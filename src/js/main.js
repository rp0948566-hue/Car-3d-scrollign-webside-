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

    initCursor();
};

const initCursor = () => {
    const cursor = document.querySelector('.cursor');
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });
    });

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 2, backgroundColor: 'transparent', border: '1px solid var(--color-accent)' });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, backgroundColor: 'var(--color-accent)', border: 'none' });
        });
    });
};


// Start the show
window.addEventListener('DOMContentLoaded', init);
