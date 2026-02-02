
/**
 * Electric Border Effect
 * Vanilla JS port of @react-bits/ElectricBorder-JS-CSS
 */
class ElectricBorder {
    constructor(targetElement, options = {}) {
        this.container = targetElement;
        this.color = options.color || '#6366f1'; // Default system primary
        this.speed = options.speed || 1;
        this.chaos = options.chaos || 0.12;
        this.borderRadius = options.borderRadius || 24;

        this.time = 0;
        this.lastTime = 0;
        this.rafId = null;

        // Simplex Noise Globals
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        this.p = [];
        this.perm = [];
        this.seed(0);

        this.init();
    }

    init() {
        // Create DOM structure
        this.container.classList.add('electric-border');
        this.container.style.setProperty('--electric-border-color', this.color);
        this.container.style.borderRadius = `${this.borderRadius}px`;

        // Define offset for the effect (must match drawing logic)
        this.borderOffset = 60;

        // Setup Canvas Container
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.className = 'eb-canvas-container';

        // Force absolute positioning to match the internal drawing offset
        // This is more robust than CSS centering
        this.canvasContainer.style.position = 'absolute';
        this.canvasContainer.style.top = `-${this.borderOffset}px`;
        this.canvasContainer.style.left = `-${this.borderOffset}px`;
        this.canvasContainer.style.width = `calc(100% + ${this.borderOffset * 2}px)`;
        this.canvasContainer.style.height = `calc(100% + ${this.borderOffset * 2}px)`;
        this.canvasContainer.style.pointerEvents = 'none';
        this.canvasContainer.style.zIndex = '2';
        this.canvasContainer.style.transform = 'none'; // Override any CSS

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'eb-canvas';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvasContainer.appendChild(this.canvas);

        // Glow Layers
        this.layers = document.createElement('div');
        this.layers.className = 'eb-layers';
        this.layers.innerHTML = `
            <div class="eb-glow-1"></div>
            <div class="eb-glow-2"></div>
            <div class="eb-background-glow"></div>
        `;

        // Prepend to container so content stays on top
        this.container.insertBefore(this.layers, this.container.firstChild);
        this.container.insertBefore(this.canvasContainer, this.container.firstChild);

        this.ctx = this.canvas.getContext('2d');

        // Observers
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);

