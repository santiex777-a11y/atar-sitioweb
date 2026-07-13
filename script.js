/**
 * ==========================================================================
 * QUIET HORIZON — ENGINE DE INTERACCIONES Y CONTROLADORES GSAP
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Global Config & States
    const CONFIG = {
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    const DOM = {
        preloader: document.getElementById('js-preloader'),
        preloaderBar: document.getElementById('js-preloader-bar'),
        preloaderPerc: document.getElementById('js-preloader-perc'),
        cursor: document.getElementById('js-cursor'),
        audioToggle: document.getElementById('js-audio-toggle'),
        bgAudio: document.getElementById('js-bg-audio'),
        journeyScroll: document.getElementById('js-journey-scroll'),
        journeySticky: document.getElementById('js-journey-sticky'),
        journeyBar: document.getElementById('js-journey-bar'),
        images: document.querySelectorAll('.reveal-image'),
        contactForm: document.getElementById('js-contact-form'),
        submitBtn: document.getElementById('js-submit-btn')
    };

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    /**
     * MODULE 1 — LENIS SMOOTH SCROLL ENGINE
     */
    let lenis;
    const initSmoothScroll = () => {
        if (CONFIG.reducedMotion) return;

        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0
        });

        // Link Lenis ticks to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    };

    /**
     * MODULE 2 — PRELOADER PROGRESS EXPERIENCE
     */
    const initPreloader = () => {
        let progress = { value: 0 };
        
        // Disable scroll during preloader
        if (lenis) lenis.stop();
        document.body.style.overflow = 'hidden';

        gsap.to(progress, {
            value: 100,
            duration: 2.8,
            ease: 'power3.out',
            onUpdate: () => {
                const currentVal = Math.floor(progress.value);
                DOM.preloaderPerc.textContent = `${currentVal}%`;
                gsap.set(DOM.preloaderBar, { scaleX: progress.value / 100 });
            },
            onComplete: () => {
                exitPreloader();
            }
        });
    };

    const exitPreloader = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                DOM.preloader.style.display = 'none';
                document.body.style.overflow = '';
                if (lenis) lenis.start();
                triggerHeroAnimations();
            }
        });

        tl.to(DOM.preloader, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            duration: 1.4,
            ease: 'power4.inOut'
        });
    };

    /**
     * MODULE 3 — HERO TEXT REVEAL & CAMERA TRANSLATION (GSAP)
     */
    const triggerHeroAnimations = () => {
        if (CONFIG.reducedMotion) return;

        // Split text lines using SplitType
        const splitElements = document.querySelectorAll('[data-split]');
        splitElements.forEach(el => {
            const split = new SplitType(el, { types: 'lines, words', tagName: 'span' });
            gsap.set(split.words, { yPercent: 100, opacity: 0 });
            
            gsap.to(split.words, {
                yPercent: 0,
                opacity: 1,
                duration: 1.5,
                stagger: 0.05,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Hero Parallax Background Zoom-Out
        gsap.to('.hero__bg-img', {
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    };

    /**
     * MODULE 4 — PREMIUM CUSTOM CURSOR SYSTEM
     */
    const initCustomCursor = () => {
        if (CONFIG.isTouch || CONFIG.reducedMotion) return;

        gsap.set(DOM.cursor, { xPercent: -50, yPercent: -50 });

        const cursorMove = (e) => {
            gsap.to(DOM.cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.4,
                ease: 'power3.out'
            });
        };

        window.addEventListener('mousemove', cursorMove);

        // Hover Interventions on Interactive Elements
        const interactiveSelectors = 'a, button, input, textarea, .reveal-image';
        document.querySelectorAll(interactiveSelectors).forEach((elem) => {
            elem.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            elem.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    };

    /**
     * MODULE 5 — HORIZONTAL NARRATIVE ENGINE (JOURNEY)
     */
    const initHorizontalJourney = () => {
        if (CONFIG.reducedMotion) return;

        const slides = gsap.utils.toArray('.journey__slide');
        const scrollAmount = DOM.journeyScroll.offsetWidth - window.innerWidth;

        // Sticky Pinning & Scroll Animation Setup
        const horizontalTween = gsap.to(DOM.journeyScroll, {
            x: -scrollAmount,
            ease: 'none',
            scrollTrigger: {
                trigger: DOM.journeySticky,
                pin: true,
                scrub: 1,
                start: 'top top',
                end: () => `+=${scrollAmount}`,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    // Update Chapter Progress Indicator Bar
                    gsap.set(DOM.journeyBar, { scaleX: self.progress });
                }
            }
        });

        // Subtle Image Parallax Transitions inside cards
        slides.forEach((slide) => {
            const img = slide.querySelector('.pillar-card__img-container img');
            if (img) {
                gsap.fromTo(img, 
                    { xPercent: -10 },
                    { 
                        xPercent: 10, 
                        ease: 'none',
                        scrollTrigger: {
                            trigger: slide,
                            containerAnimation: horizontalTween,
                            start: 'left right',
                            end: 'right left',
                            scrub: true
                        }
                    }
                );
            }
        });
    };

    /**
     * MODULE 6 — EDITORIAL REVEALS & GEOMETRIES
     */
    const initEditorialReveals = () => {
        if (CONFIG.reducedMotion) {
            DOM.images.forEach(img => img.classList.add('is-in-view'));
            return;
        }

        DOM.images.forEach((element) => {
            // Reveal curtain on viewport entry
            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                onEnter: () => element.classList.add('is-in-view'),
                once: true
            });

            // Asymmetric structural parallax calculation
            const speed = parseFloat(element.getAttribute('data-speed')) || 0;
            if (speed !== 0) {
                gsap.to(element, {
                    yPercent: speed * 100,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }
        });
    };

    /**
     * MODULE 7 — AMBIENT MUSIC ENGINE
     */
    const initAudioEngine = () => {
        let isMuted = true;

        DOM.audioToggle.addEventListener('click', () => {
            if (isMuted) {
                DOM.bgAudio.volume = 0.15;
                DOM.bgAudio.play()
                    .then(() => {
                        isMuted = false;
                        DOM.audioToggle.setAttribute('aria-pressed', 'true');
                        DOM.audioToggle.querySelector('.audio-toggle__text').textContent = 'SOUND ON';
                    })
                    .catch(() => {
                        console.warn('Playback blocked by browser autoplay security policies.');
                    });
            } else {
                DOM.bgAudio.pause();
                isMuted = true;
                DOM.audioToggle.setAttribute('aria-pressed', 'false');
                DOM.audioToggle.querySelector('.audio-toggle__text').textContent = 'SOUND OFF';
            }
        });
    };

    /**
     * MODULE 8 — PREMIUM FEEDBACK FORM DYNAMICS
     */
    const initFormInteractivity = () => {
        if (!DOM.contactForm) return;

        DOM.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnText = DOM.submitBtn.querySelector('.submit-btn__text');
            const originalText = btnText.textContent;
            
            DOM.submitBtn.style.pointerEvents = 'none';
            btnText.textContent = 'TRANSMITTING...';

            // Imitate dynamic server response delay
            setTimeout(() => {
                btnText.textContent = 'SUCCESSFULLY RECEIVED';
                DOM.contactForm.reset();
                
                setTimeout(() => {
                    btnText.textContent = originalText;
                    DOM.submitBtn.style.pointerEvents = '';
                }, 4000);
            }, 1800);
        });
    };

    /**
     * EXECUTING INITIALIZATION SEQUENCES
     */
    initSmoothScroll();
    initPreloader();
    initCustomCursor();
    initHorizontalJourney();
    initEditorialReveals();
    initAudioEngine();
    initFormInteractivity();

    // Redraw ScrollTrigger coordinates on viewport mutations
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});
