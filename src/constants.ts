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

// Timing states (frame numbers)
export const STATE_A = CONFIG.timing.STATE_A;  // Logo hold
export const STATE_B = CONFIG.timing.STATE_B;  // Logo → Brain
export const STATE_C = CONFIG.timing.STATE_C;  // Brain → BCI
export const STATE_D = CONFIG.timing.STATE_D;  // BCI → Clinical
export const STATE_E = CONFIG.timing.STATE_E;  // Clinical → Assistive
export const STATE_F = CONFIG.timing.STATE_F;  // Assistive → Logo
export const STATE_G = CONFIG.timing.STATE_G;  // Logo hold end

// Total duration
export const DURATION_IN_FRAMES = CONFIG.timing.TOTAL_FRAMES;
