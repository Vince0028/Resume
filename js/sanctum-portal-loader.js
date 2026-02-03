/**
 * Doctor Strange Sanctum Portal Loading Effect
 * RESTORED VISUALS - High quality sparks with reliable loading
 */

class SanctumPortalLoader {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.radius = 0;
        this.isAnimating = false;
        this.animationFrame = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2);
        // Expansion speed balanced for visual impact (not too fast, not too slow)
        this.expansionSpeed = this.canvas.width / 140;
    }

    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        // Particles spawn on the edge of the circle
        const dist = this.radius + (Math.random() - 0.5) * 15;

        return {
            x: this.centerX + Math.cos(angle) * dist,
            y: this.centerY + Math.sin(angle) * dist,
            prevX: this.centerX + Math.cos(angle) * dist, // Track previous pos for drawing lines
            prevY: this.centerY + Math.sin(angle) * dist,
            angle: angle,
            distance: dist,
            // Spinning speed (angular velocity)
            speed: 0.05 + Math.random() * 0.08,
            // Outward speed
            radialSpeed: (Math.random() - 0.2) * 3,
            // Thickness of the spark
            size: 1.5 + Math.random() * 2.5,
            color: Math.random() > 0.4 ? '#ffb300' : '#ff3c00', // Amber & Red-Orange
            life: 0,
            maxLife: 15 + Math.random() * 20
        };
    }

    animate() {
        if (!this.isAnimating) return;

        // Clear with a slight trail effect (optional, but sticking to clearRect for performance)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Add "Bloom" effect
        this.ctx.globalCompositeOperation = 'lighter';

        // Expand portal
        this.radius += this.expansionSpeed;

        // Check if full screen covered
        if (this.radius > this.maxRadius * 1.1) {
            this.complete();
            return;
        }

        // Spawn particles (Enough to look dense, low enough for performance)
        const emitCount = 15;
        for (let i = 0; i < emitCount; i++) {
            this.particles.push(this.createParticle());
        }

        // Limit total particles to prevent lag
        if (this.particles.length > 300) {
            this.particles.splice(0, this.particles.length - 300);
        }

        // Update and Draw
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life++;

            if (p.life > p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }

            // Save previous position
            p.prevX = p.x;
            p.prevY = p.y;

            // Move particle
            p.angle += p.speed; // Spin
            p.distance += p.radialSpeed; // Move out/in

            // Calculate new position
            p.x = this.centerX + Math.cos(p.angle) * p.distance;
            p.y = this.centerY + Math.sin(p.angle) * p.distance;

            // DRAW THE HEAT STREAK (Line from prev to new)
            this.ctx.beginPath();
            this.ctx.moveTo(p.prevX, p.prevY);
            this.ctx.lineTo(p.x, p.y);

            // Visual Styles
            this.ctx.strokeStyle = p.color;
            // Fade out near end of life
            this.ctx.lineWidth = p.size * (1 - p.life / p.maxLife);
            // Slight glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;

            this.ctx.stroke();
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    start() {
        // Hide loader text first
        const loaderContent = document.querySelector('.loader-content');
        if (loaderContent) {
            loaderContent.style.transition = 'opacity 0.3s ease';
            loaderContent.style.opacity = '0';
        }

        // Begin portal animation
        setTimeout(() => {
            this.isAnimating = true;
            this.radius = 0;
            this.particles = [];
            this.animate();
        }, 300);
    }

    complete() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // 1. Mark body as loaded to trigger CSS transitions for content
        document.body.classList.add('loaded');

        // 2. Fade out the entire black page-loader
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            pageLoader.style.transition = 'opacity 0.5s ease';
            pageLoader.style.opacity = '0';

            // 3. Remove it from DOM/Layout after fade
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 500);
        }
    }
}

// Initialize
window.addEventListener('load', function () {
    // Reset scroll
    window.scrollTo(0, 0);

    // Wait a moment for layout to settle, then start
    setTimeout(() => {
        const loader = new SanctumPortalLoader('portal-canvas');
        loader.start();
    }, 200);
});

// Failsafe
setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
        document.body.classList.add('loaded');
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) pageLoader.style.display = 'none';
    }
}, 5000);
