import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { SceneSolo } from "./scenes/SceneSolo";
import { DURATION_IN_FRAMES, FPS, WIDTH, HEIGHT } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IsometryPromo"
        component={MyComposition}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="Scene_IsometryHold"
        component={() => <SceneSolo kind="isometry-hold" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene_Brain"
        component={() => <SceneSolo kind="brain" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene_BrainToComputer"
        component={() => <SceneSolo kind="brain-to-computer" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene_Computer"
        component={() => <SceneSolo kind="computer" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene_UseCase1"
        component={() => <SceneSolo kind="usecase-1" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene_UseCase2"
        component={() => <SceneSolo kind="usecase-2" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene_IsometryEnd"
        component={() => <SceneSolo kind="isometry-end" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
