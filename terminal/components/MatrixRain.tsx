import React, { useEffect, useRef } from 'react';
import { THEME_COLOR } from '../constants';

interface MatrixRainProps {
    onEasterEggChange?: (isActive: boolean) => void;
    isVoicePlaying?: boolean;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ onEasterEggChange, isVoicePlaying = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = canvas.parentElement?.clientHeight || 100;
        };
        resize();

        setTimeout(resize, 100);

        window.addEventListener('resize', resize);

        const fontSize = 20;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = new Array(columns).fill(1);

        let lastDrawTime = 0;
        const fps = 30;
        const interval = 1000 / fps;

        const secretMessage = "YOU GET 5 PESOS IF YOU DECRYPT THIS FIRST 5 PERSON TO GET IT";
        const messageBinary = secretMessage.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('  ');
        
        let showEasterEgg = false;
        let easterEggStartTime = 0;
        const easterEggDuration = 1500;
        
        const checkEasterEgg = () => {
            if (isVoicePlaying) return;
            if (!showEasterEgg && Math.random() < 0.05) {
                showEasterEgg = true;
                easterEggStartTime = Date.now();
                onEasterEggChange?.(true);
            }
        };
        
            let easterEggInterval: number | undefined;
            easterEggInterval = setInterval(checkEasterEgg, 5000);

        const draw = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(draw);

            const elapsed = timestamp - lastDrawTime;
            if (elapsed < interval) return;

            lastDrawTime = timestamp - (elapsed % interval);

            if (isVoicePlaying && showEasterEgg) {
                showEasterEgg = false;
                onEasterEggChange?.(false);
            }

            if (showEasterEgg && Date.now() - easterEggStartTime > easterEggDuration) {
                showEasterEgg = false;
                onEasterEggChange?.(false);
            }

            if (showEasterEgg) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#00ff00';
                ctx.font = `10px monospace`;
                
                const lines = messageBinary.match(/.{1,120}/g) || [];
                const startY = (canvas.height - lines.length * 18) / 2;
                
                lines.forEach((line, index) => {
                    const textWidth = ctx.measureText(line).width;
                    const x = (canvas.width - textWidth) / 2;
                    ctx.fillText(line, x, startY + index * 18);
                });
            } else if (isVoicePlaying) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#ff3030';
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < drops.length; i++) {
                    const text = Math.random() > 0.5 ? '1' : '0';
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#6366f1';
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < drops.length; i++) {
                    const text = Math.random() > 0.5 ? '1' : '0';
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            clearInterval(easterEggInterval);
        };
    }, [isVoicePlaying]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full opacity-60"
        />
    );
};

export default MatrixRain;
