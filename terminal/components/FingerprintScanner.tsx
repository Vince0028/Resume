import React, { useState, useEffect, useRef } from 'react';
import { THEME_COLOR, THEME_GLOW } from '../constants';

interface FingerprintScannerProps {
    onScanComplete: () => void;
    isComplete?: boolean;
}

const FingerprintScanner: React.FC<FingerprintScannerProps> = ({ onScanComplete, isComplete = false }) => {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const requestRef = useRef<number>();

    const startScan = () => {
        if (!isComplete) {
            setScanning(true);
        }
    };

    const stopScan = () => {
        if (!isComplete) {
            setScanning(false);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (scanning && !isComplete) {
            const animate = () => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setScanning(false);
                        onScanComplete();
                        return 100;
                    }
                    return prev + 1; // Adjust speed here
                });
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [scanning, onScanComplete, isComplete]);

    return (
        <div
            className={`relative w-32 h-32 select-none group ${isComplete ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseDown={startScan}
            onMouseUp={stopScan}
            onMouseLeave={stopScan}
            onTouchStart={startScan}
            onTouchEnd={stopScan}
        >
            {/* Fingerprint SVG */}
            <svg
                viewBox="0 0 100 100"
                className={`w-full h-full fill-current transition-colors duration-500 ${isComplete
                        ? 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                        : scanning
                            ? 'text-indigo-400'
                            : 'text-indigo-900/50 group-hover:text-indigo-700/70'
                    }`}
            >
                <path d="M50,10 C35,10 22,20 18,35 C17,38 20,40 22,38 C26,34 36,26 50,26 C64,26 74,34 78,38 C80,40 83,38 82,35 C78,20 65,10 50,10 Z M50,18 C38,18 28,25 24,36 C23,39 26,41 28,39 C31,31 39,26 50,26 C61,26 69,31 72,39 C74,41 77,39 76,36 C72,25 62,18 50,18 Z M50,34 C42,34 35,39 32,46 C31,49 34,51 36,49 C38,44 43,42 50,42 C57,42 62,44 64,49 C66,51 69,49 68,46 C65,39 58,34 50,34 Z M50,50 C45,50 41,53 39,57 C38,60 41,62 43,60 C44,58 46,57 50,57 C54,57 56,58 57,60 C59,62 62,60 61,57 C59,53 55,50 50,50 Z M50,66 C48,66 46,67 45,69 C44,72 47,74 49,72 C49,72 50,72 50,72 C50,72 51,72 51,72 C53,74 56,72 55,69 C54,67 52,66 50,66 Z" />
                <path d="M50,90 C30,90 15,75 15,55 C15,52 18,52 18,55 C18,72 32,84 50,84 C68,84 82,72 82,55 C82,52 85,52 85,55 C85,75 70,90 50,90 Z" />
            </svg>

            {/* Scanning Beam */}
            {scanning && !isComplete && (
                <div
                    className="absolute left-0 w-full h-1 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-scan"
                    style={{
                        top: `${progress}%`,
                        opacity: 0.8
                    }}
                />
            )}

            {/* Progress Ring or Indicator */}
            <div className="absolute -bottom-8 left-0 w-full text-center">
                <div className={`h-1 w-full rounded overflow-hidden ${isComplete ? 'bg-green-900/30' : 'bg-indigo-900/30'}`}>
                    <div
                        className={`h-full transition-all duration-75 ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: isComplete ? '100%' : `${progress}%` }}
                    />
                </div>
                <div className={`text-[10px] mt-1 font-mono ${isComplete ? 'text-green-500 font-bold tracking-widest' : 'text-indigo-400'}`}>
                    {isComplete ? 'ACCESS GRANTED' : scanning ? `SCANNING... ${progress}%` : 'HOLD TO SCAN'}
                </div>
            </div>
        </div>
    );
};

export default FingerprintScanner;
