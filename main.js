import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

// --- MASTER REALITY ENGINE (V. VERTICAL WALL MODE) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Pure Black Abyss
scene.fog = new THREE.FogExp2(0x000000, 0.01);

// Top-Down Z-Axis Perspective
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1.0, 10000);
camera.position.set(0, 25, 5); // Position for a high-end top-down cinematic look

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- CINEMATIC POST PROCESSING ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.2, 0.4, 0.95);
composer.addPass(bloomPass);

// --- 4K ELITE RACING ASSETS ---
const textureLoader = new THREE.TextureLoader();
const asphaltTex = textureLoader.load('elite_racing_asphalt_4k_texture_1772437915326.png');
asphaltTex.wrapS = asphaltTex.wrapT = THREE.RepeatWrapping;
asphaltTex.repeat.set(100, 400); // Vertical stretch for the "Wall" feel
asphaltTex.anisotropy = 16;

const floorGeo = new THREE.PlaneGeometry(1000, 50000);
const floorMat = new THREE.MeshPhysicalMaterial({
    map: asphaltTex,
    metalness: 0.2,
    roughness: 0.8,
    envMapIntensity: 0.5,
    clearcoat: 0.3
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- LOAD ENVIRONMENT FOR REFLECTIONS ONLY ---
const rgbeLoader = new RGBELoader();
let trackEnv;
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/zwartkops_start_afternoon_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    trackEnv = texture;
    scene.environment = trackEnv; // Apply for reflections, but background remains black
});

// --- BESPOKE AUTOMOTIVE LIGHTING ---
const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
topLight.position.set(0, 30, 0); // Lighting from above for the top-down view
scene.add(topLight);

const rimLight = new THREE.SpotLight(0xBF00FF, 12.0, 100, 0.5);
rimLight.position.set(-10, 15, 0);
scene.add(rimLight);

const rimLight2 = new THREE.SpotLight(0x00ffff, 4.0, 100, 0.5);
rimLight2.position.set(10, 15, 0);
scene.add(rimLight2);

// --- MASTER MODEL ENGINE ---
let car, wheels = [], bodyCtrl;
const gltfLoader = new GLTFLoader();
const modelPath = './uploads_files_5859585_Bugatti+Tourbillon+2024+-+Fully+Rigged+Ready+for+Animation.glb';

gltfLoader.load(modelPath, (gltf) => {
    car = gltf.scene;
    car.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.material = new THREE.MeshPhysicalMaterial({
                color: 0x010101, // Deep Onyx
                metalness: 1.0,
                roughness: 0.1,
                envMapIntensity: 2.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                sheen: 0.8,
                sheenColor: 0xBF00FF,
                iridescence: 0.1,
                iridescenceIOR: 1.6
            });
        }
        if (child.name.includes('Wheel_Rotation_X')) wheels.push(child);
        if (child.name === 'Body_Ctrl') bodyCtrl = child;
    });

    car.scale.set(1.8, 1.8, 1.8); // Slightly larger for the top-down view
    car.position.set(0, 0, 0);
    // Point the car "up" the wall (along -Z axis)
    car.rotation.y = Math.PI;
    scene.add(car);

    gsap.to('#loader', {
        opacity: 0, duration: 2, ease: "power4.inOut", onComplete: () => {
            document.getElementById('loader').style.display = 'none';
            initMasterScroll();
        }
    });
});

function initMasterScroll() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 2.0
        });
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.5,
            onUpdate: (self) => {
                const currentSpeed = Math.round(self.progress * 444);
                if (document.getElementById('speed-val')) document.getElementById('speed-val').innerText = currentSpeed;
                if (document.getElementById('progress-fill')) document.getElementById('progress-fill').style.width = `${self.progress * 100}%`;

                const vel = self.getVelocity();
                wheels.forEach(w => w.rotation.x += vel * 0.001);
                if (asphaltTex) asphaltTex.offset.y -= vel * 0.0001; // asphalt scrolls under the car

                if (bodyCtrl) {
                    // Subtle lateral tilt based on speed/scroll
                    const targetTilt = vel * 0.0005;
                    bodyCtrl.rotation.z = THREE.MathUtils.lerp(bodyCtrl.rotation.z, targetTilt, 0.1);

                    const gDot = document.getElementById('g-dot');
                    if (gDot) {
                        gDot.style.transform = `translate(${targetTilt * 300}px, ${-Math.abs(vel * 0.0006)}px)`;
                    }
                }

                const aeroBadge = document.getElementById('aero-badge');
                if (aeroBadge) {
                    if (Math.abs(vel) > 800) {
                        aeroBadge.innerText = 'AERO: ACTIVE';
                        aeroBadge.classList.add('aero-active');
                    } else {
                        aeroBadge.innerText = 'AERO: PASSIVE';
                        aeroBadge.classList.remove('aero-active');
                    }
                }
            }
        }
    });

    // Vertical Movement Sync
    tl.to(car.position, { z: 4, duration: 10, ease: "power2.inOut" }, 0); // Slight drift down for depth
    tl.to(camera.position, { y: 20, z: 8, duration: 10 }, 0); // Adjust perspective as it scrolls
}

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0001;
});

function animate() {
    requestAnimationFrame(animate);
    if (car) {
        // Subtle tilt based on mouse for premium parallax
        car.rotation.z = THREE.MathUtils.lerp(car.rotation.z, mouseX * 2, 0.1);
        car.rotation.x = THREE.MathUtils.lerp(car.rotation.x, mouseY * 2, 0.1);

        // Locked top-down look
        camera.lookAt(0, 0, car.position.z);
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
