
const container = document.getElementById('canvas-container');
const loadingOverlay = document.getElementById('loading-overlay');
const progressText = document.getElementById('progress');
const wordResumeOverlay = document.getElementById('word-resume-overlay');
const debugInfo = document.getElementById('debug-info');
console.log("--- VERSION 8 LOADED: Small Window & Aggressive Hiding ---");



const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 5, 20);


const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 3, 5);


const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x00ffcc, 0.5, 5);
pointLight.position.set(0, 1.5, 0);
scene.add(pointLight);


const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 10;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2;


const TARGET_SCREEN_POS = new THREE.Vector3(0, 1.2, 0);
const ZOOM_THRESHOLD = 0.8;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const loader = new THREE.GLTFLoader();

const modelPath = '../3d-resume/90s_retro_office_pack.glb';

function loadModel() {
    
    if (window.location.protocol === 'file:') {
        
        console.warn("Running from file:// protocol. Browsers may block loading 3D models due to CORS security policies.");
    }

    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                console.log("MESH FOUND:", child.name); 
            }
        });

        
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        
        
        TARGET_SCREEN_POS.set(3.30, 0.31, 5.69);
        controls.target.copy(TARGET_SCREEN_POS);
        controls.update();

        
        
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                
                
                
                
                const worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);
                if (worldPos.distanceTo(TARGET_SCREEN_POS) > 4) {
                    child.visible = false;
                }
            }
        });

        
        camera.position.set(TARGET_SCREEN_POS.x + 2, TARGET_SCREEN_POS.y + 3, TARGET_SCREEN_POS.z + 3);

        
        
        
        console.log("Model Loaded. Waiting for user interaction to start.");

    }, (xhr) => {
        
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



window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


let isOverlayActive = false;
let isResumeClosed = false;


window.closeResume = function () {
    isResumeClosed = true;
    isOverlayActive = false;
    wordResumeOverlay.classList.remove('active');
};


wordResumeOverlay.addEventListener('wheel', (event) => {
    
    
    

    
    
    

    
    
    
    
    
}, { passive: false });


window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeResume();
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const distance = camera.position.distanceTo(TARGET_SCREEN_POS);

    
    
    if (distance < ZOOM_THRESHOLD && !isOverlayActive && !isResumeClosed) {
        isOverlayActive = true;
        wordResumeOverlay.classList.add('active');
        console.log('Resume overlay activated! Triggering typing animation...');
        
        if (typeof window.typeResumeContent === 'function') {
            window.typeResumeContent();
        } else {
            console.error('typeResumeContent function not found!');
        }
    }
    
    else if (distance > ZOOM_THRESHOLD + 1.5) {
        isResumeClosed = false;
        isOverlayActive = false;
        wordResumeOverlay.classList.remove('active');
    }
    
    else if (distance > ZOOM_THRESHOLD + 0.2 && isOverlayActive) {
        isOverlayActive = false;
        wordResumeOverlay.classList.remove('active');
    }

    renderer.render(scene, camera);
}
animate();
