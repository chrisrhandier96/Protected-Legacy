import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, BODY } from "./theme";

// "Where the usual policy stops": the home sits under its policy's arc, the asset
// waits outside it, then a second, specialty arc closes over the asset.
// Numbers only where the guide gives them; the words live in the page caption.
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useK = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const k = (a: number, b: number) => interpolate(frame, [a * fps, b * fps], [0, 1], { ...clamp, easing: ease });
  const out = interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames - 1], [1, 0], clamp);
  return { k, out, frame, fps };
};

const HOUSE = "M300 470 V380 L400 318 L500 380 V470 Z M340 470 V420 H376 V470";

export const ICONS: Record<string, string> = {
  // private aviation
  plane: "M850 400 L1010 384 M930 392 L898 350 M930 392 L910 436 M850 400 L834 386 M850 400 L838 412",
  // short-term rental: suitcase with a key tag
  suitcase: "M850 360 h150 v110 h-150 z M895 360 v-24 h60 v24 M850 400 h150 M1000 410 l30 0 M1030 400 v20 h18 v-20 z",
  // board service: a table with five seats
  board: "M820 410 h220 M840 410 v50 M1020 410 v50 M850 380 a14 14 0 1 0 0.1 0 M895 380 a14 14 0 1 0 0.1 0 M940 380 a14 14 0 1 0 0.1 0 M985 380 a14 14 0 1 0 0.1 0 M1030 380 a14 14 0 1 0 0.1 0",
  // collections: a ring and a framed piece
  jewel: "M860 400 a40 40 0 1 0 0.1 0 M880 360 l20 -26 l20 26 z M960 330 h90 v120 h-90 z M972 342 h66 v96 h-66 z M974 430 l22 -26 l16 14 l12 -10 l14 22",
};

