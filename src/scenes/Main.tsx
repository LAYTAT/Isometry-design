import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { Camera } from "../components/Camera";
import { PostFX } from "../components/PostFX";
import { clamp, remap, easeInOut } from "../utils/easings";
import {
  sampleGridTargets,
  sampleCircleTargets,
  sampleRoundedRectTargets,
  sampleBrainTargets,
  sampleComputerTargets,
  sampleLogoTargets,
  matchBySort,
} from "../utils/targets";
import { STATE_A, STATE_B, STATE_C, STATE_D, STATE_E } from "../constants";

const inRange = (f: number, [a, b]: [number, number]) => f >= a && f < b;

export const Main: React.FC = () => {
  const frame = useCurrentFrame();

  const targets = useMemo(() => {
    const grid = sampleGridTargets(32, 80);
    const circle = sampleCircleTargets(240);
    const rounded = sampleRoundedRectTargets(520, 300, 50);
    const brain = sampleBrainTargets();
    const computer = sampleComputerTargets();
    const logoRaw = sampleLogoTargets();
    const logo = matchBySort(computer, logoRaw);
    return { grid, circle, rounded, brain, computer, logo, logoRaw };
  }, []);

  let seg;
  if (inRange(frame, STATE_A)) {
    seg = { from: targets.grid, to: targets.grid, t: clamp(remap(frame, STATE_A[0], STATE_A[1])), mode: "wake" as const };
  } else if (inRange(frame, STATE_B)) {
    seg = { from: targets.grid, to: targets.grid, t: clamp(remap(frame, STATE_B[0], STATE_B[1])), mode: "sweep" as const };
  } else if (inRange(frame, STATE_C)) {
    seg = { from: targets.grid, to: targets.brain, t: clamp(remap(frame, STATE_C[0], STATE_C[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_D)) {
    seg = { from: targets.brain, to: targets.brain, t: clamp(remap(frame, STATE_D[0], STATE_D[1])), mode: "pulse" as const };
  } else if (inRange(frame, STATE_E)) {
    seg = { from: targets.brain, to: targets.computer, t: clamp(remap(frame, STATE_E[0], STATE_E[1])), mode: "morph" as const };
  } else {
    const tLogo = clamp(remap(frame, STATE_F[0], STATE_F[1]));
    const hold = frame >= 840;
    seg = { from: targets.computer, to: targets.logo, t: hold ? 1 : tLogo, mode: "logo" as const };
  }

  const bloom = Math.max(
    easeInOut(clamp(remap(frame, 175, 190))),
    easeInOut(clamp(remap(frame, 245, 260))),
    easeInOut(clamp(remap(frame, 405, 420)))
  );

  return (
    <div style={{ width: "100%", height: "100%", background: "black" }}>
      <Camera>
        <ParticleField seg={seg} />
      </Camera>
      <PostFX bloom={bloom} />
    </div>
  );
};
