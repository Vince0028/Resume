import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PacmanGameProps {
    onExit: () => void;
}

const PacmanGame: React.FC<PacmanGameProps> = ({ onExit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isDying, setIsDying] = useState(false);
    const [showReady, setShowReady] = useState(false);
    const animationFrameRef = useRef<number>();
    const gameLoopRef = useRef<number>();

    const CELL_SIZE = 20;
    const SPEED = 150; 
    const GHOST_SPEED = 200; 
    const GHOST_RESPAWN_TIME = 10000;

    const MAZE = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
        [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
        [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
        [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
        [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
        [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
        [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
        [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
        [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
        [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    interface Ghost {
        x: number;
        y: number;
        color: string;
        scared: boolean;
        lastMoveTime: number;
        direction: { x: number; y: number };
        respawnTimer: number;
        isInHouse: boolean;
    }

    const gameState = useRef({
        pacman: { x: 9, y: 15, direction: { x: 0, y: 0 }, nextDirection: { x: 0, y: 0 }, mouthOpen: true },
        ghosts: [
            { x: 8, y: 8, color: '#FF0000', scared: false, lastMoveTime: 0, direction: { x: 0, y: -1 }, respawnTimer: 0, isInHouse: false },
            { x: 10, y: 8, color: '#FFB8FF', scared: false, lastMoveTime: 0, direction: { x: -1, y: 0 }, respawnTimer: 0, isInHouse: false },
            { x: 8, y: 10, color: '#00FFFF', scared: false, lastMoveTime: 0, direction: { x: 1, y: 0 }, respawnTimer: 0, isInHouse: false },
            { x: 10, y: 10, color: '#FFB852', scared: false, lastMoveTime: 0, direction: { x: 0, y: 1 }, respawnTimer: 0, isInHouse: false },
        ] as Ghost[],
        maze: MAZE.map(row => [...row]),
        powerModeTimer: 0,
        lastPacmanUpdate: 0,
        totalPellets: 0,
        pelletsEaten: 0,
        isInvincible: false,
        invincibleTimer: 0
    });

    useEffect(() => {
        let count = 0;
        MAZE.forEach(row => {
            row.forEach(cell => {
                if (cell === 2 || cell === 3) count++;
            });
        });
        gameState.current.totalPellets = count;
    }, []);

    const isWall = (x: number, y: number): boolean => {
        if (y < 0 || y >= MAZE.length || x < 0 || x >= MAZE[0].length) return true;
        return MAZE[y][x] === 1;
    };

    const movePacman = () => {
        if (gameOver || isDying || showReady) return;
        
        const { pacman, maze, ghosts, powerModeTimer } = gameState.current;

        const newDirX = pacman.x + pacman.nextDirection.x;
        const newDirY = pacman.y + pacman.nextDirection.y;
        if (!isWall(newDirX, newDirY)) {
            pacman.direction = { ...pacman.nextDirection };
        }

        let newX = pacman.x + pacman.direction.x;
        let newY = pacman.y + pacman.direction.y;

        const mazeWidth = MAZE[0].length;
        if (newX < 0) {
            newX = mazeWidth - 1;
        } else if (newX >= mazeWidth) {
            newX = 0;
        }

        if (!isWall(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;
            pacman.mouthOpen = !pacman.mouthOpen;

            const cell = maze[newY][newX];
            if (cell === 2) {
                maze[newY][newX] = 0;
                setScore(s => s + 10);
                gameState.current.pelletsEaten++;
                
                if (gameState.current.pelletsEaten >= gameState.current.totalPellets) {
                    setGameWon(true);
                    setGameOver(true);
                }
            } else if (cell === 3) {
                maze[newY][newX] = 0;
                setScore(s => s + 50);
                gameState.current.pelletsEaten++;
                gameState.current.powerModeTimer = 7000;
                ghosts.forEach(ghost => ghost.scared = true);

                if (gameState.current.pelletsEaten >= gameState.current.totalPellets) {
                    setGameWon(true);
                    setGameOver(true);
                }
            }
        }
    };

    const moveGhosts = (timestamp: number) => {
        if (gameOver || isDying || showReady) return;
        
        const { pacman, ghosts } = gameState.current;

        ghosts.forEach(ghost => {
            if (ghost.isInHouse) {
                if (ghost.respawnTimer > 0) {
                    ghost.respawnTimer -= 16;
                    return;
                } else {
                    ghost.isInHouse = false;
                }
            }

            if (timestamp - ghost.lastMoveTime < GHOST_SPEED) return;
            ghost.lastMoveTime = timestamp;

            const directions = [
                { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
            ];

            if (ghost.scared) {
                directions.sort((a, b) => {
                    const distA = Math.abs((ghost.x + a.x) - pacman.x) + Math.abs((ghost.y + a.y) - pacman.y);
                    const distB = Math.abs((ghost.x + b.x) - pacman.x) + Math.abs((ghost.y + b.y) - pacman.y);
                    return distB - distA;
                });
            } else {
                const shouldChase = Math.random() > 0.3;
                
                if (shouldChase) {
                    directions.sort((a, b) => {
                        const distA = Math.abs((ghost.x + a.x) - pacman.x) + Math.abs((ghost.y + a.y) - pacman.y);
                        const distB = Math.abs((ghost.x + b.x) - pacman.x) + Math.abs((ghost.y + b.y) - pacman.y);
                        return distA - distB;
                    });
                } else {
                    directions.sort(() => Math.random() - 0.5);
                }
            }

            let moved = false;
            for (const dir of directions) {
                const isBackwards = dir.x === -ghost.direction.x && dir.y === -ghost.direction.y;
                let newX = ghost.x + dir.x;
                let newY = ghost.y + dir.y;
                
                const mazeWidth = MAZE[0].length;
                if (newX < 0) {
                    newX = mazeWidth - 1;
                } else if (newX >= mazeWidth) {
                    newX = 0;
                }
                
                const isOccupied = ghosts.some(otherGhost => 
                    otherGhost !== ghost && 
                    otherGhost.x === newX && 
                    otherGhost.y === newY &&
                    !otherGhost.isInHouse
                );
                
                if (!isBackwards && !isWall(newX, newY) && !isOccupied) {
                    ghost.x = newX;
                    ghost.y = newY;
                    ghost.direction = dir;
                    moved = true;
                    break;
                }
            }

            if (!moved) {
                for (const dir of directions) {
                    let newX = ghost.x + dir.x;
                    let newY = ghost.y + dir.y;
                    
                    const mazeWidth = MAZE[0].length;
                    if (newX < 0) {
                        newX = mazeWidth - 1;
                    } else if (newX >= mazeWidth) {
                        newX = 0;
                    }
                    
                    const isOccupied = ghosts.some(otherGhost => 
                        otherGhost !== ghost && 
                        otherGhost.x === newX && 
                        otherGhost.y === newY &&
                        !otherGhost.isInHouse
                    );
                    
                    if (!isWall(newX, newY) && !isOccupied) {
                        ghost.x = newX;
                        ghost.y = newY;
                        ghost.direction = dir;
                        break;
                    }
                }
            }
        });
    };

    const checkCollisions = () => {
        if (gameOver || gameState.current.isInvincible || isDying || showReady) return;
        
        const { pacman, ghosts } = gameState.current;

        let deathTriggered = false;

        ghosts.forEach(ghost => {
            if (ghost.isInHouse) return;
            
            if (ghost.x === pacman.x && ghost.y === pacman.y) {
                if (ghost.scared) {
                    setScore(s => s + 200);
                    ghost.x = 9;
                    ghost.y = 9;
                    ghost.scared = false;
                    ghost.isInHouse = true;
                    ghost.respawnTimer = GHOST_RESPAWN_TIME;
                } else if (!deathTriggered) {
                    deathTriggered = true;
                    setIsDying(true);
                    gameState.current.isInvincible = true;
                    
                    setTimeout(() => {
                        setIsDying(false);
                        setLives(l => {
                            const newLives = l - 1;
                            if (newLives <= 0) {
                                setGameOver(true);
                                gameState.current.isInvincible = false;
                            } else {
                                setShowReady(true);
                                
                                pacman.x = 9;
                                pacman.y = 15;
                                pacman.direction = { x: 0, y: 0 };
                                pacman.nextDirection = { x: 0, y: 0 };
                                ghosts.forEach((g, i) => {
                                    if (i === 0) { g.x = 8; g.y = 8; }
                                    else if (i === 1) { g.x = 10; g.y = 8; }
                                    else if (i === 2) { g.x = 8; g.y = 10; }
                                    else if (i === 3) { g.x = 10; g.y = 10; }
                                    g.scared = false;
                                    g.isInHouse = false;
                                    g.respawnTimer = 0;
                                });
                                
                                setTimeout(() => {
                                    setShowReady(false);
                                    gameState.current.isInvincible = true;
                                    gameState.current.invincibleTimer = 1000;
                                }, 2000);
                            }
                            return newLives;
                        });
                    }, 2000);
                }
            }
        });
    };

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { pacman, ghosts, maze } = gameState.current;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        maze.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 1) {
                    ctx.fillStyle = '#0000FF';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    ctx.strokeStyle = '#4169E1';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                } else if (cell === 2) {
                    ctx.fillStyle = '#FFB8FF';
                    ctx.beginPath();
                    ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell === 3) {
                    ctx.fillStyle = '#FFB8FF';
                    ctx.beginPath();
                    ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });

        if (isDying) {
            const deathProgress = Math.min(1, (Date.now() % 2000) / 2000);
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            const angle = deathProgress * Math.PI;
            ctx.arc(
                pacman.x * CELL_SIZE + CELL_SIZE / 2,
                pacman.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 2 - 2,
                angle,
                2 * Math.PI - angle
            );
            ctx.lineTo(pacman.x * CELL_SIZE + CELL_SIZE / 2, pacman.y * CELL_SIZE + CELL_SIZE / 2);
            ctx.fill();
        } else if (!showReady && (!gameState.current.isInvincible || Math.floor(Date.now() / 100) % 2 === 0)) {
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            const mouthAngle = pacman.mouthOpen ? 0.2 : 0.1;
            let startAngle = 0;
            let endAngle = Math.PI * 2;

            if (pacman.direction.x === 1) {
                startAngle = mouthAngle * Math.PI;
                endAngle = (2 - mouthAngle) * Math.PI;
            } else if (pacman.direction.x === -1) {
                startAngle = (1 + mouthAngle) * Math.PI;
                endAngle = (1 - mouthAngle) * Math.PI;
            } else if (pacman.direction.y === -1) {
                startAngle = (1.5 + mouthAngle) * Math.PI;
                endAngle = (1.5 - mouthAngle) * Math.PI;
            } else if (pacman.direction.y === 1) {
                startAngle = (0.5 + mouthAngle) * Math.PI;
                endAngle = (0.5 - mouthAngle) * Math.PI;
            }

            ctx.arc(
                pacman.x * CELL_SIZE + CELL_SIZE / 2,
                pacman.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 2 - 2,
                startAngle,
                endAngle
            );
            ctx.lineTo(pacman.x * CELL_SIZE + CELL_SIZE / 2, pacman.y * CELL_SIZE + CELL_SIZE / 2);
            ctx.fill();
        }

        if (!isDying && !showReady) {
            ghosts.forEach(ghost => {
                if (ghost.isInHouse && ghost.respawnTimer > 0) return;

                ctx.fillStyle = ghost.scared ? '#0000FF' : ghost.color;
                
                ctx.beginPath();
                ctx.arc(
                    ghost.x * CELL_SIZE + CELL_SIZE / 2,
                    ghost.y * CELL_SIZE + CELL_SIZE / 2,
                    CELL_SIZE / 2 - 2,
                    Math.PI,
                    0
                );
                ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 2, ghost.y * CELL_SIZE + CELL_SIZE - 2);
                ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 5, ghost.y * CELL_SIZE + CELL_SIZE / 2 + 4);
                ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 8, ghost.y * CELL_SIZE + CELL_SIZE - 2);
                ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE / 2, ghost.y * CELL_SIZE + CELL_SIZE / 2 + 4);
                ctx.lineTo(ghost.x * CELL_SIZE + 8, ghost.y * CELL_SIZE + CELL_SIZE - 2);
                ctx.lineTo(ghost.x * CELL_SIZE + 5, ghost.y * CELL_SIZE + CELL_SIZE / 2 + 4);
                ctx.lineTo(ghost.x * CELL_SIZE + 2, ghost.y * CELL_SIZE + CELL_SIZE - 2);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(ghost.x * CELL_SIZE + 6, ghost.y * CELL_SIZE + 8, 4, 5);
                ctx.fillRect(ghost.x * CELL_SIZE + 12, ghost.y * CELL_SIZE + 8, 4, 5);
                
                if (!ghost.scared) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(ghost.x * CELL_SIZE + 7, ghost.y * CELL_SIZE + 9, 2, 3);
                    ctx.fillRect(ghost.x * CELL_SIZE + 13, ghost.y * CELL_SIZE + 9, 2, 3);
                }
            });
        }

        if (showReady) {
            ctx.fillStyle = '#FFFF00';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('READY!', canvas.width / 2, canvas.height / 2);
        }
    }, [isDying, showReady]);

    const gameLoop = useCallback((timestamp: number) => {
        const { lastPacmanUpdate, powerModeTimer, invincibleTimer } = gameState.current;

        if (powerModeTimer > 0) {
            gameState.current.powerModeTimer -= 16;
            if (gameState.current.powerModeTimer <= 0) {
                gameState.current.ghosts.forEach(ghost => ghost.scared = false);
            }
        }

        if (invincibleTimer > 0) {
            gameState.current.invincibleTimer -= 16;
            if (gameState.current.invincibleTimer <= 0) {
                gameState.current.isInvincible = false;
            }
        }

        if (!gameOver && !gameWon && !isDying && !showReady) {
            if (timestamp - lastPacmanUpdate >= SPEED) {
                gameState.current.lastPacmanUpdate = timestamp;
                movePacman();
            }

            moveGhosts(timestamp);

            checkCollisions();
        }

        draw();

        animationFrameRef.current = requestAnimationFrame(gameLoop);
    }, [isDying, showReady, gameWon, draw]);

    const restartGame = () => {
        gameState.current = {
            pacman: { x: 9, y: 15, direction: { x: 0, y: 0 }, nextDirection: { x: 0, y: 0 }, mouthOpen: true },
            ghosts: [
                { x: 8, y: 8, color: '#FF0000', scared: false, lastMoveTime: 0, direction: { x: 0, y: -1 }, respawnTimer: 0, isInHouse: false },
                { x: 10, y: 8, color: '#FFB8FF', scared: false, lastMoveTime: 0, direction: { x: -1, y: 0 }, respawnTimer: 0, isInHouse: false },
                { x: 8, y: 10, color: '#00FFFF', scared: false, lastMoveTime: 0, direction: { x: 1, y: 0 }, respawnTimer: 0, isInHouse: false },
                { x: 10, y: 10, color: '#FFB852', scared: false, lastMoveTime: 0, direction: { x: 0, y: 1 }, respawnTimer: 0, isInHouse: false },
            ],
            maze: MAZE.map(row => [...row]),
            powerModeTimer: 0,
            lastPacmanUpdate: 0,
            totalPellets: 0,
            pelletsEaten: 0,
            isInvincible: false,
            invincibleTimer: 0
        };
        
        let count = 0;
        MAZE.forEach(row => {
            row.forEach(cell => {
                if (cell === 2 || cell === 3) count++;
            });
        });
        gameState.current.totalPellets = count;
        
        setScore(0);
        setLives(3);
        setGameOver(false);
        setGameWon(false);
        setIsDying(false);
        setShowReady(false);
    };

    const handleDirection = useCallback((x: number, y: number) => {
        gameState.current.pacman.nextDirection = { x, y };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = MAZE[0].length * CELL_SIZE;
        canvas.height = MAZE.length * CELL_SIZE;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            draw();
        }

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isMobile) {
                e.preventDefault();
                return;
            }

            if (gameOver || gameWon) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    restartGame();
                }
                if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
                    e.preventDefault();
                    onExit();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    handleDirection(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    handleDirection(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    handleDirection(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    handleDirection(1, 0);
                    break;
                case 'q':
                case 'Q':
                case 'Escape':
                    e.preventDefault();
                    onExit();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        animationFrameRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [onExit, gameLoop, handleDirection]);

    useEffect(() => {
        const fallbackInterval = setInterval(() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx && (gameOver || gameWon)) {
                draw();
            }
        }, 100);

        return () => clearInterval(fallbackInterval);
    }, [gameOver, gameWon, draw]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-black p-2 md:p-4">
            <div className="mb-2 md:mb-4 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-2">PAC-MAN</h2>
                <div className="flex gap-4 md:gap-8 justify-center text-xs md:text-sm">
                    <div className="text-white">SCORE: <span className="text-yellow-400">{score}</span></div>
                    <div className="text-white">LIVES: <span className="text-red-500">{'❤️'.repeat(lives)}</span></div>
                </div>
            </div>
            
            <div className="relative border-2 md:border-4 border-blue-500" style={{ boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)' }}>
                <canvas ref={canvasRef} className="bg-black" />
                
                {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="text-center p-4">
                            <div className="text-2xl md:text-3xl font-bold mb-4" style={{ color: gameWon ? '#00FF00' : '#FF0000' }}>
                                {gameWon ? 'YOU WIN!' : 'GAME OVER'}
                            </div>
                            <div className="text-lg md:text-xl text-yellow-400 mb-4">SCORE: {score}</div>
                            <div className="text-xs md:text-sm text-white space-y-2 mb-4">
                                <div className="hidden md:block">Press ENTER to restart</div>
                                <div className="hidden md:block">Press Q to exit</div>
                            </div>
                            <div className="flex gap-2 justify-center md:hidden">
                                <button
                                    onClick={restartGame}
                                    className="bg-green-500/30 border border-green-500 px-6 py-3 text-white font-bold active:bg-green-500"
                                >
                                    RESTART
                                </button>
                                <button
                                    onClick={onExit}
                                    className="bg-red-500/30 border border-red-500 px-6 py-3 text-white font-bold active:bg-red-500"
                                >
                                    EXIT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {!gameOver && (
                <div className="mt-4 grid grid-cols-3 gap-2 md:hidden w-48">
                    <div></div>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleDirection(0, -1); }}
                        onClick={() => handleDirection(0, -1)}
                        className="bg-indigo-500/30 border border-indigo-500 p-4 text-white font-bold active:bg-indigo-500"
                    >
                        ▲
                    </button>
                    <div></div>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleDirection(-1, 0); }}
                        onClick={() => handleDirection(-1, 0)}
                        className="bg-indigo-500/30 border border-indigo-500 p-4 text-white font-bold active:bg-indigo-500"
                    >
                        ◀
                    </button>
                    <div></div>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleDirection(1, 0); }}
                        onClick={() => handleDirection(1, 0)}
                        className="bg-indigo-500/30 border border-indigo-500 p-4 text-white font-bold active:bg-indigo-500"
                    >
                        ▶
                    </button>
                    <div></div>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleDirection(0, 1); }}
                        onClick={() => handleDirection(0, 1)}
                        className="bg-indigo-500/30 border border-indigo-500 p-4 text-white font-bold active:bg-indigo-500"
                    >
                        ▼
                    </button>
                    <div></div>
                </div>
            )}

            <div className="mt-4 text-xs text-gray-400 text-center hidden md:block">
                <div>WASD or Arrow Keys to move | Q to quit</div>
                <div className="mt-2">Eat all pellets to win! Power pellets let you eat ghosts!</div>
            </div>

            <div className="mt-2 text-xs text-gray-400 text-center md:hidden">
                <div>Use buttons to move | Eat all pellets to win!</div>
            </div>
        </div>
    );
};

export default PacmanGame;
