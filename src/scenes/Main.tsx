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
  sampleRoundedRectTargets,
  sampleCircleTargets,
  matchBySort,
} from "../utils/targets";
import { STATE_A, STATE_B, STATE_C, STATE_D, STATE_E, STATE_F, STATE_G } from "../constants";

const inRange = (f: number, [a, b]: [number, number]) => f >= a && f < b;

export const Main: React.FC = () => {
  const frame = useCurrentFrame();

  const targets = useMemo(() => {
    const brain = sampleBrainTargets();
    const bci = sampleBrainToComputerAssetTargets();
    const computer = sampleComputerTargets();
    const use1 = sampleRoundedRectTargets(520, 300, 50);
    const use2 = sampleCircleTargets(180);
    const core = sampleCoreTargets();
    const logoRaw = sampleLogoTargets();
    const logo = matchBySort(core, logoRaw);
    return { brain, bci, computer, use1, use2, core, logo, logoRaw };
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
    seg = { from: targets.computer, to: targets.use1, t: clamp(remap(frame, STATE_E[0], STATE_E[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_F)) {
    seg = { from: targets.use1, to: targets.use2, t: clamp(remap(frame, STATE_F[0], STATE_F[1])), mode: "morph" as const };
  } else {
    const tLogo = clamp(remap(frame, STATE_G[0], STATE_G[1]));
    const hold = frame >= 420;
    seg = { from: targets.use2, to: targets.logo, t: hold ? 1 : tLogo, mode: "logo" as const };
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
