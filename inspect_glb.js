import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const modelPath = 'c:/Users/HP/Desktop/car3d websid e/uploads_files_5859585_Bugatti+Tourbillon+2024+-+Fully+Rigged+Ready+for+Animation.glb';

loader.load(modelPath, (gltf) => {
    console.log('--- ANIMATIONS FOUND ---');
    gltf.animations.forEach((clip, index) => {
        console.log(`${index}: ${clip.name} (Duration: ${clip.duration})`);
    });
    console.log('--- MESH HIERARCHY ---');
    gltf.scene.traverse(child => {
        if (child.isMesh || child.isGroup) {
            console.log(`${child.name} [${child.type}]`);
        }
    });
    process.exit(0);
}, undefined, (err) => {
    console.error(err);
    process.exit(1);
});
