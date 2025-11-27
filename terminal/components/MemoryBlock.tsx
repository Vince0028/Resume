import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../constants';

const MemoryBlock: React.FC = () => {
    // Grid size: e.g., 20 columns x 4 rows
    const cols = 20;
    const rows = 4;
    const totalBlocks = cols * rows;

    // State to hold the active status of each block
    const [blocks, setBlocks] = useState<boolean[]>(new Array(totalBlocks).fill(false));

    useEffect(() => {
        // Randomly initialize some blocks
        setBlocks(prev => prev.map(() => Math.random() > 0.5));

        const interval = setInterval(() => {
            // Randomly toggle a few blocks to simulate activity
            setBlocks(prev => prev.map(active => Math.random() > 0.9 ? !active : active));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col font-mono text-[10px] uppercase">
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold tracking-wider text-indigo-400">MEMORY</span>
                <span className="text-[8px] text-indigo-300">USING 1.5 OUT OF 7.5 GIB</span>
            </div>

            <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {blocks.map((active, i) => (
                    <div
                        key={i}
                        className={`w-full h-full rounded-[1px] transition-opacity duration-300 ${active ? 'bg-indigo-500 opacity-90 shadow-[0_0_2px_rgba(99,102,241,0.8)]' : 'bg-indigo-900/20 opacity-30'}`}
                    />
                ))}
            </div>

            {/* Decorative bottom line */}
            <div className="w-full h-px bg-indigo-500/30 mt-1 relative">
                <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500"></div>
                <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
            </div>
        </div>
    );
};

export default MemoryBlock;
