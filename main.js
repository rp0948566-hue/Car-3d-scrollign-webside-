import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

// --- ELITE SCENE CONFIG (S-CLASS POLISH) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202); // Deeper black
scene.fog = new THREE.Fog(0x020202, 10, 50);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 15);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- CINEMATIC POST-PROCESSING ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.3, 0.85);
composer.addPass(bloomPass);

// --- PRO STUDIO LIGHTING RIG ---
// Bank Light (Large Soft Box Effect)
const areaLight = new THREE.DirectionalLight(0xffffff, 5.0);
areaLight.position.set(5, 10, 5);
areaLight.castShadow = true;
areaLight.shadow.mapSize.set(2048, 2048);
scene.add(areaLight);

// Gold Highlight Rim
const goldRim = new THREE.DirectionalLight(0xD4AF37, 3.0);
goldRim.position.set(-8, 4, -5);
scene.add(goldRim);

const ambient = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambient);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

// --- DYNAMIC REFLECTIVE FLOOR ---
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.8,
    roughness: 0.1,
    envMapIntensity: 2.5
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(120, 30, 0x111111, 0x080808);
grid.position.y = 0.01;
scene.add(grid);

// --- MODEL & ANIMATION ENGINE ---
let car, wheels = [], bodyCtrl, steeringWheel, bodyPanels = [];
let mixer, carAnimations = [];

const loader = new GLTFLoader();
const modelPath = './uploads_files_5859585_Bugatti+Tourbillon+2024+-+Fully+Rigged+Ready+for+Animation.glb';

loader.load(modelPath, (gltf) => {
    car = gltf.scene;

    // Auto-Ground
    const box = new THREE.Box3().setFromObject(car);
    car.position.y = -box.min.y;

    // Animation Sync
    mixer = new THREE.AnimationMixer(car);
    gltf.animations.forEach(clip => {
        const action = mixer.clipAction(clip);
        action.play();
        carAnimations.push(action);
    });

    car.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = new THREE.MeshStandardMaterial({
                color: 0x080808,
                metalness: 1.0,
                roughness: 0.04,
                envMapIntensity: 4.5,
                clearcoat: 1.0,
                clearcoatRoughness: 0.01,
                transparent: true,
                opacity: 1
            });
            // Track Body Panels for X-Ray Engine Reveal
            if (child.name.toLowerCase().includes('body') || child.name.toLowerCase().includes('panel') || child.name.toLowerCase().includes('hood')) {
                bodyPanels.push(child);
            }
        }
        if (child.name.includes('Wheel_Rotation_X')) wheels.push(child);
        if (child.name.includes('Body_Ctrl')) bodyCtrl = child;
        if (child.name.toLowerCase().includes('steering')) steeringWheel = child;
    });

    car.scale.set(1.5, 1.5, 1.5);
    car.position.set(12, car.position.y, -25); // Start Stage (Top Right)
    scene.add(car);

    gsap.to('#loader', {
        opacity: 0, duration: 1, onComplete: () => {
            document.getElementById('loader').style.display = 'none';
            initScroll();
        }
    });
});

function initScroll() {
    // ELITE MASTER TIMELINE (Weighted & Smooth)
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.5, // Heavier, luxury weighting
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // INTERNAL ENGINE SYNC
                if (mixer) {
                    const duration = mixer.getRoot().animations?.[0]?.duration || 5.0;
                    mixer.setTime(self.progress * duration);
                }
                // SPEEDOMETER SYNC (Top speed 400 KM/H for Tourbillon)
                const currentSpeed = Math.round(self.progress * 444);
                document.querySelector('.speed-value').innerText = currentSpeed;
                document.getElementById('speed-progress').style.width = `${self.progress * 100}%`;
            }
        }
    });

    // 1. CAR PATH: "Descending Right" into Focus
    tl.to(car.position, { x: 0, z: 8, ease: "slow(0.7, 0.7, false)" }, 0);

    // 2. ELITE CAMERA SWEEP: Engine Focus & Profile
    tl.to(camera.position, { x: 6, y: 7, z: 12, duration: 1 }, 0) // Perspective Entrance
        .to(camera.position, { x: -5, y: 2.5, z: -6, duration: 1 }, 1) // Engine Reveal (Rear View)
        .to(camera.position, { x: 0, y: 1.2, z: 4.5, duration: 1 }, 2); // Hero Stance

    // 3. X-RAY ENGINE EFFECT: Fade body during transmission/engine sweep
    bodyPanels.forEach(panel => {
        tl.to(panel.material, { opacity: 0.15, duration: 0.3 }, 0.8); // Fade in window
        tl.to(panel.material, { opacity: 1.0, duration: 0.3 }, 1.3);  // Snap back
    });

    // 4. PHYSICAL DYNAMIC DETAILS
    ScrollTrigger.create({
        trigger: "#scroll-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
            const progress = self.progress;
            // Wheel Spin
            wheels.forEach(w => {
                const spinFactor = 300;
                w.rotation.x = progress * spinFactor;
            });
            // Steering Angle during drift
            if (steeringWheel) steeringWheel.rotation.y = Math.sin(progress * 15) * 0.4;
        }
    });

    if (bodyCtrl) {
        tl.to(bodyCtrl.rotation, { z: -0.4, duration: 0.2 }, 0.4); // Initiating Drift
        tl.to(bodyCtrl.rotation, { z: 0.3, duration: 0.2 }, 1.6);  // Counter steer physics
        tl.to(bodyCtrl.rotation, { z: 0, duration: 0.2 }, 2.6);    // Linear exit
    }

    // 5. LUXURY UI REVEALS
    const uiTimeline = [
        { id: '#side-tag', start: "2%", end: "10%" },
        { id: '#brand-top', start: "8%", end: "20%" },
        { id: '#stats-center', start: "25%", end: "40%" },
        { id: '#speedometer-container', start: "5%", end: "95%" },
        { id: '#brand-bottom', start: "45%", end: "85%" }
    ];

    uiTimeline.forEach(ui => {
        gsap.to(ui.id, { opacity: 1, scrollTrigger: { trigger: "#scroll-wrapper", start: `${ui.start} top`, end: "15% top", scrub: true, toggleActions: "play none none reverse" } });
        // Sticky/Permanent UI for Speedometer
        if (ui.id !== '#speedometer-container') {
            gsap.to(ui.id, { opacity: 0, scrollTrigger: { trigger: "#scroll-wrapper", start: `${ui.end} top`, end: "25% top", scrub: true } });
        } else {
            gsap.to(ui.id, { opacity: 1, duration: 0.5 }); // Always visible once reveal starts
        }
    });

    // 6. ULTIMATE FINALE: 360 EXHIBITION
    gsap.to(car.rotation, {
        y: Math.PI * 2,
        duration: 30, // Extremely slow, elegant rotation
        repeat: -1,
        ease: "none",
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "98% top",
            toggleActions: "play none none none"
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (car) {
        // High-End Detailing: Suspension Breathing & Micro-Tilt
        const time = performance.now() * 0.001;
        car.position.y += Math.sin(time * 2.5) * 0.0006;
        car.rotation.z += Math.cos(time * 1.5) * 0.0003;

        camera.lookAt(car.position.x, car.position.y + 0.48, car.position.z);
    }

    composer.render();
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
