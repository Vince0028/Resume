/**
 * Doctor Strange Sanctum Portal Loading Effect
 * FINAL VERSION: Window Effect + High Quality Sparks
 */

class SanctumPortalLoader {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pageLoader = document.getElementById('page-loader');
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
        this.expansionSpeed = this.canvas.width / 160; // Smooth, cinematic speed
    }

    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        // Particles spawn on the edge
        const dist = this.radius + (Math.random() - 0.5) * 15;

        return {
            x: this.centerX + Math.cos(angle) * dist,
            y: this.centerY + Math.sin(angle) * dist,
            prevX: this.centerX + Math.cos(angle) * dist,
            prevY: this.centerY + Math.sin(angle) * dist,
            angle: angle,
            distance: dist,
            speed: 0.05 + Math.random() * 0.08,
            radialSpeed: (Math.random() - 0.2) * 3,
            size: 1.5 + Math.random() * 2.5,
            color: Math.random() > 0.4 ? '#ffb300' : '#ff3c00',
            life: 0,
            maxLife: 15 + Math.random() * 20
        };
    }

    animate() {
        if (!this.isAnimating) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'lighter';

        // Expand portal
        this.radius += this.expansionSpeed;

        // --- THE MAGIC: Create the Window Effect ---
        // INSIDE circle = Transparent (resume visible)
        // OUTSIDE circle = Black (everything else hidden)
        // Dark edge in the MIDDLE of sparks for organic blend
        const r = Math.max(0, this.radius);

        const innerTransparent = Math.max(0, r - 40); // Fully clear inside
        const outerBlack = r + 40; // Fully black outside

        this.pageLoader.style.background = `radial-gradient(circle at center, 
            transparent ${innerTransparent}px,
            rgba(10, 14, 39, 0.5) ${r}px,
            #0a0e27 ${outerBlack}px)`;

        // Check if full screen covered
        if (this.radius > this.maxRadius * 1.2) {
            this.complete();
            return;
        }

        // Spawn particles
        const emitCount = 15;
        for (let i = 0; i < emitCount; i++) {
            this.particles.push(this.createParticle());
        }

        // Limit particles
        if (this.particles.length > 300) {
            this.particles.splice(0, this.particles.length - 300);
        }

        // Draw sparks
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life++;

            if (p.life > p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }

            p.prevX = p.x;
            p.prevY = p.y;
            p.angle += p.speed;
            p.distance += p.radialSpeed;
            p.x = this.centerX + Math.cos(p.angle) * p.distance;
            p.y = this.centerY + Math.sin(p.angle) * p.distance;

            // Draw heat streak
            this.ctx.beginPath();
            this.ctx.moveTo(p.prevX, p.prevY);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = p.size * (1 - p.life / p.maxLife);
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

        // Ensure scrolling is disabled during intro
        document.body.style.overflow = 'hidden';

        // Start animation
        setTimeout(() => {
            this.isAnimating = true;
            this.radius = 0;
            this.particles = [];

            // Set initial background gradient
            this.pageLoader.style.background = `radial-gradient(circle at center, transparent 0px, #0a0e27 0px)`;

            this.animate();
        }, 300);
    }

    complete() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Mark as loaded
        document.body.classList.add('loaded');
        document.body.style.overflow = '';

        // Remove page loader
        this.pageLoader.style.display = 'none';
    }
}

// Initialize
window.addEventListener('load', function () {
    window.scrollTo(0, 0);

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
        document.body.style.overflow = '';
    }
}, 6000);
