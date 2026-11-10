import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, BODY } from "./theme";

// Umbrella guide: about 1 in 5 Florida drivers (20.6%) was uninsured in 2023.
const Car: React.FC<{ x: number; y: number; empty: boolean; show: number; glow: number }> = ({ x, y, empty, show, glow }) => (
  <g transform={`translate(${x} ${y})`} opacity={show}>
    <path
      d="M10 70 L22 38 Q28 24 44 24 L116 24 Q132 24 140 38 L154 70 Q164 72 164 84 L164 100 L0 100 L0 84 Q0 72 10 70 Z"
      fill={empty ? "none" : C.verdeSuave}
      stroke={empty ? C.oro : C.oroPalido}
      strokeWidth={empty ? 4 : 3}
      strokeDasharray={empty ? "10 8" : undefined}
      strokeLinejoin="round"
    />
    {empty ? <rect x={-14} y={8} width={192} height={124} rx={18} fill={C.oro} opacity={glow * 0.16} /> : null}
    <circle cx={38} cy={102} r={16} fill={C.verdeOscuro} stroke={empty ? C.oro : C.oroPalido} strokeWidth={3} />
    <circle cx={126} cy={102} r={16} fill={C.verdeOscuro} stroke={empty ? C.oro : C.oroPalido} strokeWidth={3} />
  </g>
);

export const OneInFive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const outFade = interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames - 1], [1, 0], clamp);
  const pct = interpolate(frame, [2.6 * fps, 4.4 * fps], [0, 20.6], { ...clamp, easing: ease });
  const glow = interpolate(frame, [2.2 * fps, 2.8 * fps], [0, 1], clamp);

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
      <AbsoluteFill style={{ opacity: outFade }}>
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Car
              key={i}
              x={150 + i * 200}
              y={150}
              empty={i === 3 && frame >= 2.2 * fps}
              glow={glow}
              show={interpolate(frame, [0.2 * fps + i * 6, 0.8 * fps + i * 6], [0, 1], clamp)}
            />
          ))}
        </svg>
        <Interactive.Div
          name="Percent"
          style={{
            position: "absolute",
            top: 330,
            width: 1280,
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 176,
            color: C.oro,
            fontVariantNumeric: "tabular-nums",
            opacity: interpolate(frame, [2.6 * fps, 3.1 * fps], [0, 1], clamp),
          }}
        >
          {pct.toFixed(1)}%
        </Interactive.Div>
        <Interactive.Div
          name="Meta"
          style={{
            position: "absolute",
            top: 560,
            width: 1280,
            textAlign: "center",
            fontSize: 44,
            letterSpacing: 6,
            color: C.oroPalido,
            opacity: interpolate(frame, [4.4 * fps, 5.2 * fps], [0, 1], clamp),
          }}
        >
          1 / 5 · FL · 2023
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
