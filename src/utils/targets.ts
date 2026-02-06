import { CONFIG } from "../config";
import { noise2 } from "./noise";
import { BRAIN_TO_COMPUTER_DOTS_SOURCE } from "../assets/brainToComputerDots";
import { BRAIN_DOTS_SOURCE } from "../assets/brainDots";
import { CLINICAL_DOTS_SOURCE } from "../assets/clinicalDots";
import { ASSISTIVE_DOTS_SOURCE } from "../assets/assistiveDots";

const { width: WIDTH, height: HEIGHT } = CONFIG.video;
const { count: N_DOTS, defaultSize: DOT_SIZE } = CONFIG.particles;

export type Point = { x: number; y: number; r: number };

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Pad or trim points array to exact count
 */
export const padPoints = (pts: Point[], n = N_DOTS): Point[] => {
  if (pts.length === n) return pts;
  if (pts.length > n) return pts.slice(0, n);
  const out = [...pts];
  let i = 0;
  while (out.length < n) {
    const p = pts[i % pts.length];
    const n2 = noise2(i + out.length);
    out.push({ x: p.x + n2.x * 0.6, y: p.y + n2.y * 0.6, r: p.r });
    i++;
  }
  return out;
};

/**
 * Sort points by X then Y coordinates
 */
export const sortPointsXY = (pts: Point[]) =>
  [...pts].sort((a, b) => (a.x - b.x) || (a.y - b.y));

/**
 * Match points from one array to another by sorted order
 */
export const matchBySort = (from: Point[], to: Point[]) => {
  const a = sortPointsXY(from);
  const b = sortPointsXY(to);
  const out: Point[] = [];
  for (let i = 0; i < a.length; i++) {
    out.push(b[i] ?? b[b.length - 1]);
  }
  return out;
};

/**
 * Generic function to transform source dots to screen coordinates
 */
function transformAssetToScreen(
  source: Array<[number, number, number]>,
  config: {
    sourceWidth: number;
    sourceHeight: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    dotScale: number;
    filterBorder?: boolean;
    borderFilter?: {
      leftEdge: number;
      rightEdge: number;
      topEdge: number;
      bottomEdge: number;
      mode: 'corners' | 'edges';
    };
  }
): Point[] {
  const { sourceWidth, sourceHeight, scale, offsetX, offsetY, dotScale, filterBorder, borderFilter } = config;
  
  // Calculate scale to fit in viewport
  const fitScale = Math.min(WIDTH / sourceWidth, HEIGHT / sourceHeight) * scale;
  
  // Calculate offsets to center
  const ox = WIDTH / 2 - (sourceWidth * fitScale) / 2 + offsetX;
  const oy = HEIGHT / 2 - (sourceHeight * fitScale) / 2 + offsetY;
  
  // Filter border dots if configured
  let filtered = source;
  if (filterBorder && borderFilter) {
    const { leftEdge, rightEdge, topEdge, bottomEdge, mode } = borderFilter;
    
    if (mode === 'edges') {
      // Filter entire edges
      filtered = source.filter(([x, y]) => {
        const onLeft = x < leftEdge;
        const onRight = x > rightEdge;
        const onTop = y < topEdge;
        const onBottom = y > bottomEdge;
        return !(onLeft || onRight || onTop || onBottom);
      });
    } else {
      // Filter corners only (for BCI-style partial borders)
      filtered = source.filter(([x, y]) => {
        const onLeftBorder = x < leftEdge && (y < topEdge || y > bottomEdge);
        const onRightBorder = x > rightEdge && (y < topEdge || y > bottomEdge);
        const onTopBorder = y < topEdge && (x < leftEdge || x > rightEdge);
        const onBottomBorder = y > bottomEdge && (x < leftEdge || x > rightEdge);
        return !(onLeftBorder || onRightBorder || onTopBorder || onBottomBorder);
      });
    }
  }
  
  // Transform to screen coordinates
  const pts = filtered.map(([x, y, r]) => ({
    x: x * fitScale + ox,
    y: y * fitScale + oy,
    r: r * (fitScale * dotScale),
  }));
  
  return padPoints(pts);
}

// ===================
// LOGO TARGETS
// ===================

