import { DOT_SIZE, HEIGHT, WIDTH, N_DOTS } from "../constants";
import { noise2 } from "./noise";
import { BRAIN_TO_COMPUTER_DOTS_SOURCE } from "../assets/brainToComputerDots";
import { BRAIN_DOTS_SOURCE } from "../assets/brainDots";
import { CLINICAL_DOTS_SOURCE } from "../assets/clinicalDots";
import { ASSISTIVE_DOTS_SOURCE } from "../assets/assistiveDots";

export type Point = { x: number; y: number; r: number };

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

export const sampleRoundedRectTargets = (w: number, h: number, rr: number): Point[] => {
  const pts: Point[] = [];
  const r = Math.min(rr, w / 2, h / 2);
  const straightW = w - 2 * r;
  const straightH = h - 2 * r;
  const perim = 2 * (straightW + straightH) + 2 * Math.PI * r;

  for (let i = 0; i < N_DOTS; i++) {
    let d = (i / N_DOTS) * perim;
    let x = 0, y = 0;

    if (d < straightW) {
      x = -w / 2 + r + d;
      y = -h / 2;
    } else if ((d -= straightW) < (Math.PI / 2) * r) {
      const a = -Math.PI / 2 + d / r;
      x = w / 2 - r + Math.cos(a) * r;
      y = -h / 2 + r + Math.sin(a) * r;
    } else if ((d -= (Math.PI / 2) * r) < straightH) {
      x = w / 2;
      y = -h / 2 + r + d;
    } else if ((d -= straightH) < (Math.PI / 2) * r) {
      const a = 0 + d / r;
      x = w / 2 - r + Math.cos(a) * r;
      y = h / 2 - r + Math.sin(a) * r;
    } else if ((d -= (Math.PI / 2) * r) < straightW) {
      x = w / 2 - r - d;
      y = h / 2;
    } else if ((d -= straightW) < (Math.PI / 2) * r) {
      const a = Math.PI / 2 + d / r;
      x = -w / 2 + r + Math.cos(a) * r;
      y = h / 2 - r + Math.sin(a) * r;
    } else if ((d -= (Math.PI / 2) * r) < straightH) {
      x = -w / 2;
      y = h / 2 - r - d;
    } else {
      d -= straightH;
      const a = Math.PI + d / r;
      x = -w / 2 + r + Math.cos(a) * r;
      y = -h / 2 + r + Math.sin(a) * r;
    }

    pts.push({ x: WIDTH / 2 + x, y: HEIGHT / 2 + y, r: DOT_SIZE });
  }

  return pts;
};

export const sampleBrainTargets = (): Point[] => {
  const pts: Point[] = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const a = 220;
  const b = 160;
  for (let i = 0; i < N_DOTS; i++) {
    const t = (i / N_DOTS) * Math.PI * 2;
    const x = cx + Math.cos(t) * a * 0.95 + Math.sin(t * 2) * 20;
    const y = cy + Math.sin(t) * b + Math.cos(t * 3) * 10;
    pts.push({ x, y, r: DOT_SIZE });
  }
  return pts;
};

export const sampleComputerTargets = (): Point[] => {
  const screen = sampleRoundedRectTargets(520, 300, 50);
  const pts = screen.slice(0, Math.floor(N_DOTS * 0.7));
  const base: Point[] = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 + 190;
  for (let i = 0; i < Math.floor(N_DOTS * 0.3); i++) {
    const t = (i / Math.floor(N_DOTS * 0.3)) * Math.PI * 2;
    const x = cx + Math.cos(t) * 120;
    const y = cy + Math.sin(t) * 25;
    base.push({ x, y, r: DOT_SIZE });
  }
  return padPoints([...pts, ...base]);
};

export const sampleLogoTargets = (): Point[] => {
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
  const dot = 9;
  const gap = 4;
  const rows = 5;
  const chars = text.split("");
  const colsPerChar = chars.map((c) => (FONT[c] ? FONT[c][0].length : 0));
  const totalCols = colsPerChar.reduce((a, b) => a + b, 0) + (chars.length - 1) * 1;
  const startX = WIDTH / 2 - (totalCols * (dot + gap)) / 2;
  const startY = HEIGHT / 2 - (rows * (dot + gap)) / 2 + 20;

  const pts: Point[] = [];
  let cursor = 0;
  chars.forEach((ch) => {
    const glyph = FONT[ch];
    if (!glyph) return;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === "1") {
          const x = startX + (cursor + c) * (dot + gap);
          const y = startY + r * (dot + gap);
          pts.push({ x, y, r: dot / 2 });
        }
      }
    }
    cursor += glyph[0].length + 1;
  });
  return padPoints(pts);
};

