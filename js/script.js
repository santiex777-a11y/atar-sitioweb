/**
 * ==========================================================================
 * QUIET HORIZON — ENGINE INTEGRAL (EDICIÓN ESPECIAL ATARDECERES)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Configuración Global y Accesibilidad
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
        journeyScroll: document.getElementById('js-journey-scroll'),
        journeySticky: document.getElementById('js-journey-sticky'),
        journeyBar: document.getElementById('js-journey-bar'),
        images: document.querySelectorAll('.reveal-image'),
        contactForm: document.getElementById('js-contact-form'),
        submitBtn: document.getElementById('js-submit-btn')
    };

    // Inicializar plugins GSAP
    gsap.registerPlugin(ScrollTrigger);

    /**
     * MÓDULO 1 — DESPLAZAMIENTO FLUIDO (LENIS)
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

        // Vincular actualización de GSAP
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    };

    /**
     * MÓDULO 2 — PRELOADER DE LA CARGA CREPUSCULAR
     */
    const initPreloader = () => {
        let progress = { value: 0 };
        
        // Bloquear scroll durante la precarga
        if (lenis) lenis.stop();
        document.body.style.overflow = 'hidden';

        gsap.to(progress, {
            value: 100,
            duration: 3.0,
            ease: 'power3.out',
            onUpdate: () => {
                const valActual = Math.floor(progress.value);
                DOM.preloaderPerc.textContent = `${valActual}%`;
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
            duration: 1.5,
            ease: 'power4.inOut'
        });
    };

    /**
     * MÓDULO 3 — REVELACIÓN DE TITULARES Y PARALLAX DE FONDO (HERO)
     */
    const triggerHeroAnimations = () => {
        if (CONFIG.reducedMotion) return;

        // Corte de líneas mediante SplitType
        const splitElements = document.querySelectorAll('[data-split]');
        splitElements.forEach(el => {
            const split = new SplitType(el, { types: 'lines, words', tagName: 'span' });
            gsap.set(split.words, { yPercent: 100, opacity: 0 });
            
            gsap.to(split.words, {
                yPercent: 0,
                opacity: 1,
                duration: 1.6,
                stagger: 0.06,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Zoom out progresivo del atardecer principal
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
     * MÓDULO 4 — CURSOR INTERACTIVO PREMIUM
     */
    const initCustomCursor = () => {
        if (CONFIG.isTouch || CONFIG.reducedMotion) return;

        gsap.set(DOM.cursor, { xPercent: -50, yPercent: -50 });

        const cursorMove = (e) => {
            gsap.to(DOM.cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.45,
                ease: 'power3.out'
            });
        };

        window.addEventListener('mousemove', cursorMove);

        // Hover reactivos con inversión de color
        const interactivos = 'a, button, input, textarea, .reveal-image, .submit-btn';
        document.querySelectorAll(interactivos).forEach((elemento) => {
            elemento.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            elemento.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    };

    /**
     * MÓDULO 5 — RECORRIDO HORIZONTAL (JOURNEY)
     */
    const initHorizontalJourney = () => {
        if (CONFIG.reducedMotion) return;

        const slides = gsap.utils.toArray('.journey__slide');
        const scrollAmount = DOM.journeyScroll.offsetWidth - window.innerWidth;

        // Pinning horizontal del scroll
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
                    gsap.set(DOM.journeyBar, { scaleX: self.progress });
                }
            }
        });

        // Parallax interno para las diapositivas de la luz
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
     * MÓDULO 6 — REVELACIONES ASIMÉTRICAS DE LA GALERÍA
     */
    const initEditorialReveals = () => {
        if (CONFIG.reducedMotion) {
            DOM.images.forEach(img => img.classList.add('is-in-view'));
            return;
        }

        DOM.images.forEach((element) => {
            // Revelado de la máscara visual al entrar al viewport
            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                onEnter: () => element.classList.add('is-in-view'),
                once: true
            });

            // Parallax asimétrico mediante data-speed
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
     * MÓDULO 7 — SINTETIZADOR DE AUDIO AMBIENTAL PROCEDURAL (SOCIOS DE DISEÑO)
     * No requiere descargas de archivos externos, previene errores de red y CORS.
     */
    let audioCtx;
    let oscRoot, oscFifth, lfo, lfoGain, filter, mainGain;
    let isSynthPlaying = false;

    const startSunsetDrone = () => {
        // Inicializar contexto si no existe (gesto de usuario requerido)
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Crear nodos de audio del sintetizador
        oscRoot = audioCtx.createOscillator();
        oscFifth = audioCtx.createOscillator();
        lfo = audioCtx.createOscillator();
        lfoGain = audioCtx.createGain();
        filter = audioCtx.createBiquadFilter();
        mainGain = audioCtx.createGain();

        // Configurar Tono Base (Do2 / C2 - 65.4Hz de alta calidez armónica)
        oscRoot.type = 'sawtooth'; 
        oscRoot.frequency.setValueAtTime(65.41, audioCtx.currentTime);

        // Configurar Quinta Perfecta (Sol2 desafinado sutilmente para efecto coro analógico)
        oscFifth.type = 'sawtooth';
        oscFifth.frequency.setValueAtTime(98.00, audioCtx.currentTime);
        oscFifth.frequency.setValueAtTime(98.15, audioCtx.currentTime + 0.1); 

        // Configurar Filtro de Paso Bajo (Elimina agudos molestos para un sonido súper "nublado" y cinematográfico)
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, audioCtx.currentTime); 
        filter.Q.setValueAtTime(1.2, audioCtx.currentTime);

        // Configurar Modulador de Filtro LFO (Emula el aire y la bruma con un ciclo de 12 segundos)
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime); 
        lfoGain.gain.setValueAtTime(35, audioCtx.currentTime); 

        // Ganancia Principal con Transición Suave (Fade-In de 3 segundos)
        mainGain.gain.setValueAtTime(0, audioCtx.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 3.0);

        // Conectar Cadena
        oscRoot.connect(filter);
        oscFifth.connect(filter);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency); 
        filter.connect(mainGain);
        mainGain.connect(audioCtx.destination);

        // Activar Osciladores
        oscRoot.start();
        oscFifth.start();
        lfo.start();
        isSynthPlaying = true;
    };

    const stopSunsetDrone = () => {
        if (mainGain && audioCtx) {
            // Desvanecimiento suave de salida (Fade-Out de 1.5 segundos)
            mainGain.gain.setValueAtTime(mainGain.gain.value, audioCtx.currentTime);
            mainGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
            
            setTimeout(() => {
                if (!isSynthPlaying) {
                    oscRoot.stop();
                    oscFifth.stop();
                    lfo.stop();
                    oscRoot.disconnect();
                    oscFifth.disconnect();
                    lfo.disconnect();
                }
            }, 1500);
        }
        isSynthPlaying = false;
    };

    const initAudioEngine = () => {
        let isMuted = true;

        DOM.audioToggle.addEventListener('click', () => {
            if (isMuted) {
                try {
                    startSunsetDrone();
                    isMuted = false;
                    DOM.audioToggle.setAttribute('aria-pressed', 'true');
                    DOM.audioToggle.querySelector('.audio-toggle__text').textContent = 'SONIDO ACTIVADO';
                } catch (e) {
                    console.warn('Bloqueo de Audio API del navegador o error de inicialización:', e);
                }
            } else {
                stopSunsetDrone();
                isMuted = true;
                DOM.audioToggle.setAttribute('aria-pressed', 'false');
                DOM.audioToggle.querySelector('.audio-toggle__text').textContent = 'SONIDO DESACTIVADO';
            }
        });
    };

    /**
     * MÓDULO 8 — RESPUESTA DE FORMULARIO PREMIUM
     */
    const initFormInteractivity = () => {
        if (!DOM.contactForm) return;

        DOM.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnText = DOM.submitBtn.querySelector('.submit-btn__text');
            const originalText = btnText.textContent;
            
            DOM.submitBtn.style.pointerEvents = 'none';
            btnText.textContent = 'ENVIANDO AL CREPÚSCULO...';

            setTimeout(() => {
                btnText.textContent = 'RECIBIDO EN EL OCASO';
                DOM.contactForm.reset();
                
                setTimeout(() => {
                    btnText.textContent = originalText;
                    DOM.submitBtn.style.pointerEvents = '';
                }, 4000);
            }, 1800);
        });
    };

    /**
     * CONTROL DE CICLO DE INICIALIZACIÓN
     */
    initSmoothScroll();
    initPreloader();
    initCustomCursor();
    initHorizontalJourney();
    initEditorialReveals();
    initAudioEngine();
    initFormInteractivity();

    // Actualizar coordenadas en redimensionamiento de pantalla
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});