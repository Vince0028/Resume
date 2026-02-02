/**
 * Infinite Menu - Vanilla JS Port (Fixed Version)
 * Fixes: Image loading, UI stuttering, snap behavior
 */

const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = st * cellSize + cellOffset;
    
    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}
`;

// ============ GEOMETRY ============
class DiscGeometry {
    constructor(steps = 48, radius = 1) {
        const verts = [0, 0, 0];
        const uvs = [0.5, 0.5];
        const indices = [];
        const alpha = (2 * Math.PI) / steps;

        for (let i = 0; i <= steps; i++) {
            const x = Math.cos(alpha * i);
            const y = Math.sin(alpha * i);
            verts.push(radius * x, radius * y, 0);
            uvs.push(x * 0.5 + 0.5, y * 0.5 + 0.5);
        }

        for (let i = 1; i <= steps; i++) {
            indices.push(0, i, i + 1);
        }

        this.vertexData = new Float32Array(verts);
        this.uvData = new Float32Array(uvs);
        this.indexData = new Uint16Array(indices);
    }
}

class IcosahedronGeometry {
    constructor(subdivisions = 1, radius = 2) {
        const t = (1 + Math.sqrt(5)) / 2;

        let vertices = [
            [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
            [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
            [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
        ].map(v => {
            const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            return vec3.fromValues(v[0] / len * radius, v[1] / len * radius, v[2] / len * radius);
        });

        let faces = [
            [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
            [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
            [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
            [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
        ];

        // Subdivide
        for (let s = 0; s < subdivisions; s++) {
            const midCache = {};
            const getMid = (a, b) => {
                const key = a < b ? `${a}_${b}` : `${b}_${a}`;
                if (midCache[key] !== undefined) return midCache[key];
                const va = vertices[a], vb = vertices[b];
                const mid = vec3.fromValues(
                    (va[0] + vb[0]) / 2,
                    (va[1] + vb[1]) / 2,
                    (va[2] + vb[2]) / 2
                );
                const len = vec3.length(mid);
                vec3.scale(mid, mid, radius / len);
                midCache[key] = vertices.length;
                vertices.push(mid);
                return midCache[key];
            };

            const newFaces = [];
            faces.forEach(f => {
                const a = getMid(f[0], f[1]);
                const b = getMid(f[1], f[2]);
                const c = getMid(f[2], f[0]);
                newFaces.push([f[0], a, c], [f[1], b, a], [f[2], c, b], [a, b, c]);
            });
            faces = newFaces;
        }

        this.positions = vertices;
    }
}

// ============ ARCBALL CONTROL ============
class ArcballControl {
    constructor(canvas, updateCallback) {
        this.canvas = canvas;
        this.updateCallback = updateCallback || (() => { });

        this.isPointerDown = false;
        this.orientation = quat.create();
        this.pointerRotation = quat.create();
        this.rotationVelocity = 0;
        this.rotationAxis = vec3.fromValues(1, 0, 0);
        this.snapDirection = vec3.fromValues(0, 0, -1);
        this.snapTargetDirection = null;

        this.pointerPos = vec2.create();
        this.prevPointerPos = vec2.create();
        this._rv = 0;
        this._combinedQuat = quat.create();

        canvas.addEventListener('pointerdown', e => {
            vec2.set(this.pointerPos, e.clientX, e.clientY);
            vec2.copy(this.prevPointerPos, this.pointerPos);
            this.isPointerDown = true;
            canvas.style.cursor = 'grabbing';
        });

        const endPointer = () => {
            this.isPointerDown = false;
            canvas.style.cursor = 'grab';
        };

        canvas.addEventListener('pointerup', endPointer);
        canvas.addEventListener('pointerleave', endPointer);
        canvas.addEventListener('pointermove', e => {
            if (this.isPointerDown) vec2.set(this.pointerPos, e.clientX, e.clientY);
        });

        canvas.style.touchAction = 'none';
        canvas.style.cursor = 'grab';
    }

    update(dt) {
        const ts = dt / 16.66 + 0.0001;
        let snapRotation = quat.create();
        const IDENTITY = quat.create();

        if (this.isPointerDown) {
            const move = vec2.sub(vec2.create(), this.pointerPos, this.prevPointerPos);
            vec2.scale(move, move, 0.3 * ts);

            if (vec2.sqrLen(move) > 0.1) {
                vec2.add(move, this.prevPointerPos, move);
                const a = this.project(move);
                const b = this.project(this.prevPointerPos);
                vec3.normalize(a, a);
                vec3.normalize(b, b);
                vec2.copy(this.prevPointerPos, move);

                const axis = vec3.cross(vec3.create(), a, b);
                vec3.normalize(axis, axis);
                const angle = Math.acos(Math.max(-1, Math.min(1, vec3.dot(a, b)))) * 5;
                quat.setAxisAngle(this.pointerRotation, axis, angle);
            } else {
                quat.slerp(this.pointerRotation, this.pointerRotation, IDENTITY, 0.1 * ts);
            }
        } else {
            // Dampen rotation
            quat.slerp(this.pointerRotation, this.pointerRotation, IDENTITY, 0.1 * ts);

            // Snap to nearest
            if (this.snapTargetDirection) {
                const a = this.snapTargetDirection;
                const b = this.snapDirection;
                const sqrDist = vec3.squaredDistance(a, b);
                const factor = Math.max(0.1, 1 - sqrDist * 10) * 0.2 * ts;

                const axis = vec3.cross(vec3.create(), a, b);
                if (vec3.length(axis) > 0.0001) {
                    vec3.normalize(axis, axis);
                    const angle = Math.acos(Math.max(-1, Math.min(1, vec3.dot(a, b)))) * factor;
                    quat.setAxisAngle(snapRotation, axis, angle);
                }
            }
        }

        const combined = quat.multiply(quat.create(), snapRotation, this.pointerRotation);
        quat.multiply(this.orientation, combined, this.orientation);
        quat.normalize(this.orientation, this.orientation);

        // Track velocity
        quat.slerp(this._combinedQuat, this._combinedQuat, combined, 0.8 * ts);
        quat.normalize(this._combinedQuat, this._combinedQuat);

        const rad = Math.acos(Math.min(1, this._combinedQuat[3])) * 2;
        const s = Math.sin(rad / 2);
        if (s > 0.0001) {
            this.rotationAxis[0] = this._combinedQuat[0] / s;
            this.rotationAxis[1] = this._combinedQuat[1] / s;
            this.rotationAxis[2] = this._combinedQuat[2] / s;
        }
        this._rv += (rad / (2 * Math.PI) - this._rv) * 0.5 * ts;
        this.rotationVelocity = this._rv / ts;

        this.updateCallback(dt);
    }

    project(pos) {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        const s = Math.max(w, h) - 1;
        const x = (2 * pos[0] - w - 1) / s;
        const y = (2 * pos[1] - h - 1) / s;
        const xySq = x * x + y * y;
        const z = xySq <= 2 ? Math.sqrt(4 - xySq) : 4 / Math.sqrt(xySq);
        return vec3.fromValues(-x, y, z);
    }
}

// ============ MAIN MENU ============
class InfiniteGridMenu {
    constructor(canvas, items, onActiveItemChange, onMovementChange, onInit, scale) {
        this.canvas = canvas;
        this.items = items || [];
        this.onActiveItemChange = onActiveItemChange;
        this.onMovementChange = onMovementChange;
        this.scaleFactor = scale || 1;
        this.time = 0;
        this.smoothRV = 0;
        this.isMoving = false;
        this.lastActiveIndex = -1; // Track to prevent stuttering!
        this.textureLoaded = false;

        this.SPHERE_RADIUS = 2;
        this.camera = {
            position: vec3.fromValues(0, 0, 3 * this.scaleFactor),
            up: vec3.fromValues(0, 1, 0),
            view: mat4.create(),
            proj: mat4.create()
        };

        this.init(onInit);
    }

    init(onInit) {
        const gl = this.gl = this.canvas.getContext('webgl2', { antialias: true, alpha: true });
        if (!gl) { console.error('No WebGL2!'); return; }

        // Shaders
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, discVertShaderSource);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(vs));

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, discFragShaderSource);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(fs));

        const prog = this.program = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        this.loc = {
            aPos: gl.getAttribLocation(prog, 'aModelPosition'),
            aUv: gl.getAttribLocation(prog, 'aModelUvs'),
            aMat: gl.getAttribLocation(prog, 'aInstanceMatrix'),
            uWorld: gl.getUniformLocation(prog, 'uWorldMatrix'),
            uView: gl.getUniformLocation(prog, 'uViewMatrix'),
            uProj: gl.getUniformLocation(prog, 'uProjectionMatrix'),
            uRot: gl.getUniformLocation(prog, 'uRotationAxisVelocity'),
            uTex: gl.getUniformLocation(prog, 'uTex'),
            uCount: gl.getUniformLocation(prog, 'uItemCount'),
            uAtlas: gl.getUniformLocation(prog, 'uAtlasSize')
        };

        // Geometry
        this.disc = new DiscGeometry(48, 1);
        this.ico = new IcosahedronGeometry(1, this.SPHERE_RADIUS);
        this.instanceCount = this.ico.positions.length;

        // VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.disc.vertexData, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.loc.aPos);
        gl.vertexAttribPointer(this.loc.aPos, 3, gl.FLOAT, false, 0, 0);

        const uvBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.disc.uvData, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.loc.aUv);
        gl.vertexAttribPointer(this.loc.aUv, 2, gl.FLOAT, false, 0, 0);

        const idxBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.disc.indexData, gl.STATIC_DRAW);

        this.instanceMats = new Float32Array(this.instanceCount * 16);
        this.matBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.matBuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.instanceMats.byteLength, gl.DYNAMIC_DRAW);

        for (let i = 0; i < 4; i++) {
            const loc = this.loc.aMat + i;
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
            gl.vertexAttribDivisor(loc, 1);
        }

        gl.bindVertexArray(null);

        this.worldMat = mat4.create();
        this.loadTexture();
        this.control = new ArcballControl(this.canvas, dt => this.onControl(dt));
        this.resize();

        if (onInit) onInit(this);
    }

    loadTexture() {
        const gl = this.gl;
        this.atlasSize = Math.ceil(Math.sqrt(Math.max(1, this.items.length)));
        const cellSize = 512;
        const atlasCanvas = document.createElement('canvas');
        atlasCanvas.width = this.atlasSize * cellSize;
        atlasCanvas.height = this.atlasSize * cellSize;
        const ctx = atlasCanvas.getContext('2d');

        // Fill with a visible placeholder
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);

        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload placeholder immediately
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
        this.textureLoaded = true;

        // Load actual images
        let loaded = 0;
        const total = this.items.length;

        if (total === 0) return;

        this.items.forEach((item, i) => {
            const img = new Image();
            // CrossOrigin removed for local file support

            img.onload = () => {
                const x = (i % this.atlasSize) * cellSize;
                const y = Math.floor(i / this.atlasSize) * cellSize;

                // Draw with cover behavior
                const imgAspect = img.width / img.height;
                let sx = 0, sy = 0, sw = img.width, sh = img.height;
                if (imgAspect > 1) {
                    sw = img.height;
                    sx = (img.width - sw) / 2;
                } else {
                    sh = img.width;
                    sy = (img.height - sh) / 2;
                }

                ctx.drawImage(img, sx, sy, sw, sh, x, y, cellSize, cellSize);
                loaded++;

                // Update texture after each image loads
                gl.bindTexture(gl.TEXTURE_2D, this.tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
            };

            img.onerror = () => {
                console.warn('Failed to load:', item.image);
                // Fallback debug color
                const x = (i % this.atlasSize) * cellSize;
                const y = Math.floor(i / this.atlasSize) * cellSize;
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x, y, cellSize, cellSize);

                loaded++;
                gl.bindTexture(gl.TEXTURE_2D, this.tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
            };

            img.src = item.image;
        });
    }

    resize() {
        const gl = this.gl;
        const dpr = Math.min(2, window.devicePixelRatio);
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        const aspect = this.canvas.width / this.canvas.height;
        const fov = aspect > 1
            ? 2 * Math.atan(0.7 / this.camera.position[2])
            : 2 * Math.atan(0.7 / aspect / this.camera.position[2]);
        mat4.perspective(this.camera.proj, fov, aspect, 0.1, 40);
    }

    run(time = 0) {
        const dt = Math.min(32, time - this.time);
        this.time = time;
        this.animate(dt);
        this.render();
        requestAnimationFrame(t => this.run(t));
    }

    animate(dt) {
        this.control.update(dt);

        this.ico.positions.forEach((pos, i) => {
            const p = vec3.transformQuat(vec3.create(), pos, this.control.orientation);
            const s = (Math.abs(p[2]) / this.SPHERE_RADIUS) * 0.6 + 0.4;
            const scale = s * 0.25;

            const mat = mat4.create();
            mat4.translate(mat, mat, vec3.negate(vec3.create(), p));
            mat4.multiply(mat, mat, mat4.targetTo(mat4.create(), [0, 0, 0], p, [0, 1, 0]));
            mat4.scale(mat, mat, [scale, scale, scale]);
            mat4.translate(mat, mat, [0, 0, -this.SPHERE_RADIUS]);

            this.instanceMats.set(mat, i * 16);
        });

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.matBuf);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceMats);

        this.smoothRV = this.control.rotationVelocity;
    }

    render() {
        const gl = this.gl;

        if (!this.textureLoaded) return;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(this.program);

        mat4.targetTo(this.camera.view, this.camera.position, [0, 0, 0], this.camera.up);
        mat4.invert(this.camera.view, this.camera.view);

        gl.uniformMatrix4fv(this.loc.uWorld, false, this.worldMat);
        gl.uniformMatrix4fv(this.loc.uView, false, this.camera.view);
        gl.uniformMatrix4fv(this.loc.uProj, false, this.camera.proj);
        gl.uniform4f(this.loc.uRot,
            this.control.rotationAxis[0],
            this.control.rotationAxis[1],
            this.control.rotationAxis[2],
            this.smoothRV * 1.1
        );
        gl.uniform1i(this.loc.uCount, Math.max(1, this.items.length));
        gl.uniform1i(this.loc.uAtlas, this.atlasSize);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(this.loc.uTex, 0);

        gl.bindVertexArray(this.vao);
        gl.drawElementsInstanced(gl.TRIANGLES, this.disc.indexData.length, gl.UNSIGNED_SHORT, 0, this.instanceCount);
    }

    onControl(dt) {
        const ts = dt / 16.66 + 0.0001;
        let targetZ = 3 * this.scaleFactor;

        const moving = this.control.isPointerDown || Math.abs(this.smoothRV) > 0.01;
        if (moving !== this.isMoving) {
            this.isMoving = moving;
            if (this.onMovementChange) this.onMovementChange(moving);
        }

        if (!this.control.isPointerDown) {
            // Find nearest
            const invOri = quat.conjugate(quat.create(), this.control.orientation);
            const nt = vec3.transformQuat(vec3.create(), this.control.snapDirection, invOri);

            let maxD = -Infinity, nearest = 0;
            for (let i = 0; i < this.ico.positions.length; i++) {
                const d = vec3.dot(nt, this.ico.positions[i]);
                if (d > maxD) { maxD = d; nearest = i; }
            }

            const itemIdx = nearest % Math.max(1, this.items.length);

            // ONLY update UI if the active item actually changed!
            if (itemIdx !== this.lastActiveIndex) {
                this.lastActiveIndex = itemIdx;
                if (this.onActiveItemChange) this.onActiveItemChange(itemIdx);
            }

            const worldPos = vec3.transformQuat(vec3.create(), this.ico.positions[nearest], this.control.orientation);
            this.control.snapTargetDirection = vec3.normalize(vec3.create(), worldPos);
        } else {
            targetZ += this.control.rotationVelocity * 80 + 2.5;
        }

        this.camera.position[2] += (targetZ - this.camera.position[2]) / (5 / ts);
    }
}

// ============ PUBLIC API ============
window.InfiniteMenu = function (container, items, scale = 1.0) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    const handleActive = (idx) => {
        if (container.updateUICallback) {
            container.updateUICallback(items[idx]);
        }
    };

    const handleMove = (isMoving) => {
        if (container.onMovementChange) {
            container.onMovementChange(isMoving);
        }
    };

    const menu = new InfiniteGridMenu(canvas, items, handleActive, handleMove, sk => sk.run(), scale);
    window.addEventListener('resize', () => menu.resize());

    return menu;
};
