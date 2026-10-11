import React, { useEffect, useRef, useState } from 'react';

interface SnakeGridBackgroundProps {
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

interface CellCoord {
  c: number;
  r: number;
}

// 7-column x 6-row Heart perimeter path relative to top-left anchor
const HEART_PERIMETER: CellCoord[] = [
  { c: 3, r: 1 }, // top-center notch
  { c: 2, r: 0 },
  { c: 1, r: 0 },
  { c: 0, r: 1 },
  { c: 0, r: 2 },
  { c: 1, r: 3 },
  { c: 2, r: 4 },
  { c: 3, r: 5 }, // bottom tip
  { c: 4, r: 4 },
  { c: 5, r: 3 },
  { c: 6, r: 2 },
  { c: 6, r: 1 },
  { c: 5, r: 0 },
  { c: 4, r: 0 },
];

// All cells comprising the filled heart
const HEART_FILLED_CELLS: CellCoord[] = [
  { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 4, r: 0 }, { c: 5, r: 0 },
  { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 }, { c: 4, r: 1 }, { c: 5, r: 1 }, { c: 6, r: 1 },
  { c: 0, r: 2 }, { c: 1, r: 2 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 2 }, { c: 5, r: 2 }, { c: 6, r: 2 },
  { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 }, { c: 5, r: 3 },
  { c: 2, r: 4 }, { c: 3, r: 4 }, { c: 4, r: 4 },
  { c: 3, r: 5 },
];

interface Ladder {
  c: number;
  topR: number;
  bottomR: number;
  glow: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  isHeart?: boolean;
}

interface ActiveHeart {
  anchorC: number;
  anchorR: number;
  progress: number; // 0 to 1
  pulse: number; // heartbeat timer
  fade: number; // alpha 0 to 1
  completed: boolean;
  color: string;
}

interface FoodPellet {
  c: number;
  r: number;
  color: string;
  pulse: number;
}

interface Snake {
  id: string;
  type: 'heart' | 'ladder' | 'wanderer' | 'hunter';
  color: string;
  secondaryColor: string;
  glowColor: string;
  body: CellCoord[]; // [head, segment, ..., tail]
  prevBody: CellCoord[];
  dir: CellCoord; // current moving direction {c, r}
  nextDir: CellCoord;
  targetLength: number;
  moveInterval: number; // ms per cell step
  moveTimer: number;
  // Special heart-maker state
  heartTarget?: { anchorC: number; anchorR: number };
  heartStepIndex?: number;
  heartCyclesDone?: number;
  // Special ladder state
  climbingLadder?: { ladder: Ladder; dir: number };
}

const CELL_SIZE = 54;

const drawVectorHeart = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  alpha: number
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.beginPath();
  const d = size;
  ctx.moveTo(0, d * 0.45);
  ctx.bezierCurveTo(-d * 0.55, d * 0.1, -d * 0.6, -d * 0.35, -d * 0.28, -d * 0.42);
  ctx.bezierCurveTo(-d * 0.1, -d * 0.45, 0, -d * 0.22, 0, -d * 0.12);
  ctx.bezierCurveTo(0, -d * 0.22, d * 0.1, -d * 0.45, d * 0.28, -d * 0.42);
  ctx.bezierCurveTo(d * 0.6, -d * 0.35, d * 0.55, d * 0.1, 0, d * 0.45);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
};

