import { useState, useCallback, useRef } from 'react';

// ── Piece definitions ──
const PIECE_SHAPES: number[][][] = [
    [[1]],
    [[1, 1]],
    [[1, 1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1, 1, 1]],
    [[1], [1]],
    [[1], [1], [1]],
    [[1], [1], [1], [1]],
    [[1], [1], [1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0], [1, 1]],
    [[0, 1], [1, 1]],
    [[1, 1], [1, 1], [1, 1]],
    [[1, 1, 1], [1, 1, 1]],
];

const COLORS = [
    '#4ade80', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7',
    '#06b6d4', '#ec4899', '#f97316',
];

const GRID = 8;
const CELL = 34;
const GAP = 2;
const GRID_PX = GRID * CELL + (GRID - 1) * GAP;
const MINI_CELL = 14;

type Cell = string | null;
type GridT = Cell[][];
type Piece = { shape: number[][]; color: string };

function randomPiece(): Piece {
    const shape = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { shape, color };
}

function canPlace(grid: GridT, piece: Piece, row: number, col: number): boolean {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                const gr = row + r;
                const gc = col + c;
                if (gr < 0 || gr >= GRID || gc < 0 || gc >= GRID) return false;
                if (grid[gr][gc]) return false;
            }
        }
    }
    return true;
}

function canPlaceAnywhere(grid: GridT, piece: Piece): boolean {
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            if (canPlace(grid, piece, r, c)) return true;
        }
    }
    return false;
}

function clearLines(grid: GridT): { newGrid: GridT; cleared: number; clearedCells: Set<string> } {
    const toClearRows = new Set<number>();
    const toClearCols = new Set<number>();

    for (let r = 0; r < GRID; r++) {
        if (grid[r].every(cell => cell !== null)) toClearRows.add(r);
    }
    for (let c = 0; c < GRID; c++) {
        if (grid.every(row => row[c] !== null)) toClearCols.add(c);
    }

    const cleared = toClearRows.size + toClearCols.size;
    const clearedCells = new Set<string>();

    if (cleared > 0) {
        const newGrid = grid.map(row => [...row]);
        toClearRows.forEach(r => {
            for (let c = 0; c < GRID; c++) { clearedCells.add(`${r}-${c}`); newGrid[r][c] = null; }
        });
        toClearCols.forEach(c => {
            for (let r = 0; r < GRID; r++) { clearedCells.add(`${r}-${c}`); newGrid[r][c] = null; }
        });
        return { newGrid, cleared, clearedCells };
    }

    return { newGrid: grid, cleared: 0, clearedCells };
}

