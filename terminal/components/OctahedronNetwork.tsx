import React, { useEffect, useRef, useState } from 'react';

interface OctahedronNetworkProps {
    networkLevel: number;
}

const OctahedronNetwork: React.FC<OctahedronNetworkProps> = ({ networkLevel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [packets, setPackets] = useState(0);
    const [latency, setLatency] = useState(0);
    const [nodes, setNodes] = useState(0);

    useEffect(() => {
        
        const interval = setInterval(() => {
            
            setPackets(Math.floor(networkLevel * 100 + Math.random() * 500));
            setLatency(Math.floor((100 - networkLevel) * 0.8 + Math.random() * 20));
            setNodes(Math.floor(networkLevel * 2 + Math.random() * 50));
        }, 1500);

        return () => clearInterval(interval);
    }, [networkLevel]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        
        let rotation = Math.random() * Math.PI * 2;

        const octahedronVertices = [
            [0, 1.8, 0],    
            [1.8, 0, 0],    
            [0, 0, 1.8],    
            [-1.8, 0, 0],   
            [0, 0, -1.8],   
            [0, -1.8, 0]    
        ];

        const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [5, 1], [5, 2], [5, 3], [5, 4],
            [1, 2], [2, 3], [3, 4], [4, 1]
        ];

        const rotateY = (point: number[], angle: number): number[] => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return [
                point[0] * cos - point[2] * sin,
                point[1],
                point[0] * sin + point[2] * cos
            ];
        };

        const rotateX = (point: number[], angle: number): number[] => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return [
                point[0],
                point[1] * cos - point[2] * sin,
                point[1] * sin + point[2] * cos
            ];
        };

        const project = (point: number[]): [number, number] => {
            const scale = 65; 
            const distance = 3;
            const z = point[2] + distance;
            const factor = scale / z;
            return [
                centerX + point[0] * factor,
                centerY - point[1] * factor
            ];
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            rotation += 0.01;

            
            const rotated = octahedronVertices.map(v => {
                let p = rotateY(v, rotation);
                p = rotateX(p, rotation * 0.7);
                return p;
            });

            
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#6366f1';
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2.5;
            edges.forEach(([i, j]) => {
                const [x1, y1] = project(rotated[i]);
                const [x2, y2] = project(rotated[j]);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
            ctx.shadowBlur = 0;

            
            rotated.forEach((point, i) => {
                const [x, y] = project(point);
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#818cf8';
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#818cf8';
                ctx.fill();
                ctx.strokeStyle = '#c7d2fe';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });
            ctx.shadowBlur = 0;

            
            ctx.strokeStyle = '#4f46e5';
            ctx.fillStyle = '#a5b4fc';
            ctx.font = '9px monospace'; 
            ctx.lineWidth = 1;

            
            const annotations = [
                { x: 8, y: 18, text: `PKT/s: ${packets}`, line: true },
                { x: width - 75, y: 18, text: `LAT: ${latency}ms`, line: true },
                { x: 8, y: height - 8, text: `BW: ${networkLevel}%`, line: true },
                { x: width - 75, y: height - 8, text: `NODES: ${nodes}`, line: true }
            ];

            annotations.forEach(ann => {
                if (ann.line) {
                    ctx.beginPath();
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = '#4f46e5';
                    ctx.moveTo(ann.x + 35, ann.y - 3);
                    ctx.lineTo(centerX, centerY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                const textWidth = ctx.measureText(ann.text).width;
                ctx.fillRect(ann.x - 1, ann.y - 9, textWidth + 2, 11);

                
                ctx.fillStyle = '#a5b4fc';
                ctx.fillText(ann.text, ann.x, ann.y);
            });

            
            const bracketSize = 12;
            ctx.strokeStyle = '#4338ca';
            ctx.lineWidth = 1.5;

            
            ctx.beginPath();
            ctx.moveTo(6, 6 + bracketSize);
            ctx.lineTo(6, 6);
            ctx.lineTo(6 + bracketSize, 6);
            ctx.stroke();

            
            ctx.beginPath();
            ctx.moveTo(width - 6 - bracketSize, 6);
            ctx.lineTo(width - 6, 6);
            ctx.lineTo(width - 6, 6 + bracketSize);
            ctx.stroke();

            
            ctx.beginPath();
            ctx.moveTo(6, height - 6 - bracketSize);
            ctx.lineTo(6, height - 6);
            ctx.lineTo(6 + bracketSize, height - 6);
            ctx.stroke();

            
            ctx.beginPath();
            ctx.moveTo(width - 6 - bracketSize, height - 6);
            ctx.lineTo(width - 6, height - 6);
            ctx.lineTo(width - 6, height - 6 - bracketSize);
            ctx.stroke();

            requestAnimationFrame(animate);
        };

        animate();
    }, [networkLevel, packets, latency, nodes]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full h-full"
            style={{ imageRendering: 'crisp-edges' }}
        />
    );
};

export default OctahedronNetwork;
