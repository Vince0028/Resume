import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PokemonCardProps {
  className?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ className = '' }) => {
  const [spinCount, setSpinCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDizzy, setIsDizzy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const dizzyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSpinning || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle 3D tilt on hover
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      setTilt({ x: rotateX, y: rotateY });
    },
    [isSpinning]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleClick = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinCount((prev) => prev + 1);

    // Halfway through the 360-degree flip (when back of card is facing the user),
    // switch the front face to the dizzy expression
    setTimeout(() => {
      setIsDizzy(true);
    }, 400);

    // Spin animation completes
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = setTimeout(() => {
      setIsSpinning(false);
    }, 850);

    // Dizzy image stays for a few seconds, then returns to normal
    if (dizzyTimerRef.current) clearTimeout(dizzyTimerRef.current);
    dizzyTimerRef.current = setTimeout(() => {
      setIsDizzy(false);
    }, 3800);
  };

  useEffect(() => {
    return () => {
      if (dizzyTimerRef.current) clearTimeout(dizzyTimerRef.current);
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, []);

  const frontSrc = isDizzy
    ? `${import.meta.env.BASE_URL}images/Lanyard_dizzy.png`
    : isHovered && !isSpinning
    ? `${import.meta.env.BASE_URL}images/lanyard_shy.png`
    : `${import.meta.env.BASE_URL}images/Lanyard_pokemon.png`;

  const backSrc = `${import.meta.env.BASE_URL}images/Back_pokemon.png`;

  // Each press spins a full 360 degrees (flip all over)
  const currentRotationY = spinCount * 360 + (isHovered && !isSpinning ? tilt.y : 0);
  const currentRotationX = isHovered && !isSpinning ? tilt.x : 0;

  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      {/* Outer floating wrapper */}
      <div className="card-float-wrapper" style={{ perspective: '1200px' }}>
        {/* Holographic glow aura under the card */}
        <div className="absolute -inset-3 rounded-[24px] bg-gradient-to-r from-amber-500/25 via-blue-500/15 to-amber-500/25 blur-xl opacity-60 hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

        {/* 3D Rotating Card (Pure card, identical front & back size) */}
        <div
          ref={cardRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`,
            transition: isSpinning
              ? 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'transform 0.15s ease-out',
          }}
          className="relative w-[230px] sm:w-[260px] md:w-[285px] aspect-[463/727] cursor-pointer"
        >
          {/* ── CARD FRONT (Pokemon Trainer Card) ── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="absolute inset-0 w-full h-full rounded-[16px] sm:rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
          >
            <img
              src={frontSrc}
              alt="Pokemon Card Front"
              className="w-full h-full object-fill pointer-events-none"
              draggable={false}
            />
          </div>

          {/* ── CARD BACK (Classic Pokemon Card Back - identical dimensions) ── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 w-full h-full rounded-[16px] sm:rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
          >
            <img
              src={backSrc}
              alt="Pokemon Card Back"
              className="w-full h-full object-fill pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes card-float-anim {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
            .card-float-wrapper {
              animation: card-float-anim 4s ease-in-out infinite;
            }
          `,
        }}
      />
    </div>
  );
};

export default PokemonCard;
