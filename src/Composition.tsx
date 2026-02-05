import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const Scene: React.FC<{
  start: number;
  duration: number;
  title: string;
  subtitle?: string;
}> = ({ start, duration, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start;

  const fade = interpolate(local, [0, 15, duration - 15, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lift = spring({
    frame: local,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 80,
        opacity: fade,
        transform: `translateY(${(1 - lift) * 20}px)`,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            fontWeight: 400,
            color: "#9FCBFF",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

export const MyComposition: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <div
      style={{
        width,
        height,
        background: "#0B0F14",
        color: "#EAF2FF",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      {/* subtle gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(800px 400px at 20% 20%, rgba(79,209,255,0.15), transparent), radial-gradient(600px 300px at 80% 70%, rgba(123,97,255,0.12), transparent)",
        }}
      />

      <Scene
        start={0}
        duration={90}
        title="Isometry"
        subtitle="High‑bandwidth, non‑invasive brain‑computer interfaces"
      />
      <Scene
        start={90}
        duration={90}
        title="Think faster than we type"
        subtitle="Today’s interfaces are bottlenecked by low bandwidth inputs"
      />
      <Scene
        start={180}
        duration={90}
        title="Functional ultrasound sensing"
        subtitle="High‑SNR neural signals — without opening the skull"
      />
      <Scene
        start={270}
        duration={90}
        title="Psycho Helm • Psycho Chip"
        subtitle="A unified platform for medical and everyday interfaces"
      />
      <Scene
        start={360}
        duration={90}
        title="Isometry.us"
        subtitle="Synergizing minds and actions"
      />
    </div>
  );
};
