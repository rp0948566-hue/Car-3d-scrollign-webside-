import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * App State
 */
const state = {
    initialized: false,
};

/**
 * Initialize Application
 */
const init = () => {
    console.log('--- REDEFINED | Car 3D Experience ---');
    state.initialized = true;
};

// Start the show
window.addEventListener('DOMContentLoaded', init);
