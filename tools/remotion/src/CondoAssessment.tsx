import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, BODY } from "./theme";

// Condo guide: Florida s. 627.714 requires HO-6 policies to include at least
// $2,000 of loss assessment coverage, with a deductible of no more than $250.
const COLS = 4;
const ROWS = 6;
const UNIT = 52;
const GAP = 12;
const BX = 250;
const BY = 150;
const MINE = { r: 3, c: 2 };

export const CondoAssessment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const outFade = interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames - 1], [1, 0], clamp);
  const bw = COLS * UNIT + (COLS + 1) * GAP;
  const bh = ROWS * UNIT + (ROWS + 1) * GAP;
  const amount = interpolate(frame, [2.4 * fps, 3.8 * fps], [0, 2000], { ...clamp, easing: ease });

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
      <AbsoluteFill style={{ opacity: outFade }}>
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
          <rect x={BX} y={BY} width={bw} height={bh} fill={C.verde} stroke={C.oroClaro} strokeWidth={4} pathLength={1} strokeDasharray={1}
            strokeDashoffset={interpolate(frame, [0, 1 * fps], [1, 0], { ...clamp, easing: ease })} />
          {Array.from({ length: ROWS * COLS }).map((_, k) => {
            const r = Math.floor(k / COLS);
            const c = k % COLS;
            const mine = r === MINE.r && c === MINE.c;
            const on = interpolate(frame, [0.6 * fps + k * 1.5, 1.0 * fps + k * 1.5], [0, 1], clamp);
            const lit = mine ? interpolate(frame, [1.8 * fps, 2.4 * fps], [0, 1], clamp) : 0;
            return (
              <rect key={k} x={BX + GAP + c * (UNIT + GAP)} y={BY + GAP + r * (UNIT + GAP)} width={UNIT} height={UNIT} rx={4}
                fill={lit > 0 ? C.oro : C.verdeSuave} opacity={on * (mine ? 0.35 + 0.65 * lit : 1)} />
            );
          })}
          <line x1={BX - 40} x2={BX + bw + 40} y1={BY + bh} y2={BY + bh} stroke={C.verdeSuave} strokeWidth={3} />
          {/* connector from the lit unit to the figures */}
          <line x1={BX + GAP + MINE.c * (UNIT + GAP) + UNIT} y1={BY + GAP + MINE.r * (UNIT + GAP) + UNIT / 2}
            x2={640} y2={BY + GAP + MINE.r * (UNIT + GAP) + UNIT / 2} stroke={C.oro} strokeWidth={2}
            pathLength={1} strokeDasharray={1} strokeDashoffset={interpolate(frame, [2.1 * fps, 2.6 * fps], [1, 0], clamp)} />
        </svg>
        <Interactive.Div
          name="Minimum"
          style={{ position: "absolute", left: 670, top: 270, fontFamily: DISPLAY, fontSize: 132, color: C.oro, fontVariantNumeric: "tabular-nums",
            opacity: interpolate(frame, [2.4 * fps, 2.9 * fps], [0, 1], clamp) }}
        >
          {"≥ $" + Math.round(amount).toLocaleString("en-US")}
        </Interactive.Div>
        <Interactive.Div
          name="Deductible"
          style={{ position: "absolute", left: 676, top: 440, fontFamily: DISPLAY, fontSize: 64, color: C.oroPalido,
            opacity: interpolate(frame, [4.2 * fps, 5 * fps], [0, 1], { ...clamp, easing: ease }),
            translate: interpolate(frame, [4.2 * fps, 5 * fps], ["0px 16px", "0px 0px"], { ...clamp, easing: ease }) }}
        >
          {"≤ $250"}
          <span style={{ fontFamily: BODY, fontSize: 36, letterSpacing: 4, color: C.agua, marginLeft: 20 }}>HO-6 · FL 627.714</span>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
