import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, easeInOut } from "../utils/easings";

export const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const scale = lerp(1.0, 1.05, easeInOut(t));
  const drift = Math.sin(t * Math.PI * 2) * 0.02;
  return (
    <div style={{ width: "100%", height: "100%", transform: `translateX(${drift * 100}%) scale(${scale})` }}>
      {children}
    </div>
  );
};
