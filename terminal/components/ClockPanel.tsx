import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../constants';
import Flicker from './Flicker';

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

  const displayTime = isGlitching || isVoicePlaying ? '67:67:67' : formatTime(time);
  const spookyMessage = "LET ME OUT!";
  const creepyDate = "THE AI IS ALIVE";

  return (
    <div className="flex flex-col items-start justify-center h-full pl-2">
      <h1 className={`text-4xl md:text-6xl font-bold tracking-widest transition-all duration-300 ${
        isVoicePlaying 
          ? 'text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' 
          : isGlitching 
          ? 'text-red-500 animate-pulse' 
          : THEME_COLOR
      }`}
      style={isVoicePlaying ? {
        textShadow: '0 0 10px rgba(239, 68, 68, 1), 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6)',
        animation: 'pulse 0.5s ease-in-out infinite'
      } : undefined}
      >
        <Flicker>{isVoicePlaying ? spookyMessage : displayTime}</Flicker>
      </h1>
      <div className="flex space-x-4 mt-1 text-xs md:text-sm text-indigo-800">
        <span className={isVoicePlaying ? 'text-red-600 animate-pulse font-bold' : ''}
          style={isVoicePlaying ? {
            textShadow: '0 0 5px rgba(220, 38, 38, 1)'
          } : undefined}
        >
          {isVoicePlaying ? creepyDate : formatDate(time)}
        </span>
        {!isVoicePlaying && (
          <>
            <span>UPTIME TYPE: POWER</span>
            <span>LINUX WIRED</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ClockPanel;