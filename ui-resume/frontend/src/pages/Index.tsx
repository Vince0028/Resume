import { useState, useCallback, useRef, useEffect, Suspense, lazy, Component } from 'react';
import { flushSync } from 'react-dom';
import type { ReactNode, ErrorInfo } from 'react';
import { Sun, Moon } from 'lucide-react';
import Navbar from '@/components/resume/Navbar';
import HeroSection from '@/components/resume/HeroSection';
import AboutSection from '@/components/resume/AboutSection';
import ExperienceSection from '@/components/resume/ExperienceSection';
import SkillsSection from '@/components/resume/SkillsSection';
import HobbiesSection from '@/components/resume/HobbiesSection';
import GallerySection from '@/components/resume/GallerySection';
import TerminalSection from '@/components/resume/TerminalSection';
import FooterBar from '@/components/resume/FooterBar';

const Lanyard = lazy(() => import('@/components/resume/Lanyard'));

class LanyardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lanyard error:', error, info);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface ContentProps {
  isDarkMode: boolean;
  onToggle: (e: React.MouseEvent) => void;
  scrollOffset?: number;
  isTransition?: boolean;
  introPhase?: 'closed' | 'opening' | 'done';
}

const ResumeContent = ({ isDarkMode, onToggle, scrollOffset, isTransition = false, introPhase = 'done' }: ContentProps) => {
  const style = scrollOffset !== undefined ? { transform: `translateY(-${scrollOffset}px)` } : {};

  return (
    <div style={style}>
      <div className="min-h-screen bg-background text-foreground relative">
        <div className="h-14" /> {/* Navbar spacer */}
        <HeroSection introPhase={introPhase} isTransition={isTransition} />
        <AboutSection className="bg-secondary/30" />
        <ExperienceSection isDarkMode={isDarkMode} />
        <SkillsSection isDarkMode={isDarkMode} className="bg-secondary/30" isTransition={isTransition} />
        <HobbiesSection />
        <GallerySection className="bg-secondary/30" isTransition={isTransition} />
        <TerminalSection isTransition={isTransition} />
        <div className="h-14" /> {/* FooterBar spacer */}
      </div>
    </div>
  );
};



