export const FPS = 30;
export const DURATION_IN_FRAMES = 450;
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

export const STATE_A: [number, number] = [0, 90];   // ISOMETRY hold
export const STATE_B: [number, number] = [90, 180]; // ISOMETRY -> brain
export const STATE_C: [number, number] = [180, 270]; // brain -> computer
export const STATE_D: [number, number] = [270, 330]; // computer -> dot
export const STATE_E: [number, number] = [330, 450]; // dot -> ISOMETRY
