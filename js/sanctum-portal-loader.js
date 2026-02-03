/**
 * Doctor Strange Sanctum Portal Loading Effect
 * VOLUMETRIC PORTAL - Sparks spill over the void boundary
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
        this.expansionSpeed = this.maxRadius / 100;
    }

    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        // Sparks spawn AT the portal edge
        const dist = this.radius + (Math.random() - 0.5) * 20;

        return {
            x: this.centerX + Math.cos(angle) * dist,
            y: this.centerY + Math.sin(angle) * dist,
            prevX: this.centerX + Math.cos(angle) * dist,
            prevY: this.centerY + Math.sin(angle) * dist,
            angle: angle,
            distance: dist,
            speed: 0.04 + Math.random() * 0.08,
            // IMPORTANT: Positive radialSpeed means flying OUTWARD into the void
            radialSpeed: 1 + Math.random() * 3,
            size: 1.5 + Math.random() * 2.5,
            // System Palette Colors: Primary (#6366f1), Secondary (#8b5cf6), Accent (#ec4899)
            color: Math.random() > 0.6 ? '#6366f1' : (Math.random() > 0.5 ? '#8b5cf6' : '#ec4899'),
            life: 0,
            maxLife: 20 + Math.random() * 25
        };
    }

    animate() {
        if (!this.isAnimating) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'lighter';

        // Expand portal
        this.radius += this.expansionSpeed;

        // --- SPARKS SPILL OVER THE DARK BACKGROUND ---
        // The transparent zone is SMALLER than the spark radius
        // This means sparks will appear OVER the black void!
        const r = Math.max(0, this.radius);

        // Transparent zone ends 80px BEFORE the current spark radius
        // So sparks naturally fly over the black!
        const clearZone = Math.max(0, r - 80);
        const blackStart = Math.max(0, r - 50);

        this.pageLoader.style.background = `radial-gradient(circle at center, 
            transparent ${clearZone}px,
            #0a0e27 ${blackStart}px)`;

        // Check if full screen covered
        if (this.radius > this.maxRadius) {
            this.complete();
            return;
        }

        // Spawn particles AT the boundary
        const emitCount = 12;
        for (let i = 0; i < emitCount; i++) {
            this.particles.push(this.createParticle());
        }

        // Limit particles
        if (this.particles.length > 250) {
            this.particles.splice(0, this.particles.length - 250);
        }

        // Draw sparks - they FLY OUTWARD into the black void
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
            // Particles fly OUTWARD - breaking the frame!
            p.distance += p.radialSpeed;
            p.x = this.centerX + Math.cos(p.angle) * p.distance;
            p.y = this.centerY + Math.sin(p.angle) * p.distance;

            // Draw spark with glow (foreground occlusion)
            const alpha = 1 - (p.life / p.maxLife);
            this.ctx.beginPath();
            this.ctx.moveTo(p.prevX, p.prevY);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = p.size * alpha;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 12;
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

        document.body.style.overflow = 'hidden';

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

        document.body.classList.add('loaded');
        document.body.style.overflow = '';
        // Wait for CSS transition
        setTimeout(() => {
            this.pageLoader.style.display = 'none';
        }, 500);
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
