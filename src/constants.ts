export const FPS = 30;
export const DURATION_IN_FRAMES = 765;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const DOT_SIZE = 3;
export const DOT_OPACITY = 0.9;
export const BG_COLOR = "#000000";
export const DOT_COLOR = "#F8F8F8";

export const N_DOTS = 1200;

export const LAYERS = [
  { z: 0.7, opacity: 0.35 },
  { z: 1.0, opacity: 0.6 },
  { z: 1.3, opacity: 0.9 },
];

// Fast transitions (45 frames = 1.5s) + holds (90 frames = 3s)
export const STATE_A: [number, number] = [0, 90];       // logo hold (3s)
export const STATE_B: [number, number] = [90, 135];     // logo -> brain (1.5s)
export const STATE_B_HOLD: [number, number] = [135, 225]; // brain hold (3s)
export const STATE_C: [number, number] = [225, 270];    // brain -> bci (1.5s)
export const STATE_C_HOLD: [number, number] = [270, 360]; // bci hold (3s)
export const STATE_D: [number, number] = [360, 405];    // bci -> clinical (1.5s)
export const STATE_D_HOLD: [number, number] = [405, 495]; // clinical hold (3s)
export const STATE_E: [number, number] = [495, 540];    // clinical -> assistive (1.5s)
export const STATE_E_HOLD: [number, number] = [540, 630]; // assistive hold (3s)
export const STATE_F: [number, number] = [630, 675];    // assistive -> logo (1.5s)
export const STATE_G: [number, number] = [675, 765];    // logo hold (3s)
