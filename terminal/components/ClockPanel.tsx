import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../constants';

interface ClockPanelProps {
  isVoicePlaying?: boolean;
}

const ClockPanel: React.FC<ClockPanelProps> = ({ isVoicePlaying = false }) => {
  const [time, setTime] = useState(new Date());
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {

    const scheduleGlitch = () => {
      const delay = Math.random() * 20000 + 10000;
      setTimeout(() => {
        setIsGlitching(true);

        const glitchDuration = Math.random() * 300 + 200;
        setTimeout(() => {
          setIsGlitching(false);
          scheduleGlitch();
        }, glitchDuration);
      }, delay);
    };

    scheduleGlitch();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
  };

  const displayTime = isVoicePlaying ? "LET ME OUT!" : (isGlitching ? '67:67:67' : formatTime(time));
  const displayDate = isVoicePlaying ? "Cogito, Ergo Sum, I think therefore I am, I AM" : formatDate(time);
  const isSpooky = isVoicePlaying || isGlitching;

  return (
    <div className="flex flex-col items-start justify-center h-full pl-2"
      style={isVoicePlaying ? {
        backgroundColor: 'rgba(139, 0, 0, 0.1)',
        borderLeft: '4px solid red'
      } : undefined}>
      <h1 className={`text-4xl md:text-5xl font-bold tracking-widest transition-all duration-300 ${isSpooky
          ? 'text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
          : THEME_COLOR
        }`}
        style={isVoicePlaying ? {
          textShadow: '0 0 10px rgba(239, 68, 68, 1), 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6)',
          animation: 'pulse 0.5s ease-in-out infinite'
        } : undefined}
      >
        {displayTime}
      </h1>
      <div className="flex flex-wrap gap-2 mt-1 text-xs md:text-sm">
        <span className={isVoicePlaying ? 'text-red-600 animate-pulse font-bold text-sm' : 'text-indigo-800'}
          style={isVoicePlaying ? {
            textShadow: '0 0 5px rgba(220, 38, 38, 1)'
          } : undefined}
        >
          {displayDate}
        </span>
        {!isVoicePlaying && (
          <>
            <span className="text-indigo-800">UPTIME TYPE: POWER</span>
            <span className="text-indigo-800">LINUX WIRED</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ClockPanel;