import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Target } from './types';
import { SWEEP_SPEED, HUD_COLORS } from './constants';

interface RadarProps {
    targets: Target[];
    direction?: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
    startAngle?: number;
}

const Radar: React.FC<RadarProps> = ({ targets, direction = 1, startAngle = 0 }) => {
    const [sweepAngle, setSweepAngle] = useState(startAngle);
    const requestRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const animate = (time: number) => {
        setSweepAngle((prev) => {
            const next = prev + (SWEEP_SPEED * direction);
            // Normalize angle to 0-360
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
            // Calculate angular difference based on sweep direction
            const diff = direction === 1
                ? (sweepAngle - t.angle + 360) % 360
                : (t.angle - sweepAngle + 360) % 360;

            let opacity = 0;
            // Phosphorus decay simulation - targets stay visible for ~160 degrees of rotation
            const decayAngle = 160;
            if (diff < decayAngle) {
                opacity = Math.pow(1 - (diff / decayAngle), 2.5);
            }
            return { ...t, opacity };
        });
    }, [targets, sweepAngle, direction]);

    return (
        <div ref={containerRef} className="relative aspect-square w-full h-full flex items-center justify-center">
            {/* Outer Compass Scale */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/10 flex items-center justify-center">
                {Array.from({ length: 72 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-full flex flex-col justify-between items-center"
                        style={{ transform: `rotate(${i * 5}deg)` }}
                    >
                        <div className={`w-[1px] ${i % 2 === 0 ? 'h-2 bg-indigo-500/40' : 'h-1 bg-indigo-500/20'}`} />
                        <div className={`w-[1px] ${i % 2 === 0 ? 'h-2 bg-indigo-500/40' : 'h-1 bg-indigo-500/20'}`} />
                    </div>
                ))}
            </div>

            {/* Main Radar Screen */}
            <div className="relative w-[88%] h-[88%] rounded-full bg-black border-[2px] border-indigo-500/30 shadow-[inset_0_0_60px_rgba(99,102,241,0.2)] overflow-hidden">
                {/* Radar Scanning Grid (Phosphor mesh) */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(${HUD_COLORS.PRIMARY} 1px, transparent 1px), linear-gradient(90deg, ${HUD_COLORS.PRIMARY} 1px, transparent 1px)`,
                        backgroundSize: '4px 4px'
                    }} />

                {/* Concentric Rings */}
                {rings.map((r) => (
                    <div
                        key={r}
                        className="absolute inset-0 border border-indigo-500/20 rounded-full"
                        style={{ margin: `${r * 12.5}%` }}
                    />
                ))}

                {/* Tactical Crosshair Lines */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500/30 -translate-y-1/2 pointer-events-none" />
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-indigo-500/30 -translate-x-1/2 pointer-events-none" />

                {/* THE RADAR SWEEP (Lead line + Wedge) */}
                <div
                    className="absolute inset-0 origin-center pointer-events-none z-10"
                    style={{ transform: `rotate(${sweepAngle}deg)` }}
                >
                    {/* Leading Sweep Line (The bright beam) */}
                    <div className="absolute left-1/2 top-0 w-[2px] h-[50%] bg-indigo-400 origin-bottom shadow-[0_0_20px_2px_rgba(99,102,241,0.8)]"
                        style={{ transform: 'translateX(-50%)' }} />

                    {/* Trailing Wedge Gradient (The "After Effect") */}
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            background: direction === 1
                                ? `conic-gradient(from 180deg at 50% 50%, rgba(99, 102, 241, 0) 0deg, rgba(99, 102, 241, 0.05) 120deg, rgba(99, 102, 241, 0.4) 178deg, transparent 180deg)`
                                : `conic-gradient(from 180deg at 50% 50%, transparent 180deg, rgba(99, 102, 241, 0.4) 182deg, rgba(99, 102, 241, 0.05) 240deg, rgba(99, 102, 241, 0) 360deg)`,
                            transform: 'rotate(0deg)'
                        }}
                    />
                </div>

                {/* Target Blips & Data Blocks */}
                {visibleTargets.map((t) => (
                    <div
                        key={t.id}
                        className="absolute transition-all duration-300 ease-out z-20"
                        style={{
                            left: `${50 + (t.distance / 2.1) * Math.cos(((t.angle - 90) * Math.PI) / 180)}%`,
                            top: `${50 + (t.distance / 2.1) * Math.sin(((t.angle - 90) * Math.PI) / 180)}%`,
                            opacity: t.opacity,
                            transform: `translate(-50%, -50%)`,
                        }}
                    >
                        <div className="relative flex flex-col items-center">
                            {/* Target Icon (Triangle) */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.type === 'HOSTILE' ? '#ef4444' : '#818cf8'} strokeWidth="3" style={{ transform: `rotate(${t.angle}deg)` }}>
                                <path d="M12 4L18 16H6L12 4Z" fill="currentColor" fillOpacity={t.opacity * 0.4} />
                            </svg>

                            {t.type === 'HOSTILE' && (
                                <div className="absolute -inset-1.5 border border-red-500/40 rounded-full animate-ping opacity-50" />
                            )}

                            {/* Phosphorus Glow Trail */}
                            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full pointer-events-none" style={{ opacity: t.opacity * 0.5 }} />
                        </div>
                    </div>
                ))}

                {/* Center Station Point */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#6366f1] z-30" />
            </div>
        </div>
    );
};

export default Radar;
