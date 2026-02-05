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
        id="Scene-IsometryHold"
        component={() => <SceneSolo kind="isometry-hold" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene-Brain"
        component={() => <SceneSolo kind="brain" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene-BrainToComputer"
        component={() => <SceneSolo kind="brain-to-computer" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene-Computer"
        component={() => <SceneSolo kind="computer" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene-UseCase1"
        component={() => <SceneSolo kind="usecase-1" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene-UseCase2"
        component={() => <SceneSolo kind="usecase-2" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Scene-IsometryEnd"
        component={() => <SceneSolo kind="isometry-end" />}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
