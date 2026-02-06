import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { DOT_COLOR, DOT_OPACITY, LAYERS, WIDTH, HEIGHT, N_DOTS } from "../constants";
import { clamp, easeInOut, lerp, smoothstep } from "../utils/easings";
import { Point } from "../utils/targets";
import { noise2 } from "../utils/noise";

export type Segment = { from: Point[]; to: Point[]; t: number; mode: "wake" | "sweep" | "morph" | "pulse" | "logo" };

type Particle = { id: number; x: number; y: number; vx: number; vy: number; baseX: number; baseY: number; color?: string };

export const ParticleField: React.FC<{ seg: Segment }> = ({ seg }) => {
  const frame = useCurrentFrame();

  const particles = useMemo<Particle[]>(() => {
    return new Array(N_DOTS).fill(0).map((_, i) => {
      const p = seg.from[i] ?? seg.from[i % seg.from.length];
      return { id: i, x: p.x, y: p.y, vx: 0, vy: 0, baseX: p.x, baseY: p.y, color: p.color };
    });
  }, [seg.from]);

  const target = seg.to;

  const steps = frame;
  const stiffness = 0.12;
  const damping = 0.78;

  for (let s = 0; s < steps; s++) {
    const t = clamp(seg.t);
    const k = easeInOut(t);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const q = target[i] ?? target[i % target.length];
      const tx = lerp(p.baseX, q.x, k);
      const ty = lerp(p.baseY, q.y, k);
      const ax = (tx - p.x) * stiffness;
      const ay = (ty - p.y) * stiffness;
      p.vx = (p.vx + ax) * damping;
      p.vy = (p.vy + ay) * damping;
      p.x += p.vx;
      p.y += p.vy;
      // Adopt target color once transition is past halfway
      if (k > 0.5 && q.color) {
        p.color = q.color;
      }
    }
  }

  const focusCx = WIDTH * (0.35 + 0.30 * Math.sin(frame * 0.006));
  const focusCy = HEIGHT * (0.45 + 0.25 * Math.cos(frame * 0.005));
  const focusR = 520;

  const sweepPos = lerp(-WIDTH * 0.2, WIDTH * 1.2, clamp(seg.t));

  const pulseT = seg.mode === "pulse" ? clamp(seg.t) : 0;
  const pulseX = lerp(WIDTH * 0.25, WIDTH * 0.75, pulseT);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
      {LAYERS.map((layer, li) => (
        <g key={li} style={{ opacity: layer.opacity }}>
          {particles.map((p) => {
            const n = noise2(p.id + li * 10000);
            const micro = seg.mode === "logo" ? 0 : 0.2;
            let x = p.x + n.x * micro * layer.z;
            let y = p.y + n.y * micro * layer.z;
            let r = DOT_OPACITY * layer.z * 0.9;
            let alpha = DOT_OPACITY;

            if (seg.mode === "wake") {
              const dx = x - focusCx;
              const dy = y - focusCy;
              const d = Math.sqrt(dx * dx + dy * dy);
              const f = 1 - clamp(d / focusR);
              alpha *= lerp(0.12, 1.0, smoothstep(f));
              r *= lerp(0.85, 1.25, smoothstep(f));
            }

            if (seg.mode === "sweep") {
              const diag = x - y * 0.85;
              const dist = Math.abs(diag - sweepPos);
              const band = 130;
              const s = 1 - clamp(dist / band);
              const hit = smoothstep(s);
              alpha *= lerp(0.35, 1.0, hit);
              x += n.x * 6 * hit * layer.z;
              y += n.y * 6 * hit * layer.z;
            }

            if (seg.mode === "pulse") {
              const dist = Math.abs(x - pulseX);
              const band = 70;
              const s = 1 - clamp(dist / band);
              const hit = smoothstep(s);
              alpha *= lerp(0.7, 1.0, hit);
              r *= lerp(0.95, 1.08, hit);
            }

            if (seg.mode === "logo") {
              const settle = smoothstep(clamp(seg.t));
              alpha *= lerp(0.9, 1.0, settle);
            }

            return <circle key={p.id} cx={x} cy={y} r={r} fill={p.color || DOT_COLOR} opacity={alpha} />;
          })}
        </g>
      ))}
    </svg>
  );
};