export const PolicyEdge: React.FC<{ icon: keyof typeof ICONS }> = ({ icon }) => {
  const { k, out } = useK();
  const dash = (on: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - on });
  return (
    <AbsoluteFill style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
      <svg width={1280} height={720} style={{ position: "absolute", opacity: out }}>
        <g transform="translate(0 30)">
        <line x1={180} x2={1140} y1={470} y2={470} stroke={C.verdeSuave} strokeWidth={3} />
        <path d={HOUSE} fill="none" stroke={C.oroClaro} strokeWidth={3.5} strokeLinejoin="round" {...dash(k(0, 1))} />
        {/* the usual policy: an arc over the home only */}
        <path d="M200 470 A200 200 0 0 1 600 470" fill="none" stroke={C.oroPalido} strokeWidth={3} {...dash(k(0.8, 2))} />
        {/* the asset, outside it */}
        <path d={ICONS[icon]} fill="none" stroke={C.oroClaro} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" {...dash(k(2.2, 3.4))} />
        {/* the gap between them pulses once */}
        <rect x={640} y={300} width={140} height={170} rx={8} fill={C.oro} opacity={0.12 * k(3.6, 4.2) * (1 - k(5.6, 6.4))} />
        <path d="M660 300 v170 M760 300 v170" stroke={C.oro} strokeWidth={2} strokeDasharray="6 8" opacity={k(3.6, 4.2) * (1 - k(5.6, 6.4))} />
        {/* the specialty policy closes over the asset */}
        <path d="M780 470 A160 170 0 0 1 1100 470" fill="none" stroke={C.oro} strokeWidth={4} strokeLinecap="round" {...dash(k(5.4, 7))} />
        <path d="M760 470 A180 190 0 0 1 1120 470 Z" fill={C.oro} opacity={0.1 * k(6.6, 7.6)} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Renovations guide: most homeowners policies limit or exclude coverage after 30 to 60 consecutive days unoccupied [3]
export const Vacancy: React.FC = () => {
  const { k, out, frame, fps } = useK();
  const day = Math.round(interpolate(frame, [1.4 * fps, 5.4 * fps], [0, 60], { ...clamp, easing: Easing.linear }));
  const warn = day >= 30;
  return (
    <AbsoluteFill style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
      <svg width={1280} height={720} style={{ position: "absolute", opacity: out }}>
        <line x1={180} x2={720} y1={470} y2={470} stroke={C.verdeSuave} strokeWidth={3} />
        <path d={HOUSE} fill="none" stroke={C.oroClaro} strokeWidth={3.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(0, 1)} />
        {/* scaffolding */}
        <path d="M520 470 V330 M580 470 V330 M520 360 H580 M520 410 H580 M520 360 L580 410" fill="none" stroke={C.oroPalido} strokeWidth={2.5} opacity={k(0.8, 1.4)} />
        {/* the policy arc fades to dashes once the 30 day mark passes */}
        <path d="M200 470 A220 220 0 0 1 640 470" fill="none" stroke={warn ? C.oro : C.oroPalido} strokeWidth={3}
          strokeDasharray={warn ? "10 14" : undefined} opacity={k(0.6, 1.4) * (warn ? 0.6 : 1)} />
        {/* the day track */}
        <line x1={760} x2={1120} y1={430} y2={430} stroke={C.verdeSuave} strokeWidth={10} strokeLinecap="round" />
        <line x1={760} x2={760 + (360 * day) / 60} y1={430} y2={430} stroke={warn ? C.oro : C.oroPalido} strokeWidth={10} strokeLinecap="round" />
        <line x1={940} x2={940} y1={410} y2={450} stroke={C.oro} strokeWidth={3} opacity={k(1.2, 1.8)} />
        <line x1={1120} x2={1120} y1={410} y2={450} stroke={C.oro} strokeWidth={3} opacity={k(1.2, 1.8)} />
      </svg>
      <div style={{ position: "absolute", left: 760, top: 250, fontFamily: DISPLAY, fontSize: 120, color: warn ? C.oro : C.oroPalido, opacity: out * k(1.2, 1.8), fontVariantNumeric: "tabular-nums" }}>{day}</div>
      <div style={{ position: "absolute", left: 900, top: 470, width: 80, textAlign: "center", fontSize: 34, color: C.agua, opacity: out * k(1.2, 1.8) }}>30</div>
      <div style={{ position: "absolute", left: 1080, top: 470, width: 80, textAlign: "center", fontSize: 34, color: C.agua, opacity: out * k(1.2, 1.8) }}>60</div>
    </AbsoluteFill>
  );
};

// Kidnap and ransom guide: the State Department's four advisory levels and its K indicator [4];
// some policies exclude or limit countries at certain levels
export const TravelLevels: React.FC = () => {
  const { k, out } = useK();
  const shades = [C.verdeSuave, "#3E6A50", C.oroClaro, C.oro];
  return (
    <AbsoluteFill style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
      <svg width={1280} height={720} style={{ position: "absolute", opacity: out }}>
        {[0, 1, 2, 3].map((i) => {
          const h = 90 + i * 70;
          const g = k(0.4 + i * 0.5, 1.4 + i * 0.5);
          return <rect key={i} x={260 + i * 200} y={540 - h * g} width={140} height={h * g} rx={6} fill={shades[i]} />;
        })}
        <line x1={220} x2={1100} y1={540} y2={540} stroke={C.verdeSuave} strokeWidth={3} />
        {/* the levels some policies exclude or limit */}
        <rect x={640} y={150} width={420} height={420} rx={12} fill="none" stroke={C.oro} strokeWidth={3} strokeDasharray="10 10" opacity={k(3.6, 4.4)} />
        <circle cx={1060} cy={150} r={36} fill={C.verdeOscuro} stroke={C.oro} strokeWidth={3} opacity={k(5, 5.6)} />
      </svg>
      {[1, 2, 3, 4].map((n, i) => (
        <div key={n} style={{ position: "absolute", left: 260 + i * 200, width: 140, top: 560, textAlign: "center", fontFamily: DISPLAY, fontSize: 56, color: i > 1 ? C.oro : C.oroPalido, opacity: out * k(0.6 + i * 0.5, 1.2 + i * 0.5) }}>{n}</div>
      ))}
      <div style={{ position: "absolute", left: 1024, width: 72, top: 116, textAlign: "center", fontFamily: DISPLAY, fontSize: 52, color: C.oro, opacity: out * k(5, 5.6) }}>K</div>
    </AbsoluteFill>
  );
};
