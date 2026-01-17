import React, { useEffect, useRef, useState, useMemo } from 'react';

import globeData from '../data/globe_points.json';

interface Point3D {
    x: number;
    y: number;
    z: number;
    isLand: boolean;
    char: string;
}

interface CrisisPoint {
    x: number;
    y: number;
    z: number;
    label: string;
}

interface BinaryGlobeNetworkProps {
    networkLevel?: number;
    isVoicePlaying?: boolean;
    isIAmPlaying?: boolean;
}

interface RawPoint {
    x: number;
    y: number;
    z: number;
    isLand: boolean;
}

const BinaryGlobeNetwork: React.FC<BinaryGlobeNetworkProps> = ({ networkLevel, isVoicePlaying, isIAmPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [points, setPoints] = useState<Point3D[]>([]);
    const [crises, setCrises] = useState<CrisisPoint[]>([]);

    const stateRef = useRef({
        y: 0,
        velocity: 0.012,
        baseSpeed: 0.012,
        glitchTimer: 0,
        jitter: 0,
        pulse: 0,
        glitchIntensity: 0,
        infectionActive: false,
        infectionProgress: 0,
        rebootTimer: 0
    });
    const frameIdRef = useRef<number>(0);

    useEffect(() => {
        
        const rawPoints = globeData as RawPoint[];

        const generatedPoints: Point3D[] = rawPoints.map(p => ({
            ...p,
            char: Math.random() > 0.5 ? '1' : '0'
        }));

        
        for (let i = generatedPoints.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [generatedPoints[i], generatedPoints[j]] = [generatedPoints[j], generatedPoints[i]];
        }

        
        const crisisPoints: CrisisPoint[] = [];
        const crisisLabels = ['HACKED', 'BREACH', 'SYSTEM_FAIL', 'CRITICAL', 'ROOT_ACCESS', 'OVERRIDE', 'FATAL', 'MALWARE'];
        const minDistance = 0.35;

        const candidates = generatedPoints.filter(p => p.isLand); 

        for (const p of candidates) {
            if (crisisPoints.length >= 40) break; 

            let tooClose = false;
            for (const existing of crisisPoints) {
                const dx = p.x - existing.x;
                const dy = p.y - existing.y;
                const dz = p.z - existing.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < minDistance) {
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose) {
                crisisPoints.push({
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    label: crisisLabels[Math.floor(Math.random() * crisisLabels.length)]
                });
            }
        }

        setPoints(generatedPoints);
        setCrises(crisisPoints);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || points.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const radius = Math.min(width, height) * 0.40;

        const buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        const bctx = buffer.getContext('2d', { alpha: true });
        if (!bctx) return;

        const fontMono = '"Courier New", Courier, monospace';

        const render = () => {
            const s = stateRef.current;
            s.pulse += 0.1;

            
            if (!s.infectionActive) {
                
                if (Math.random() > 0.9995) {
                    s.infectionActive = true;
                    s.infectionProgress = 0;
                }
            } else {
                
                s.infectionProgress += 2 + (s.infectionProgress * 0.03);
                if (s.infectionProgress >= points.length + 200) {
                    if (!s.rebootTimer) {
                        s.rebootTimer = 180; 
                        s.glitchTimer = 180; 
                    }

                    s.rebootTimer--;

                    
                    if (s.rebootTimer > 0) {
                        s.glitchIntensity = 1.0;
                        s.jitter = (Math.random() - 0.5) * 0.05;
                    }

                    if (s.rebootTimer <= 0) {
                        s.infectionActive = false;
                        s.infectionProgress = 0;
                        s.rebootTimer = 0;
                        s.glitchTimer = 0; 
                    }
                }
            }

            
            if (s.glitchTimer > 0) {
                s.glitchTimer--;
                s.jitter = (Math.random() - 0.5) * 0.03;
                s.glitchIntensity = Math.random();
                if (Math.random() > 0.8) s.velocity *= 0.4;
            } else {
                s.jitter = 0;
                s.glitchIntensity = 0;
                const rand = Math.random();
                if (rand > 0.988) { 
                    s.glitchTimer = Math.floor(Math.random() * 20) + 8;
                    if (Math.random() > 0.6) {
                        s.velocity = -s.velocity * (1.5 + Math.random());
                    } else {
                        s.velocity = (Math.random() - 0.5) * 0.1;
                    }
                }
            }

            const targetSpeed = s.velocity < 0 ? -s.baseSpeed : s.baseSpeed;
            s.velocity += (targetSpeed - s.velocity) * 0.04;
            s.y += s.velocity + s.jitter;

            const cosY = Math.cos(s.y);
            const sinY = Math.sin(s.y);
            const cosX = Math.cos(0.25);
            const sinX = Math.sin(0.25);

            
            bctx.clearRect(0, 0, width, height);

            
            const isFullRed = s.infectionActive && s.infectionProgress > points.length;
            const glowColor = isFullRed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.1)';

            const glow = bctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius * 1.5);
            glow.addColorStop(0, glowColor);
            glow.addColorStop(1, 'rgba(13, 14, 16, 0)');
            bctx.fillStyle = glow;
            bctx.fillRect(0, 0, width, height);

            bctx.textAlign = 'center';
            bctx.textBaseline = 'middle';

            
            const len = points.length;
            for (let i = 0; i < len; i++) {
                const p = points[i];
                let rx = p.x * cosY - p.z * sinY;
                let rz = p.x * sinY + p.z * cosY;
                let ry = p.y * cosX - rz * sinX;
                let rrz = p.y * sinX + rz * cosX;

                if (rrz > 0) {
                    const screenX = width / 2 + rx * radius;
                    const screenY = height / 2 - ry * radius;
                    const scale = 0.7 + (rrz * 0.3);
                    const isInfected = s.infectionActive && i < s.infectionProgress;

                    if (isInfected) {
                        
                        bctx.font = `bold ${Math.floor(6 * scale)}px ${fontMono}`;
                        bctx.fillStyle = `rgba(239, 68, 68, ${0.8 + rrz * 0.2})`; 
                    } else {
                        
                        if (p.isLand) {
                            bctx.font = `bold ${Math.floor(6 * scale)}px ${fontMono}`;
                            bctx.fillStyle = `rgba(129, 140, 248, ${0.5 + rrz * 0.5})`; 
                        } else {
                            bctx.font = `${Math.floor(4 * scale)}px ${fontMono}`;
                            bctx.fillStyle = `rgba(199, 210, 254, ${rrz * 0.12})`; 
                        }
                    }

                    const flickerRate = s.glitchIntensity > 0 ? 0.90 : 0.994;
                    const char = Math.random() > flickerRate ? (p.char === '1' ? '0' : '1') : p.char;
                    bctx.fillText(char, screenX, screenY);
                }
            }

            
            for (const c of crises) {
                let rx = c.x * cosY - c.z * sinY;
                let rz = c.x * sinY + c.z * cosY;
                let ry = c.y * cosX - rz * sinX;
                let rrz = c.y * sinX + rz * cosX;

                if (rrz > 0.2) {
                    const screenX = width / 2 + rx * radius;
                    const screenY = height / 2 - ry * radius;
                    const op = (0.5 + Math.sin(s.pulse) * 0.5) * rrz;

                    bctx.beginPath();
                    bctx.arc(screenX, screenY, (3 + Math.sin(s.pulse * 2.5) * 2) * rrz, 0, Math.PI * 2);
                    bctx.strokeStyle = `rgba(239, 68, 68, ${op * 0.8})`;
                    bctx.stroke();

                    bctx.beginPath();
                    bctx.arc(screenX, screenY, 2 * rrz, 0, Math.PI * 2);
                    bctx.fillStyle = `rgba(220, 38, 38, ${rrz})`;
                    bctx.fill();

                    if (Math.random() > 0.1 || s.glitchTimer === 0) {
                        bctx.font = `bold ${Math.floor(14 * rrz)}px ${fontMono}`;
                        bctx.fillStyle = `rgba(239, 68, 68, ${rrz})`;
                        bctx.fillText(c.label, screenX + 16 * rrz, screenY - 12 * rrz);

                        bctx.beginPath();
                        bctx.moveTo(screenX, screenY);
                        bctx.lineTo(screenX + 12 * rrz, screenY - 10 * rrz);
                        bctx.strokeStyle = `rgba(239, 68, 68, ${rrz * 0.5})`;
                        bctx.stroke();
                    }
                }
            }

            
            ctx.clearRect(0, 0, width, height);

            if (s.glitchTimer > 0) {
                
                const slices = 8 + Math.floor(Math.random() * 12);
                for (let i = 0; i < slices; i++) {
                    const h = Math.random() * (height / 8);
                    const y = Math.random() * (height - h);
                    const xOffset = (Math.random() - 0.5) * 60 * s.glitchIntensity;

                    ctx.drawImage(buffer, 0, y, width, h, xOffset, y, width, h);

                    if (Math.random() > 0.7) {
                        ctx.fillStyle = `rgba(99, 102, 241, ${Math.random() * 0.2})`;
                        ctx.fillRect(0, y, width, 1);
                    }
                }

                if (Math.random() > 0.5) {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.globalAlpha = 0.4;
                    ctx.drawImage(buffer, 4 * s.glitchIntensity, 0);
                    ctx.globalAlpha = 1.0;
                    ctx.globalCompositeOperation = 'source-over';
                }

                if (Math.random() > 0.92) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`;
                    ctx.fillRect(0, Math.random() * height, width, 20 + Math.random() * 100);
                }
            } else {
                ctx.drawImage(buffer, 0, 0);
            }

            frameIdRef.current = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(frameIdRef.current);
    }, [points, crises]);

    
    const mapPoints = useMemo(() => {
        if (points.length === 0) return [];
        const sampled = [];
        
        for (let i = 0; i < points.length; i += 2) {
            const p = points[i];
            if (p.isLand) {
                const lon = Math.atan2(p.x, p.z);
                const lat = Math.asin(p.y);
                
                const x = ((lon + Math.PI) / (Math.PI * 2)) * 100;
                const y = ((Math.PI / 2 - lat) / Math.PI) * 100;
                sampled.push({ x, y, id: i });
            }
        }
        return sampled;
    }, [points]);

    if (isIAmPlaying) {
        return (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img
                    src="/Images/iam.png"
                    alt="I AM"
                    className="w-full h-full object-cover opacity-90 filter hue-rotate-15 contrast-125 sepia-[.3]"
                />
                <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay animate-pulse pointer-events-none"></div>
                <div className="absolute inset-0 pointer-events-none bg-[url('/scanlines.png')] opacity-10"></div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-full h-full object-contain cursor-default select-none filter drop-shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            />
            {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[10px] text-indigo-400/50 animate-pulse font-mono">INITIALIZING...</div>
                </div>
            )}

            {/* Accurate Mini Map Overlay - REMOVED per user request */}
            {points.length > 0 && null}
        </div>
    );
};

export default BinaryGlobeNetwork;
