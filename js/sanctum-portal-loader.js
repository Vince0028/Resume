/**
 * Doctor Strange Sanctum Portal Loading Effect
 * Creates a "window" effect where the website is visible inside the expanding portal
 */

class SanctumPortalLoader {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.radius = 0;
        this.expansionSpeed = 0;
        this.isAnimating = false;
        this.animationFrame = null;

        this.setupPortalStructure();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupPortalStructure() {
        const pageLoader = document.getElementById('page-loader');

        // Make page-loader just a container (transparent background)
        pageLoader.style.backgroundColor = 'transparent';

        // Create the black mask that covers everything EXCEPT the portal circle
        // This sits BEHIND the canvas but ABOVE the website content
        this.maskOverlay = document.createElement('div');
        this.maskOverlay.id = 'portal-mask';
        this.maskOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #0a0e27;
            z-index: 99997;
            pointer-events: none;
        `;

        // Insert mask BEFORE the page-loader (so it's behind the canvas)
        document.body.insertBefore(this.maskOverlay, pageLoader);

        // Update canvas z-index to be above mask
        this.canvas.style.zIndex = '99999';
    }

    updateMask() {
        if (!this.maskOverlay) return;

        // Create circular hole that reveals content underneath
        // The hole grows from center, revealing the website
        const featherPx = 5; // Slight feather for organic edge
        this.maskOverlay.style.maskImage = `radial-gradient(circle ${this.radius}px at center, transparent 0%, transparent calc(100% - ${featherPx}px), black 100%)`;
        this.maskOverlay.style.webkitMaskImage = `radial-gradient(circle ${this.radius}px at center, transparent 0%, transparent calc(100% - ${featherPx}px), black 100%)`;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2);
        this.expansionSpeed = this.canvas.width / 120; // Slightly faster
    }

    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const dist = this.radius + (Math.random() - 0.5) * 15;
        const x = this.centerX + Math.cos(angle) * dist;
        const y = this.centerY + Math.sin(angle) * dist;

        return {
            x,
            y,
            prevX: x,
            prevY: y,
            angle,
            distance: dist,
            speed: 0.05 + Math.random() * 0.1,
            radialSpeed: (Math.random() - 0.1) * 3.5,
            size: 1.5 + Math.random() * 3,
            color: Math.random() > 0.4 ? '#ffb300' : '#ff3c00',
            life: 0,
            maxLife: 20 + Math.random() * 30
        };
    }

    animate() {
        if (!this.isAnimating) return;

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Bloom effect for glow
        this.ctx.globalCompositeOperation = 'lighter';

        // Expand the portal
        this.radius += this.expansionSpeed;

        // Update mask to reveal more content
        this.updateMask();

        // Check if portal has fully opened
        if (this.radius > this.maxRadius * 0.95) {
            this.complete();
            return;
        }

        // Emit particles at the growing edge
        const emitCount = 30;
        for (let i = 0; i < emitCount; i++) {
            this.particles.push(this.createParticle());
        }

        // Update and draw spark streaks
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

            // Draw glowing heat streaks
            this.ctx.beginPath();
            this.ctx.moveTo(p.prevX, p.prevY);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = p.size * (1 - p.life / p.maxLife);
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = p.color;
            this.ctx.stroke();
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    start() {
        // Hide the loading text when portal starts
        const loaderContent = document.querySelector('.loader-content');
        if (loaderContent) {
            loaderContent.style.transition = 'opacity 0.3s ease';
            loaderContent.style.opacity = '0';
        }

        // Prevent scrolling during animation
        document.body.style.overflow = 'hidden';

        // Start portal animation after text fades
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

        // Fade out the mask
        if (this.maskOverlay) {
            this.maskOverlay.style.transition = 'opacity 0.5s ease';
            this.maskOverlay.style.opacity = '0';
        }

        // Re-enable scrolling
        document.body.style.overflow = '';

        // Trigger the page loaded state
        document.body.classList.add('loaded');

        setTimeout(() => {
            const pageLoader = document.getElementById('page-loader');
            if (pageLoader) {
                pageLoader.style.display = 'none';
            }
            if (this.maskOverlay && this.maskOverlay.parentNode) {
                this.maskOverlay.parentNode.removeChild(this.maskOverlay);
            }
        }, 500);
    }

    stop() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize portal loader
let portalLoader = null;

// Wait for page to be fully loaded
window.addEventListener('load', function () {
    // Reset scroll position
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Start portal after brief delay
    setTimeout(() => {
        portalLoader = new SanctumPortalLoader('portal-canvas');
        portalLoader.start();
    }, 300);
});

// Fallback timeout
setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
        document.body.classList.add('loaded');
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) pageLoader.style.display = 'none';
        const mask = document.getElementById('portal-mask');
        if (mask) mask.style.display = 'none';
    }
}, 6000);
