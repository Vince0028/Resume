import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../constants';
import Flicker from './Flicker';

const ClockPanel: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Random glitch effect - happens every 10-30 seconds
    const scheduleGlitch = () => {
      const delay = Math.random() * 20000 + 10000; // 10-30 seconds
      setTimeout(() => {
        setIsGlitching(true);
        // Glitch lasts for 200-500ms
        const glitchDuration = Math.random() * 300 + 200;
        setTimeout(() => {
          setIsGlitching(false);
          scheduleGlitch(); // Schedule next glitch
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

  const displayTime = isGlitching ? '67:67:67' : formatTime(time);

  return (
    <div className="flex flex-col items-start justify-center h-full pl-2">
      <h1 className={`text-4xl md:text-6xl font-bold ${THEME_COLOR} tracking-widest ${isGlitching ? 'text-red-500 animate-pulse' : ''}`}>
        <Flicker>{displayTime}</Flicker>
      </h1>
      <div className="flex space-x-4 mt-1 text-xs md:text-sm text-indigo-800">
        <span>{formatDate(time)}</span>
        <span>UPTIME TYPE: POWER</span>
        <span>LINUX WIRED</span>
      </div>
    </div>
  );
};

export default ClockPanel;