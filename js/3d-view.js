
const container = document.getElementById('canvas-container');
const loadingOverlay = document.getElementById('loading-overlay');
const progressText = document.getElementById('progress');
const wordResumeOverlay = document.getElementById('word-resume-overlay');
const debugInfo = document.getElementById('debug-info');
console.log("--- VERSION 8 LOADED: Small Window & Aggressive Hiding ---");

// Scene setup
// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 5, 20);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 3, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x00ffcc, 0.5, 5);
pointLight.position.set(0, 1.5, 0);
scene.add(pointLight);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 10;
controls.enablePan = true;
controls.maxPolarAngle = Math.PI / 2;

// Interaction
const TARGET_SCREEN_POS = new THREE.Vector3(0, 1.2, 0);
const ZOOM_THRESHOLD = 0.8;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- 3D Model Loading Logic ---
const loader = new THREE.GLTFLoader();
// Precise filename found in directory
const modelPath = '../3d-resume/90s_retro_office_pack.glb';

function loadModel() {
    // Check for file protocol restriction
    if (window.location.protocol === 'file:') {
        // Just a warning log, we still try to run it, but this is the likely culprit
        console.warn("Running from file:// protocol. Browsers may block loading 3D models due to CORS security policies.");
    }

    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                console.log("MESH FOUND:", child.name); // Log names to find "Screen"
            }
        });

        // Center Model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Precise target from user calibration
        // RE-CALIBRATED v17: Focused on Paper on Filing Cabinet
        TARGET_SCREEN_POS.set(3.30, 0.31, 5.69);
        controls.target.copy(TARGET_SCREEN_POS);
        controls.update();

        // CLEANUP: Hide objects that are "floating" far away (the asset palette)
        // calculated distance from the main desk
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // If object is more than 8 meters away from our target, hide it
                // This removes the "floating assets" seen in the background
                // If object is more than 4 meters away from our target, hide it
                // TIGHTER THRESHOLD to ensure background items are gone
                const worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);
                if (worldPos.distanceTo(TARGET_SCREEN_POS) > 4) {
                    child.visible = false;
                }
            }
        });

        // Adjust camera to look at the new target from a distance
        camera.position.set(TARGET_SCREEN_POS.x + 2, TARGET_SCREEN_POS.y + 3, TARGET_SCREEN_POS.z + 3);

        // Success: Model Loaded
        // Note: loadingOverlay is now handled by the BSOD click event in HTML
        // We just ensure the progress text is gone or hidden if we kept it, but we replaced the whole overlay content.
        console.log("Model Loaded. Waiting for user interaction to start.");

    }, (xhr) => {
        // Progress
        if (xhr.lengthComputable) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            progressText.innerText = percent + "%";
        }
    }, (error) => {
        console.error('An error happened', error);

        let errorMsg = "UNKNOWN ERROR";
        if (error.message) errorMsg = error.message;
        else if (error.target && error.target.status) errorMsg = `HTTP ${error.target.status}`;
        else if (window.location.protocol === 'file:') errorMsg = "CORS ERROR (SECURITY BLOCKED)";

        progressText.innerHTML = `
            <div style="color: #ff5555; text-align: center;">
                ERROR LOADING MODEL<br>
                <span style="font-size: 0.6em; color: #aaa;">${errorMsg}</span>
            </div>
        `;

        if (window.location.protocol === 'file:') {
            progressText.innerHTML += `
                <div style="margin-top: 20px; font-size: 14px; color: #ffcc00; max-width: 400px; line-height: 1.5;">
                    <strong>⚠️ BROWSER SECURITY WARNING</strong><br>
                    Browsers block loading 3D files directly from your hard drive.<br><br>
                    <strong>SOLUTION:</strong><br>
                    Use "Live Server" in VS Code.<br>
                    Right-click '3d_resume.html' -> "Open with Live Server".
                </div>
            `;
        }
    });
}

loadModel();

// Debug Click Removed - Finalized

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Resume State Logic
let isOverlayActive = false;
let isResumeClosed = false;

// Expose close function to HTML
window.closeResume = function () {
    isResumeClosed = true;
    isOverlayActive = false;
    wordResumeOverlay.classList.remove('active');
};

// Allow scrolling (zooming) even when mouse is over the resume overlay
wordResumeOverlay.addEventListener('wheel', (event) => {
    // If the resume is at the top/bottom of scroll, OR if zooming out (deltaY > 0 is down/zoom out usually?)
    // Actually, Three.js OrbitControls: Scroll Down = Zoom Out (Dolly Out), Scroll Up = Zoom In.
    // We want to pass this to controls if possible, OR mostly: allow the user to back out.

    // Simple logic: If holding 'Alt' or just normally scrolling?
    // Let's rely on the user dragging outside the paper (which now works due to pointer-events: none on overlay)
    // But since the paper fits the screen, they might scroll ON the paper.

    // Hack: If they scroll UP (zoom out direction for many, or DOWN?), let's move camera slightly?
    // OrbitControls logic is internal. 
    // Let's add a "Manual Zoom" control via a button instead to be safe?
    // OR: just let events bubble?
    // The issue is the paper has 'overflow-y: auto', so it consumes the scroll.
}, { passive: false });

// Global 'Escape' key to close/zoom out
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeResume();
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const distance = camera.position.distanceTo(TARGET_SCREEN_POS);

    // Logic: 
    // 1. If close enough AND not already active AND hasn't been explicitly closed during this approach
    if (distance < ZOOM_THRESHOLD && !isOverlayActive && !isResumeClosed) {
        isOverlayActive = true;
        wordResumeOverlay.classList.add('active');
    }
    // 2. Reset the "Closed" flag only when user backs away significantly
    else if (distance > ZOOM_THRESHOLD + 1.5) {
        isResumeClosed = false;
        isOverlayActive = false;
        wordResumeOverlay.classList.remove('active');
    }
    // 3. Normal hide if they just back out without closing
    else if (distance > ZOOM_THRESHOLD + 0.2 && isOverlayActive) {
        isOverlayActive = false;
        wordResumeOverlay.classList.remove('active');
    }

    renderer.render(scene, camera);
}
animate();
