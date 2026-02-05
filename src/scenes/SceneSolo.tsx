import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
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

export type SceneKind =
  | "isometry-hold"
  | "brain"
  | "brain-to-computer"
  | "computer"
  | "usecase-1"
  | "usecase-2"
  | "isometry-end";

export const SceneSolo: React.FC<{ kind: SceneKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const targets = useMemo(() => {
    const core = sampleCoreTargets();
    const brain = sampleBrainTargets();
    const bci = sampleBrainToComputerAssetTargets();
    const computer = sampleComputerTargets();
    const use1 = sampleRoundedRectTargets(520, 300, 50);
    const use2 = sampleCircleTargets(180);
    const logoRaw = sampleLogoTargets();
    const logo = matchBySort(core, logoRaw);
    return { core, brain, bci, computer, use1, use2, logo };
  }, []);

  let seg;
  const t = clamp(remap(frame, 0, durationInFrames - 1));
  switch (kind) {
    case "isometry-hold":
      seg = { from: targets.logo, to: targets.logo, t: 1, mode: "logo" as const };
      break;
    case "brain":
      seg = { from: targets.brain, to: targets.brain, t: 1, mode: "morph" as const };
      break;
    case "brain-to-computer":
      seg = { from: targets.bci, to: targets.bci, t: 1, mode: "morph" as const };
      break;
    case "computer":
      seg = { from: targets.computer, to: targets.computer, t: 1, mode: "morph" as const };
      break;
    case "usecase-1":
      seg = { from: targets.use1, to: targets.use1, t: 1, mode: "morph" as const };
      break;
    case "usecase-2":
      seg = { from: targets.use2, to: targets.use2, t: 1, mode: "morph" as const };
      break;
    case "isometry-end":
      seg = { from: targets.logo, to: targets.logo, t: 1, mode: "logo" as const };
      break;
    default:
      seg = { from: targets.core, to: targets.core, t: 1, mode: "morph" as const };
  }

  const bloom = Math.max(
    easeInOut(clamp(remap(frame, 10, 20))),
    easeInOut(clamp(remap(frame, durationInFrames - 20, durationInFrames - 5)))
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
