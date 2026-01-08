import React, { useState, useEffect } from 'react';
import Radar from './Radar';
import { Target } from './types';

const RadarMain: React.FC = () => {
    const [targets, setTargets] = useState<Target[]>([]);

    // Helper to generate random targets
    const generateTargets = (count: number, prefix: string) => {
        return Array.from({ length: count }).map((_, i) => ({
            id: `${prefix}-${i}`,
            angle: Math.random() * 360,
            distance: 20 + Math.random() * 70,
            type: Math.random() > 0.8 ? 'HOSTILE' : 'FRIENDLY',
            speed: Math.floor(Math.random() * 500) + 200,
            altitude: Math.floor(Math.random() * 30000) + 5000,
        } as Target));
    };

    // Initialize random targets
    useEffect(() => {
        setTargets(generateTargets(10, 'T'));
    }, []);

    // Update target positions to simulate movement
    useEffect(() => {
        const moveTargets = (prev: Target[]) => prev.map(t => {
            // Small random movement
            const angleShift = (Math.random() - 0.5) * 0.2;
            const distShift = (Math.random() - 0.5) * 0.1;

            let newDist = t.distance + distShift;
            // Keep targets within radar bounds
            if (newDist < 10) newDist = 10;
            if (newDist > 95) newDist = 95;

            return {
                ...t,
                angle: (t.angle + angleShift + 360) % 360,
                distance: newDist,
                // Occasionally update speed/altitude for "realism"
                speed: Math.max(100, t.speed + (Math.random() - 0.5) * 10),
                altitude: Math.max(1000, t.altitude + (Math.random() - 0.5) * 50)
            };
        });

        const moveInterval = setInterval(() => {
            setTargets(prev => moveTargets(prev));
        }, 100);

        return () => clearInterval(moveInterval);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-transparent select-none flex items-center justify-center">
            <div className="w-full h-full relative flex items-center justify-center">
                <Radar targets={targets} direction={1} startAngle={0} />
            </div>
        </div>
    );
};

export default RadarMain;
