import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { Camera } from "../components/Camera";
import { PostFX } from "../components/PostFX";
import { clamp, remap, easeInOut } from "../utils/easings";
import {
  sampleLogoTargets,
  sampleCoreTargets,
  sampleBrainToComputerAssetTargets,
  sampleBrainAssetTargets,
  sampleClinicalAssetTargets,
  sampleAssistiveAssetTargets,
  matchBySort,
} from "../utils/targets";
import { STATE_A, STATE_B, STATE_B_HOLD, STATE_C, STATE_C_HOLD, STATE_D, STATE_D_HOLD, STATE_E, STATE_E_HOLD, STATE_F } from "../constants";

const inRange = (f: number, [a, b]: [number, number]) => f >= a && f < b;

export const Main: React.FC = () => {
  const frame = useCurrentFrame();

  const targets = useMemo(() => {
    const brain = sampleBrainAssetTargets();
    const bci = sampleBrainToComputerAssetTargets();
    const clinical = sampleClinicalAssetTargets();
    const assistive = sampleAssistiveAssetTargets();
    const core = sampleCoreTargets();
    const logoRaw = sampleLogoTargets();
    const logo = matchBySort(core, logoRaw);
    return { brain, bci, clinical, assistive, core, logo, logoRaw };
  }, []);

  let seg;
  if (inRange(frame, STATE_A)) {
    seg = { from: targets.logo, to: targets.logo, t: 1, mode: "logo" as const };
  } else if (inRange(frame, STATE_B)) {
    seg = { from: targets.logo, to: targets.brain, t: clamp(remap(frame, STATE_B[0], STATE_B[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_B_HOLD)) {
    seg = { from: targets.brain, to: targets.brain, t: 1, mode: "morph" as const };
  } else if (inRange(frame, STATE_C)) {
    seg = { from: targets.brain, to: targets.bci, t: clamp(remap(frame, STATE_C[0], STATE_C[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_C_HOLD)) {
    seg = { from: targets.bci, to: targets.bci, t: 1, mode: "morph" as const };
  } else if (inRange(frame, STATE_D)) {
    seg = { from: targets.bci, to: targets.clinical, t: clamp(remap(frame, STATE_D[0], STATE_D[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_D_HOLD)) {
    seg = { from: targets.clinical, to: targets.clinical, t: 1, mode: "morph" as const };
  } else if (inRange(frame, STATE_E)) {
    seg = { from: targets.clinical, to: targets.assistive, t: clamp(remap(frame, STATE_E[0], STATE_E[1])), mode: "morph" as const };
  } else if (inRange(frame, STATE_E_HOLD)) {
    seg = { from: targets.assistive, to: targets.assistive, t: 1, mode: "morph" as const };
  } else if (inRange(frame, STATE_F)) {
    seg = { from: targets.assistive, to: targets.logo, t: clamp(remap(frame, STATE_F[0], STATE_F[1])), mode: "morph" as const };
  } else {
    seg = { from: targets.logo, to: targets.logo, t: 1, mode: "logo" as const };
  }

  const bloom = Math.max(
    easeInOut(clamp(remap(frame, 120, 135))),
    easeInOut(clamp(remap(frame, 255, 270))),
    easeInOut(clamp(remap(frame, 390, 405))),
    easeInOut(clamp(remap(frame, 525, 540))),
    easeInOut(clamp(remap(frame, 660, 675)))
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
