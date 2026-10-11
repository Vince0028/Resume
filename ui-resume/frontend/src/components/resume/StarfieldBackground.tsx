import React, { useEffect, useRef } from 'react';

interface StarfieldBackgroundProps {
  className?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  speed: number;
  thickness: number;
  headColor: string;
  tailColor: string;
  alpha: number;
  life: number;
  maxLife: number;
  isAsteroid: boolean;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initStars();
    };

    // Stars collection
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 7500); // good density
      const starColors = [
        '#ffffff',
        '#e0f2fe', // soft cyan
        '#fef08a', // warm amber star
        '#fbcfe8', // soft rose
        '#ddd6fe', // gentle lavender
      ];

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() < 0.85 ? Math.random() * 1.4 + 0.6 : Math.random() * 2.2 + 1.2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          baseAlpha: Math.random() * 0.5 + 0.25,
          twinkleSpeed: Math.random() * 0.003 + 0.001,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    // Meteors and Falling Asteroids
    let meteors: Meteor[] = [];
    let embers: Ember[] = [];

    const spawnMeteor = (customX?: number, customY?: number, forceAsteroid = false) => {
      const isAsteroid = forceAsteroid || Math.random() < 0.4;
      const angle = (Math.PI / 180) * (Math.random() * 20 + 35); // 35 to 55 degrees downwards
      const speed = isAsteroid ? Math.random() * 5 + 7 : Math.random() * 9 + 11;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Start position (mostly top and upper-left)
      const startX = customX ?? (Math.random() * (width + 300) - 200);
      const startY = customY ?? (Math.random() * -100 - 20);

      const headColors = isAsteroid
        ? ['#ffedd5', '#fed7aa', '#fde047', '#ffffff'] // warm fiery asteroid
        : ['#ffffff', '#bae6fd', '#e0f2fe', '#fef08a']; // blue-white shooting star

      const tailColors = isAsteroid
        ? 'rgba(249, 115, 22, ' // orange-amber asteroid trail
        : 'rgba(56, 189, 248, '; // cyan-white star trail

      meteors.push({
        x: startX,
        y: startY,
        vx,
        vy,
        length: isAsteroid ? Math.random() * 100 + 120 : Math.random() * 160 + 180,
        speed,
        thickness: isAsteroid ? Math.random() * 1.5 + 2.5 : Math.random() * 1 + 1.5,
        headColor: headColors[Math.floor(Math.random() * headColors.length)],
        tailColor: tailColors,
        alpha: 1,
        life: 0,
        maxLife: isAsteroid ? Math.floor(Math.random() * 30 + 65) : Math.floor(Math.random() * 25 + 45),
        isAsteroid,
      });
    };

    const spawnEmber = (x: number, y: number, color: string) => {
      embers.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5 - 0.5,
        vy: (Math.random() - 0.5) * 1.5 + 0.5,
        color,
        alpha: 0.9,
        size: Math.random() * 2 + 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 15),
      });
    };

    let meteorSpawnTimer = 0;
    const meteorInterval = 2400; // ms between falling stars

    // Click on About section triggers a shooting star directly across cursor!
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      spawnMeteor(clickX - 120, clickY - 140, true);
    };

    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('resize', resize);

    resize();
    initStars();

    let lastTime = performance.now();

    // 60fps render loop
    const render = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // ── 1. DRAW AMBIENT DEEP SPACE NEBULA CLOUDS ──
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.4, 10, width * 0.2, height * 0.4, width * 0.6);
      grad1.addColorStop(0, 'rgba(30, 27, 75, 0.25)'); // deep indigo
      grad1.addColorStop(0.5, 'rgba(15, 23, 42, 0.12)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.6, 20, width * 0.8, height * 0.6, width * 0.5);
      grad2.addColorStop(0, 'rgba(212, 132, 26, 0.06)'); // subtle gold glow
      grad2.addColorStop(0.6, 'rgba(88, 28, 135, 0.08)'); // purple dusk
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // ── 2. DRAW TWINKLING STARS ──
      for (const star of stars) {
        const twinkle = Math.sin(currentTime * star.twinkleSpeed + star.twinkleOffset);
        const currentAlpha = Math.max(0.05, star.baseAlpha + twinkle * 0.35);

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = star.color;

        if (star.size > 1.8) {
          // Bigger stars have a tiny soft cross flare
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle twinkle crosshair
          if (twinkle > 0.4) {
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = currentAlpha * 0.5;
            ctx.beginPath();
            ctx.moveTo(star.x - star.size * 2, star.y);
            ctx.lineTo(star.x + star.size * 2, star.y);
            ctx.moveTo(star.x, star.y - star.size * 2);
            ctx.lineTo(star.x, star.y + star.size * 2);
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ── 3. SPAWN AND DRAW FALLING STARS / ASTEROIDS ──
      meteorSpawnTimer += delta;
      if (meteorSpawnTimer > meteorInterval + Math.random() * 1200) {
        meteorSpawnTimer = 0;
        spawnMeteor();
      }

      for (let mIdx = meteors.length - 1; mIdx >= 0; mIdx--) {
        const m = meteors[mIdx];
        m.life++;
        m.x += m.vx;
        m.y += m.vy;

        // Fade in quickly, then fade out towards end of life
        const progress = m.life / m.maxLife;
        if (progress < 0.2) {
          m.alpha = progress / 0.2;
        } else {
          m.alpha = Math.max(0, 1 - (progress - 0.2) / 0.8);
        }

        // Tail vector
        const tailX = m.x - (m.vx / m.speed) * m.length;
        const tailY = m.y - (m.vy / m.speed) * m.length;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineWidth = m.thickness;

        // Radiant fading linear tail
        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${m.alpha * 0.9})`);
        gradient.addColorStop(0.2, `${m.tailColor}${m.alpha * 0.7})`);
        gradient.addColorStop(0.6, `${m.tailColor}${m.alpha * 0.3})`);
        gradient.addColorStop(1, `${m.tailColor}0)`);

        ctx.strokeStyle = gradient;
        ctx.shadowColor = m.headColor;
        ctx.shadowBlur = m.isAsteroid ? 12 : 8;

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing core head
        ctx.fillStyle = m.headColor;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Asteroids leave small glowing dust embers behind
        if (m.isAsteroid && Math.random() < 0.45) {
          spawnEmber(
            m.x - (m.vx / m.speed) * (Math.random() * 20),
            m.y - (m.vy / m.speed) * (Math.random() * 20),
            m.headColor
          );
        }

        ctx.restore();

        if (m.life >= m.maxLife || m.x > width + 200 || m.y > height + 200) {
          meteors.splice(mIdx, 1);
        }
      }

      // ── 4. DRAW ASTEROID EMBERS / DUST ──
      for (let eIdx = embers.length - 1; eIdx >= 0; eIdx--) {
        const ember = embers[eIdx];
        ember.life++;
        ember.x += ember.vx;
        ember.y += ember.vy;
        ember.alpha = Math.max(0, 0.9 * (1 - ember.life / ember.maxLife));

        ctx.save();
        ctx.globalAlpha = ember.alpha;
        ctx.fillStyle = ember.color;
        ctx.shadowColor = ember.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (ember.life >= ember.maxLife) {
          embers.splice(eIdx, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-pointer z-0"
        title="Click the sky to shoot a star!"
      />

      {/* Simple human instruction */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/85 border border-primary/25 backdrop-blur-md text-[11px] font-mono text-zinc-900 dark:text-white/95 [ .theme-light_& ]:text-zinc-900 [ .theme-dark_& ]:text-white/95 shadow-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>Click the sky to shoot a star ✨</span>
      </div>
    </div>
  );
};

export default StarfieldBackground;