const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [navTheme, setNavTheme] = useState(true); // flips immediately for smooth navbar transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const [transitionScroll, setTransitionScroll] = useState(0);
  const isAnimating = useRef(false);
  const overlayTargetDark = useRef(false); // locked at toggle time — never reactive

  // Intro animation state
  const [introPhase, setIntroPhase] = useState<'closed' | 'opening' | 'done'>('closed');

  // Smoke particle canvas ref
  const smokeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Start opening after a brief pause so the closed state is visible
    const t1 = setTimeout(() => setIntroPhase('opening'), 800);
    // Mark done after animation completes (3s animation + 800ms delay)
    const t2 = setTimeout(() => setIntroPhase('done'), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Smoke particle effect along the seam AND panel edges
  useEffect(() => {
    if (introPhase !== 'opening') return;
    const canvas = smokeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const halfH = canvas.height / 2;
    const navH = 56; // 3.5rem = 56px
    const totalDist = halfH - navH; // max distance each panel travels

    // Approximate the keyframe positions as a lookup (fraction of anim → fraction of totalDist)
    // Keyframes: 0%→0, 20%→12vh, 25%→10vh(stutter), 28%→11vh, 55%→30vh, 62%→28vh(stutter), 65%→29vh, 90%→~finalish, 100%→final
    const vhToPx = canvas.height / 100;
    const keyframes: [number, number][] = [
      [0, 0],
      [0.20, 12 * vhToPx],
      [0.25, 10 * vhToPx],
      [0.28, 11 * vhToPx],
      [0.55, 30 * vhToPx],
      [0.62, 28 * vhToPx],
      [0.65, 29 * vhToPx],
      [0.90, totalDist - 8],
      [1.00, totalDist],
    ];

    // Interpolate offset at a given animation progress (0-1)
    const getOffset = (t: number): number => {
      if (t <= 0) return 0;
      if (t >= 1) return totalDist;
      for (let i = 1; i < keyframes.length; i++) {
        const [t0, v0] = keyframes[i - 1];
        const [t1, v1] = keyframes[i];
        if (t <= t1) {
          const frac = (t - t0) / (t1 - t0);
          return v0 + (v1 - v0) * frac;
        }
      }
      return totalDist;
    };

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; decay: number; color: string;
    }

    const particles: Particle[] = [];
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    let animId: number;
    const animDuration = 3000;
    const spawnDuration = 2800;

    const spawnAt = (yPos: number, count: number, driftDir: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: yPos + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.5,
          vy: driftDir * (Math.random() * 1.5 + 0.3),
          size: Math.random() * 25 + 12,
          alpha: Math.random() * 0.35 + 0.12,
          decay: Math.random() * 0.004 + 0.002,
          color: Math.random() > 0.3
            ? `hsla(${primaryColor} / VAR)`
            : `hsla(0 0% 60% / VAR)`,
        });
      }
    };

    const startTime = performance.now();
    let lastTime = startTime;

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const offset = getOffset(progress);
      const topEdge = halfH - offset;   // bottom edge of top panel
      const bottomEdge = halfH + offset; // top edge of bottom panel

      // Spawn particles along all three lines
      if (elapsed < spawnDuration && Math.random() > 0.25) {
        // Center seam (fewer as it spreads)
        const seamCount = progress < 0.3 ? 3 : 1;
        spawnAt(halfH, seamCount, Math.random() > 0.5 ? -1 : 1);

        // Top panel edge — smoke drifts upward
        spawnAt(topEdge, 2, -1);

        // Bottom panel edge — smoke drifts downward
        spawnAt(bottomEdge, 2, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size += 0.3;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        const col = p.color.replace('VAR', '0.6');
        const colT = p.color.replace('VAR', '0');
        gradient.addColorStop(0, col);
        gradient.addColorStop(1, colT);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0 || elapsed < spawnDuration) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [introPhase]);

  const toggleTheme = useCallback((e: React.MouseEvent) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // If triggered by keyboard (space/enter), clientX/Y will be 0.
    // Fall back to the button's center position for the ripple origin.
    let x = e.clientX;
    let y = e.clientY;
    if (x === 0 && y === 0) {
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const currentScroll = window.scrollY;

    // Lock the overlay's target theme BEFORE any state changes.
    // This ref stays constant even when isDarkMode flips later.
    overlayTargetDark.current = !isDarkMode;

    setRipplePos({ x, y });
    setTransitionScroll(currentScroll);
    setIsTransitioning(true);
    setNavTheme((prev) => !prev); // flip navbar theme immediately

    // After clip-path animation completes:
    // 1. Swap the base theme (invisible — overlay still covers it with correct theme via ref)
    // 2. Wait for the browser to paint the new base theme
    // 3. Remove overlay — seamless handoff
    setTimeout(() => {
      flushSync(() => {
        setIsDarkMode((prev) => !prev);
      });

      // Double-rAF: let the browser fully paint the new base theme
      // under the still-present overlay before removing it
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(false);
          isAnimating.current = false;
        });
      });
    }, 1000);
  }, [isDarkMode]);

  return (
    <>
      {/* INTRO ANIMATION — futuristic box opening */}
      {introPhase !== 'done' && (
        <>
          {/* Top half — slides up */}
          <div
            className={`fixed inset-x-0 top-0 z-[200] bg-background transition-colors duration-1000 ${introPhase === 'closed' ? 'intro-top-closed' : 'intro-top-opening'
              }`}
            style={{ height: '50vh' }}
          >
            <div className={`${navTheme ? 'theme-dark' : 'theme-light'} h-full flex flex-col`}>
              {/* Navbar preview at the bottom of the top panel */}
              <div className="flex-1" />
              <Navbar isDarkMode={navTheme} onToggle={() => { }} hideControls={true} />
            </div>
          </div>
          {/* Bottom half — slides down */}
          <div
            className={`fixed inset-x-0 bottom-0 z-[200] bg-background transition-colors duration-1000 ${introPhase === 'closed' ? 'intro-bottom-closed' : 'intro-bottom-opening'
              }`}
            style={{ height: '50vh' }}
          >
            <div className={`${navTheme ? 'theme-dark' : 'theme-light'} h-full flex flex-col`}>
              <FooterBar minimal />
              <div className="flex-1" />
            </div>
          </div>
          {/* Center glow line at the seam */}
          <div
            className={`fixed inset-x-0 top-1/2 z-[201] h-[2px] pointer-events-none ${introPhase === 'closed' ? 'opacity-100' : 'intro-seam-fade'
              }`}
            style={{
              background: 'linear-gradient(90deg, transparent 10%, hsl(var(--primary)) 30%, hsl(var(--primary)) 70%, transparent 90%)',
              boxShadow: '0 0 20px 4px hsl(var(--primary) / 0.5)',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Smoke particles canvas */}
          <canvas
            ref={smokeCanvasRef}
            className="fixed inset-0 z-[202] pointer-events-none"
          />
        </>
      )}


      {/* NAVBAR — only after intro animation completes */}
      {introPhase === 'done' && (
        <div className={`${navTheme ? 'theme-dark' : 'theme-light'} fixed top-0 left-0 right-0 z-[60] transition-colors duration-1000`}>
          <Navbar isDarkMode={navTheme} onToggle={toggleTheme} />
        </div>
      )}

      {/* FOOTER BAR — only after intro animation completes */}
      {introPhase === 'done' && (
        <div className={`${navTheme ? 'theme-dark' : 'theme-light'} fixed bottom-0 left-0 right-0 z-[60] transition-colors duration-1000`}>
          <FooterBar />
        </div>
      )}

      {/* LAYER 1: Base — stays in document flow, scroll position preserved */}
      <div className={`${isDarkMode ? 'theme-dark' : 'theme-light'} relative ${isTransitioning ? '!transition-none !duration-0 [&_*]:!transition-none [&_*]:!duration-0' : ''}`}>
        {/* LANYARD — absolute within hero area, scrolls with content */}
        <div
          className="absolute top-0 left-0 right-0 z-[58] hidden lg:block pointer-events-none"
          style={{ height: '100vh' }}
        >
          <div className="pointer-events-none w-full h-full [&_canvas]:pointer-events-auto">
            <LanyardErrorBoundary>
              <Suspense fallback={null}>
                <Lanyard position={[2, 0, 18]} gravity={[0, -40, 0]} fov={15} />
              </Suspense>
            </LanyardErrorBoundary>
          </div>
        </div>
        <ResumeContent isDarkMode={isDarkMode} onToggle={toggleTheme} introPhase={introPhase} />
      </div>

      {/* LAYER 2: Transition overlay — renders TARGET theme, expands from click */}
      {isTransitioning && (
        <div
          className="fixed inset-0 z-[57] pointer-events-none overflow-hidden"
          style={{
            animation: 'explode-clip 1s ease-in-out forwards',
          }}
        >
          {/* Target theme content, synced to user's scroll position */}
          <div className={overlayTargetDark.current ? 'theme-dark' : 'theme-light'}>
            <ResumeContent
              isDarkMode={overlayTargetDark.current}
              onToggle={() => { }}
              scrollOffset={transitionScroll}
              isTransition={true}
              introPhase={introPhase}
            />
          </div>

          {/* Glowing wavefront edge */}
          <div
            className="fixed rounded-full pointer-events-none"
            style={{
              top: ripplePos.y,
              left: ripplePos.x,
              transform: 'translate(-50%, -50%)',
              animation: 'explode-wave 1s ease-out forwards',
              borderStyle: 'solid',
              borderColor: overlayTargetDark.current
                ? 'hsla(35, 90%, 55%, 0.25)'
                : 'hsla(220, 70%, 60%, 0.25)',
            }}
          />
        </div>
      )}

      {/* Dynamic keyframes scoped to click position */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes explode-clip {
              0% { clip-path: circle(0% at ${ripplePos.x}px ${ripplePos.y}px); }
              100% { clip-path: circle(200% at ${ripplePos.x}px ${ripplePos.y}px); }
            }
            @keyframes explode-wave {
              0% { width: 0px; height: 0px; opacity: 1; border-width: 60px; }
              40% { opacity: 1; border-width: 20px; }
              100% { width: 450vmax; height: 450vmax; opacity: 0; border-width: 0px; }
            }

            /* Intro box-open animation — smooth with two stutters */
            .intro-top-closed {
              transform: translateY(0);
            }
            .intro-top-opening {
              animation: intro-slide-up 3s ease-in-out forwards;
            }
            .intro-bottom-closed {
              transform: translateY(0);
            }
            .intro-bottom-opening {
              animation: intro-slide-down 3s ease-in-out forwards;
            }
            .intro-seam-fade {
              animation: intro-seam 1.2s ease-out forwards;
            }

            @keyframes intro-slide-up {
              0%   { transform: translateY(0); }
              /* Smooth open */
              20%  { transform: translateY(-12vh); }
              /* First stutter — catches, slips back */
              25%  { transform: translateY(-10vh); }
              28%  { transform: translateY(-11vh); }
              /* Pushes through smoothly */
              55%  { transform: translateY(-30vh); }
              /* Second stutter near the end */
              62%  { transform: translateY(-28vh); }
              65%  { transform: translateY(-29vh); }
              /* Final slide into position */
              90%  { transform: translateY(calc(-50vh + 4rem)); }
              100% { transform: translateY(calc(-50vh + 3.5rem)); }
            }
            @keyframes intro-slide-down {
              0%   { transform: translateY(0); }
              20%  { transform: translateY(12vh); }
              25%  { transform: translateY(10vh); }
              28%  { transform: translateY(11vh); }
              55%  { transform: translateY(30vh); }
              62%  { transform: translateY(28vh); }
              65%  { transform: translateY(29vh); }
              90%  { transform: translateY(calc(50vh - 4rem)); }
              100% { transform: translateY(calc(50vh - 3.5rem)); }
            }
            @keyframes intro-seam {
              0% { opacity: 1; transform: translateY(-50%) scaleX(1); }
              40% { opacity: 0.9; transform: translateY(-50%) scaleX(1.2); }
              70% { opacity: 0.5; transform: translateY(-50%) scaleX(1.8); }
              100% { opacity: 0; transform: translateY(-50%) scaleX(2.5); }
            }
          `,
        }}
      />
    </>
  );
};

export default Index;
