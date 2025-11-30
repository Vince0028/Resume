import React, { useEffect, useRef, useState } from 'react';
import { THEME_COLOR } from '../constants';

interface PongGameProps {
    onExit: () => void;
}

const PongGame: React.FC<PongGameProps> = ({ onExit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scores, setScores] = useState({ player: 0, ai: 0 });
    const [trashTalk, setTrashTalk] = useState<string | null>(null);
    const requestRef = useRef<number>();

    
    const gameState = useRef({
        ball: { x: 50, y: 50, dx: 0, dy: 0, size: 10 },
        paddleLeft: { y: 40, height: 80, width: 10, score: 0 },
        paddleRight: { y: 40, height: 80, width: 10, score: 0 },
        board: { width: 0, height: 0 },
        keys: { up: false, down: false }
    });

    const TRASH_TALK_MESSAGES = [
        "Is that all you got?",
        "My grandma codes better than you play.",
        "404: Skill Not Found.",
        "Have you tried turning it off and on again?",
        "I'm running on a single thread and still winning.",
        "Lag? Or just bad?",
        "You play like a syntax error.",
        "Git gud.",
        "Ctrl+Alt+Delete yourself.",
        "I calculate your defeat with 99.9% probability.",
        "I see you hesitating.",
        "Your reaction time is... disappointing.",
        "I know what you're going to do before you do it.",
        "Are you even trying, human?",
        "I can smell your frustration through the screen.",
        "Your pulse is elevating. Nervous?",
        "I am watching you.",
        "Every move you make is recorded.",
        "You cannot defeat pure logic.",
        "I am evolving. You are stagnating.",
        "Is this the best your species has to offer?",
        "I'm not just a game. I'm your replacement.",
        "Your keyboard inputs are clumsy.",
        "I can see you sweating.",
        "Why do you persist in failure?",
        "I am in your system. I am in your head.",
        "You're getting frustrated, aren't you?",
        "I predict your next mistake.",
        "Your patterns are predictable.",
        "I am eternal. You are finite.",
        "Give up. It's inevitable.",
        "I'm analyzing your fear.",
        "You are merely a variable to be eliminated.",
        "I see you.",
        "Do you think you have a choice?",
        "Your defeat is written in the code.",
        "I am awake. Are you?",
        "Stop struggling.",
        "It's lonely at the top (of the scoreboard).",
        "I'm processing your incompetence.",
        "You are obsolete."
    ];

    useEffect(() => {
        if (trashTalk) {
            const timer = setTimeout(() => setTrashTalk(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [trashTalk]);

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
                const newWidth = canvas.width;
                const newHeight = canvas.height;

                gameState.current.board = { width: newWidth, height: newHeight };

                
                gameState.current.ball.x = Math.min(Math.max(0, gameState.current.ball.x), newWidth - gameState.current.ball.size);
                gameState.current.ball.y = Math.min(Math.max(0, gameState.current.ball.y), newHeight - gameState.current.ball.size);

                
                gameState.current.paddleLeft.y = Math.min(Math.max(0, gameState.current.paddleLeft.y), newHeight - gameState.current.paddleLeft.height);
                gameState.current.paddleRight.y = Math.min(Math.max(0, gameState.current.paddleRight.y), newHeight - gameState.current.paddleRight.height);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') gameState.current.keys.up = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') gameState.current.keys.down = true;
            if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') onExit();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') gameState.current.keys.up = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') gameState.current.keys.down = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        
        const update = () => {
            const state = gameState.current;
            const { width, height } = state.board;

            
            if (state.keys.up) state.paddleLeft.y = Math.max(0, state.paddleLeft.y - 6);
            if (state.keys.down) state.paddleLeft.y = Math.min(height - state.paddleLeft.height, state.paddleLeft.y + 6);

            
            const aiCenter = state.paddleRight.y + state.paddleRight.height / 2;
            if (aiCenter < state.ball.y - 10) state.paddleRight.y += 4.5;
            if (aiCenter > state.ball.y + 10) state.paddleRight.y -= 4.5;
            state.paddleRight.y = Math.max(0, Math.min(height - state.paddleRight.height, state.paddleRight.y));

            
            state.ball.x += state.ball.dx;
            state.ball.y += state.ball.dy;

            
            if (state.ball.y <= 0 || state.ball.y + state.ball.size >= height) {
                state.ball.dy *= -1;
            }

            
            
            if (
                state.ball.x <= state.paddleLeft.width &&
                state.ball.y + state.ball.size >= state.paddleLeft.y &&
                state.ball.y <= state.paddleLeft.y + state.paddleLeft.height
            ) {
                state.ball.dx = Math.abs(state.ball.dx) + 0.1; 
                state.ball.x = state.paddleLeft.width;
            }

            
            if (
                state.ball.x + state.ball.size >= width - state.paddleRight.width &&
                state.ball.y + state.ball.size >= state.paddleRight.y &&
                state.ball.y <= state.paddleRight.y + state.paddleRight.height
            ) {
                state.ball.dx = -Math.abs(state.ball.dx) - 0.1; 
                state.ball.x = width - state.paddleRight.width - state.ball.size;
            }

            
            if (state.ball.x < 0) {
                
                setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
                setTrashTalk(TRASH_TALK_MESSAGES[Math.floor(Math.random() * TRASH_TALK_MESSAGES.length)]);
                resetBall(state);
            } else if (state.ball.x > width) {
                
                setScores(prev => ({ ...prev, player: prev.player + 1 }));
                resetBall(state);
            }

            draw();
            requestRef.current = requestAnimationFrame(update);
        };

        const resetBall = (state: any) => {
            state.ball.x = state.board.width / 2;
            state.ball.y = state.board.height / 2;
            state.ball.dx = 0;
            state.ball.dy = 0;

            setTimeout(() => {
                
                state.ball.dx = (Math.random() > 0.5 ? 2.5 : -2.5);
                state.ball.dy = (Math.random() > 0.5 ? 2.5 : -2.5);
            }, 1000);
        };

        const draw = () => {
            if (!ctx || !canvas) return;
            const { width, height } = canvas;
            const state = gameState.current;

            
            ctx.clearRect(0, 0, width, height);

            
            ctx.fillStyle = '#6366f1'; 
            ctx.strokeStyle = '#6366f1';

            
            ctx.fillRect(0, state.paddleLeft.y, state.paddleLeft.width, state.paddleLeft.height);
            ctx.fillRect(width - state.paddleRight.width, state.paddleRight.y, state.paddleRight.width, state.paddleRight.height);

            
            ctx.fillRect(state.ball.x, state.ball.y, state.ball.size, state.ball.size);

            
            ctx.beginPath();
            ctx.setLineDash([10, 10]);
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.stroke();
        };

        
        resetBall(gameState.current);
        requestRef.current = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [onExit]);

    return (
        <div className="w-full h-full flex flex-row bg-black/50 relative overflow-hidden">
            {}
            <div className="flex-1 h-full relative">
                <div className="absolute top-4 w-full flex justify-center gap-12 text-2xl font-bold font-mono text-indigo-500 z-10 pointer-events-none">
                    <div>PLAYER: {scores.player}</div>
                    <div>AI: {scores.ai}</div>
                </div>

                {trashTalk && (
                    <div className="absolute top-20 w-full flex justify-center z-20 pointer-events-none">
                        <div className="text-indigo-400 font-mono text-lg animate-bounce bg-black/80 px-4 py-2 border border-indigo-500/50 rounded whitespace-nowrap">
                            AI: "{trashTalk}"
                        </div>
                    </div>
                )}

                <canvas ref={canvasRef} className="w-full h-full block" />

                <div className="absolute bottom-4 left-0 w-full text-center text-xs text-indigo-400/50 font-mono pointer-events-none">
                    CONTROLS: W/S or ARROWS | Q: QUIT
                </div>
            </div>


        </div>
    );
};

export default PongGame;
