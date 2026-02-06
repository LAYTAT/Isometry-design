export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
export const remap = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
