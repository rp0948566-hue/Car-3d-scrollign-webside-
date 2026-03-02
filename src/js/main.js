import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Bugatti Ivory Gallery App
 * An advanced, professional-grade scrollytelling orchestration.
 */
class IvoryGalleryApp {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.progressFill = document.getElementById('progress-fill');
        this.loader = document.getElementById('loader');
        this.hudBoxes = document.querySelectorAll('.hud-box');

        // Configuration
        this.pinDuration = '+=150%';
        this.scrubValue = 1.0;

        this.init();
    }

    init() {
        console.log("Bugatti Ivory Gallery: INITIALIZING...");
        this.initLoader();
        this.initChapters();
        this.initMasterTimeline();
        this.handleResize();
    }

    /**
     * Professional Entry Animation
     */
    initLoader() {
        gsap.to(this.loader, {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut",
            onComplete: () => {
                this.loader.style.display = 'none';
                this.revealHUD();
            }
        });
    }

    revealHUD() {
        gsap.to(this.hudBoxes, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            stagger: 0.1,
            ease: "expo.out"
        });
    }

    /**
     * Master Pinning Orchestration
     * Each chapter is pinned to hold the viewport's focus.
     */
    initChapters() {
        this.sections.forEach((section, index) => {
            const content = section.querySelector('.section-content');

            // Section-Specific Pinning
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: this.pinDuration,
                pin: true,
                scrub: this.scrubValue,
                onUpdate: (self) => {
                    const p = self.progress;
                    // Sophisticated opacity curve: Fade in (0-0.4), Hold (0.4-0.6), Fade out (0.6-1)
                    let opacity = 0;
                    if (p < 0.4) opacity = p * 2.5;
                    else if (p >= 0.4 && p <= 0.6) opacity = 1;
                    else opacity = 1 - (p - 0.6) * 2.5;

                    // Apply smooth transforms and opacity
                    gsap.set(content, {
                        opacity: Math.max(0, Math.min(1, opacity)),
                        y: 30 * (1 - opacity),
                        scale: 0.95 + (0.05 * opacity)
                    });
                }
            });
        });
    }

    /**
     * Global Master Progress Tracking
     */
    initMasterTimeline() {
        ScrollTrigger.create({
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                const globalProgress = self.progress;
                if (this.progressFill) {
                    this.progressFill.style.width = `${globalProgress * 100}%`;
                }
            }
        });
    }

    /**
     * Recovery logic for resizing events
     */
    handleResize() {
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
    }
}

// --- OPTIONAL 3D LAYER (DECOUPLED FOR NOW) ---
/*
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// To reactivate, uncomment below and integrate with the class above.
// const scene = new THREE.Scene();
// ... (Previous 3D Logic)
*/

// BOOTSTRAP THE APP
window.addEventListener('DOMContentLoaded', () => {
    new IvoryGalleryApp();
});