const SnakeGridBackground: React.FC<SnakeGridBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [activeHeartCount, setActiveHeartCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let cols = Math.ceil(width / CELL_SIZE);
    let rows = Math.ceil(height / CELL_SIZE);
    let offsetX = (width % CELL_SIZE) / 2;
    let offsetY = (height % CELL_SIZE) / 2;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      cols = Math.ceil(width / CELL_SIZE);
      rows = Math.ceil(height / CELL_SIZE);
      offsetX = (width % CELL_SIZE) / 2;
      offsetY = (height % CELL_SIZE) / 2;

      initLadders();
    };

    // Ladders setup
    let ladders: Ladder[] = [];
    const initLadders = () => {
      ladders = [];
      if (cols < 6 || rows < 7) return;

      const numLadders = Math.min(4, Math.max(2, Math.floor(cols / 8)));
      for (let i = 0; i < numLadders; i++) {
        const c = Math.floor((cols / (numLadders + 1)) * (i + 1)) + (Math.floor(Math.random() * 3) - 1);
        const ladderHeight = Math.floor(Math.random() * 3) + 3; // 3 to 5 cells high
        const topR = Math.floor(Math.random() * (rows - ladderHeight - 2)) + 1;
        const bottomR = topR + ladderHeight;

        if (c > 1 && c < cols - 2 && bottomR < rows - 1) {
          ladders.push({
            c,
            topR,
            bottomR,
            glow: 0.4 + Math.random() * 0.4,
          });
        }
      }
    };

    // Particles list
    let particles: Particle[] = [];
    const spawnParticles = (x: number, y: number, color: string, count = 10, isHeart = false) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2 + 1) * (isHeart ? 1.5 : 1);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isHeart ? 0.8 : 0),
          color,
          alpha: 1,
          size: Math.random() * 3 + 2,
          life: 0,
          maxLife: isHeart ? 60 : 40,
          isHeart,
        });
      }
    };

    // Active illuminated hearts
    let activeHearts: ActiveHeart[] = [];

    // Food Pellets
    let foods: FoodPellet[] = [];
    const spawnFood = (customCoord?: CellCoord) => {
      if (customCoord) {
        foods.push({
          c: customCoord.c,
          r: customCoord.r,
          color: ['#00f0ff', '#f59e0b', '#10b981', '#ec4899', '#a855f7'][Math.floor(Math.random() * 5)],
          pulse: 0,
        });
        return;
      }
      if (foods.length >= 6) return;
      const c = Math.floor(Math.random() * (cols - 4)) + 2;
      const r = Math.floor(Math.random() * (rows - 4)) + 2;
      foods.push({
        c,
        r,
        color: ['#00f0ff', '#f59e0b', '#10b981', '#ec4899', '#a855f7'][Math.floor(Math.random() * 5)],
        pulse: Math.random() * Math.PI * 2,
      });
    };

    // Spawn initial food (minimal)
    for (let i = 0; i < 2; i++) spawnFood();

    // Snakes collection (just 2 calm ambient snakes)
    let snakes: Snake[] = [];

    const createHeartSnake = (id: string, startC: number, startR: number): Snake => ({
      id,
      type: 'heart',
      color: '#f43f5e', // Soft neon pink/rose
      secondaryColor: '#fda4af',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      body: [
        { c: startC, r: startR },
        { c: startC - 1, r: startR },
        { c: startC - 2, r: startR },
      ],
      prevBody: [
        { c: startC, r: startR },
        { c: startC - 1, r: startR },
        { c: startC - 2, r: startR },
      ],
      dir: { c: 1, r: 0 },
      nextDir: { c: 1, r: 0 },
      targetLength: 8,
      moveInterval: 260, // Slower, calm slither
      moveTimer: 0,
      heartStepIndex: 0,
      heartCyclesDone: 0,
    });

    const createLadderSnake = (id: string, startC: number, startR: number): Snake => ({
      id,
      type: 'ladder',
      color: '#f59e0b', // Cyber amber / gold
      secondaryColor: '#fde68a',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      body: [
        { c: startC, r: startR },
        { c: startC, r: startR + 1 },
        { c: startC, r: startR + 2 },
      ],
      prevBody: [
        { c: startC, r: startR },
        { c: startC, r: startR + 1 },
        { c: startC, r: startR + 2 },
      ],
      dir: { c: 0, r: -1 },
      nextDir: { c: 0, r: -1 },
      targetLength: 8,
      moveInterval: 280, // Slower, calm slither
      moveTimer: 0,
    });

    const initSnakes = () => {
      snakes = [];
      const midC = Math.floor(cols / 2);
      const midR = Math.floor(rows / 2);

      // Just 2 relaxed ambient snakes:
      // 1. Heart creator snake (traces hearts)
      snakes.push(createHeartSnake('heart-1', Math.max(3, midC - 6), Math.max(2, midR - 2)));

      // 2. Ladder explorer snake (climbs ladders)
      snakes.push(createLadderSnake('ladder-1', Math.min(cols - 4, midC + 4), Math.max(3, midR)));
    };

    // Helper: Valid directions
    const DIRS: CellCoord[] = [
      { c: 1, r: 0 },
      { c: -1, r: 0 },
      { c: 0, r: 1 },
      { c: 0, r: -1 },
    ];

    const pickRandomValidDir = (currentHead: CellCoord, currentDir: CellCoord): CellCoord => {
      const valid = DIRS.filter((d) => {
        // Can't reverse immediately
        if (d.c === -currentDir.c && d.r === -currentDir.r) return false;
        const nc = currentHead.c + d.c;
        const nr = currentHead.r + d.r;
        return nc >= 1 && nc < cols - 1 && nr >= 1 && nr < rows - 1;
      });

      if (valid.length === 0) return { c: -currentDir.c, r: -currentDir.r };
      // 70% chance to keep current direction if still valid
      const keepCurrent = valid.find((d) => d.c === currentDir.c && d.r === currentDir.r);
      if (keepCurrent && Math.random() < 0.7) return keepCurrent;

      return valid[Math.floor(Math.random() * valid.length)];
    };

    // Trigger heart creation at specific location
    const triggerHeartAt = (anchorC: number, anchorR: number) => {
      // Clamp bounds so 7x6 heart fits within grid
      const c = Math.max(1, Math.min(cols - 8, anchorC));
      const r = Math.max(1, Math.min(rows - 7, anchorR));

      // Find heart snake or reassign closest snake
      const heartSnake = snakes.find((s) => s.type === 'heart') || snakes[0];
      if (heartSnake) {
        heartSnake.heartTarget = { anchorC: c, anchorR: r };
        heartSnake.heartStepIndex = 0;
      }
    };

    // Update single snake logic
    const updateSnake = (snake: Snake, delta: number) => {
      snake.moveTimer += delta;
      if (snake.moveTimer < snake.moveInterval) return;

      snake.moveTimer -= snake.moveInterval;
      snake.prevBody = snake.body.map((b) => ({ ...b }));

      const head = snake.body[0];

      // HEART MAKER LOGIC
      if (snake.type === 'heart') {
        if (!snake.heartTarget) {
          // Pick a nice open anchor on the grid to build a heart
          const anchorC = Math.floor(Math.random() * (cols - 10)) + 2;
          const anchorR = Math.floor(Math.random() * (rows - 9)) + 2;
          snake.heartTarget = { anchorC, anchorR };
          snake.heartStepIndex = 0;
        }

        const target = snake.heartTarget;
        const stepIdx = snake.heartStepIndex ?? 0;

        if (stepIdx < HEART_PERIMETER.length) {
          // Follow the heart perimeter step by step
          const heartOffset = HEART_PERIMETER[stepIdx];
          const targetCell = { c: target.anchorC + heartOffset.c, r: target.anchorR + heartOffset.r };

          // Determine direction towards next heart cell
          const dc = Math.sign(targetCell.c - head.c);
          const dr = Math.sign(targetCell.r - head.r);

          if (dc !== 0) {
            snake.nextDir = { c: dc, r: 0 };
          } else if (dr !== 0) {
            snake.nextDir = { c: 0, r: dr };
          } else {
            // Reached this cell! advance to next
            snake.heartStepIndex = stepIdx + 1;
            if (snake.heartStepIndex >= HEART_PERIMETER.length) {
              // Heart perimeter completed! ACTIVATE HEART ILLUMINATION!
              activeHearts.push({
                anchorC: target.anchorC,
                anchorR: target.anchorR,
                progress: 0,
                pulse: 0,
                fade: 1,
                completed: false,
                color: snake.color,
              });

              // Burst heart sparkle particles
              const centerCellX = offsetX + (target.anchorC + 3.5) * CELL_SIZE;
              const centerCellY = offsetY + (target.anchorR + 2.5) * CELL_SIZE;
              spawnParticles(centerCellX, centerCellY, snake.color, 25, true);

              // Reset target to create another heart after a wandering break
              snake.heartCyclesDone = (snake.heartCyclesDone || 0) + 1;
              snake.heartTarget = undefined;
              snake.heartStepIndex = 0;
            }
          }
        }
      }

      // LADDER SNAKE LOGIC
      if (snake.type === 'ladder') {
        // Check if head is at the bottom or top of a ladder
        if (!snake.climbingLadder) {
          const hitLadder = ladders.find(
            (l) => l.c === head.c && (head.r === l.bottomR || head.r === l.topR)
          );
          if (hitLadder && Math.random() < 0.85) {
            const goingUp = head.r === hitLadder.bottomR;
            snake.climbingLadder = {
              ladder: hitLadder,
              dir: goingUp ? -1 : 1,
            };
            snake.nextDir = { c: 0, r: goingUp ? -1 : 1 };
          }
        } else {
          // Currently climbing ladder
          const { ladder, dir } = snake.climbingLadder;
          const targetR = dir === -1 ? ladder.topR : ladder.bottomR;

          // Spawn ascending sparkles
          const cellX = offsetX + ladder.c * CELL_SIZE + CELL_SIZE / 2;
          const cellY = offsetY + head.r * CELL_SIZE + CELL_SIZE / 2;
          spawnParticles(cellX, cellY, snake.color, 4);

          if (head.r === targetR) {
            // Finished climbing!
            snake.climbingLadder = undefined;
            snake.nextDir = Math.random() > 0.5 ? { c: 1, r: 0 } : { c: -1, r: 0 };
          } else {
            snake.nextDir = { c: 0, r: dir };
          }
        }
      }

      // HUNTER SNAKE LOGIC (HUNT FOOD OR MOUSE)
      if (snake.type === 'hunter' && foods.length > 0) {
        // Find closest food
        let closest = foods[0];
        let minDist = 99999;
        for (const food of foods) {
          const d = Math.abs(food.c - head.c) + Math.abs(food.r - head.r);
          if (d < minDist) {
            minDist = d;
            closest = food;
          }
        }

        // Steer towards closest food
        if (minDist > 0 && Math.random() < 0.85) {
          const dc = Math.sign(closest.c - head.c);
          const dr = Math.sign(closest.r - head.r);

          if (dc !== 0 && !(dc === -snake.dir.c && snake.dir.r === 0)) {
            snake.nextDir = { c: dc, r: 0 };
          } else if (dr !== 0 && !(dr === -snake.dir.r && snake.dir.c === 0)) {
            snake.nextDir = { c: 0, r: dr };
          }
        }
      }

      // WANDERER LOGIC (Keep moving randomly, occasional 90-degree turn)
      if (snake.type === 'wanderer' || (!snake.heartTarget && snake.type === 'heart') || (!snake.climbingLadder && snake.type === 'ladder')) {
        if (Math.random() < 0.25 || head.c <= 1 || head.c >= cols - 2 || head.r <= 1 || head.r >= rows - 2) {
          snake.nextDir = pickRandomValidDir(head, snake.dir);
        }
      }

      snake.dir = snake.nextDir;

      // New head position
      const newHead: CellCoord = {
        c: head.c + snake.dir.c,
        r: head.r + snake.dir.r,
      };

      // Wrap around or bounce at screen boundaries
      if (newHead.c < 0) newHead.c = cols - 1;
      if (newHead.c >= cols) newHead.c = 0;
      if (newHead.r < 0) newHead.r = rows - 1;
      if (newHead.r >= rows) newHead.r = 0;

      // Add new head
      snake.body.unshift(newHead);

      // Check food collision
      const eatenFoodIdx = foods.findIndex((f) => f.c === newHead.c && f.r === newHead.r);
      if (eatenFoodIdx !== -1) {
        const food = foods[eatenFoodIdx];
        const cx = offsetX + food.c * CELL_SIZE + CELL_SIZE / 2;
        const cy = offsetY + food.r * CELL_SIZE + CELL_SIZE / 2;
        spawnParticles(cx, cy, food.color, 15);
        foods.splice(eatenFoodIdx, 1);
        snake.targetLength = Math.min(18, snake.targetLength + 1);
        spawnFood();
      }

      // Trim tail to target length
      while (snake.body.length > snake.targetLength) {
        snake.body.pop();
      }
    };

    // Click handler to trigger hearts & food
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const clickC = Math.floor((clickX - offsetX) / CELL_SIZE);
      const clickR = Math.floor((clickY - offsetY) / CELL_SIZE);

      // Trigger heart near click
      triggerHeartAt(clickC - 3, clickR - 2);

      // Spawn burst of heart particles
      spawnParticles(clickX, clickY, '#f43f5e', 30, true);

      // Add a food pellet
      spawnFood({ c: clickC, r: clickR });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    resize();
    initSnakes();

    let lastTime = performance.now();

    // Main 60fps Render Loop
    const render = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // ── 1. DRAW SUBTLE 2D BACKGROUND GRID ──
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'; // very faint ambient grid lines

      for (let c = 0; c <= cols; c++) {
        const x = offsetX + c * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let r = 0; r <= rows; r++) {
        const y = offsetY + r * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Small glowing crosshairs at grid intersections
      ctx.fillStyle = 'rgba(212, 132, 26, 0.15)'; // faint primary amber
      for (let c = 0; c <= cols; c += 2) {
        for (let r = 0; r <= rows; r += 2) {
          const x = offsetX + c * CELL_SIZE;
          const y = offsetY + r * CELL_SIZE;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      // ── 2. DRAW LADDERS (SNAKES & LADDERS THEME) ──
      for (const ladder of ladders) {
        const lx = offsetX + ladder.c * CELL_SIZE;
        const lyTop = offsetY + ladder.topR * CELL_SIZE;
        const lyBottom = offsetY + (ladder.bottomR + 1) * CELL_SIZE;
        const w = CELL_SIZE;

        // Ladder glow background
        ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
        ctx.fillRect(lx + 8, lyTop, w - 16, lyBottom - lyTop);

        // Ladder vertical rails
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lx + 10, lyTop);
        ctx.lineTo(lx + 10, lyBottom);
        ctx.moveTo(lx + w - 10, lyTop);
        ctx.lineTo(lx + w - 10, lyBottom);
        ctx.stroke();

        // Ladder horizontal rungs
        const rungs = (ladder.bottomR - ladder.topR + 1) * 3;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i <= rungs; i++) {
          const ry = lyTop + (i / rungs) * (lyBottom - lyTop);
          ctx.beginPath();
          ctx.moveTo(lx + 10, ry);
          ctx.lineTo(lx + w - 10, ry);
          ctx.stroke();
        }

        // Top and bottom ladder tags
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.font = '9px monospace';
        ctx.fillText('▲ UP', lx + 14, lyTop - 4);
      }

      // ── 3. DRAW ACTIVE ILLUMINATED HEARTS ──
      for (let i = activeHearts.length - 1; i >= 0; i--) {
        const heart = activeHearts[i];
        heart.pulse += delta * 0.005;
        heart.fade -= delta * 0.00015; // stays lit for ~6 seconds

        if (heart.fade <= 0) {
          activeHearts.splice(i, 1);
          continue;
        }

        const scale = 1 + Math.sin(heart.pulse * 4) * 0.05; // subtle heartbeat pulse
        const alpha = Math.min(1, heart.fade) * 0.35; // Soft ambient alpha

        // Draw each cell of the heart with gentle neon glow
        for (const cell of HEART_FILLED_CELLS) {
          const cx = offsetX + (heart.anchorC + cell.c) * CELL_SIZE;
          const cy = offsetY + (heart.anchorR + cell.r) * CELL_SIZE;

          // Cell neon background
          ctx.fillStyle = `rgba(244, 63, 94, ${alpha * 0.22})`;
          ctx.fillRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);

          // Glowing border
          ctx.strokeStyle = `rgba(251, 113, 133, ${alpha * 0.45})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        }

        // Floating vector heart icon in center (NO EMOJI)
        const centerX = offsetX + (heart.anchorC + 3.5) * CELL_SIZE;
        const centerY = offsetY + (heart.anchorR + 2.5) * CELL_SIZE;
        drawVectorHeart(
          ctx,
          centerX,
          centerY,
          24 * scale,
          'rgba(244, 63, 94, 0.5)',
          'rgba(255, 255, 255, 0.75)',
          alpha
        );
      }

      // ── 4. DRAW FOOD PELLETS (SUBTLE CYBER CUBES) ──
      for (const food of foods) {
        food.pulse += delta * 0.004;
        const fx = offsetX + food.c * CELL_SIZE;
        const fy = offsetY + food.r * CELL_SIZE;
        const boxPad = 14 + Math.sin(food.pulse) * 1.5;
        const boxDim = CELL_SIZE - boxPad * 2;

        ctx.save();
        ctx.shadowColor = food.color;
        ctx.shadowBlur = 4;
        ctx.fillStyle = food.color;
        ctx.globalAlpha = 0.35;
        ctx.fillRect(fx + boxPad, fy + boxPad, boxDim, boxDim);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(fx + boxPad - 1, fy + boxPad - 1, boxDim + 2, boxDim + 2);
        ctx.restore();
      }

      // ── 5. UPDATE AND DRAW 2D SNAKES AS SQUARE BOXES (SOFT AMBIENT) ──
      for (const snake of snakes) {
        updateSnake(snake, delta);

        const interpolation = Math.min(1, snake.moveTimer / snake.moveInterval);
        const bodyLen = snake.body.length;
        if (bodyLen < 2) continue;

        ctx.save();

        // Draw each snake segment as a pure square box inside grid cells
        for (let b = bodyLen - 1; b >= 0; b--) {
          const curr = snake.body[b];
          const prev = snake.prevBody[b] || curr;

          // Interpolated position for fluid 60fps slithering
          const interpC = prev.c + (curr.c - prev.c) * interpolation;
          const interpR = prev.r + (curr.r - prev.r) * interpolation;

          const px = offsetX + interpC * CELL_SIZE;
          const py = offsetY + interpR * CELL_SIZE;

          const t = 1 - b / bodyLen; // 1 at head, 0 at tail
          const padding = 3;
          const boxSize = CELL_SIZE - padding * 2;

          // Soft ambient cell illumination
          const cellX = offsetX + curr.c * CELL_SIZE;
          const cellY = offsetY + curr.r * CELL_SIZE;
          ctx.fillStyle = snake.glowColor.replace('0.25', `${(t * 0.08).toFixed(2)}`);
          ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);

          // Subtle shadow blur
          ctx.shadowColor = snake.color;
          ctx.shadowBlur = t > 0.8 ? 5 : 0;

          if (b === 0) {
            // HEAD: Translucent glowing square cyber block
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(px + padding, py + padding, boxSize, boxSize);

            ctx.strokeStyle = snake.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + padding, py + padding, boxSize, boxSize);

            // Digital pixel visor / square eyes
            ctx.fillStyle = 'rgba(10, 10, 10, 0.7)';
            const eyeSize = Math.max(3, Math.floor(boxSize * 0.16));
            const eyeOffset = Math.floor(boxSize * 0.25);
            const cx = px + padding + boxSize / 2;
            const cy = py + padding + boxSize / 2;

            if (snake.dir.c !== 0) {
              // Moving horizontally
              const eyeX = cx + snake.dir.c * (boxSize * 0.22) - eyeSize / 2;
              ctx.fillRect(eyeX, cy - eyeOffset - eyeSize / 2, eyeSize, eyeSize);
              ctx.fillRect(eyeX, cy + eyeOffset - eyeSize / 2, eyeSize, eyeSize);
            } else {
              // Moving vertically
              const eyeY = cy + snake.dir.r * (boxSize * 0.22) - eyeSize / 2;
              ctx.fillRect(cx - eyeOffset - eyeSize / 2, eyeY, eyeSize, eyeSize);
              ctx.fillRect(cx + eyeOffset - eyeSize / 2, eyeY, eyeSize, eyeSize);
            }
          } else {
            // BODY SEGMENTS: Soft translucent square boxes
            const alpha = 0.16 + t * 0.22;
            ctx.fillStyle = snake.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(px + padding, py + padding, boxSize, boxSize);

            // Inner subtle border
            ctx.strokeStyle = snake.secondaryColor || '#ffffff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * 0.65;
            ctx.strokeRect(px + padding + 2, py + padding + 2, boxSize - 4, boxSize - 4);
            ctx.globalAlpha = 1;
          }
        }

        ctx.restore();
      }

      // ── 6. DRAW PARTICLES (SQUARE PIXELS & VECTOR HEARTS) ──
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = 1 - pt.life / pt.maxLife;

        if (pt.life >= pt.maxLife) {
          particles.splice(p, 1);
          continue;
        }

        if (pt.isHeart) {
          drawVectorHeart(ctx, pt.x, pt.y, pt.size * 1.8, pt.color, '#ffffff', pt.alpha * 0.5);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha * 0.6);
          ctx.fillStyle = pt.color;
          ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
          ctx.restore();
        }
      }

      // ── 7. MOUSE CURSOR CELL HIGHLIGHT ──
      if (mousePosRef.current.active) {
        const mx = mousePosRef.current.x;
        const my = mousePosRef.current.y;
        const mc = Math.floor((mx - offsetX) / CELL_SIZE);
        const mr = Math.floor((my - offsetY) / CELL_SIZE);

        if (mc >= 0 && mc < cols && mr >= 0 && mr < rows) {
          const cx = offsetX + mc * CELL_SIZE;
          const cy = offsetY + mr * CELL_SIZE;

          ctx.fillStyle = 'rgba(212, 132, 26, 0.08)';
          ctx.fillRect(cx, cy, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = 'rgba(212, 132, 26, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx, cy, CELL_SIZE, CELL_SIZE);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}>
      {/* 2D Canvas for Snakes, Ladders, Hearts and Grid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
        title="Interactive Snake & Grid: Click to create hearts or spawn energy!"
      />

      {/* Subtle Bottom-Right Interaction Hint */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 border border-primary/20 backdrop-blur-md text-[10px] font-mono text-muted-foreground shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
        <span>Click grid to summon hearts & ladders</span>
      </div>
    </div>
  );
};

export default SnakeGridBackground;
