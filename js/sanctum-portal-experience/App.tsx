
import React, { useState, useEffect } from 'react';
import PortalOverlay from './components/PortalOverlay';
import MainContent from './components/MainContent';
import { PortalState } from './types';

const App: React.FC = () => {
  const [portalState, setPortalState] = useState<PortalState>(PortalState.IDLE);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
      setPortalState(PortalState.OPENING);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePortalComplete = () => {
    setPortalState(PortalState.OPEN);
  };

  if (!hasStarted) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="text-amber-900/30 mystic-font text-xs tracking-[0.8em] animate-pulse uppercase">
          Aligning Realities
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#050505] min-h-screen">
      {/* 
          MainContent is now rendered immediately. 
          The PortalOverlay sits on top of it with a black mask that grows.
      */}
      <MainContent />

      {/* Portal Layer: The "Shroud" and the Sparks */}
      {portalState !== PortalState.OPEN && (
        <PortalOverlay 
          state={portalState} 
          onComplete={handlePortalComplete} 
        />
      )}

      {/* Subtle post-portal flash effect */}
      {portalState === PortalState.OPEN && (
        <div className="fixed inset-0 pointer-events-none z-[60] bg-amber-500/5 animate-[pulse_3s_ease-in-out_infinite]" />
      )}
    </div>
  );
};

export default App;
