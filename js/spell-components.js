/**
 * Spell UI Engine for CAT-SYSTEM V2
 * Inspired by https://spell.sh/ - Refined UI components for Design Engineers
 *
 * Implements:
 * 1. Spell Light Rays (Interactive Canvas Background)
 * 2. Spell Kbd Search (/ Shortcut & Quick Focus)
 * 3. Spell 3D Tilt Cards with Cursor Spotlight
 * 4. Spell Blur-Reveal & Shimmer Typography
 * 5. Spell Tactile Pop-Button Feedback
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initSpellLightRays();
        initSpellKbdSearch();
        initSpellTiltCards();
        initSpellTypography();
        initSpellPopButtons();
    });

    /**
     * 1. Spell Light Rays (Ambient WebGL/Canvas Animation)
     * Recreates the atmospheric light rays from spell.sh
     */
    function initSpellLightRays() {
        let canvas = document.getElementById('spell-light-rays');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'spell-light-rays';
            canvas.className = 'spell-canvas-bg';
            document.body.prepend(canvas);
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        let animationFrameId;
        let isVisible = true;

        const rays = [
            { angle: -0.4, speed: 0.0003, width: 0.35, alpha: 0.045 },
            { angle: -0.15, speed: -0.0004, width: 0.25, alpha: 0.06 },
            { angle: 0.1, speed: 0.00025, width: 0.4, alpha: 0.04 },
            { angle: 0.35, speed: -0.0003, width: 0.3, alpha: 0.055 },
            { angle: 0.6, speed: 0.0002, width: 0.28, alpha: 0.035 }
        ];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize, { passive: true });

        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
            if (isVisible) loop();
        });

        let time = 0;
        function render() {
            if (!isVisible) return;
            ctx.clearRect(0, 0, width, height);

            const isDark = document.body.classList.contains('dark-mode');
            const originX = width * 0.5;
            const originY = -50;
            const rayLength = Math.max(width, height) * 1.5;

            time += 1;

            rays.forEach((ray, i) => {
                const currentAngle = ray.angle + Math.sin(time * ray.speed + i) * 0.08;
                const spread = ray.width;

                const x1 = originX + Math.sin(currentAngle - spread * 0.5) * rayLength;
                const y1 = originY + Math.cos(currentAngle - spread * 0.5) * rayLength;
                const x2 = originX + Math.sin(currentAngle + spread * 0.5) * rayLength;
                const y2 = originY + Math.cos(currentAngle + spread * 0.5) * rayLength;

                const grad = ctx.createRadialGradient(
                    originX, originY, 10,
                    originX, originY, rayLength
                );

                const baseColor = isDark ? '255, 255, 255' : '100, 116, 139';
                const opacity = isDark ? ray.alpha : ray.alpha * 0.65;

                grad.addColorStop(0, `rgba(${baseColor}, ${opacity * 1.5})`);
                grad.addColorStop(0.35, `rgba(${baseColor}, ${opacity})`);
                grad.addColorStop(0.8, `rgba(${baseColor}, ${opacity * 0.2})`);
                grad.addColorStop(1, `rgba(${baseColor}, 0)`);

                ctx.beginPath();
                ctx.moveTo(originX, originY);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();

                ctx.fillStyle = grad;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        }

        function loop() {
            cancelAnimationFrame(animationFrameId);
            render();
        }

        loop();
    }

    /**
     * 2. Spell Kbd Search Component
     * Press '/' or 'Ctrl+K' to instantly open and focus search
     */
    function initSpellKbdSearch() {
        const searchInput = document.getElementById('search-input');
        const searchContainer = document.getElementById('search-container');
        const menuToggle = document.getElementById('menu-toggle');

        if (!searchInput) return;

        // Inserir tag <kbd>/</kbd> se não existir
        if (searchContainer && !searchContainer.querySelector('.spell-kbd')) {
            const kbd = document.createElement('kbd');
            kbd.className = 'spell-kbd';
            kbd.textContent = '/';
            kbd.title = 'Pressione / para buscar';
            searchContainer.appendChild(kbd);
        }

        // Listener global de teclado
        window.addEventListener('keydown', (e) => {
            // Ignora se o usuário já estiver digitando em um input, textarea ou select
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isEditing = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || document.activeElement.isContentEditable;

            // Tecla / para buscar
            if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) && !isEditing) {
                e.preventDefault();

                // Abrir sidebar se estiver oculta
                if (menuToggle && !menuToggle.checked) {
                    menuToggle.checked = true;
                }

                // Focar com micro-animação
                setTimeout(() => {
                    searchInput.focus();
                    searchInput.select();
                    searchInput.classList.add('spell-focus-pulse');
                    setTimeout(() => searchInput.classList.remove('spell-focus-pulse'), 400);
                }, 50);
            }

            // Tecla Escape para desfoque
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.blur();
                if (menuToggle && window.innerWidth <= 768) {
                    menuToggle.checked = false;
                }
            }
        });
    }

    /**
     * 3. Spell 3D Perspective Tilt Cards with Spotlight Glow
     * Based on spell.sh's Perspective Card and Tilt Card
     */
    function initSpellTiltCards() {
        const targets = document.querySelectorAll('.quick-link-card, .hero-stat-card, .hero-section');

        targets.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Salva coordenadas para o gradiente de spotlight
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                // Calcula inclinação 3D se for card individual
                if (card.classList.contains('quick-link-card') || card.classList.contains('hero-stat-card')) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
                    const rotateY = ((x - centerX) / centerX) * 6;  // max 6deg

                    card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px) scale3d(1.015, 1.015, 1.015)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /**
     * 4. Spell Typography Animations (Blur Reveal & Shimmer)
     */
    function initSpellTypography() {
        const heroTitle = document.querySelector('.hero-title');
        const heroBadge = document.querySelector('.hero-badge');
        const heroHighlight = document.querySelector('.hero-highlight');

        // Shimmer no texto de destaque
        if (heroHighlight) {
            heroHighlight.classList.add('spell-shimmer-text');
        }

        // Pill badge com ping dot
        if (heroBadge && !heroBadge.querySelector('.spell-badge-dot')) {
            heroBadge.classList.add('spell-badge');
            const dot = document.createElement('span');
            dot.className = 'spell-badge-dot';
            heroBadge.prepend(dot);
        }

        // Animação de revelação suave (Blur Reveal)
        if (heroTitle) {
            heroTitle.classList.add('spell-blur-reveal');
        }
    }

    /**
     * 5. Spell Tactile Pop-Button Feedback
     */
    function initSpellPopButtons() {
        const buttons = document.querySelectorAll('#login-btn, #logout-btn, #theme-toggle, .radio-toggle-btn, button[type="submit"]');

        buttons.forEach(btn => {
            btn.classList.add('spell-pop-btn');
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.97) translateY(1px)';
            });
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /**
     * 6. Spell UI Blur Reveal Engine (Official spell.sh component)
     * Smooth element blur reveal animation with staggered timing
     */
    function applySpellBlurReveal(element, options = {}) {
        if (!element || element.dataset.blurApplied) return;
        element.dataset.blurApplied = 'true';

        const delay = options.delay !== undefined 
            ? options.delay 
            : (parseFloat(element.dataset.blurDelay) || 0);

        setTimeout(() => {
            element.classList.add('is-revealed');
        }, delay * 1000);
    }

    window.triggerSpellBlurReveal = function (container = document) {
        const targets = container.querySelectorAll('.spell-blur-reveal');
        targets.forEach((el, index) => {
            const delay = el.dataset.blurDelay !== undefined && !isNaN(parseFloat(el.dataset.blurDelay))
                ? parseFloat(el.dataset.blurDelay)
                : (index * 0.08);
            applySpellBlurReveal(el, { delay });
        });
    };

    window.applySpellBlurReveal = applySpellBlurReveal;
})();
