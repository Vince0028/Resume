import React, { useEffect, useRef } from 'react';

interface SnakeGridBackgroundProps {
  className?: string;
}

interface CellCoord {
  c: number;
  r: number;
}

type ShapeKind = 'heart' | 'claude';

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

// All cells comprising the filled heart (7x6)
const HEART_FILLED_CELLS: CellCoord[] = [
  { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 4, r: 0 }, { c: 5, r: 0 },
  { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 }, { c: 4, r: 1 }, { c: 5, r: 1 }, { c: 6, r: 1 },
  { c: 0, r: 2 }, { c: 1, r: 2 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 2 }, { c: 5, r: 2 }, { c: 6, r: 2 },
  { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 }, { c: 5, r: 3 },
  { c: 2, r: 4 }, { c: 3, r: 4 }, { c: 4, r: 4 },
  { c: 3, r: 5 },
];

// 7-column x 7-row Claude Asterisk perimeter path relative to top-left anchor
const CLAUDE_PERIMETER: CellCoord[] = [
  { c: 3, r: 0 }, // North tip
  { c: 4, r: 1 },
  { c: 5, r: 1 }, // NE tip
  { c: 5, r: 2 },
  { c: 6, r: 3 }, // East tip
  { c: 5, r: 4 },
  { c: 5, r: 5 }, // SE tip
  { c: 4, r: 5 },
  { c: 3, r: 6 }, // South tip
  { c: 2, r: 5 },
  { c: 1, r: 5 }, // SW tip
  { c: 1, r: 4 },
  { c: 0, r: 3 }, // West tip
  { c: 1, r: 2 },
  { c: 1, r: 1 }, // NW tip
  { c: 2, r: 1 },
];

// All cells comprising the filled Claude Asterisk (7x7)
const CLAUDE_FILLED_CELLS: CellCoord[] = [
  { c: 3, r: 0 },
  { c: 1, r: 1 }, { c: 3, r: 1 }, { c: 5, r: 1 },
  { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 2 },
  { c: 0, r: 3 }, { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 }, { c: 5, r: 3 }, { c: 6, r: 3 },
  { c: 2, r: 4 }, { c: 3, r: 4 }, { c: 4, r: 4 },
  { c: 1, r: 5 }, { c: 3, r: 5 }, { c: 5, r: 5 },
  { c: 3, r: 6 },
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
  shapeType?: ShapeKind;
  isBonk?: boolean;
}

interface ActiveShape {
  type: ShapeKind;
  anchorC: number;
  anchorR: number;
  pulse: number;
  fade: number;
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
  type: 'shapeMaker' | 'ladder';
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
  // Bump animation state
  bumpTimer?: number; // > 0 when recently bumped!
  bumpOffset?: { x: number; y: number };
  // Intentional photo attraction curiosity state
  curiosityTarget?: { c: number; r: number; approachDir: CellCoord };
  curiosityCooldown?: number;
  // Shape-maker state (Heart vs Claude)
  currentShapeKind?: ShapeKind;
  shapeTarget?: { anchorC: number; anchorR: number; kind: ShapeKind };
  shapeStepIndex?: number;
  // Ladder state
  climbingLadder?: { ladder: Ladder; dir: number };
}

const CELL_SIZE = 54;

// Draw vector heart icon (no emoji)
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

// Draw official Anthropic Claude asterisk logo icon
const drawClaudeLogo = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color = '#DE7356',
  alpha = 1
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const numRays = 8;
  const rayLen = size * 0.95;
  const rayWidth = size * 0.28;
  const coreRadius = size * 0.32;

  ctx.fillStyle = color;
  for (let i = 0; i < numRays; i++) {
    const angle = (i * Math.PI * 2) / numRays;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    const w = i % 2 === 0 ? rayWidth : rayWidth * 0.82;
    const len = i % 2 === 0 ? rayLen : rayLen * 0.82;
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-w / 2, -len, w, len * 0.85, w / 2);
    } else {
      ctx.rect(-w / 2, -len, w, len * 0.85);
    }
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('CLAUDE', 0, size * 0.95);

  ctx.restore();
};

