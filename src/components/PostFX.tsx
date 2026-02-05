import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { lerp } from "../utils/easings";

export const PostFX: React.FC<{ bloom?: number }> = ({ bloom = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const grain = (Math.sin(frame * 12.9898) * 43758.5453) % 1;
  const vignette = `radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)`;
  const grainOpacity = lerp(0.05, 0.08, bloom);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: vignette }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='${grainOpacity}'/></svg>)`,
          mixBlendMode: "screen",
          opacity: 0.25 + (grain > 0.5 ? 0.04 : 0),
        }}
      />
    </div>
  );
};
