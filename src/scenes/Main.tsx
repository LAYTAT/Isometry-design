import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { Camera } from "../components/Camera";
import { PostFX } from "../components/PostFX";
import { clamp, remap, easeInOut } from "../utils/easings";
import {
  sampleBrainTargets,
  sampleComputerTargets,
  sampleLogoTargets,
  sampleCoreTargets,
  sampleBrainToComputerAssetTargets,
  matchBySort,
} from "../utils/targets";
import { STATE_A, STATE_B, STATE_C, STATE_D, STATE_E, STATE_F } from "../constants";

const inRange = (f: number, [a, b]: [number, number]) => f >= a && f < b;

export const Main: React.FC = () => {
  const frame = useCurrentFrame();

  const targets = useMemo(() => {
    const brain = sampleBrainTargets();
    const bci = sampleBrainToComputerAssetTargets();
    const computer = sampleComputerTargets();
    const core = sampleCoreTargets();
    const logoRaw = sampleLogoTargets();
    const logo = matchBySort(core, logoRaw);
    return { brain, bci, computer, core, logo, logoRaw };
  }, []);

  let seg;
  if (inRange(frame, STATE_A)) {
    seg = { from: targets.logo, to: targets.logo, t: 1, mode: "logo" as const };
  } else if (inRange(frame, STATE_B)) {
    seg = { from: targets.logo, to: targets.brain, t: clamp(remap(frame, STATE_B[0], STATE_B[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_C)) {
    seg = { from: targets.brain, to: targets.bci, t: clamp(remap(frame, STATE_C[0], STATE_C[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_D)) {
    seg = { from: targets.bci, to: targets.computer, t: clamp(remap(frame, STATE_D[0], STATE_D[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_E)) {
    seg = { from: targets.computer, to: targets.core, t: clamp(remap(frame, STATE_E[0], STATE_E[1])), mode: "morph" as const };
  } else {
    const tLogo = clamp(remap(frame, STATE_F[0], STATE_F[1]));
    const hold = frame >= 420;
    seg = { from: targets.core, to: targets.logo, t: hold ? 1 : tLogo, mode: "logo" as const };
  }

  const bloom = Math.max(
    easeInOut(clamp(remap(frame, 165, 180))),
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