export const sortPointsXY = (pts: Point[]) =>
  [...pts].sort((a, b) => (a.x - b.x) || (a.y - b.y));

export const matchBySort = (from: Point[], to: Point[]) => {
  const a = sortPointsXY(from);
  const b = sortPointsXY(to);
  const out: Point[] = [];
  for (let i = 0; i < a.length; i++) {
    out.push(b[i] ?? b[b.length - 1]);
  }
  return out;
};

export const sampleWearableTargets = (): Point[] => {
  const pts: Point[] = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  // headset arc
  for (let i = 0; i < N_DOTS * 0.5; i++) {
    const t = Math.PI * (i / (N_DOTS * 0.5));
    const x = cx + Math.cos(Math.PI + t) * 220;
    const y = cy + Math.sin(Math.PI + t) * 140;
    pts.push({ x, y, r: DOT_SIZE });
  }
  // ear pads
  for (let i = 0; i < N_DOTS * 0.25; i++) {
    const t = (i / (N_DOTS * 0.25)) * Math.PI * 2;
    pts.push({ x: cx - 220 + Math.cos(t) * 40, y: cy + 40 + Math.sin(t) * 40, r: DOT_SIZE });
  }
  for (let i = 0; i < N_DOTS * 0.25; i++) {
    const t = (i / (N_DOTS * 0.25)) * Math.PI * 2;
    pts.push({ x: cx + 220 + Math.cos(t) * 40, y: cy + 40 + Math.sin(t) * 40, r: DOT_SIZE });
  }
  return padPoints(pts);
};

