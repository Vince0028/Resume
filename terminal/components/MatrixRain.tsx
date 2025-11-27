import React, { useEffect, useRef } from 'react';
import { THEME_COLOR } from '../constants';

const MatrixRain: React.FC = () => {
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

        const fontSize = 18;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = new Array(columns).fill(1);

        let lastDrawTime = 0;
        const fps = 30;
        const interval = 1000 / fps;

        const draw = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(draw);

            const elapsed = timestamp - lastDrawTime;
            if (elapsed < interval) return;

            lastDrawTime = timestamp - (elapsed % interval);

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
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full opacity-60"
        />
    );
};

export default MatrixRain;
