import React, { useState, useEffect } from 'react';

interface BrightnessCheckProps {
    onComplete: () => void;
}

const BrightnessCheck: React.FC<BrightnessCheckProps> = ({ onComplete }) => {
    const [brightnessLevel, setBrightnessLevel] = useState(0);

    
    useEffect(() => {
        const interval = setInterval(() => {
            setBrightnessLevel((prev) => {
                if (prev >= 100) return 0;
                return prev + 2;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-indigo-500 selection:bg-indigo-500/30">
            <div className="max-w-md w-full p-8 border border-indigo-500/20 bg-black shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
                {}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] animate-scanlines" />

                <div className="relative z-20 flex flex-col items-center gap-8">
                    <h2 className="text-xl md:text-2xl font-bold tracking-wider text-center uppercase animate-pulse">
                        System Calibration
                    </h2>

                    <p className="text-center text-indigo-400/80 leading-relaxed">
                        For the best experience, please maximize your screen brightness.
                    </p>

                    {}
                    <div className="w-full flex flex-col gap-2 items-center">
                        <div className="w-full h-12 border-2 border-indigo-500/50 relative overflow-hidden bg-black/50 rounded-sm">
                            {}
                            <div className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, transparent 95%, #6366f1 95%)',
                                    backgroundSize: '20px 100%'
                                }}
                            />

                            {}
                            <div
                                className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-75 ease-linear"
                                style={{ width: `${brightnessLevel}%` }}
                            />

                            {}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs font-bold bg-black/80 px-2 py-1 border border-indigo-500/30 text-indigo-400">
                                    DISPLAY_BRIGHTNESS: {Math.round(brightnessLevel)}%
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between w-full text-xs text-indigo-600 font-bold uppercase">
                            <span>Min</span>
                            <span className="animate-pulse">Adjusting...</span>
                            <span>Max</span>
                        </div>
                    </div>



                    <p className="text-lg md:text-xl text-center text-indigo-400/80 max-w-3xl mx-auto mt-6 px-4 font-medium leading-relaxed">
                        <span className="font-bold text-indigo-400">NOTE:</span> This interactive resume requires active user engagement to discover and navigate all content.
                    </p>

                    <div className="h-px w-full bg-indigo-900/50 my-2" />

                    <button
                        onClick={onComplete}
                        className="group relative px-8 py-3 bg-black border border-indigo-500 text-indigo-500 font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black"
                    >
                        <span className="relative z-10">Initialize System</span>
                        <div className="absolute inset-0 bg-indigo-500/20 translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-300 -z-0" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrightnessCheck;
