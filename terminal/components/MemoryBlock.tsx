import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../constants';

interface BlockState {
    active: boolean;
    warning: boolean;
}

interface MemoryBlockProps {
    isSpookyActive?: boolean;
}

const MemoryBlock: React.FC<MemoryBlockProps> = ({ isSpookyActive = false }) => {
    const cols = 20;
    const rows = 4;
    const totalBlocks = cols * rows;

    const [blocks, setBlocks] = useState<BlockState[]>(
        new Array(totalBlocks).fill(null).map(() => ({ active: false, warning: false }))
    );

    useEffect(() => {
        
        setBlocks(prev => prev.map(() => ({
            active: Math.random() > 0.5,
            warning: false
        })));

        
        const activityInterval = setInterval(() => {
            setBlocks(prev => prev.map(block => ({
                ...block,
                active: Math.random() > 0.9 ? !block.active : block.active
            })));
        }, 100);

        
        const warningInterval = setInterval(() => {
            setBlocks(prev => {
                const newBlocks = [...prev];
                
                const numWarnings = Math.floor(Math.random() * 6) + 1;

                for (let i = 0; i < numWarnings; i++) {
                    const randomIndex = Math.floor(Math.random() * totalBlocks);
                    if (newBlocks[randomIndex].active && !newBlocks[randomIndex].warning) {
                        newBlocks[randomIndex] = { ...newBlocks[randomIndex], warning: true };

                        
                        const duration = Math.random() * 2000 + 2000;
                        setTimeout(() => {
                            setBlocks(current => {
                                const updated = [...current];
                                updated[randomIndex] = { ...updated[randomIndex], warning: false };
                                return updated;
                            });
                        }, duration);
                    }
                }

                return newBlocks;
            });
        }, 3000);

        return () => {
            clearInterval(activityInterval);
            clearInterval(warningInterval);
        };
    }, [totalBlocks]);

    return (
        <div className="w-full h-full flex flex-col font-mono text-[10px] uppercase">
            <div className="flex justify-between items-center mb-1">
                <span className={`font-bold tracking-wider ${isSpookyActive ? 'text-red-400' : 'text-indigo-400'}`}>MEMORY</span>
                <span className={`text-[8px] ${isSpookyActive ? 'text-red-300' : 'text-indigo-300'}`}>USING 1.5 OUT OF 7.5 GIB</span>
            </div>

            <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {blocks.map((block, i) => (
                    <div
                        key={i}
                        className={`w-full h-full rounded-[1px] transition-all duration-500 ${block.warning
                            ? 'bg-red-500 opacity-90 shadow-[0_0_6px_rgba(239,68,68,0.95)]'
                            : block.active
                                ? (isSpookyActive
                                    ? 'bg-red-400 opacity-90 shadow-[0_0_4px_rgba(239,68,68,0.6)]'
                                    : 'bg-indigo-500 opacity-90 shadow-[0_0_2px_rgba(99,102,241,0.8)]')
                                : (isSpookyActive ? 'bg-red-900/30 opacity-40' : 'bg-indigo-900/20 opacity-30')
                            }`}
                    />
                ))}
            </div>

            <div className={`w-full h-px ${isSpookyActive ? 'bg-red-500/40' : 'bg-indigo-500/30'} mt-1 relative`}>
                <div className={`absolute left-0 top-0 h-full w-1 ${isSpookyActive ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                <div className={`absolute right-0 top-0 h-full w-1 ${isSpookyActive ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
            </div>
        </div>
    );
};

export default MemoryBlock;