export const sampleLogoTargets = (): Point[] => {
  const { dotSize, gap, verticalOffset } = CONFIG.scenes.logo;
  
  const FONT: Record<string, string[]> = {
    I: ["111", "010", "010", "010", "111"],
    S: ["1111", "1000", "1110", "0001", "1110"],
    O: ["1111", "1001", "1001", "1001", "1111"],
    M: ["10001", "11011", "10101", "10001", "10001"],
    E: ["1111", "1000", "1110", "1000", "1111"],
    T: ["11111", "00100", "00100", "00100", "00100"],
    R: ["1110", "1001", "1110", "1010", "1001"],
    Y: ["10001", "01010", "00100", "00100", "00100"],
  };
  
  const text = "ISOMETRY";
  const rows = 5;
  const chars = text.split("");
  const colsPerChar = chars.map((c) => (FONT[c] ? FONT[c][0].length : 0));
  const totalCols = colsPerChar.reduce((a, b) => a + b, 0) + (chars.length - 1) * 1;
  const startX = WIDTH / 2 - (totalCols * (dotSize + gap)) / 2;
  const startY = HEIGHT / 2 - (rows * (dotSize + gap)) / 2 + verticalOffset;

  const pts: Point[] = [];
  let cursor = 0;
  chars.forEach((ch) => {
    const glyph = FONT[ch];
    if (!glyph) return;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === "1") {
          const x = startX + (cursor + c) * (dotSize + gap);
          const y = startY + r * (dotSize + gap);
          pts.push({ x, y, r: dotSize / 2 });
        }
      }
    }
    cursor += glyph[0].length + 1;
  });
  return padPoints(pts);
};

// ===================
// ASSET-BASED TARGETS
// ===================

export const sampleBrainAssetTargets = (): Point[] => {
  const cfg = CONFIG.scenes.brain;
  return transformAssetToScreen(BRAIN_DOTS_SOURCE, {
    sourceWidth: cfg.sourceWidth,
    sourceHeight: cfg.sourceHeight,
    scale: cfg.scale,
    offsetX: cfg.offsetX,
    offsetY: cfg.offsetY,
    dotScale: cfg.dotScale,
  });
};

export const sampleBrainToComputerAssetTargets = (): Point[] => {
  const cfg = CONFIG.scenes.bci;
  return transformAssetToScreen(BRAIN_TO_COMPUTER_DOTS_SOURCE, {
    sourceWidth: cfg.sourceWidth,
    sourceHeight: cfg.sourceHeight,
    scale: cfg.scale,
    offsetX: cfg.offsetX,
    offsetY: cfg.offsetY,
    dotScale: cfg.dotScale,
    filterBorder: cfg.filterBorder,
    borderFilter: cfg.borderFilter,
  });
};

export const sampleClinicalAssetTargets = (): Point[] => {
  const cfg = CONFIG.scenes.clinical;
  return transformAssetToScreen(CLINICAL_DOTS_SOURCE, {
    sourceWidth: cfg.sourceWidth,
    sourceHeight: cfg.sourceHeight,
    scale: cfg.scale,
    offsetX: cfg.offsetX,
    offsetY: cfg.offsetY,
    dotScale: cfg.dotScale,
    filterBorder: cfg.filterBorder,
    borderFilter: cfg.borderFilter,
  });
};

export const sampleAssistiveAssetTargets = (): Point[] => {
  const cfg = CONFIG.scenes.assistive;
  return transformAssetToScreen(ASSISTIVE_DOTS_SOURCE, {
    sourceWidth: cfg.sourceWidth,
    sourceHeight: cfg.sourceHeight,
    scale: cfg.scale,
    offsetX: cfg.offsetX,
    offsetY: cfg.offsetY,
    dotScale: cfg.dotScale,
    filterBorder: cfg.filterBorder,
    borderFilter: cfg.borderFilter,
  });
};

// ===================
// GEOMETRIC TARGETS (for testing/fallback)
// ===================

export const sampleGridTargets = (spacing = 32, margin = 80): Point[] => {
  const pts: Point[] = [];
  for (let y = margin; y <= HEIGHT - margin; y += spacing) {
    for (let x = margin; x <= WIDTH - margin; x += spacing) {
      pts.push({ x, y, r: DOT_SIZE });
    }
  }
  return padPoints(pts);
};

export const sampleCircleTargets = (radius = 240): Point[] => {
  const pts: Point[] = [];
  for (let i = 0; i < N_DOTS; i++) {
    const a = (i / N_DOTS) * Math.PI * 2;
    pts.push({ x: WIDTH / 2 + Math.cos(a) * radius, y: HEIGHT / 2 + Math.sin(a) * radius, r: DOT_SIZE });
  }
  return pts;
};

export const sampleCoreTargets = (): Point[] => {
  const pts: Point[] = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  for (let i = 0; i < N_DOTS; i++) {
    const a = (i / N_DOTS) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * 18, y: cy + Math.sin(a) * 18, r: DOT_SIZE });
  }
  return pts;
};

export const sampleEllipsisTargets = (): Point[] => {
  const pts: Point[] = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const r = 26;
  const gap = 140;
  const centers = [cx - gap, cx, cx + gap];
  for (const x0 of centers) {
    for (let i = 0; i < N_DOTS / 3; i++) {
      const a = (i / (N_DOTS / 3)) * Math.PI * 2;
      pts.push({ x: x0 + Math.cos(a) * r, y: cy + Math.sin(a) * r, r: DOT_SIZE });
    }
  }
  return padPoints(pts);
};
