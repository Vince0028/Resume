import { useEffect, useState, memo } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
        }
    }
}

const Robot = memo(function Robot() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulated loading progress for the UI
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 95) return p;
                return p + Math.floor(Math.random() * 15);
            });
        }, 150);

        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.12.58/build/spline-viewer.js';
        script.onload = () => {
            // Add a small delay after script loads to ensure WebGL context is fully ready
            setTimeout(() => {
                setProgress(100);
                setTimeout(() => setLoading(false), 400); // Wait for 100% to display briefly
            }, 800);
        };
        document.head.appendChild(script);

        return () => {
            clearInterval(interval);
            document.head.removeChild(script);
        };
    }, []);

    return (
        <div className="w-full h-full relative flex items-center justify-center bg-transparent overflow-hidden">
            {/* Top Blue Ambient Light */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/30 blur-[100px] pointer-events-none z-0" />

            {/* Bottom Red Ambient Light */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/30 blur-[100px] pointer-events-none z-0" />

            {/* Loading Screen */}
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1120] backdrop-blur-md">
                    <div className="w-48 space-y-4">
                        <div className="flex justify-between items-end font-mono text-xs">
                            <span className="text-primary/80 animate-pulse">BOOTING_SYSTEM</span>
                            <span className="text-terminal-green">{Math.min(progress, 100)}%</span>
                        </div>

                        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-200 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>

                        <div className="font-mono text-[10px] text-muted-foreground space-y-1 opacity-60">
                            <p>{'>'} initializing graphics engine...</p>
                            <p>{'>'} parsing vector geometries...</p>
                            {progress > 50 && <p>{'>'} loading textures...</p>}
                            {progress > 85 && <p>{'>'} mounting render context...</p>}
                        </div>
                    </div>
                </div>
            )}

            {/*
              Spline wrapper — extends beyond the container's bottom-right edge.
              The parent has overflow:hidden, so the "Built with Spline" logo
              (which sits at the bottom-right of the viewer) gets clipped away.
              The robot stays centered because Spline centers the 3D scene.
            */}
            <div
                style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '-60px',
                    right: '-120px',
                    bottom: '-80px',
                    zIndex: 10,
                }}
            >
                <spline-viewer
                    url="https://prod.spline.design/wceYjgfQbByDP1M6/scene.splinecode"
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                    }}
                />
            </div>

            {/* Hello badge at bottom-right corner */}
            <div
                className="absolute bottom-3 right-3 z-20 pointer-events-none"
                style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 32, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <span className="text-sm font-mono text-blue-400 tracking-wider">👋 Hello!</span>
            </div>
        </div>
    );
});

export default Robot;
