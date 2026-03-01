import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

// --- ELITE SCENE CONFIG (S-CLASS PERFECTION V2 - THE "COOL" PASS) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);
scene.fog = new THREE.Fog(0x020202, 10, 60);

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

// Gold Highlight Rim (LUXURY)
const goldRim = new THREE.DirectionalLight(0xD4AF37, 3.5);
goldRim.position.set(-8, 4, -5);
scene.add(goldRim);

const ambient = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambient);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

// --- "SURFACE" REALISM: BRUSHED STUDIO FLOOR ---
const floorGeo = new THREE.PlaneGeometry(300, 300);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 2.5
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// DRIFT SMOKE PARTICLE SYSTEM
const smokeGeometry = new THREE.BufferGeometry();
const smokeCount = 200;
const smokePositions = new Float32Array(smokeCount * 3);
for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3] = (Math.random() - 0.5) * 2;
    smokePositions[i * 3 + 1] = Math.random() * 0.5;
    smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
}
smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
const smokeMaterial = new THREE.PointsMaterial({
    color: 0xAAAAAA,
    size: 0.1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
});
const driftSmoke = new THREE.Points(smokeGeometry, smokeMaterial);
scene.add(driftSmoke);

// --- MODEL & ANIMATION ENGINE ---
let car, wheels = [], bodyCtrl, steeringWheel, bodyPanels = [];
let mixer, carAnimations = [];

const loader = new GLTFLoader();
const modelPath = './uploads_files_5859585_Bugatti+Tourbillon+2024+-+Fully+Rigged+Ready+for+Animation.glb';

loader.load(modelPath, (gltf) => {
    car = gltf.scene;

    // Auto-Ground logic (THE "SURFACE" FEEL)
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
    car.position.set(15, car.position.y, -30); // Starting Position (Far Top-Right)
    scene.add(car);

    gsap.to('#loader', {
        opacity: 0, duration: 1, onComplete: () => {
            document.getElementById('loader').style.display = 'none';
            initScroll();
        }
    });
});

function initScroll() {
    // ELITE MASTER TIMELINE: THE DRIFT & SURFACE PASS
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.2,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // INTERNAL ENGINE SYNC
                if (mixer) {
                    const duration = mixer.getRoot().animations?.[0]?.duration || 5.0;
                    mixer.setTime(self.progress * duration);
                }
                // SPEEDOMETER SYNC
                const currentSpeed = Math.round(self.progress * 444);
                document.querySelector('.speed-value').innerText = currentSpeed;
                document.getElementById('speed-progress').style.width = `${self.progress * 100}%`;

                // TIRE SMOKE SYNC during drift phase (Z between 5 and 15)
                if (car.position.z > 2 && car.position.z < 15) {
                    driftSmoke.material.opacity = Math.sin(self.progress * Math.PI) * 0.3;
                    driftSmoke.position.set(car.position.x, car.position.y, car.position.z - 2);
                } else {
                    driftSmoke.material.opacity = 0;
                }
            }
        }
    });

    // 1. CINEMATIC PATH: High-Class Entrance
    tl.to(car.position, { x: 0, z: 12, ease: "power2.inOut" }, 0);

    // 2. ELITE CAMERA SWEEP: THE "ENGINE REVEAL"
    tl.to(camera.position, { x: 8, y: 6, z: 15, duration: 1 }, 0) // The Reveal
        .to(camera.position, { x: -6, y: 3, z: -8, duration: 1 }, 1) // The Engine Sweep
        .to(camera.position, { x: 0, y: 1.0, z: 4, duration: 1 }, 2); // The Hero

    // 3. X-RAY ENGINE PASS: Body panel fading for clients
    bodyPanels.forEach(panel => {
        tl.to(panel.material, { opacity: 0.1, duration: 0.3 }, 0.8);
        tl.to(panel.material, { opacity: 1.0, duration: 0.3 }, 1.3);
    });

    // 4. MOTION PHYSICS
    ScrollTrigger.create({
        trigger: "#scroll-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
            const progress = self.progress;
            wheels.forEach(w => {
                w.rotation.x = progress * 400; // Fast rotation for effect
            });
            if (steeringWheel) steeringWheel.rotation.y = Math.sin(progress * 25) * 0.6;
        }
    });

    // TIRE SMOKE PHYSICS
    gsap.to(smokeMaterial, {
        opacity: 0.4,
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "30% top",
            end: "60% top",
            scrub: true
        }
    });

    if (bodyCtrl) {
        // Aggressive Drift Lean as requested
        tl.to(bodyCtrl.rotation, { z: -0.5, duration: 0.3 }, 0.3); // Initial Lean
        tl.to(bodyCtrl.rotation, { z: 0.4, duration: 0.3 }, 1.4);  // Counter Lean
        tl.to(bodyCtrl.rotation, { z: 0, duration: 0.3 }, 2.5);    // Neutral Exit

        // Tilt back during acceleration
        tl.to(bodyCtrl.rotation, { x: -0.1, duration: 0.5 }, 0);
    }

    // 5. LUXURY UI REVEALS (PERMANENT SPEEDO)
    const uiTimeline = [
        { id: '#side-tag', start: "2%", end: "10%" },
        { id: '#brand-top', start: "8%", end: "20%" },
        { id: '#stats-center', start: "25%", end: "40%" },
        { id: '#speedometer-container', start: "5%", end: "95%" },
        { id: '#brand-bottom', start: "45%", end: "85%" }
    ];

    uiTimeline.forEach(ui => {
        gsap.to(ui.id, { opacity: 1, scrollTrigger: { trigger: "#scroll-wrapper", start: `${ui.start} top`, end: "10% top", scrub: true } });
        if (ui.id !== '#speedometer-container') {
            gsap.to(ui.id, { opacity: 0, scrollTrigger: { trigger: "#scroll-wrapper", start: `${ui.end} top`, end: "25% top", scrub: true } });
        }
    });

    // 6. SHOWCASE ROTATION
    gsap.to(car.rotation, {
        y: Math.PI * 2,
        duration: 25,
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
        // High-Class Micro-Vibration: The "Engine Roar"
        const time = performance.now() * 0.001;
        car.position.y += Math.sin(time * 4) * 0.0006; // Roaring Vibration
        car.rotation.z += Math.cos(time * 2) * 0.0002;

        camera.lookAt(car.position.x, car.position.y + 0.45, car.position.z);
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
