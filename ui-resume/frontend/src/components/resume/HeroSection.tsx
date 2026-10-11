import { ChevronDown } from 'lucide-react';
import Shuffle from '@/components/ui/Shuffle';
import SnakeGridBackground from './SnakeGridBackground';

interface HeroSectionProps {
  introPhase?: 'closed' | 'opening' | 'done';
  isTransition?: boolean;
}

const HeroSection = ({ introPhase = 'done', isTransition = false }: HeroSectionProps) => {
  const showStatic = introPhase === 'closed' || isTransition;
  const opacityClass = introPhase === 'closed' ? 'opacity-0' : 'opacity-100';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-16">
      {/* 2D Snake, Ladders, and Hearts Animated Grid Background */}
      <SnakeGridBackground />

      <div className="relative z-[56] w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 pointer-events-none">
        {/* Left: Text content */}
        <div className="text-left max-w-2xl lg:flex-1">
          <div className={`font-mono text-sm tracking-[0.3em] text-muted-foreground mb-8 uppercase min-h-[20px] transition-opacity duration-1000 ${opacityClass}`}>
            <Shuffle
              text="Portfolio / 2026"
              shuffleDirection="down"
              duration={1.5}
              stagger={0.08}
              shuffleTimes={3}
              tag="p"
              textAlign="left"
              disableAnimation={showStatic}
            />
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8 text-foreground transition-opacity duration-1000 ${opacityClass}`} style={{ display: 'flex', flexDirection: 'column' }}>
            <Shuffle
              text="Vince Nelmar"
              shuffleDirection="right"
              duration={1.8}
              stagger={0.05}
              shuffleTimes={4}
              tag="div"
              textAlign="left"
              disableAnimation={showStatic}
            />
            <Shuffle
              text="Alobin"
              shuffleDirection="right"
              duration={1.8}
              stagger={0.05}
              shuffleTimes={4}
              maxDelay={0.3}
              tag="div"
              textAlign="left"
              disableAnimation={showStatic}
            />
          </h1>

          <div className={`font-mono text-sm text-muted-foreground max-w-lg mb-2 leading-relaxed min-h-[40px] transition-opacity duration-1000 ${opacityClass}`}>
            <Shuffle
              text="BSIT Student & Full Stack Developer • AI, Web, Mobile & Computer Vision."
              shuffleDirection="up"
              duration={1.5}
              stagger={0.04}
              shuffleTimes={3}
              tag="p"
              textAlign="left"
              disableAnimation={showStatic}
            />
          </div>
        </div>

        {/* Right: Big Hero Photo (Graduation Photo) */}
        <div className={`lg:flex-1 flex justify-center lg:justify-end items-center pointer-events-auto transition-all duration-1000 ${opacityClass}`}>
          <div className="relative group max-w-sm sm:max-w-md lg:max-w-lg w-full">
            {/* Ambient golden/primary glow behind image */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-amber-500/20 to-primary/40 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            {/* Pure image container without any text overlay */}
            <div id="hero-grad-photo" className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-sm shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-primary/40">
              <img
                src={`${import.meta.env.BASE_URL}images/grad.png`}
                alt="Vince Nelmar Alobin"
                className="w-full h-auto max-h-[560px] object-cover rounded-2xl select-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="font-mono text-xs tracking-[0.3em]">SCROLL</span>
        <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  );
};

export default HeroSection;
