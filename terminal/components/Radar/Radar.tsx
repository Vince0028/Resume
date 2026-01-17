import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Target } from './types';
import { SWEEP_SPEED, HUD_COLORS } from './constants';

import globeData from '../../data/globe_points.json';

interface RadarProps {
    targets: Target[];
    direction?: 1 | -1; 
    startAngle?: number;
}

interface RawPoint {
    x: number;
    y: number;
    z: number;
    isLand: boolean;
}

const Radar: React.FC<RadarProps> = ({ targets, direction = 1, startAngle = 0 }) => {
    const [sweepAngle, setSweepAngle] = useState(startAngle);
    const requestRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    
    const mapPoints = useMemo(() => {
        const rawPoints = globeData as RawPoint[];
        const sampled = [];
        
        for (let i = 0; i < rawPoints.length; i++) {
            const p = rawPoints[i];
            if (p.isLand) {
                
                const lon = Math.atan2(p.x, p.z);
                const lat = Math.asin(p.y);
                const x = ((lon + Math.PI) / (Math.PI * 2)) * 100;
                const y = ((Math.PI / 2 - lat) / Math.PI) * 100;

                
                if (y < 88) {
                    sampled.push({ x, y, id: i });
                }
            }
        }
        return sampled;
    }, []);

    const animate = (time: number) => {
        setSweepAngle((prev) => {
            const next = prev + (SWEEP_SPEED * direction);
            
            return (next + 360) % 360;
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [direction]);

    const rings = [1, 2, 3, 4];

    const visibleTargets = useMemo(() => {
        return targets.map(t => {
            
            const diff = direction === 1
                ? (sweepAngle - t.angle + 360) % 360
                : (t.angle - sweepAngle + 360) % 360;

            let opacity = 0;
            
            const decayAngle = 150;
            if (diff < decayAngle) {
                opacity = Math.pow(1 - (diff / decayAngle), 4);
            }
            return { ...t, opacity };
        });
    }, [targets, sweepAngle, direction]);

    return (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black/95 overflow-hidden">

            {/* World Map Background Layer (Fills Container - Dotted Style) */}
            <div className="absolute inset-0 opacity-100 z-0">
                {mapPoints.map(p => (
                    <div
                        key={p.id}
                        className="absolute bg-indigo-500 w-[2px] h-[2px] rounded-full"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 0.8 }}
                    />
                ))}
            </div>

            {/* Radar UI Overlays (Full Container) */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative w-full h-full">

                    {/* Main Radar Screen (Rectangular Viewport) */}
                    <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(99,102,241,0.15)] overflow-hidden">

                        {/* Rectangular Grid Overlay */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }}
                        />

                        {/* Tactical Crosshair Lines (Brighter) */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500/40 -translate-y-1/2 pointer-events-none" />
                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-indigo-500/40 -translate-x-1/2 pointer-events-none" />

                        {/* THE RADAR SWEEP (Full Coverage) */}
                        <div
                            className="absolute inset-[-50%] origin-center pointer-events-none z-10"
                            style={{ transform: `rotate(${sweepAngle}deg)` }}
                        >
                            {/* Extended sweep arm */}
                            <div className="absolute left-1/2 top-0 w-[2px] h-[50%] bg-indigo-400 origin-bottom shadow-[0_0_20px_2px_rgba(99,102,241,0.8)]"
                                style={{ transform: 'translateX(-50%)' }} />

                            {/* Gradient Wedge */}
                            <div className="absolute inset-0"
                                style={{
                                    background: direction === 1
                                        ? `conic-gradient(from 180deg at 50% 50%, rgba(99, 102, 241, 0) 0deg, rgba(99, 102, 241, 0.05) 120deg, rgba(99, 102, 241, 0.3) 178deg, transparent 180deg)`
                                        : `conic-gradient(from 180deg at 50% 50%, transparent 180deg, rgba(99, 102, 241, 0.3) 182deg, rgba(99, 102, 241, 0.05) 240deg, rgba(99, 102, 241, 0) 360deg)`,
                                    transform: 'rotate(0deg)'
                                }}
                            />
                        </div>

                        {/* Target Blips */}
                        {visibleTargets.map((t) => (
                            <div
                                key={t.id}
                                className="absolute z-20"
                                style={{
                                    left: `${50 + (t.distance / 2.1) * Math.cos(((t.angle - 90) * Math.PI) / 180)}%`,
                                    top: `${50 + (t.distance / 2.1) * Math.sin(((t.angle - 90) * Math.PI) / 180)}%`,
                                    opacity: t.opacity,
                                    transform: `translate(-50%, -50%)`,
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    {t.opacity > 0.8 && (
                                        <div className="absolute w-8 h-8 border border-indigo-400 rounded-full animate-ping opacity-75"
                                            style={{ animationDuration: '1s' }} />
                                    )}
                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${t.type === 'HOSTILE' ? 'bg-red-500 text-red-500' : 'bg-indigo-400 text-indigo-400'
                                        }`} />
                                    {t.type === 'HOSTILE' && (
                                        <div className="absolute -inset-2 border border-red-500/40 rounded-full animate-pulse opacity-50" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Center Point */}
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#6366f1] z-30" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Radar;
