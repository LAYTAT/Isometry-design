/**
 * CONSTANTS
 * 
 * These values are derived from config.ts for backwards compatibility.
 * Edit config.ts to change these values.
 */

import { CONFIG } from "./config";

// Video dimensions
export const WIDTH = CONFIG.video.width;
export const HEIGHT = CONFIG.video.height;
export const FPS = CONFIG.video.fps;
export const BG_COLOR = CONFIG.video.backgroundColor;

// Particle settings
export const N_DOTS = CONFIG.particles.count;
export const DOT_SIZE = CONFIG.particles.defaultSize;
export const DOT_COLOR = CONFIG.particles.color;
export const EASING = CONFIG.particles.transitionEasing;
export const DOT_OPACITY = 0.85;

// Render layers for depth effect
export const LAYERS = [
  { z: 1.0, opacity: 1.0 },
  { z: 1.15, opacity: 0.4 },
  { z: 1.3, opacity: 0.2 },
];

// Get timing from config
const t = CONFIG.timing;

// Timing states as [start, end] tuples for scene transitions
// Each tuple defines when that scene is TRANSITIONING
export const STATE_A: [number, number] = [t.STATE_A, t.STATE_B];           // Logo hold
export const STATE_B: [number, number] = [t.STATE_B, t.STATE_B + 45];      // Logo → Brain transition
export const STATE_B_HOLD: [number, number] = [t.STATE_B + 45, t.STATE_C]; // Brain hold
export const STATE_C: [number, number] = [t.STATE_C, t.STATE_C + 60];      // Brain → BCI transition
export const STATE_C_HOLD: [number, number] = [t.STATE_C + 60, t.STATE_D]; // BCI hold
export const STATE_D: [number, number] = [t.STATE_D, t.STATE_D + 60];      // BCI → Clinical transition
export const STATE_D_HOLD: [number, number] = [t.STATE_D + 60, t.STATE_E]; // Clinical hold
export const STATE_E: [number, number] = [t.STATE_E, t.STATE_E + 60];      // Clinical → Assistive transition
export const STATE_E_HOLD: [number, number] = [t.STATE_E + 60, t.STATE_F]; // Assistive hold
export const STATE_F: [number, number] = [t.STATE_F, t.STATE_F + 60];      // Assistive → Logo transition
export const STATE_G: [number, number] = [t.STATE_F + 60, t.TOTAL_FRAMES]; // Logo hold end

// Total duration
export const DURATION_IN_FRAMES = CONFIG.timing.TOTAL_FRAMES;
