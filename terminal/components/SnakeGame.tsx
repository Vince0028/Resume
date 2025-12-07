import React, { useEffect, useRef, useState } from 'react';

interface SnakeGameProps {
    onExit: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onExit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [countdown, setCountdown] = useState<number>(3);
    const requestRef = useRef<number>();
    const initializedRef = useRef(false);

    
    const GRID_SIZE = 20;
    const SPEED = 100; 

    
    const gameState = useRef({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        direction: { x: 1, y: 0 }, 
        nextDirection: { x: 1, y: 0 },
        gridWidth: 0,
        gridHeight: 0,
        lastUpdate: 0
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        
        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;

                
                gameState.current.gridWidth = Math.floor(canvas.width / GRID_SIZE);
                gameState.current.gridHeight = Math.floor(canvas.height / GRID_SIZE);

                
                const { food, gridWidth, gridHeight } = gameState.current;
                if (food.x >= gridWidth) food.x = gridWidth - 1;
                if (food.y >= gridHeight) food.y = gridHeight - 1;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) {
                if (e.key === 'Enter' || e.key === ' ') restartGame();
                if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') onExit();
                return;
            }

            const { direction } = gameState.current;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (direction.y === 0) gameState.current.nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (direction.y === 0) gameState.current.nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (direction.x === 0) gameState.current.nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (direction.x === 0) gameState.current.nextDirection = { x: 1, y: 0 };
                    break;
                case 'q':
                case 'Q':
                case 'Escape':
                    onExit();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        const spawnFood = () => {
            const { gridWidth, gridHeight, snake } = gameState.current;
            if (gridWidth === 0 || gridHeight === 0) return; // Don't spawn if grid not initialized
            let newFood;
            let isOnSnake;

            do {
                newFood = {
                    x: Math.floor(Math.random() * gridWidth),
                    y: Math.floor(Math.random() * gridHeight)
                };
                isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            } while (isOnSnake);

            gameState.current.food = newFood;
        };

        const restartGame = () => {
            const { gridWidth, gridHeight } = gameState.current;
            gameState.current.snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
            gameState.current.direction = { x: 1, y: 0 };
            gameState.current.nextDirection = { x: 1, y: 0 };
            setScore(0);
            setGameOver(false);
            spawnFood();
        };

        // Initialize food after grid is set
        spawnFood();

        // Start countdown
        if (!initializedRef.current) {
            initializedRef.current = true;
            let count = 3;
            const countdownInterval = setInterval(() => {
                count--;
                setCountdown(count);
                if (count === 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }

        // Game loop
        const update = (time: number) => {
            if (gameOver) {
                draw(); 
                requestRef.current = requestAnimationFrame(update);
                return;
            }

            // Don't update if countdown is active
            if (countdown > 0) {
                draw();
                requestRef.current = requestAnimationFrame(update);
                return;
            }

            if (time - gameState.current.lastUpdate > SPEED) {
                const state = gameState.current;

                
                state.direction = state.nextDirection;

                
                const head = { ...state.snake[0] };
                head.x += state.direction.x;
                head.y += state.direction.y;

                
                if (
                    head.x < 0 ||
                    head.x >= state.gridWidth ||
                    head.y < 0 ||
                    head.y >= state.gridHeight
                ) {
                    setGameOver(true);
                    return;
                }

                
                if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    setGameOver(true);
                    return;
                }

                
                state.snake.unshift(head);

                
                if (head.x === state.food.x && head.y === state.food.y) {
                    setScore(prev => prev + 10);
                    spawnFood();
                    
                } else {
                    state.snake.pop();
                }

                state.lastUpdate = time;
            }

            draw();
            requestRef.current = requestAnimationFrame(update);
        };

        const draw = () => {
            if (!ctx || !canvas) return;
            const { width, height } = canvas;
            const state = gameState.current;

            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, width, height);

            
            ctx.strokeStyle = '#1e1b4b'; 
            ctx.lineWidth = 1;
            

            
            ctx.fillStyle = '#ef4444'; 
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.fillRect(
                state.food.x * GRID_SIZE + 1,
                state.food.y * GRID_SIZE + 1,
                GRID_SIZE - 2,
                GRID_SIZE - 2
            );
            ctx.shadowBlur = 0;

            
            ctx.fillStyle = '#6366f1'; 
            state.snake.forEach((segment, index) => {
                
                if (index === 0) {
                    ctx.fillStyle = '#818cf8'; 
                    ctx.shadowColor = '#6366f1';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = '#6366f1'; 
                    ctx.shadowBlur = 0;
                }

                ctx.fillRect(
                    segment.x * GRID_SIZE + 1,
                    segment.y * GRID_SIZE + 1,
                    GRID_SIZE - 2,
                    GRID_SIZE - 2
                );
            });
        };

        requestRef.current = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [onExit, gameOver, countdown]);

    const handleDirectionChange = (newDirection: { x: number, y: number }) => {
        const { direction } = gameState.current;
        // Prevent reversing direction
        if (newDirection.x === -direction.x && newDirection.y === -direction.y) return;
        gameState.current.nextDirection = newDirection;
    };

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-black/50">
            {}
            <div className="absolute top-4 w-full flex justify-center gap-12 text-2xl font-bold font-mono text-indigo-500 z-10 pointer-events-none">
                <div>SCORE: {score}</div>
            </div>

            {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <div className="text-8xl font-bold font-mono text-indigo-500 animate-pulse">
                        {countdown}
                    </div>
                </div>
            )}