export default function BlockBlastGame() {
    const [grid, setGrid] = useState<GridT>(() =>
        Array.from({ length: GRID }, () => Array(GRID).fill(null))
    );
    const [pieces, setPieces] = useState<(Piece | null)[]>(() => [randomPiece(), randomPiece(), randomPiece()]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0);
    const [flashCells, setFlashCells] = useState<Set<string>>(new Set());
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('blockblast-hi');
        return saved ? parseInt(saved) : 0;
    });

    // Drag state
    const [dragging, setDragging] = useState<number | null>(null);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
    const [dropTarget, setDropTarget] = useState<{ r: number; c: number } | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const checkGameOver = useCallback((g: GridT, p: (Piece | null)[]) => {
        const activePieces = p.filter(Boolean) as Piece[];
        if (activePieces.length === 0) return false;
        return !activePieces.some(piece => canPlaceAnywhere(g, piece));
    }, []);

    const doPlace = useCallback((pieceIdx: number, row: number, col: number) => {
        const piece = pieces[pieceIdx];
        if (!piece) return;
        if (!canPlace(grid, piece, row, col)) return;

        const newGrid = grid.map(r => [...r]);
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) newGrid[row + r][col + c] = piece.color;
            }
        }

        const blockCount = piece.shape.flat().filter(Boolean).length;
        let addScore = blockCount * 10;

        const { newGrid: clearedGrid, cleared, clearedCells } = clearLines(newGrid);
        const newCombo = cleared > 0 ? combo + 1 : 0;

        if (cleared > 0) {
            setFlashCells(clearedCells);
            setTimeout(() => setFlashCells(new Set()), 300);
            addScore += cleared * 100 * (1 + newCombo * 0.5);
        }

        setCombo(newCombo);
        setGrid(clearedGrid);
        setScore(prev => {
            const ns = prev + Math.round(addScore);
            if (ns > highScore) { setHighScore(ns); localStorage.setItem('blockblast-hi', ns.toString()); }
            return ns;
        });

        const newPieces = [...pieces];
        newPieces[pieceIdx] = null;

        const remaining = newPieces.filter(Boolean);
        if (remaining.length === 0) {
            const fresh = [randomPiece(), randomPiece(), randomPiece()];
            setPieces(fresh);
            if (checkGameOver(clearedGrid, fresh)) setGameOver(true);
        } else {
            setPieces(newPieces);
            if (checkGameOver(clearedGrid, newPieces)) setGameOver(true);
        }
    }, [pieces, grid, combo, highScore, checkGameOver]);

    // Convert pointer position to grid cell
    const pointerToCell = useCallback((clientX: number, clientY: number, piece: Piece) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        // Center the piece on the pointer
        const pieceW = piece.shape[0].length;
        const pieceH = piece.shape.length;
        const cellSize = rect.width / GRID;
        const col = Math.round((clientX - rect.left) / cellSize - pieceW / 2);
        const row = Math.round((clientY - rect.top) / cellSize - pieceH / 2);
        if (row < -1 || row >= GRID + 1 || col < -1 || col >= GRID + 1) return null;
        return { r: Math.max(0, Math.min(GRID - pieceH, row)), c: Math.max(0, Math.min(GRID - pieceW, col)) };
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent, idx: number) => {
        if (gameOver || !pieces[idx]) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(idx);
        setDragPos({ x: e.clientX, y: e.clientY });
    }, [gameOver, pieces]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (dragging === null) return;
        e.preventDefault();
        setDragPos({ x: e.clientX, y: e.clientY });
        const piece = pieces[dragging];
        if (piece) {
            const cell = pointerToCell(e.clientX, e.clientY, piece);
            setDropTarget(cell);
        }
    }, [dragging, pieces, pointerToCell]);

    const handlePointerUp = useCallback(() => {
        if (dragging !== null && dropTarget && pieces[dragging]) {
            const piece = pieces[dragging]!;
            if (canPlace(grid, piece, dropTarget.r, dropTarget.c)) {
                doPlace(dragging, dropTarget.r, dropTarget.c);
            }
        }
        setDragging(null);
        setDragPos(null);
        setDropTarget(null);
    }, [dragging, dropTarget, pieces, grid, doPlace]);

    const resetGame = useCallback(() => {
        setGrid(Array.from({ length: GRID }, () => Array(GRID).fill(null)));
        setPieces([randomPiece(), randomPiece(), randomPiece()]);
        setScore(0);
        setGameOver(false);
        setCombo(0);
        setFlashCells(new Set());
        setDragging(null);
        setDragPos(null);
        setDropTarget(null);
    }, []);

    // Preview cells for drop target
    const previewCells = new Set<string>();
    let previewValid = false;
    if (dragging !== null && dropTarget && pieces[dragging]) {
        const piece = pieces[dragging]!;
        previewValid = canPlace(grid, piece, dropTarget.r, dropTarget.c);
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) previewCells.add(`${dropTarget.r + r}-${dropTarget.c + c}`);
            }
        }
    }

    const dragPiece = dragging !== null ? pieces[dragging] : null;

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center select-none touch-none h-full justify-between"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* HUD */}
            <div className="w-full flex justify-between items-center px-4 py-2 font-mono text-[11px]">
                <span className="text-green-400">SCORE: {score}</span>
                {combo > 0 && <span className="text-primary animate-pulse text-[10px]">COMBO x{combo + 1}</span>}
                <span className="text-green-400">HI: {highScore}</span>
            </div>

            {/* Grid */}
            <div
                ref={gridRef}
                className="relative rounded-lg p-[3px]"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`,
                    gridTemplateRows: `repeat(${GRID}, ${CELL}px)`,
                    gap: `${GAP}px`,
                    background: 'rgba(11, 17, 32, 0.6)',
                    border: '1px solid rgba(100, 116, 139, 0.2)',
                }}
            >
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        const key = `${r}-${c}`;
                        const isPreview = previewCells.has(key);
                        const isFlash = flashCells.has(key);
                        const pColor = dragPiece?.color;

                        return (
                            <div
                                key={key}
                                className="rounded-[4px]"
                                style={{
                                    width: CELL,
                                    height: CELL,
                                    transition: 'all 0.12s ease',
                                    background: isFlash ? '#fff'
                                        : cell ? cell
                                            : isPreview
                                                ? (previewValid ? `${pColor}40` : 'rgba(239,68,68,0.2)')
                                                : 'rgba(30, 41, 59, 0.4)',
                                    border: isPreview && previewValid
                                        ? `2px solid ${pColor}80`
                                        : cell
                                            ? '1px solid rgba(255,255,255,0.15)'
                                            : '1px solid rgba(100, 116, 139, 0.12)',
                                    boxShadow: cell ? `inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 6px ${cell}30` : undefined,
                                    transform: isFlash ? 'scale(1.08)' : undefined,
                                }}
                            />
                        );
                    })
                )}
            </div>

            {/* Piece tray */}
            <div className="flex gap-3 justify-center items-center mt-3 px-2" style={{ minHeight: 80 }}>
                {pieces.map((piece, i) => (
                    <div
                        key={i}
                        className={`p-2 rounded-lg border-2 transition-all ${piece === null
                            ? 'opacity-0 pointer-events-none'
                            : dragging === i
                                ? 'border-primary/60 bg-primary/10 scale-95 opacity-40'
                                : 'border-border/40 bg-card/30 hover:border-border cursor-grab active:cursor-grabbing'
                            }`}
                        onPointerDown={(e) => handlePointerDown(e, i)}
                    >
                        {piece && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${piece.shape[0].length}, ${MINI_CELL}px)`,
                                    gap: '2px',
                                }}
                            >
                                {piece.shape.flat().map((cell, ci) => (
                                    <div
                                        key={ci}
                                        className="rounded-[2px]"
                                        style={{
                                            width: MINI_CELL,
                                            height: MINI_CELL,
                                            background: cell ? piece.color : 'transparent',
                                            border: cell ? '1px solid rgba(255,255,255,0.15)' : undefined,
                                            boxShadow: cell ? 'inset 0 -1px 2px rgba(0,0,0,0.3)' : undefined,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Instructions */}
            <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-1">
                Drag a piece onto the grid · Clear rows & columns
            </p>

            {/* Floating drag piece */}
            {dragging !== null && dragPos && dragPiece && (
                <div
                    className="fixed pointer-events-none z-[300]"
                    style={{
                        left: dragPos.x,
                        top: dragPos.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${dragPiece.shape[0].length}, ${CELL - 2}px)`,
                            gap: '2px',
                            opacity: 0.85,
                        }}
                    >
                        {dragPiece.shape.flat().map((cell, ci) => (
                            <div
                                key={ci}
                                className="rounded-[4px]"
                                style={{
                                    width: CELL - 2,
                                    height: CELL - 2,
                                    background: cell ? dragPiece.color : 'transparent',
                                    border: cell ? '1px solid rgba(255,255,255,0.25)' : undefined,
                                    boxShadow: cell ? `inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 12px ${dragPiece.color}50` : undefined,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Game Over overlay */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/70 rounded-[1.8rem] flex flex-col items-center justify-center gap-3 z-10">
                    <span className="font-mono text-xl font-bold text-primary">GAME OVER</span>
                    <span className="font-mono text-sm text-green-400">Score: {score}</span>
                    <button
                        onClick={resetGame}
                        className="px-4 py-2 rounded-full border border-primary/50 text-primary font-mono text-xs hover:bg-primary/10 transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
