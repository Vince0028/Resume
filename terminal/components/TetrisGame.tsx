import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME_BORDER } from '../constants';

// Tetromino definitions
const TETROMINOS = {
    I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 'text-cyan-400' },
    J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: 'text-blue-500' },
    L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: 'text-orange-500' },
    O: { shape: [[1, 1], [1, 1]], color: 'text-yellow-400' },
    S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 'text-green-500' },
    T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'text-purple-500' },
    Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 'text-red-500' },
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createBoard = () => Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill([0, 'clear']));

interface TetrisGameProps {
    onExit: () => void;
}

const TetrisGame: React.FC<TetrisGameProps> = ({ onExit }) => {
    const [lockedBoard, setLockedBoard] = useState(createBoard());
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS.I.shape,
        collided: false,
        color: TETROMINOS.I.color
    });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [dropTime, setDropTime] = useState<number | null>(null);

    const checkCollision = (player: any, stage: any, { x: moveX, y: moveY }: { x: number, y: number }) => {
        for (let y = 0; y < player.tetromino.length; y += 1) {
            for (let x = 0; x < player.tetromino[y].length; x += 1) {
                if (player.tetromino[y][x] !== 0) {
                    if (
                        !stage[y + player.pos.y + moveY] ||
                        !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                        stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const movePlayer = (dir: number) => {
        if (!checkCollision(player, lockedBoard, { x: dir, y: 0 })) {
            setPlayer({ ...player, pos: { x: player.pos.x + dir, y: player.pos.y } });
        }
    };

    const resetPlayer = useCallback(() => {
        const keys = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
        const randKey = keys[Math.floor(Math.random() * keys.length)];
        const tetromino = TETROMINOS[randKey];

        setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: tetromino.shape,
            collided: false,
            color: tetromino.color
        });
    }, []);

    const startGame = () => {
        setLockedBoard(createBoard());
        setGameOver(false);
        setScore(0);
        resetPlayer();
        setDropTime(1000);
    };

    const rotate = (matrix: any[], dir: number) => {
        const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
        if (dir > 0) return rotated.map(row => row.reverse());
        return rotated.reverse();
    };

    const playerRotate = (stage: any, dir: number) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);
        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    const handleDrop = () => {
        if (!checkCollision(player, lockedBoard, { x: 0, y: 1 })) {
            setPlayer({ ...player, pos: { x: player.pos.x, y: player.pos.y + 1 } });
        } else {
            // Lock
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
                return;
            }

            // Add to locked board
            const newBoard = JSON.parse(JSON.stringify(lockedBoard));
            player.tetromino.forEach((row: any[], y: number) => {
                row.forEach((value: number, x: number) => {
                    if (value !== 0) {
                        newBoard[y + player.pos.y][x + player.pos.x] = [value, player.color];
                    }
                });
            });

            // Check cleared rows
            const rowsToClear: number[] = [];
            newBoard.forEach((row: any[], i: number) => {
                if (row.every(cell => cell[0] !== 0)) {
                    rowsToClear.push(i);
                }
            });

            if (rowsToClear.length > 0) {
                setScore(prev => prev + (rowsToClear.length * 100));
                rowsToClear.forEach(rowIndex => {
                    newBoard.splice(rowIndex, 1);
                    newBoard.unshift(new Array(BOARD_WIDTH).fill([0, 'clear']));
                });
            }

            setLockedBoard(newBoard);
            resetPlayer();
        }
    };

    const dropPlayer = () => {
        setDropTime(null);
        handleDrop();
    };

    // Custom Hook for Interval
    const useInterval = (callback: () => void, delay: number | null) => {
        const savedCallback = useRef<() => void>();
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        useEffect(() => {
            if (delay !== null) {
                const id = setInterval(() => {
                    if (savedCallback.current) savedCallback.current();
                }, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    };

    useInterval(() => {
        handleDrop();
    }, dropTime);

    // Combined board for rendering
    const getRenderBoard = () => {
        const newBoard = JSON.parse(JSON.stringify(lockedBoard));
        player.tetromino.forEach((row: any[], y: number) => {
            row.forEach((value: number, x: number) => {
                if (value !== 0) {
                    const boardY = y + player.pos.y;
                    const boardX = x + player.pos.x;
                    if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                        newBoard[boardY][boardX] = [value, player.color];
                    }
                }
            });
        });
        return newBoard;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;

            // Prevent default scrolling for arrow keys
            if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
                e.preventDefault();
            }

            if (e.keyCode === 37) movePlayer(-1);
            else if (e.keyCode === 39) movePlayer(1);
            else if (e.keyCode === 40) dropPlayer();
            else if (e.keyCode === 38) playerRotate(lockedBoard, 1);
            else if (e.keyCode === 81 || e.keyCode === 27) onExit(); // Q or Esc to quit
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!gameOver) {
                if (e.keyCode === 40) {
                    setDropTime(1000 / (Math.floor(score / 100) + 1));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [player, lockedBoard, gameOver, onExit, score]);

    useEffect(() => {
        startGame();
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center font-mono relative p-2">
            <div className={`border-2 ${THEME_BORDER} p-4 bg-black/90 relative flex flex-col items-center h-full max-h-[90vh] w-auto aspect-[10/22]`}>
                <div className="flex justify-between w-full mb-2 text-indigo-400 text-xs md:text-sm">
                    <span>TETRIS_TERM_V1</span>
                    <span>SCORE: {score}</span>
                </div>

                <div className="aspect-[10/20] w-auto h-full min-h-0 bg-indigo-900/20 border border-indigo-900/50 grid grid-rows-[repeat(20,minmax(0,1fr))] gap-[1px]">
                    {getRenderBoard().map((row: any[], y: number) => (
                        <div key={y} className="flex w-full h-full">
                            {row.map((cell: any, x: number) => (
                                <div
                                    key={x}
                                    className={`flex-1 h-full border border-black/20 ${cell[0] === 0 ? 'bg-transparent' : ''
                                        }`}
                                >
                                    {cell[0] !== 0 && (
                                        <div className={`w-full h-full ${cell[1].split(' ')[0]} bg-current opacity-80 shadow-[0_0_5px_currentColor]`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                        <h2 className="text-2xl text-red-500 font-bold mb-4">GAME OVER</h2>
                        <p className="text-indigo-300 mb-4">SCORE: {score}</p>
                        <button
                            onClick={startGame}
                            className="px-4 py-2 border border-indigo-500 text-indigo-400 hover:bg-indigo-500/20 mb-2 w-48"
                        >
                            RESTART
                        </button>
                        <button
                            onClick={onExit}
                            className="px-4 py-2 border border-red-500 text-red-400 hover:bg-red-500/20 w-48"
                        >
                            EXIT
                        </button>
                    </div>
                )}

                <div className="mt-2 text-[10px] md:text-xs text-center text-gray-500">
                    ARROWS: MOVE/ROTATE | Q: QUIT
                </div>
            </div>
        </div>
    );
};

export default TetrisGame;
