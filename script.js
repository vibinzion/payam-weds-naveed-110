/* ==========================================================================
   EMERALD NOIR — LUXURY DIGITAL WEDDING INVITATION SCRIPT
   Syeda Payam Batool Naqvi & Syed Naveed Shoukat Zaidi
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initWelcomeOverlay();
    initAmbientParticles();
    initCountdown();
    initScratchCard();
    initScrollAnimations();
});

/* ==========================================================================
   1. WELCOME OVERLAY & BACKGROUND MUSIC UNLOCKER
   ========================================================================== */
function initWelcomeOverlay() {
    const overlay = document.getElementById('welcomeOverlay');
    const audio = document.getElementById('wedding-audio');

    if (!overlay) return;

    overlay.addEventListener('click', () => {
        // 1. Play background music on explicit user tap
        if (audio) {
            audio.volume = 0.85;
            audio.play().catch(err => {
                console.log('Audio playback note:', err);
            });
        }

        // 2. Smoothly fade out overlay to reveal invitation
        overlay.classList.add('fade-out');

        // 3. Remove overlay from DOM flow once 1.5s transition completes
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1500);
    }, { once: true });
}

/* ==========================================================================
   2. SCRATCH TO REVEAL WEDDING DATE
   ========================================================================== */
function initScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    const box = document.getElementById('scratchBox');
    const revealBtn = document.getElementById('revealAllBtn');
    if (!canvas || !box) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let isRevealed = false;

    function resizeCanvas() {
        const rect = box.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawGoldFoil();
    }

    function drawGoldFoil() {
        const w = canvas.width;
        const h = canvas.height;
        
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#e8c872');
        grad.addColorStop(0.25, '#d4af37');
        grad.addColorStop(0.5, '#fff0bd');
        grad.addColorStop(0.75, '#b38728');
        grad.addColorStop(1, '#825e14');

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < 400; i++) {
            const px = Math.random() * w;
            const py = Math.random() * h;
            const pr = Math.random() * 1.5;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(92, 66, 12, 0.35)';
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = 'rgba(74, 51, 10, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        ctx.fillStyle = '#2d2006';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '600 13px "Montserrat", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('✨ SCRATCH WITH TOUCH OR MOUSE ✨', w / 2, h / 2 - 12);
        
        ctx.fillStyle = '#47340b';
        ctx.font = 'italic 12px "Playfair Display", serif';
        ctx.fillText('To unveil the sacred date', w / 2, h / 2 + 12);
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
        if (!isRevealed) resizeCanvas();
    });

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function scratch(e) {
        if (!isDrawing || isRevealed) return;
        const pos = getPos(e);
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
        ctx.fill();

        checkScratchPercentage();
    }

    function checkScratchPercentage() {
        if (isRevealed) return;
        try {
            const w = canvas.width;
            const h = canvas.height;
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            let clearedPixels = 0;
            const step = 32;
            const totalSampled = (w * h) / step;

            for (let i = 3; i < data.length; i += step * 4) {
                if (data[i] === 0) {
                    clearedPixels++;
                }
            }

            if (clearedPixels / totalSampled > 0.42) {
                revealEntireDate();
            }
        } catch (err) {
            console.error(err);
        }
    }

    function revealEntireDate() {
        if (isRevealed) return;
        isRevealed = true;
        canvas.style.transition = 'opacity 0.8s ease';
        canvas.style.opacity = '0';
        setTimeout(() => {
            canvas.style.display = 'none';
        }, 800);
        if (revealBtn) {
            revealBtn.style.opacity = '0.4';
            revealBtn.disabled = true;
            revealBtn.innerHTML = '<i class="fa-solid fa-check"></i> Date Revealed';
        }
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        scratch(e);
    });
    window.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', scratch);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        scratch(e);
        e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchend', () => { isDrawing = false; });
    canvas.addEventListener('touchmove', (e) => {
        scratch(e);
        e.preventDefault();
    }, { passive: false });

    // Fallback reveal button
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            revealEntireDate();
        });
    }
}

/* ==========================================================================
   3. LIVE COUNTDOWN TIMER
   Target: Friday, 20 November 2026, 06:30 PM (Asia/Karachi UTC+5)
   ========================================================================== */
function initCountdown() {
    const targetTime = new Date('2026-11-20T18:30:00+05:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function update() {
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

/* ==========================================================================
   4. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up');
    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. AMBIENT GOLD DUST PARTICLES
   ========================================================================== */
function initAmbientParticles() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 55);

    class StardustParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * w;
            this.y = initial ? Math.random() * h : h + 10;
            this.size = Math.random() * 2 + 0.6;
            this.speedY = Math.random() * 0.45 + 0.15;
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.pulse = Math.random() * 0.03 + 0.01;
            this.pulseDir = 1;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;

            this.opacity += this.pulse * this.pulseDir;
            if (this.opacity > 0.85) this.pulseDir = -1;
            if (this.opacity < 0.2) this.pulseDir = 1;

            if (this.y < -10 || this.x < -10 || this.x > w + 10) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = `rgba(238, 207, 109, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new StardustParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}
