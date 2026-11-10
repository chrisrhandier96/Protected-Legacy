import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, BODY, money } from "./theme";

// Flood guide: a $2,000,000 rebuild against the NFIP $250,000 building limit.
// Words live in the page's HTML caption; the video carries numbers only.
const W = 1280;
const H = 720;
const HOUSE_X = 230;
const HOUSE_W = 340;
const BASE_Y = 620;
const HOUSE_H = 440; // body + roof height = the $2M rebuild
const CAP = 250_000;
const REBUILD = 2_000_000;

export const FloodGap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const capH = (HOUSE_H * CAP) / REBUILD; // 55 px of 440
  const waterH = interpolate(frame, [1.2 * fps, 3.4 * fps], [0, capH], { ...clamp, easing: ease });
  const capValue = interpolate(frame, [1.2 * fps, 3.4 * fps], [0, CAP], { ...clamp, easing: ease });
  const outFade = interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames - 1], [1, 0], clamp);

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
      <AbsoluteFill style={{ opacity: outFade }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
          {/* house outline draws in */}
          <path
            d={`M${HOUSE_X} ${BASE_Y} V${BASE_Y - 270} L${HOUSE_X + HOUSE_W / 2} ${BASE_Y - HOUSE_H} L${HOUSE_X + HOUSE_W} ${BASE_Y - 270} V${BASE_Y} Z`}
            fill={C.verde}
            stroke={C.oroClaro}
            strokeWidth={4}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={interpolate(frame, [0, 1.1 * fps], [1, 0], { ...clamp, easing: ease })}
          />
          <rect x={HOUSE_X + 140} y={BASE_Y - 120} width={60} height={120} fill={C.verdeSuave} opacity={interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 1], clamp)} />
          {/* covered slice: water up to the NFIP limit */}
          <rect x={HOUSE_X + 2} y={BASE_Y - waterH} width={HOUSE_W - 4} height={waterH} fill={C.agua} opacity={0.9} />
          {/* uncovered part glows after the water stops */}
          <path
            d={`M${HOUSE_X + 2} ${BASE_Y - capH} V${BASE_Y - 270} L${HOUSE_X + HOUSE_W / 2} ${BASE_Y - HOUSE_H + 3} L${HOUSE_X + HOUSE_W - 2} ${BASE_Y - 270} V${BASE_Y - capH} Z`}
            fill={C.oro}
            opacity={interpolate(frame, [4 * fps, 5 * fps], [0, 0.22], clamp)}
          />
          {/* rebuild line at the roof peak */}
          <line x1={HOUSE_X - 40} x2={HOUSE_X + HOUSE_W + 110} y1={BASE_Y - HOUSE_H} y2={BASE_Y - HOUSE_H} stroke={C.oroPalido} strokeWidth={2} strokeDasharray="8 8" opacity={interpolate(frame, [3.6 * fps, 4.4 * fps], [0, 1], clamp)} />
          {/* limit line */}
          <line x1={HOUSE_X - 40} x2={HOUSE_X + HOUSE_W + 110} y1={BASE_Y - capH} y2={BASE_Y - capH} stroke={C.blanco} strokeWidth={2} opacity={interpolate(frame, [2.6 * fps, 3.4 * fps], [0, 1], clamp)} />
          {/* bracket over the uncovered part */}
          <path d={`M${HOUSE_X + HOUSE_W + 70} ${BASE_Y - HOUSE_H + 6} h14 V${BASE_Y - capH - 6} h-14`} fill="none" stroke={C.oro} strokeWidth={3}
            pathLength={1} strokeDasharray={1} strokeDashoffset={interpolate(frame, [4.6 * fps, 5.4 * fps], [1, 0], clamp)} />
          <line x1={120} x2={1160} y1={BASE_Y} y2={BASE_Y} stroke={C.verdeSuave} strokeWidth={3} />
        </svg>

        <Interactive.Div
          name="Limit"
          style={{
            position: "absolute",
            left: HOUSE_X + HOUSE_W + 130,
            top: BASE_Y - capH - 46,
            fontFamily: DISPLAY,
            fontSize: 64,
            color: C.blanco,
            fontVariantNumeric: "tabular-nums",
            opacity: interpolate(frame, [1.2 * fps, 1.8 * fps], [0, 1], clamp),
          }}
        >
          {money(capValue)}
          <div style={{ fontFamily: BODY, fontSize: 36, letterSpacing: 4, color: C.agua, marginTop: 4 }}>NFIP</div>
        </Interactive.Div>

        <Interactive.Div
          name="Rebuild"
          style={{
            position: "absolute",
            left: HOUSE_X + HOUSE_W + 130,
            top: BASE_Y - HOUSE_H - 40,
            fontFamily: DISPLAY,
            fontSize: 64,
            color: C.oroClaro,
            opacity: interpolate(frame, [3.8 * fps, 4.6 * fps], [0, 1], { ...clamp, easing: ease }),
            translate: interpolate(frame, [3.8 * fps, 4.6 * fps], ["-24px 0px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {money(REBUILD)}
        </Interactive.Div>

        <Interactive.Div
          name="Gap"
          style={{
            position: "absolute",
            left: HOUSE_X + HOUSE_W + 130,
            top: BASE_Y - HOUSE_H + 120,
            fontFamily: DISPLAY,
            fontSize: 104,
            color: C.oro,
            fontVariantNumeric: "tabular-nums",
            opacity: interpolate(frame, [5.2 * fps, 6 * fps], [0, 1], clamp),
            scale: interpolate(frame, [5.2 * fps, 6.2 * fps], [0.9, 1], { ...clamp, easing: Easing.spring({ damping: 200 }), output: "perceptual-scale" }),
          }}
        >
          {money(REBUILD - CAP)}
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
