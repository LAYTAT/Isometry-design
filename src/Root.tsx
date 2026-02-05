import { Composition } from "remotion";
import { MyComposition } from "./Composition";
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
    </>
  );
};