export const sampleMedicalCrossTargets = (): Point[] => {
  const pts: Point[] = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const w = 220;
  const t = 60;
  // vertical bar
  for (let y = -w; y <= w; y += 12) {
    for (let x = -t; x <= t; x += 12) {
      pts.push({ x: cx + x, y: cy + y, r: DOT_SIZE });
    }
  }
  // horizontal bar
  for (let y = -t; y <= t; y += 12) {
    for (let x = -w; x <= w; x += 12) {
      pts.push({ x: cx + x, y: cy + y, r: DOT_SIZE });
    }
  }
  return padPoints(pts);
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

export const sampleWindowTargets = (): Point[] => {
  const pts: Point[] = [];
  // outer window
  const outer = sampleRoundedRectTargets(900, 420, 40);
  pts.push(...outer.slice(0, Math.floor(N_DOTS * 0.6)));
  // globe icon
  const gx = WIDTH / 2 - 260;
  const gy = HEIGHT / 2;
  for (let i = 0; i < N_DOTS * 0.15; i++) {
    const a = (i / (N_DOTS * 0.15)) * Math.PI * 2;
    pts.push({ x: gx + Math.cos(a) * 60, y: gy + Math.sin(a) * 60, r: DOT_SIZE });
  }
  // ellipsis center
  const ex = WIDTH / 2;
  const ey = HEIGHT / 2;
  for (let i = 0; i < N_DOTS * 0.1; i++) {
    const a = (i / (N_DOTS * 0.1)) * Math.PI * 2;
    pts.push({ x: ex + Math.cos(a) * 25, y: ey + Math.sin(a) * 25, r: DOT_SIZE });
  }
  // laptop right
  const lx = WIDTH / 2 + 260;
  const ly = HEIGHT / 2 + 20;
  const rect = sampleRoundedRectTargets(160, 120, 20);
  pts.push(...rect.slice(0, Math.floor(N_DOTS * 0.15)).map((p) => ({ x: p.x - WIDTH/2 + lx, y: p.y - HEIGHT/2 + ly, r: p.r })));

  return padPoints(pts);
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

export const sampleBCIWindowTargets = (): Point[] => {
  const pts: Point[] = [];
  const frame = sampleRoundedRectTargets(1100, 520, 50);
  pts.push(...frame.slice(0, Math.floor(N_DOTS * 0.55)));

  const bx = WIDTH / 2 - 260;
  const by = HEIGHT / 2;
  for (let i = 0; i < N_DOTS * 0.2; i++) {
    const a = (i / (N_DOTS * 0.2)) * Math.PI * 2;
    pts.push({ x: bx + Math.cos(a) * 90, y: by + Math.sin(a) * 70, r: DOT_SIZE });
  }

  const ex = WIDTH / 2;
  const ey = HEIGHT / 2 + 10;
  for (let i = 0; i < N_DOTS * 0.05; i++) {
    const a = (i / (N_DOTS * 0.05)) * Math.PI * 2;
    pts.push({ x: ex + Math.cos(a) * 16, y: ey + Math.sin(a) * 16, r: DOT_SIZE });
  }

  const lx = WIDTH / 2 + 300;
  const ly = HEIGHT / 2 + 40;
  const rect = sampleRoundedRectTargets(200, 140, 20);
  pts.push(...rect.slice(0, Math.floor(N_DOTS * 0.2)).map((p) => ({ x: p.x - WIDTH/2 + lx, y: p.y - HEIGHT/2 + ly, r: p.r })));

  return padPoints(pts);
};

export const sampleBrainToComputerAssetTargets = (): Point[] => {
  const srcW = 1536;
  const srcH = 1049;
  const scale = Math.min(WIDTH / srcW, HEIGHT / srcH) * 1.05;
  const ox = WIDTH / 2 - (srcW * scale) / 2;
  const oy = HEIGHT / 2 - (srcH * scale) / 2;
  // Filter out border rectangle dots
  const margin = 60;
  const filtered = BRAIN_TO_COMPUTER_DOTS_SOURCE.filter(([x, y]) => {
    const isLeftEdge = x < margin + 250;
    const isRightEdge = x > srcW - margin - 250;
    const isTopEdge = y < margin + 300;
    const isBottomEdge = y > srcH - margin - 50;
    // Keep only dots that are NOT on border edges OR are part of internal content
    const onLeftBorder = x < 320 && (y < 340 || y > 700);
    const onRightBorder = x > 1230 && (y < 340 || y > 700);
    const onTopBorder = y < 350 && (x < 320 || x > 1230);
    const onBottomBorder = y > 700 && (x < 320 || x > 1230);
    return !(onLeftBorder || onRightBorder || onTopBorder || onBottomBorder);
  });
  const pts = filtered.map(([x, y, r]) => ({
    x: x * scale + ox,
    y: y * scale + oy,
    r: r * (scale * 0.85),
  }));
  return padPoints(pts);
};

export const sampleBrainAssetTargets = (): Point[] => {
  const srcW = 540;
  const srcH = 395;
  const scale = Math.min(WIDTH / srcW, HEIGHT / srcH) * 0.85;
  const ox = WIDTH / 2 - (srcW * scale) / 2;
  const oy = HEIGHT / 2 - (srcH * scale) / 2;
  const pts = BRAIN_DOTS_SOURCE.map(([x, y, r]) => ({
    x: x * scale + ox,
    y: y * scale + oy,
    r: r * (scale * 0.9),
  }));
  return padPoints(pts);
};

export const sampleClinicalAssetTargets = (): Point[] => {
  const srcW = 1536;
  const srcH = 1272;
  const scale = Math.min(WIDTH / srcW, HEIGHT / srcH) * 1.25;
  const ox = WIDTH / 2 - (srcW * scale) / 2;
  const oy = HEIGHT / 2 - (srcH * scale) / 2 + 60; // shifted down
  // Filter out border rectangle dots (left ~103-105, right ~1418/1498, top ~287-290, bottom ~984-988)
  const filtered = CLINICAL_DOTS_SOURCE.filter(([x, y]) => {
    const onLeftBorder = x < 130;
    const onRightBorder = x > 1400; // more aggressive filter for right edge
    const onTopBorder = y < 310;
    const onBottomBorder = y > 960;
    return !(onLeftBorder || onRightBorder || onTopBorder || onBottomBorder);
  });
  const pts = filtered.map(([x, y, r]) => ({
    x: x * scale + ox,
    y: y * scale + oy,
    r: r * (scale * 0.85),
  }));
  return padPoints(pts);
};

export const sampleAssistiveAssetTargets = (): Point[] => {
  const srcW = 1536;
  const srcH = 1237;
  const scale = Math.min(WIDTH / srcW, HEIGHT / srcH) * 1.25;
  const ox = WIDTH / 2 - (srcW * scale) / 2;
  const oy = HEIGHT / 2 - (srcH * scale) / 2 + 120; // shifted down more
  // Filter out border rectangle dots (left ~79-84, right ~1497-1498, top ~211-216)
  const filtered = ASSISTIVE_DOTS_SOURCE.filter(([x, y]) => {
    const onLeftBorder = x < 110;
    const onRightBorder = x > 1480;
    const onTopBorder = y < 240;
    return !(onLeftBorder || onRightBorder || onTopBorder);
  });
  const pts = filtered.map(([x, y, r]) => ({
    x: x * scale + ox,
    y: y * scale + oy,
    r: r * (scale * 0.85),
  }));
  return padPoints(pts);
};
