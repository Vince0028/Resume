import React, { useState, useEffect } from 'react';
import Radar from './Radar';
import { Target } from './types';
// @ts-ignore
import globeData from '../../data/globe_points.json';

const RadarMain: React.FC = () => {
    const [targets, setTargets] = useState<Target[]>([]);

    // Helper to generate random targets ON LAND
    const generateTargets = (count: number, prefix: string) => {
        const rawPoints = globeData as { x: number, y: number, z: number, isLand: boolean }[];
        const landPoints = rawPoints.filter(p => p.isLand);

        return Array.from({ length: count }).map((_, i) => {
            // Pick a random land point
            const p = landPoints[Math.floor(Math.random() * landPoints.length)];

            // Convert 3D point to 2D Map Percentages (Same projection as Radar.tsx)
            // Equirectangular Projection
            const lon = Math.atan2(p.x, p.z);
            const lat = Math.asin(p.y);
            const mapX = ((lon + Math.PI) / (Math.PI * 2)) * 100;
            const mapY = ((Math.PI / 2 - lat) / Math.PI) * 100;

            // Convert Map coordinates (0-100) relative to Center (50, 50) into Polar (Angle/Distance) for Radar
            const deltaX = mapX - 50;
            const deltaY = mapY - 50;

            // Calculate Distance
            // Rendering logic: left = 50 + (dist / 2.1) * cos
            // So: delta = (dist / 2.1) * cos
            // dist / 2.1 = sqrt(deltaX^2 + deltaY^2)
            // dist = sqrt(deltaX^2 + deltaY^2) * 2.1
            const distFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const distance = distFromCenter * 2.1;

            // Calculate Angle
            // Rendering logic: cos((angle - 90)) -> cos(theta - 90) = sin(theta) if theta is standard math angle? 
            // Standard Math: x = r * cos(theta), y = r * sin(theta)
            // Our code: x = r * cos(angle - 90) = r * sin(angle) ?? 
            // Let's reverse engineer strictly:
            // x_offset = (dist/2.1) * cos((angle-90)*RAD)
            // y_offset = (dist/2.1) * sin((angle-90)*RAD)

            // We have x_offset (deltaX) and y_offset (deltaY)
            // atan2(y, x) gives the angle of the vector (theta)
            // theta = (angle - 90) * RAD
            // angle - 90 = degrees(atan2(deltaY, deltaX))
            // angle = degrees(atan2(deltaY, deltaX)) + 90
            const angleRad = Math.atan2(deltaY, deltaX);
            const angle = (angleRad * 180 / Math.PI) + 90;

            return {
                id: `${prefix}-${i}`,
                angle: (angle + 360) % 360, // Normalize
                distance: distance,
                type: Math.random() > 0.8 ? 'HOSTILE' : 'FRIENDLY',
                speed: 0, // Static stations for now to keep them strictly on land
                altitude: 0,
            } as Target;
        });
    };

    // Initialize targets
    useEffect(() => {
        setTargets(generateTargets(15, 'T'));
    }, []);

    // Restoring random behavior with UNIQUE keys to prevent "teleporting" (sliding) effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTargets(prev => prev.map(t => {
                // 10% chance to respawn a target
                if (Math.random() > 0.90) {
                    // Generate a NEW target with a unique ID to prevent React from animating the position change
                    // passing a unique prefix based on time and random value
                    return generateTargets(1, `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`)[0];
                }
                return t;
            }));
        }, 800); // Slower interval for less chaos
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
