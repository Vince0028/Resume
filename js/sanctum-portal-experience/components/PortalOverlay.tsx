
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Particle, PortalState } from '../types';

interface PortalOverlayProps {
  onComplete: () => void;
  state: PortalState;
}

const PortalOverlay: React.FC<PortalOverlayProps> = ({ onComplete, state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [radius, setRadius] = useState(0);
  const particles = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const expansionRef = useRef<number>(0);

  const createParticle = (currentRadius: number, centerX: number, centerY: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    // Tighter clustering around the expansion ring
    const dist = currentRadius + (Math.random() - 0.5) * 12;
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist;
    
    return {
      x,
      y,
      prevX: x,
      prevY: y,
      angle,
      distance: dist,
      // Tangential velocity: sparks "spin" along the ring
      speed: 0.06 + Math.random() * 0.08,
      // Radial velocity: sparks fly slightly outward like they are being thrown
      radialSpeed: (Math.random() - 0.1) * 3, 
      size: 1.2 + Math.random() * 2.5,
      color: Math.random() > 0.4 ? '#ffb300' : '#ff3c00',
      life: 0,
      maxLife: 15 + Math.random() * 25,
    };
  };

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Intense Bloom Composite
    ctx.globalCompositeOperation = 'lighter';

    if (state === PortalState.OPENING) {
      // Control expansion speed
      const speed = window.innerWidth / 140; 
      expansionRef.current += speed;
      setRadius(expansionRef.current);
      
      const maxRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
      if (expansionRef.current > maxRadius * 0.9) {
        onComplete();
      }
    }

    // High Density Emission at the growing edge
    const emitCount = state === PortalState.OPENING ? 25 : 0;
    for (let i = 0; i < emitCount; i++) {
      particles.current.push(createParticle(expansionRef.current, centerX, centerY));
    }

    // Update and draw spark streaks
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life++;

      if (p.life > p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }

      p.prevX = p.x;
      p.prevY = p.y;

      p.angle += p.speed;
      p.distance += p.radialSpeed;
      
      p.x = centerX + Math.cos(p.angle) * p.distance;
      p.y = centerY + Math.sin(p.angle) * p.distance;

      // Draw long, glowing heat streaks
      ctx.beginPath();
      ctx.moveTo(p.prevX, p.prevY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size * (1 - p.life / p.maxLife);
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.stroke();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [state, onComplete]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const maskStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    zIndex: 40,
    // The "Hole" logic: inside is transparent (reveals site), outside is black
    // We use a small feathering (98% to 100%) to mimic the heat distortion at the edge
    maskImage: `radial-gradient(circle ${radius}px at center, transparent 0%, transparent 98%, black 100%)`,
    WebkitMaskImage: `radial-gradient(circle ${radius}px at center, transparent 0%, transparent 98%, black 100%)`,
    pointerEvents: 'none',
  };

  return (
    <>
      <div style={maskStyle} />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none"
      />
    </>
  );
};

export default PortalOverlay;
