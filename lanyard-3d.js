(() => {
	function fail(msg) {
		console.error(msg);
		const m = document.getElementById('lanyard-3d-root');
		if (m) {
			m.innerHTML = '<div style="color:#f33;font-size:12px;text-align:center;padding:4px;border:1px solid #f33;border-radius:4px;background:rgba(255,0,0,0.1)">' + msg + '</div>';
		}
	}

	function init() {
		if (!window.THREE) {
			setTimeout(() => {
				if (!window.THREE) { fail('THREE.js failed to load'); return; }
				init();
			}, 500);
			return;
		}

		const mount = document.getElementById('lanyard-3d-root');
		if (!mount) { fail('mount missing'); return }

		document.body.classList.add('has-3d-lanyard');

		// Add floating warning message to body so it can float across entire screen
		const warningMsg = document.createElement('div');
		const warningBaseText = "don't press me";
		let warningResetTimer = null;
		warningMsg.className = 'lanyard-warning-msg';
		warningMsg.textContent = warningBaseText;
		document.body.appendChild(warningMsg);

		const w = (mount.clientWidth && mount.clientWidth > 0) ? mount.clientWidth : 220;
		const h = (mount.clientHeight && mount.clientHeight > 0) ? mount.clientHeight : 340;

		const scene = new THREE.Scene();
		let camera;
		try {
			const aspect = w / h;
			const viewH = 2;
			const viewW = viewH * aspect;
			camera = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 10);
			camera.position.set(0, 0, 5);
		} catch (e) { fail('camera error'); return }

		let renderer;
		try {
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(w, h);
			mount.appendChild(renderer.domElement);
		} catch (e) { fail('WebGL unsupported'); return }

		const texLoader = new THREE.TextureLoader();
		function load(path) {
			return texLoader.load(
				path,
				() => { },
				undefined,
				(err) => {
					console.error('Texture load failed:', path, err);
				}
			);
		}

		const frontTex = load('Images/Lanyard_pokemon.png');
		const frontTexShy = load('Images/lanyard_shy.png');
		const frontTexDizzy = load('Images/Lanyard_dizzy.png');
		const backTex = load('Images/Back_pokemon.png');

		[frontTex, frontTexShy, frontTexDizzy, backTex].forEach(t => {
			if (t) {
				if ('SRGBColorSpace' in THREE) t.colorSpace = THREE.SRGBColorSpace;
				else if ('sRGBEncoding' in THREE) t.encoding = THREE.sRGBEncoding;
				t.anisotropy = 8;
			}
		});

		const cardGroup = new THREE.Group();
		scene.add(cardGroup);

		const aspectR = w / h;
		const viewH2 = 2;
		const viewW2 = viewH2 * aspectR;
		const cardGeo = new THREE.BoxGeometry(viewW2, viewH2, 0.02);

		const matFront = new THREE.MeshBasicMaterial({ map: frontTex, color: 0xffffff });
		const matBack = new THREE.MeshBasicMaterial({ map: backTex, color: 0xffffff });
		const matSide = new THREE.MeshBasicMaterial({ color: 0x22263d });

		const cardMesh = new THREE.Mesh(cardGeo, [matSide, matSide, matSide, matSide, matFront, matBack]);
		cardGroup.add(cardMesh);

		scene.add(new THREE.AmbientLight(0xffffff, 0.7));
		const dir = new THREE.DirectionalLight(0xffffff, 0.6);
		dir.position.set(2, 3, 4);
		scene.add(dir);

		let spinRemaining = 0;
		const spinSpeed = 4;
		let dizzyDuration = 0;
		renderer.domElement.addEventListener('click', () => {
			console.log('Lanyard clicked! spinRemaining:', spinRemaining);
			if (spinRemaining <= 0) {
				console.log('Starting spin and dizzy...');
				spinRemaining = 2 * Math.PI;
				dizzyDuration = 2.5;

				// Temporary dizzy text on the speech cloud
				console.log('Changing text to dizzy message');
				warningMsg.textContent = 'Nakaka-hilo talaga pag pina ikot-ikot ka nya';
				if (warningResetTimer) { clearTimeout(warningResetTimer); }
				warningResetTimer = setTimeout(() => {
					console.log('Resetting text back to default');
					warningMsg.textContent = warningBaseText;
					warningResetTimer = null;
				}, 3500);
			}
		});

		renderer.domElement.style.cursor = 'pointer';

		renderer.domElement.addEventListener('mouseenter', () => {
			console.log('Mouse entered lanyard - changing to shy');
			if (dizzyDuration <= 0) {
				matFront.map = frontTexShy;
				matFront.needsUpdate = true;
			}
		});

		renderer.domElement.addEventListener('mouseleave', () => {
			console.log('Mouse left lanyard - changing to normal');
			if (dizzyDuration <= 0) {
				matFront.map = frontTex;
				matFront.needsUpdate = true;
			}
		});

		renderer.domElement.addEventListener('mouseover', () => {
			console.log('Mouse over lanyard (Opera fallback) - changing to shy');
			matFront.map = frontTexShy;
			matFront.needsUpdate = true;
		});

		renderer.domElement.addEventListener('mouseout', () => {
			console.log('Mouse out lanyard (Opera fallback) - changing to normal');
			matFront.map = frontTex;
			matFront.needsUpdate = true;
		});


		window.addEventListener('resize', () => {
			const nw = mount.clientWidth || 220;
			const nh = mount.clientHeight || 340;
			const aspect = nw / nh;
			const vH = 2;
			const vW = vH * aspect;
			camera.left = -vW / 2;
			camera.right = vW / 2;
			camera.top = vH / 2;
			camera.bottom = -vH / 2;
			camera.updateProjectionMatrix();
			renderer.setSize(nw, nh);
		});

		let last = performance.now();
		function loop(now) {
			const dt = (now - last) / 1000;
			last = now;
			if (spinRemaining > 0) {
				const step = Math.min(spinSpeed * dt, spinRemaining);
				cardGroup.rotation.y += step;
				spinRemaining -= step;
			}
			
			if (dizzyDuration > 0) {
				dizzyDuration -= dt;
				if (dizzyDuration > 0) {
					matFront.map = frontTexDizzy;
					matFront.needsUpdate = true;
				} else {
					matFront.map = frontTex;
					matFront.needsUpdate = true;
				}
			}
			
			renderer.render(scene, camera);
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
		console.log('lanyard init done');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

