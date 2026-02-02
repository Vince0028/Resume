/**
 * Doctor Strange Sanctum Portal Loading Effect
 * A mystical portal opening animation for the resume loading screen
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

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    createMaskOverlay() {
        // Create a black overlay with a circular mask that reveals the website
        this.maskOverlay = document.createElement('div');
        this.maskOverlay.id = 'portal-mask';
        this.maskOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #0a0e27;
            z-index: 99998;
            pointer-events: none;
            mask-image: radial-gradient(circle 0px at center, transparent 0%, transparent 0%, black 0%);
            -webkit-mask-image: radial-gradient(circle 0px at center, transparent 0%, transparent 0%, black 0%);
        `;
        document.getElementById('page-loader').appendChild(this.maskOverlay);
    }

    updateMask() {
        if (!this.maskOverlay) return;

        // Create a sharp-edged circular window with slight feathering
        const featherPercent = 98; // 2% feather for organic burning effect
        this.maskOverlay.style.maskImage = `radial-gradient(circle ${this.radius}px at center, transparent 0%, transparent ${featherPercent}%, black 100%)`;
        this.maskOverlay.style.webkitMaskImage = `radial-gradient(circle ${this.radius}px at center, transparent 0%, transparent ${featherPercent}%, black 100%)`;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.maxRadius = Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2);
        this.expansionSpeed = this.canvas.width / 140;
    }

    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const dist = this.radius + (Math.random() - 0.5) * 12;
        const x = this.centerX + Math.cos(angle) * dist;
        const y = this.centerY + Math.sin(angle) * dist;

        return {
            x,
            y,
            prevX: x,
            prevY: y,
            angle,
            distance: dist,
            speed: 0.06 + Math.random() * 0.08,
            radialSpeed: (Math.random() - 0.1) * 3,
            size: 1.2 + Math.random() * 2.5,
            color: Math.random() > 0.4 ? '#ffb300' : '#ff3c00',
            life: 0,
            maxLife: 15 + Math.random() * 25
        };
    }

    animate() {
        if (!this.isAnimating) return;

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Intense bloom composite for glowing effect
        this.ctx.globalCompositeOperation = 'lighter';

        // Expand the portal
        this.radius += this.expansionSpeed;

        // Check if portal has fully opened
        if (this.radius > this.maxRadius * 0.9) {
            this.complete();
            return;
        }

        // Emit particles at the growing edge
        const emitCount = 25;
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

            // Draw long, glowing heat streaks
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
        // Hide the loading text and progress bar when portal starts
        const loaderContent = document.querySelector('.loader-content');
        if (loaderContent) {
            loaderContent.style.transition = 'opacity 0.3s ease';
            loaderContent.style.opacity = '0';
        }

        // Make the website content visible immediately (it will be revealed by the portal)
        // Remove the initial hiding of content
        document.body.style.overflow = 'hidden'; // Prevent scrolling during animation

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

        // Trigger the page loaded state
        document.body.classList.add('loaded');
        setTimeout(() => {
            document.getElementById('page-loader').style.display = 'none';
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

// Wait for the entire page (including images, styles, etc.) to be fully loaded
window.addEventListener('load', function () {
    // Reset scroll position
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Wait a brief moment to ensure everything is rendered
    setTimeout(() => {
        portalLoader = new SanctumPortalLoader('portal-canvas');
        portalLoader.start();
    }, 300);
});

// Fallback timeout in case portal doesn't complete (5 seconds)
setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
        document.body.classList.add('loaded');
        setTimeout(() => {
            const pageLoader = document.getElementById('page-loader');
            if (pageLoader) {
                pageLoader.style.display = 'none';
            }
        }, 500);
    }
}, 5000);
