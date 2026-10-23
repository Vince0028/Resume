import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

interface PokemonCardProps {
  className?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [speechText, setSpeechText] = useState("don't press me");
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  }, []);

  const handleCardClick = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

    if (newCount > 4) {
      setSpeechText('Nakaka-hilo talaga pag pina ikot-ikot ka lang nya');
      speechTimerRef.current = setTimeout(() => {
        setSpeechText(nextFlipped ? 'Trainer: Vince Nelmar Alobin' : "don't press me");
      }, 3500);
    } else if (nextFlipped) {
      setSpeechText('Trainer: Vince Nelmar Alobin');
      speechTimerRef.current = setTimeout(() => {
        setSpeechText('Press again to flip back');
      }, 2500);
    } else {
      setSpeechText("don't press me");
    }
  };

  const frontImg = clickCount > 4
    ? `${import.meta.env.BASE_URL}images/Lanyard_dizzy.png`
    : isHovered && !isFlipped
    ? `${import.meta.env.BASE_URL}images/lanyard_shy.png`
    : `${import.meta.env.BASE_URL}images/Lanyard_pokemon.png`;

  const backImg = `${import.meta.env.BASE_URL}images/Back_pokemon.png`;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble / Badge */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="px-3.5 py-1.5 rounded-full bg-card/90 border border-primary/40 shadow-lg backdrop-blur-md flex items-center gap-2 animate-bounce transition-all duration-300">
          <Sparkles size={12} className="text-primary animate-pulse" />
          <span className="font-mono text-[11px] text-foreground font-semibold tracking-wide">
            {speechText}
          </span>
          <RotateCcw size={12} className="text-muted-foreground ml-0.5" />
        </div>
      </div>

      {/* 3D Perspective Card Wrapper */}
      <div
        style={{ perspective: '1200px' }}
        className="relative cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Glow halo behind card */}
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/20 via-primary/30 to-blue-500/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${isHovered ? tilt.x : 0}deg) rotateY(${(isHovered ? tilt.y : 0) + (isFlipped ? 180 : 0)}deg)`,
            transition: isHovered
              ? 'transform 0.15s ease-out, box-shadow 0.3s ease'
              : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
          }}
          className="relative w-[230px] sm:w-[250px] md:w-[270px] h-[360px] sm:h-[390px] md:h-[420px] rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.03]"
        >
          {/* ── CARD FRONT (Pokemon Trainer Card with Vince's photo) ── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/50 bg-[#12121a] shadow-xl flex items-center justify-center p-1"
          >
            <img
              src={frontImg}
              alt="Vince Nelmar Alobin - Pokemon Trainer Card"
              className="w-full h-full object-contain rounded-xl"
              draggable={false}
              onError={(e) => {
                // Fallback to Lanyard_dizzy if Lanyard_pokemon fails
                const img = e.target as HTMLImageElement;
                if (!img.src.includes('Lanyard_dizzy.png')) {
                  img.src = `${import.meta.env.BASE_URL}images/Lanyard_dizzy.png`;
                }
              }}
            />

            {/* Holographic foil sheen overlay */}
            <div
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.35) 0%, rgba(255,215,0,0.15) 30%, transparent 70%)`,
                opacity: isHovered ? 0.8 : 0,
              }}
              className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 mix-blend-overlay"
            />
          </div>

          {/* ── CARD BACK (Classic Pokemon Card Back) ── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/50 bg-[#1a1b2e] shadow-xl flex items-center justify-center p-1"
          >
            <img
              src={backImg}
              alt="Pokemon Card Back"
              className="w-full h-full object-contain rounded-xl"
              draggable={false}
            />

            {/* Holographic foil sheen overlay for back */}
            <div
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.4) 0%, rgba(100,180,255,0.2) 30%, transparent 70%)`,
                opacity: isHovered ? 0.8 : 0,
              }}
              className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 mix-blend-overlay"
            />
          </div>
        </div>
      </div>

      {/* Under-card Hint */}
      <div className="mt-3 flex items-center gap-1.5 text-muted-foreground/80 font-mono text-[11px]">
        <RotateCcw size={11} className="text-primary" />
        <span>Click card to {isFlipped ? 'flip front' : 'flip back'}</span>
      </div>
    </div>
  );
};

export default PokemonCard;