            {}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                    <h2 className="text-4xl font-bold text-red-500 mb-4 font-mono animate-pulse">GAME OVER</h2>
                    <p className="text-indigo-300 text-xl mb-8 font-mono">FINAL SCORE: {score}</p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => {
                                setGameOver(false);
                                setScore(0);
                                gameState.current.snake = [{ x: 10, y: 10 }];
                                gameState.current.direction = { x: 1, y: 0 };
                                gameState.current.nextDirection = { x: 1, y: 0 };
                            }}
                            className="px-6 py-2 border-2 border-indigo-500 bg-black text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all font-mono font-bold"
                        >
                            RESTART
                        </button>
                        <button
                            onClick={onExit}
                            className="px-6 py-2 border-2 border-red-500 bg-black text-red-400 hover:bg-red-500/20 active:scale-95 transition-all font-mono font-bold"
                        >
                            EXIT
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full block" />

            <div className="absolute bottom-4 left-0 w-full text-center text-xs text-indigo-400/50 font-mono pointer-events-none md:block hidden">
                CONTROLS: WASD / ARROWS | Q: QUIT
            </div>

            {/* Mobile Touch Controls */}
            {!gameOver && (
                <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
                    {/* Up Button */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleDirectionChange({ x: 0, y: -1 }); }}
                        onClick={() => handleDirectionChange({ x: 0, y: -1 })}
                        className="w-16 h-16 border-2 border-indigo-500 bg-black/80 rounded-lg flex items-center justify-center active:bg-indigo-500/20 active:scale-95 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <div className="flex gap-4">
                        {/* Left Button */}
                        <button
                            onTouchStart={(e) => { e.preventDefault(); handleDirectionChange({ x: -1, y: 0 }); }}
                            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
                            className="w-16 h-16 border-2 border-indigo-500 bg-black/80 rounded-lg flex items-center justify-center active:bg-indigo-500/20 active:scale-95 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        {/* Down Button */}
                        <button
                            onTouchStart={(e) => { e.preventDefault(); handleDirectionChange({ x: 0, y: 1 }); }}
                            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
                            className="w-16 h-16 border-2 border-indigo-500 bg-black/80 rounded-lg flex items-center justify-center active:bg-indigo-500/20 active:scale-95 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {/* Right Button */}
                        <button
                            onTouchStart={(e) => { e.preventDefault(); handleDirectionChange({ x: 1, y: 0 }); }}
                            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
                            className="w-16 h-16 border-2 border-indigo-500 bg-black/80 rounded-lg flex items-center justify-center active:bg-indigo-500/20 active:scale-95 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Exit Button - Only show during gameplay */}
            {!gameOver && (
                <button
                    onClick={onExit}
                    className="absolute top-4 right-4 z-30 px-4 py-2 border-2 border-red-500 bg-black/80 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all font-mono text-sm font-bold"
                >
                    EXIT
                </button>
            )}
        </div>
    );
};

export default SnakeGame;