        this.resize();
        this.start();
    }

    // Noise Functions
    seed(seed) {
        if (seed > 0 && seed < 1) seed *= 65536;
        seed = Math.floor(seed);
        if (seed < 256) seed |= seed << 8;
        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) v = i ^ (i & 240); // simple hash
            else v = i ^ (i >> 1);
            this.p[i] = v;
            this.perm[i] = this.p[i];
            this.perm[i + 256] = this.p[i];
        }
    }

    // Simple pseudo-random for the effect
    random(x) {
        return (Math.sin(x * 12.9898) * 43758.5453) % 1;
    }

    noise2D(x, y) {
        const i = Math.floor(x);
        const j = Math.floor(y);
        const fx = x - i;
        const fy = y - j;

        const a = this.random(i + j * 57);
        const b = this.random(i + 1 + j * 57);
        const c = this.random(i + (j + 1) * 57);
        const d = this.random(i + 1 + (j + 1) * 57);

        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uy = fy * fy * (3.0 - 2.0 * fy);

        return a * (1 - ux) * (1 - uy) +
            b * ux * (1 - uy) +
            c * (1 - ux) * uy +
            d * ux * uy;
    }

    octavedNoise(x, octaves, lacunarity, gain, baseAmp, baseFreq, time, seed, baseFlatness) {
        let y = 0;
        let amp = baseAmp;
        let freq = baseFreq;

        for (let i = 0; i < octaves; i++) {
            let frameAmp = amp;
            if (i === 0) frameAmp *= baseFlatness;

            y += frameAmp * this.noise2D(freq * x + seed * 100, time * freq * 0.3);
            freq *= lacunarity;
            amp *= gain;
        }
        return y;
    }

    getCornerPoint(centerX, centerY, radius, startAngle, arcLength, progress) {
        const angle = startAngle + progress * arcLength;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    }

    getRoundedRectPoint(t, left, top, width, height, radius) {
        const straightWidth = width - 2 * radius;
        const straightHeight = height - 2 * radius;
        const cornerArc = (Math.PI * radius) / 2;
        const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
        const dist = t * totalPerimeter;

        let accumulated = 0;

        // Top edge
        if (dist <= accumulated + straightWidth) {
            const p = (dist - accumulated) / straightWidth;
            return { x: left + radius + p * straightWidth, y: top };
        }
        accumulated += straightWidth;

        // Top-Right
        if (dist <= accumulated + cornerArc) {
            const p = (dist - accumulated) / cornerArc;
            return this.getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, p);
        }
        accumulated += cornerArc;

        // Right
        if (dist <= accumulated + straightHeight) {
            const p = (dist - accumulated) / straightHeight;
            return { x: left + width, y: top + radius + p * straightHeight };
        }
        accumulated += straightHeight;

        // Bottom-Right
        if (dist <= accumulated + cornerArc) {
            const p = (dist - accumulated) / cornerArc;
            return this.getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, p);
        }
        accumulated += cornerArc;

        // Bottom
        if (dist <= accumulated + straightWidth) {
            const p = (dist - accumulated) / straightWidth;
            return { x: left + width - radius - p * straightWidth, y: top + height };
        }
        accumulated += straightWidth;

        // Bottom-Left
        if (dist <= accumulated + cornerArc) {
            const p = (dist - accumulated) / cornerArc;
            return this.getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, p);
        }
        accumulated += cornerArc;

        // Left
        if (dist <= accumulated + straightHeight) {
            const p = (dist - accumulated) / straightHeight;
            return { x: left, y: top + height - radius - p * straightHeight };
        }
        accumulated += straightHeight;

        // Top-Left
        const p = (dist - accumulated) / cornerArc;
        return this.getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, p);
    }

    resize() {
        // Use offsetWidth/Height to get unscaled dimensions
        this.width = this.container.offsetWidth + this.borderOffset * 2;
        this.height = this.container.offsetHeight + this.borderOffset * 2;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        // No need to set style.width/height here as we set it to percentages in init()
        // But for canvas internal resolution mapping:
        // Actually, canvas style width/height IS controlled by the container size we set in init
        // But we need to ensure the coordinate space matches.

        this.ctx.scale(dpr, dpr);
    }

    animate(now) {
        if (!this.container.isConnected) {
            this.stop();
            return;
        }

        const dt = (now - this.lastTime) / 1000;
        this.time += dt * this.speed;
        this.lastTime = now;

        const ctx = this.ctx;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const displacement = this.borderOffset; // Use same value for displacement scale
        const W = this.width - 2 * this.borderOffset;
        const H = this.height - 2 * this.borderOffset;
        const R = Math.min(this.borderRadius, Math.min(W, H) / 2);

        const perimeter = 2 * (W + H) + 2 * Math.PI * R;
        const samples = Math.floor(perimeter / 2);

        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const p = i / samples;
            // Draw starting from (borderOffset, borderOffset)
            const pt = this.getRoundedRectPoint(p, this.borderOffset, this.borderOffset, W, H, R);

            const nx = this.octavedNoise(p * 8, 10, 1.6, 0.7, this.chaos, 10, this.time, 0, 0);
            const ny = this.octavedNoise(p * 8, 10, 1.6, 0.7, this.chaos, 10, this.time, 1, 0);

            const x = pt.x + nx * displacement;
            const y = pt.y + ny * displacement;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        this.rafId = requestAnimationFrame(t => this.animate(t));
    }

    start() {
        if (!this.rafId) {
            this.lastTime = performance.now();
            this.rafId = requestAnimationFrame(t => this.animate(t));
        }
    }

    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}

// Expose to window
window.ElectricBorder = ElectricBorder;
