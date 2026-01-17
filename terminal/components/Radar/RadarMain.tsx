import React, { useState, useEffect } from 'react';
import Radar from './Radar';
import { Target } from './types';

import globeData from '../../data/globe_points.json';

const RadarMain: React.FC = () => {
    const [targets, setTargets] = useState<Target[]>([]);

    
    const generateTargets = (count: number, prefix: string) => {
        const rawPoints = globeData as { x: number, y: number, z: number, isLand: boolean }[];
        const landPoints = rawPoints.filter(p => p.isLand);

        return Array.from({ length: count }).map((_, i) => {
            
            const p = landPoints[Math.floor(Math.random() * landPoints.length)];

            
            
            const lon = Math.atan2(p.x, p.z);
            const lat = Math.asin(p.y);
            const mapX = ((lon + Math.PI) / (Math.PI * 2)) * 100;
            const mapY = ((Math.PI / 2 - lat) / Math.PI) * 100;

            
            const deltaX = mapX - 50;
            const deltaY = mapY - 50;

            
            
            
            
            
            const distFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const distance = distFromCenter * 2.1;

            
            
            
            
            
            
            

            
            
            
            
            
            const angleRad = Math.atan2(deltaY, deltaX);
            const angle = (angleRad * 180 / Math.PI) + 90;

            return {
                id: `${prefix}-${i}`,
                angle: (angle + 360) % 360, 
                distance: distance,
                type: Math.random() > 0.8 ? 'HOSTILE' : 'FRIENDLY',
                speed: 0, 
                altitude: 0,
            } as Target;
        });
    };

    
    useEffect(() => {
        setTargets(generateTargets(15, 'T'));
    }, []);

    
    useEffect(() => {
        const interval = setInterval(() => {
            setTargets(prev => prev.map(t => {
                
                if (Math.random() > 0.90) {
                    
                    
                    return generateTargets(1, `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`)[0];
                }
                return t;
            }));
        }, 800); 
        return () => clearInterval(interval);
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