const SnakeGridBackground: React.FC<SnakeGridBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

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

    // Get Bounding Box of Hero Graduation Photo in grid cell coords
    const getPhotoBounds = () => {
      const el = document.getElementById('hero-grad-photo');
      if (!el || !canvas) return null;
      const r = el.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();

      // Convert to grid cell coordinates with 0-cell snug buffer
      const minC = Math.floor((r.left - cr.left - offsetX) / CELL_SIZE);
      const maxC = Math.ceil((r.right - cr.left - offsetX) / CELL_SIZE) - 1;
      const minR = Math.floor((r.top - cr.top - offsetY) / CELL_SIZE);
      const maxR = Math.ceil((r.bottom - cr.top - offsetY) / CELL_SIZE) - 1;

      return { minC, maxC, minR, maxR };
    };

    const isCellBlocked = (c: number, r: number) => {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
      const p = getPhotoBounds();
      if (p && c >= p.minC && c <= p.maxC && r >= p.minR && r <= p.maxR) {
        return true;
      }
      return false;
    };

    const isPhotoCell = (c: number, r: number) => {
      const p = getPhotoBounds();
      if (!p) return false;
      return c >= p.minC && c <= p.maxC && r >= p.minR && r <= p.maxR;
    };

    // Intentional target right outside the photo so the snake slithers over and bonks it!
    const getPhotoPerimeterTarget = (): { c: number; r: number; approachDir: CellCoord } | null => {
      const p = getPhotoBounds();
      if (!p) return null;

      // Most frequently hit the left edge (facing the user content)
      const side = Math.random();
      if (side < 0.7) {
        // Left perimeter cell moving right directly into photo
        const targetR = Math.floor(Math.random() * Math.max(1, p.maxR - p.minR + 1)) + p.minR;
        return {
          c: Math.max(0, p.minC - 1),
          r: Math.max(0, Math.min(rows - 1, targetR)),
          approachDir: { c: 1, r: 0 },
        };
      } else if (side < 0.85) {
        // Top perimeter cell moving down into photo
        const targetC = Math.floor(Math.random() * Math.max(1, p.maxC - p.minC + 1)) + p.minC;
        return {
          c: Math.max(0, Math.min(cols - 1, targetC)),
          r: Math.max(0, p.minR - 1),
          approachDir: { c: 0, r: 1 },
        };
      } else {
        // Bottom perimeter cell moving up into photo
        const targetC = Math.floor(Math.random() * Math.max(1, p.maxC - p.minC + 1)) + p.minC;
        return {
          c: Math.max(0, Math.min(cols - 1, targetC)),
          r: Math.min(rows - 1, p.maxR + 1),
          approachDir: { c: 0, r: -1 },
        };
      }
    };

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

    // Ladders setup (placed outside photo bounds)
    let ladders: Ladder[] = [];
    const initLadders = () => {
      ladders = [];
      if (cols < 6 || rows < 7) return;

      const numLadders = Math.min(3, Math.max(2, Math.floor(cols / 10)));
      const p = getPhotoBounds();

      for (let i = 0; i < numLadders; i++) {
        let c = Math.floor((cols / (numLadders + 1)) * (i + 1)) + (Math.floor(Math.random() * 3) - 1);

        // If ladder column collides with photo, shift it to left open space
        if (p && c >= p.minC - 1 && c <= p.maxC + 1) {
          c = Math.max(2, p.minC - 2 - i);
        }

        const ladderHeight = Math.floor(Math.random() * 3) + 3; // 3 to 5 cells high
        const topR = Math.floor(Math.random() * (rows - ladderHeight - 2)) + 1;
        const bottomR = topR + ladderHeight;

        if (c > 1 && c < cols - 2 && bottomR < rows - 1 && !isCellBlocked(c, topR) && !isCellBlocked(c, bottomR)) {
          ladders.push({
            c,
            topR,
            bottomR,
            glow: 0.25,
          });
        }
      }
    };

    // Particles list
    let particles: Particle[] = [];
    const spawnParticles = (x: number, y: number, color: string, count = 10, shapeType?: ShapeKind) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 1.8 + 0.8) * (shapeType ? 1.4 : 1);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (shapeType ? 0.6 : 0),
          color,
          alpha: 1,
          size: Math.random() * 2.5 + 2,
          life: 0,
          maxLife: shapeType ? 55 : 35,
          shapeType,
        });
      }
    };

    // Cute bonk stars for bumping!
    const spawnBonkStars = (x: number, y: number) => {
      const starColors = ['#fde047', '#facc15', '#ffffff', '#fbbf24', '#f59e0b'];
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1.6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.4, // Pop upwards!
          color: starColors[Math.floor(Math.random() * starColors.length)],
          alpha: 1,
          size: Math.random() * 3 + 2.5,
          life: 0,
          maxLife: Math.floor(Math.random() * 20 + 35),
          isBonk: true,
        });
      }
    };

    // Active illuminated shapes (Hearts & Claude logos)
    let activeShapes: ActiveShape[] = [];

    // Food Pellets (Minimal, calm, not behind photo)
    let foods: FoodPellet[] = [];
    const spawnFood = (customCoord?: CellCoord) => {
      if (customCoord && !isCellBlocked(customCoord.c, customCoord.r)) {
        foods.push({
          c: customCoord.c,
          r: customCoord.r,
          color: ['#00f0ff', '#f59e0b', '#DE7356', '#f43f5e'][Math.floor(Math.random() * 4)],
          pulse: 0,
        });
        return;
      }
      if (foods.length >= 2) return;

      for (let attempt = 0; attempt < 20; attempt++) {
        const c = Math.floor(Math.random() * (cols - 4)) + 2;
        const r = Math.floor(Math.random() * (rows - 4)) + 2;
        if (!isCellBlocked(c, r)) {
          foods.push({
            c,
            r,
            color: ['#00f0ff', '#f59e0b', '#DE7356', '#f43f5e'][Math.floor(Math.random() * 4)],
            pulse: Math.random() * Math.PI * 2,
          });
          break;
        }
      }
    };

    for (let i = 0; i < 2; i++) spawnFood();

    // Snakes collection (just 2 calm ambient snakes)
    let snakes: Snake[] = [];

    const createShapeMakerSnake = (id: string, startC: number, startR: number): Snake => ({
      id,
      type: 'shapeMaker',
      color: '#f43f5e', // Starts as soft neon rose
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
      moveInterval: 260, // Calm, relaxed pace
      moveTimer: 0,
      bumpTimer: 0,
      bumpOffset: { x: 0, y: 0 },
      currentShapeKind: 'heart',
      shapeStepIndex: 0,
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
      moveInterval: 280, // Calm, relaxed pace
      moveTimer: 0,
      bumpTimer: 0,
      bumpOffset: { x: 0, y: 0 },
    });

    const initSnakes = () => {
      snakes = [];
      const midC = Math.floor(cols / 2);
      const midR = Math.floor(rows / 2);
      const p = getPhotoBounds();

      // Ensure starting position is never inside photo
      let start1C = Math.max(3, midC - 6);
      let start2C = Math.max(3, midC - 2);
      let snake2Dir: CellCoord = { c: 1, r: 0 };
      let snake2R = midR;

      if (p) {
        if (start1C >= p.minC) start1C = Math.max(2, p.minC - 5);
        // Position snake 2 just 3 cells to the left of the photo, moving right directly into it!
        start2C = Math.max(2, p.minC - 3);
        snake2R = Math.floor((p.minR + p.maxR) / 2);
      }

      const s1 = createShapeMakerSnake('shape-1', start1C, Math.max(2, midR - 2));
      const s2 = createLadderSnake('ladder-1', start2C, snake2R);
      s2.dir = snake2Dir;
      s2.nextDir = snake2Dir;
      // Trigger curiosity early on so it intentionally bonks into the photo right away!
      s2.curiosityCooldown = 300;

      snakes.push(s1);
      snakes.push(s2);
    };

    // Valid directions helper avoiding photo obstacle and screen boundaries
    const DIRS: CellCoord[] = [
      { c: 1, r: 0 },
      { c: -1, r: 0 },
      { c: 0, r: 1 },
      { c: 0, r: -1 },
    ];

    const pickRandomValidDir = (currentHead: CellCoord, currentDir: CellCoord): CellCoord => {
      const valid = DIRS.filter((d) => {
        if (d.c === -currentDir.c && d.r === -currentDir.r) return false;
        const nc = currentHead.c + d.c;
        const nr = currentHead.r + d.r;
        return !isCellBlocked(nc, nr);
      });

      if (valid.length === 0) {
        const rev = { c: -currentDir.c, r: -currentDir.r };
        if (!isCellBlocked(currentHead.c + rev.c, currentHead.r + rev.r)) return rev;
        const anyOpen = DIRS.find((d) => !isCellBlocked(currentHead.c + d.c, currentHead.r + d.r));
        return anyOpen || rev;
      }

      const keepCurrent = valid.find((d) => d.c === currentDir.c && d.r === currentDir.r);
      if (keepCurrent && Math.random() < 0.7) return keepCurrent;

      return valid[Math.floor(Math.random() * valid.length)];
    };

    // Pick open shape anchor completely outside photo
    const pickOpenShapeAnchor = (shapeW = 7, shapeH = 7) => {
      const p = getPhotoBounds();
      for (let attempt = 0; attempt < 30; attempt++) {
        const anchorC = Math.floor(Math.random() * (cols - shapeW - 2)) + 1;
        const anchorR = Math.floor(Math.random() * (rows - shapeH - 2)) + 1;

        if (p) {
          const overlaps = !(
            anchorC + shapeW < p.minC ||
            anchorC > p.maxC ||
            anchorR + shapeH < p.minR ||
            anchorR > p.maxR
          );
          if (!overlaps) return { anchorC, anchorR };
        } else {
          return { anchorC, anchorR };
        }
      }
      return { anchorC: 2, anchorR: 2 };
    };

    // Trigger shape creation (Heart or Claude) at location
    const triggerShapeAt = (anchorC: number, anchorR: number, kind: ShapeKind) => {
      const p = getPhotoBounds();
      let c = Math.max(1, Math.min(cols - 8, anchorC));
      let r = Math.max(1, Math.min(rows - 8, anchorR));

      // Avoid photo if clicked near it
      if (p && !(c + 7 < p.minC || c > p.maxC || r + 7 < p.minR || r > p.maxR)) {
        c = Math.max(1, p.minC - 8);
      }

      const shapeSnake = snakes.find((s) => s.type === 'shapeMaker') || snakes[0];
      if (shapeSnake) {
        shapeSnake.shapeTarget = { anchorC: c, anchorR: r, kind };
        shapeSnake.shapeStepIndex = 0;
        shapeSnake.currentShapeKind = kind;

        if (kind === 'claude') {
          shapeSnake.color = '#DE7356'; // Claude terracotta
          shapeSnake.secondaryColor = '#FCD34D';
          shapeSnake.glowColor = 'rgba(222, 115, 86, 0.25)';
        } else {
          shapeSnake.color = '#f43f5e'; // Heart rose
          shapeSnake.secondaryColor = '#fda4af';
          shapeSnake.glowColor = 'rgba(244, 63, 94, 0.25)';
        }
      }
    };

    // Update single snake logic
    const updateSnake = (snake: Snake, delta: number) => {
      // Ease bump recoil offset smoothly back to zero
      if (snake.bumpOffset) {
        snake.bumpOffset.x *= 0.88;
        snake.bumpOffset.y *= 0.88;
      }

      // If recently bumped, hold position and display cute >< face!
      if (snake.bumpTimer && snake.bumpTimer > 0) {
        snake.bumpTimer -= delta;
        return; // Pause snake cell stepping while bumped!
      }

      snake.moveTimer += delta;
      if (snake.moveTimer < snake.moveInterval) return;

      snake.moveTimer -= snake.moveInterval;
      snake.prevBody = snake.body.map((b) => ({ ...b }));

      const head = snake.body[0];

      // SHAPE MAKER LOGIC (HEARTS & CLAUDE LOGOS)
      if (snake.type === 'shapeMaker') {
        // Only if idle for 25+ seconds without interaction, spawn one surprise shape
        if (!snake.shapeTarget && idleTimer > 25000) {
          idleTimer = 0;
          const nextKind: ShapeKind = snake.currentShapeKind === 'claude' ? 'heart' : 'claude';
          const { anchorC, anchorR } = pickOpenShapeAnchor(7, 7);

          snake.shapeTarget = { anchorC, anchorR, kind: nextKind };
          snake.shapeStepIndex = 0;
          snake.currentShapeKind = nextKind;

          if (nextKind === 'claude') {
            shapeColors(snake, '#DE7356', '#FCD34D', 'rgba(222, 115, 86, 0.25)');
          } else {
            shapeColors(snake, '#f43f5e', '#fda4af', 'rgba(244, 63, 94, 0.25)');
          }
        }

        if (snake.shapeTarget) {
          const target = snake.shapeTarget;
          const perimeter = target.kind === 'claude' ? CLAUDE_PERIMETER : HEART_PERIMETER;
          const stepIdx = snake.shapeStepIndex ?? 0;

          if (stepIdx < perimeter.length) {
            const shapeOffset = perimeter[stepIdx];
            const targetCell = { c: target.anchorC + shapeOffset.c, r: target.anchorR + shapeOffset.r };

            const dc = Math.sign(targetCell.c - head.c);
            const dr = Math.sign(targetCell.r - head.r);

            if (dc !== 0 && !isCellBlocked(head.c + dc, head.r)) {
              snake.nextDir = { c: dc, r: 0 };
            } else if (dr !== 0 && !isCellBlocked(head.c, head.r + dr)) {
              snake.nextDir = { c: 0, r: dr };
            } else {
              snake.shapeStepIndex = stepIdx + 1;

              if (snake.shapeStepIndex >= perimeter.length) {
                const existing = activeShapes.find(
                  (s) => s.anchorC === target.anchorC && s.anchorR === target.anchorR
                );
                if (!existing) {
                  activeShapes.push({
                    type: target.kind,
                    anchorC: target.anchorC,
                    anchorR: target.anchorR,
                    pulse: 0,
                    fade: 1,
                    color: snake.color,
                  });
                }

                const centerCellX = offsetX + (target.anchorC + 3.5) * CELL_SIZE;
                const centerCellY = offsetY + (target.anchorR + (target.kind === 'claude' ? 3.5 : 2.5)) * CELL_SIZE;
                spawnParticles(centerCellX, centerCellY, snake.color, 20, target.kind);

                snake.shapeTarget = undefined;
                snake.shapeStepIndex = 0;
                // Return snake to calm cyber amber
                shapeColors(snake, '#f59e0b', '#fde68a', 'rgba(245, 158, 11, 0.25)');
              }
            }
          }
        }
      }

      // LADDER SNAKE LOGIC
      if (snake.type === 'ladder') {
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
          const { ladder, dir } = snake.climbingLadder;
          const targetR = dir === -1 ? ladder.topR : ladder.bottomR;

          const cellX = offsetX + ladder.c * CELL_SIZE + CELL_SIZE / 2;
          const cellY = offsetY + head.r * CELL_SIZE + CELL_SIZE / 2;
          spawnParticles(cellX, cellY, snake.color, 3);

          if (head.r === targetR) {
            snake.climbingLadder = undefined;
            snake.nextDir = Math.random() > 0.5 ? { c: 1, r: 0 } : { c: -1, r: 0 };
          } else {
            snake.nextDir = { c: 0, r: dir };
          }
        }
      }

      // WANDERER & INTENTIONAL PHOTO CURIOSITY
      if (!snake.shapeTarget && !snake.climbingLadder) {
        if (!snake.curiosityCooldown) {
          snake.curiosityCooldown = Math.random() * 2000 + 800;
        }
        snake.curiosityCooldown -= delta;

        // Periodically seek out Vince's graduation photo to bump into it!
        if (snake.curiosityCooldown <= 0 && !snake.curiosityTarget) {
          const tgt = getPhotoPerimeterTarget();
          if (tgt) {
            snake.curiosityTarget = tgt;
            snake.curiosityCooldown = 5000 + Math.random() * 4000; // Next curiosity in 5-9 seconds
          }
        }

        if (snake.curiosityTarget) {
          const tgt = snake.curiosityTarget;
          if (head.c === tgt.c && head.r === tgt.r) {
            // Reached photo perimeter cell! Charge directly into the photo for the bonk!
            snake.nextDir = tgt.approachDir;
            snake.curiosityTarget = undefined;
          } else {
            const dc = Math.sign(tgt.c - head.c);
            const dr = Math.sign(tgt.r - head.r);

            // Move towards perimeter target
            if (dc !== 0 && !isPhotoCell(head.c + dc, head.r) && !(dc === -snake.dir.c && snake.dir.r === 0)) {
              snake.nextDir = { c: dc, r: 0 };
            } else if (dr !== 0 && !isPhotoCell(head.c, head.r + dr) && !(dr === -snake.dir.r && snake.dir.c === 0)) {
              snake.nextDir = { c: 0, r: dr };
            } else {
              snake.nextDir = pickRandomValidDir(head, snake.dir);
            }
          }
        } else {
          if (Math.random() < 0.25 || head.c <= 1 || head.c >= cols - 2 || head.r <= 1 || head.r >= rows - 2) {
            snake.nextDir = pickRandomValidDir(head, snake.dir);
          }
        }
      }

      // ── BUMP DETECTION WITH PHOTO & BOUNDARY ──
      const desiredC = head.c + snake.nextDir.c;
      const desiredR = head.r + snake.nextDir.r;

      const isPhotoBump = isPhotoCell(desiredC, desiredR);
      const isBoundaryBump = desiredC < 0 || desiredC >= cols || desiredR < 0 || desiredR >= rows;

      if (isPhotoBump || isBoundaryBump) {
        // BUMP! Trigger cute >< eyes, pause movement & burst bonk stars!
        snake.bumpTimer = 750; // Pause for 750ms so user clearly sees the cute >< face and bonk stars!
        snake.bumpOffset = {
          x: -snake.nextDir.c * 12,
          y: -snake.nextDir.r * 12,
        };

        const contactX = offsetX + (head.c + 0.5 + snake.nextDir.c * 0.45) * CELL_SIZE;
        const contactY = offsetY + (head.r + 0.5 + snake.nextDir.r * 0.45) * CELL_SIZE;
        spawnBonkStars(contactX, contactY);

        // Turn 90 degrees away from the obstacle
        const turnDirs = snake.nextDir.c !== 0
          ? [{ c: 0, r: 1 }, { c: 0, r: -1 }]
          : [{ c: 1, r: 0 }, { c: -1, r: 0 }];
        const validTurn = turnDirs.find((d) => !isCellBlocked(head.c + d.c, head.r + d.r));
        snake.nextDir = validTurn || { c: -snake.nextDir.c, r: -snake.nextDir.r };
        snake.curiosityTarget = undefined;
      }

      snake.dir = snake.nextDir;

      let newHead: CellCoord = {
        c: head.c + snake.dir.c,
        r: head.r + snake.dir.r,
      };

      // Ensure newHead never breaches photo or boundary
      if (isCellBlocked(newHead.c, newHead.r)) {
        newHead = { c: head.c, r: head.r };
      }

      snake.body.unshift(newHead);

      const eatenFoodIdx = foods.findIndex((f) => f.c === newHead.c && f.r === newHead.r);
      if (eatenFoodIdx !== -1) {
        const food = foods[eatenFoodIdx];
        const cx = offsetX + food.c * CELL_SIZE + CELL_SIZE / 2;
        const cy = offsetY + food.r * CELL_SIZE + CELL_SIZE / 2;
        spawnParticles(cx, cy, food.color, 10);
        foods.splice(eatenFoodIdx, 1);
        snake.targetLength = Math.min(14, snake.targetLength + 1);
        spawnFood();
      }

      while (snake.body.length > snake.targetLength) {
        snake.body.pop();
      }
    };

    const shapeColors = (snake: Snake, color: string, secondary: string, glow: string) => {
      snake.color = color;
      snake.secondaryColor = secondary;
      snake.glowColor = glow;
    };

    // Click handler to trigger shapes & food
    const handleCanvasClick = (e: MouseEvent) => {
      idleTimer = 0;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const clickC = Math.floor((clickX - offsetX) / CELL_SIZE);
      const clickR = Math.floor((clickY - offsetY) / CELL_SIZE);

      if (isCellBlocked(clickC, clickR)) return;

      const chosenKind: ShapeKind = Math.random() > 0.5 ? 'claude' : 'heart';
      const anchorC = Math.max(1, Math.min(cols - 8, clickC - 3));
      const anchorR = Math.max(1, Math.min(rows - 8, clickR - 3));
      const burstColor = chosenKind === 'claude' ? '#DE7356' : '#f43f5e';

      // Instantly light up the shape around the clicked box!
      activeShapes.push({
        type: chosenKind,
        anchorC,
        anchorR,
        pulse: 0,
        fade: 1,
        color: burstColor,
      });

      triggerShapeAt(anchorC, anchorR, chosenKind);

      spawnParticles(clickX, clickY, burstColor, 24, chosenKind);
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
    let idleTimer = 0;

    // Main 60fps Render Loop
    const render = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;
      idleTimer += delta;

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
      ctx.fillStyle = 'rgba(212, 132, 26, 0.12)';
      for (let c = 0; c <= cols; c += 2) {
        for (let r = 0; r <= rows; r += 2) {
          const x = offsetX + c * CELL_SIZE;
          const y = offsetY + r * CELL_SIZE;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      // ── 2. DRAW LADDERS (SUBTLE CYBER LADDERS) ──
      for (const ladder of ladders) {
        const lx = offsetX + ladder.c * CELL_SIZE;
        const lyTop = offsetY + ladder.topR * CELL_SIZE;
        const lyBottom = offsetY + (ladder.bottomR + 1) * CELL_SIZE;
        const w = CELL_SIZE;

        ctx.fillStyle = 'rgba(245, 158, 11, 0.025)';
        ctx.fillRect(lx + 8, lyTop, w - 16, lyBottom - lyTop);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lx + 10, lyTop);
        ctx.lineTo(lx + 10, lyBottom);
        ctx.moveTo(lx + w - 10, lyTop);
        ctx.lineTo(lx + w - 10, lyBottom);
        ctx.stroke();

        const rungs = (ladder.bottomR - ladder.topR + 1) * 3;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= rungs; i++) {
          const ry = lyTop + (i / rungs) * (lyBottom - lyTop);
          ctx.beginPath();
          ctx.moveTo(lx + 10, ry);
          ctx.lineTo(lx + w - 10, ry);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.font = '8px monospace';
        ctx.fillText('▲ UP', lx + 14, lyTop - 4);
      }

      // ── 3. DRAW ACTIVE ILLUMINATED SHAPES (HEARTS & CLAUDE LOGOS) ──
      for (let i = activeShapes.length - 1; i >= 0; i--) {
        const shape = activeShapes[i];
        shape.pulse += delta * 0.005;
        shape.fade -= delta * 0.00015; // stays lit for ~6 seconds

        if (shape.fade <= 0) {
          activeShapes.splice(i, 1);
          continue;
        }

        const scale = 1 + Math.sin(shape.pulse * 4) * 0.05;
        const alpha = Math.min(1, shape.fade) * 0.35; // Gentle ambient alpha

        if (shape.type === 'heart') {
          for (const cell of HEART_FILLED_CELLS) {
            const cx = offsetX + (shape.anchorC + cell.c) * CELL_SIZE;
            const cy = offsetY + (shape.anchorR + cell.r) * CELL_SIZE;

            ctx.fillStyle = `rgba(244, 63, 94, ${alpha * 0.2})`;
            ctx.fillRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);

            ctx.strokeStyle = `rgba(251, 113, 133, ${alpha * 0.45})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }

          const centerX = offsetX + (shape.anchorC + 3.5) * CELL_SIZE;
          const centerY = offsetY + (shape.anchorR + 2.5) * CELL_SIZE;
          drawVectorHeart(
            ctx,
            centerX,
            centerY,
            24 * scale,
            'rgba(244, 63, 94, 0.5)',
            'rgba(255, 255, 255, 0.75)',
            alpha
          );
        } else {
          for (const cell of CLAUDE_FILLED_CELLS) {
            const cx = offsetX + (shape.anchorC + cell.c) * CELL_SIZE;
            const cy = offsetY + (shape.anchorR + cell.r) * CELL_SIZE;

            ctx.fillStyle = `rgba(222, 115, 86, ${alpha * 0.22})`;
            ctx.fillRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);

            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.45})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }

          const centerX = offsetX + (shape.anchorC + 3.5) * CELL_SIZE;
          const centerY = offsetY + (shape.anchorR + 3.2) * CELL_SIZE;
          drawClaudeLogo(
            ctx,
            centerX,
            centerY,
            20 * scale,
            '#DE7356',
            alpha
          );
        }
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

        for (let b = bodyLen - 1; b >= 0; b--) {
          const curr = snake.body[b];
          const prev = snake.prevBody[b] || curr;

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

          ctx.shadowColor = snake.color;
          ctx.shadowBlur = t > 0.8 ? 5 : 0;

          if (b === 0) {
            // HEAD: Translucent glowing square cyber block with bump recoil
            const isBumped = Boolean(snake.bumpTimer && snake.bumpTimer > 0);
            const shake = isBumped ? Math.sin((snake.bumpTimer || 0) * 0.04) * 3 : 0;
            const hx = px + padding + (snake.bumpOffset?.x || 0) + shake;
            const hy = py + padding + (snake.bumpOffset?.y || 0);

            ctx.fillStyle = isBumped ? 'rgba(255, 230, 230, 0.75)' : 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(hx, hy, boxSize, boxSize);

            ctx.strokeStyle = isBumped ? '#f43f5e' : snake.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(hx, hy, boxSize, boxSize);

            const cx = hx + boxSize / 2;
            const cy = hy + boxSize / 2;
            const eyeOffset = Math.floor(boxSize * 0.25);

            if (isBumped) {
              // CUTE "> <" SQUEEZE/OUCH EYES ANIMATION!
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 2.2;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              let eye1X = cx, eye1Y = cy, eye2X = cx, eye2Y = cy;
              if (snake.dir.c !== 0) {
                eye1X = cx + snake.dir.c * (boxSize * 0.18);
                eye1Y = cy - eyeOffset;
                eye2X = cx + snake.dir.c * (boxSize * 0.18);
                eye2Y = cy + eyeOffset;
              } else {
                eye1X = cx - eyeOffset;
                eye1Y = cy + snake.dir.r * (boxSize * 0.18);
                eye2X = cx + eyeOffset;
                eye2Y = cy + snake.dir.r * (boxSize * 0.18);
              }

              // Left eye: >
              ctx.beginPath();
              ctx.moveTo(eye1X - 3.5, eye1Y - 3.5);
              ctx.lineTo(eye1X + 2.5, eye1Y);
              ctx.lineTo(eye1X - 3.5, eye1Y + 3.5);
              ctx.stroke();

              // Right eye: <
              ctx.beginPath();
              ctx.moveTo(eye2X + 3.5, eye2Y - 3.5);
              ctx.lineTo(eye2X - 2.5, eye2Y);
              ctx.lineTo(eye2X + 3.5, eye2Y + 3.5);
              ctx.stroke();

              // Cute rosy blush on cheeks!
              ctx.fillStyle = 'rgba(244, 63, 94, 0.75)';
              ctx.beginPath();
              ctx.arc(cx - eyeOffset * 0.75, cy + 5, 3, 0, Math.PI * 2);
              ctx.arc(cx + eyeOffset * 0.75, cy + 5, 3, 0, Math.PI * 2);
              ctx.fill();

              // Little cute bonk stars floating & bobbing above head
              const starFloat = Math.sin((snake.bumpTimer || 0) * 0.02) * 3;
              ctx.fillStyle = '#fde047';
              ctx.font = '13px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('💫', cx, hy - 5 + starFloat);
            } else {
              // Normal digital visor square eyes
              ctx.fillStyle = 'rgba(10, 10, 10, 0.7)';
              const eyeSize = Math.max(3, Math.floor(boxSize * 0.16));

              if (snake.dir.c !== 0) {
                const eyeX = cx + snake.dir.c * (boxSize * 0.22) - eyeSize / 2;
                ctx.fillRect(eyeX, cy - eyeOffset - eyeSize / 2, eyeSize, eyeSize);
                ctx.fillRect(eyeX, cy + eyeOffset - eyeSize / 2, eyeSize, eyeSize);
              } else {
                const eyeY = cy + snake.dir.r * (boxSize * 0.22) - eyeSize / 2;
                ctx.fillRect(cx - eyeOffset - eyeSize / 2, eyeY, eyeSize, eyeSize);
                ctx.fillRect(cx + eyeOffset - eyeSize / 2, eyeY, eyeSize, eyeSize);
              }
            }
          } else {
            // BODY SEGMENTS: Soft translucent square boxes
            const alpha = 0.16 + t * 0.22;
            ctx.fillStyle = snake.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(px + padding, py + padding, boxSize, boxSize);

            ctx.strokeStyle = snake.secondaryColor || '#ffffff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * 0.65;
            ctx.strokeRect(px + padding + 2, py + padding + 2, boxSize - 4, boxSize - 4);
            ctx.globalAlpha = 1;
          }
        }

        ctx.restore();
      }

      // ── 6. DRAW PARTICLES (PIXELS, MINI VECTOR ICONS & BONK STARS) ──
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

        if (pt.isBonk) {
          // Cute 4-point bonk star sparkle
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 6;
          const s = pt.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - s);
          ctx.quadraticCurveTo(pt.x, pt.y, pt.x + s, pt.y);
          ctx.quadraticCurveTo(pt.x, pt.y, pt.x, pt.y + s);
          ctx.quadraticCurveTo(pt.x, pt.y, pt.x - s, pt.y);
          ctx.quadraticCurveTo(pt.x, pt.y, pt.x, pt.y - s);
          ctx.fill();
          ctx.restore();
        } else if (pt.shapeType === 'heart') {
          drawVectorHeart(ctx, pt.x, pt.y, pt.size * 1.8, pt.color, '#ffffff', pt.alpha * 0.5);
        } else if (pt.shapeType === 'claude') {
          drawClaudeLogo(ctx, pt.x, pt.y, pt.size * 1.5, '#DE7356', pt.alpha * 0.5);
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

        if (mc >= 0 && mc < cols && mr >= 0 && mr < rows && !isCellBlocked(mc, mr)) {
          const cx = offsetX + mc * CELL_SIZE;
          const cy = offsetY + mr * CELL_SIZE;

          ctx.fillStyle = 'rgba(212, 132, 26, 0.06)';
          ctx.fillRect(cx, cy, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = 'rgba(212, 132, 26, 0.3)';
          ctx.lineWidth = 1;
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-pointer z-0"
        title="Click any box to make a heart or Claude!"
      />

      {/* Simple human instruction */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/85 border border-primary/25 backdrop-blur-md text-[11px] font-mono text-zinc-900 dark:text-white/95 [ .theme-light_& ]:text-zinc-900 [ .theme-dark_& ]:text-white/95 shadow-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Click any box to make a heart or Claude ❤️</span>
      </div>
    </div>
  );
};

export default SnakeGridBackground;
