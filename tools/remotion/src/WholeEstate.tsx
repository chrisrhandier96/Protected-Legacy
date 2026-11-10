import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

// Homepage hero (laptops): the whole estate, not one risk. The hero's own lead
// line names it: waterfront residence, rental property, vessel, private aviation,
// collections, reputation, legacy. Each one draws in under a storm sky, then one
// gold canopy closes over all of them ("protect it, all of it").
// Weighted to the right: the hero text sits on the left half.

type Draw = { d: string; at: number; w?: number };
const ASSETS: Draw[] = [
  // waterfront residence (center)
  { d: "M760 470 V380 L860 318 L960 380 V470 M760 470 H960 M800 470 V420 H836 V470 M880 410 h44 v30 h-44 z", at: 0.6, w: 3.5 },
  // rental property (left, smaller)
  { d: "M612 470 V418 L664 384 L716 418 V470 Z M648 470 V444 H676 V470", at: 2.0 },
  // vessel on the water
  { d: "M1008 512 L1028 532 H1150 L1170 512 Z M1060 512 V462 L1112 512 M1060 462 L1040 512", at: 2.7 },
  // private aviation
  { d: "M1060 200 L1180 186 M1120 193 L1094 160 M1120 193 L1104 222 M1060 200 L1048 190 M1060 200 L1050 208", at: 3.4 },
  // collections (a framed piece)
  { d: "M640 248 h72 v56 h-72 z M650 258 h52 v36 h-52 z M652 290 l16 -14 l12 10 l8 -6 l12 12", at: 4.1 },
  // reputation (shield)
  { d: "M900 196 L940 182 L980 196 V226 C980 252 960 266 940 274 C920 266 900 252 900 226 Z M926 226 l10 10 l20 -22", at: 4.8 },
  // legacy (a tree)
  { d: "M1150 470 V420 M1150 440 L1128 418 M1150 430 L1174 404 M1150 420 C1116 420 1110 380 1134 370 C1130 342 1172 336 1178 362 C1206 360 1208 404 1180 414 C1172 422 1158 420 1150 420", at: 5.5 },
];

export const WholeEstate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const t = frame / fps;
  const fade = interpolate(frame, [0, 0.6 * fps, durationInFrames - 1 * fps, durationInFrames - 1], [0, 1, 1, 0], clamp);
  const canopy = interpolate(frame, [6.6 * fps, 8.4 * fps], [1, 0], { ...clamp, easing: ease });
  const glow = interpolate(frame, [7.6 * fps, 9 * fps], [0, 1], clamp);
  const storm = interpolate(frame, [6.6 * fps, 9 * fps], [1, 0.15], clamp);

  return (
    <AbsoluteFill name="Scene" style={{ backgroundColor: C.verdeOscuro }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute", opacity: fade, overflow: "visible" }}>
        <defs>
          <radialGradient id="g" cx="880" cy="470" r="420" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.oro} stopOpacity={0.22} />
            <stop offset="1" stopColor={C.oro} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* storm sky: slow drifting cloud bands */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={760 + i * 210 + Math.sin(t * 0.35 + i) * 30} cy={110 + i * 26} rx={260} ry={34} fill={C.verdeSuave} opacity={0.55 * storm} />
        ))}
        {/* rain streaks, fading as the canopy closes */}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 600 + ((i * 47) % 660);
          const y = ((i * 89 + frame * 9) % 420) + 140;
          return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 26} stroke={C.oroPalido} strokeWidth={1.4} opacity={0.18 * storm} />;
        })}
        {/* ground and water */}
        <line x1={560} x2={1700} y1={470} y2={470} stroke={C.verdeSuave} strokeWidth={3} />
        <path d={`M990 536 c24 -8 48 -8 72 0 s48 8 72 0 s48 -8 72 0`} fill="none" stroke={C.agua} strokeWidth={2.5}
          opacity={interpolate(frame, [2.4 * fps, 3 * fps], [0, 0.8], clamp)} transform={`translate(${Math.sin(t * 1.2) * 6} 0)`} />
        {/* the canopy's glow sits behind everything it protects */}
        <circle cx={880} cy={470} r={420} fill="url(#g)" opacity={glow} />
        {ASSETS.map((a, i) => {
          const on = interpolate(frame, [a.at * fps, (a.at + 0.9) * fps], [1, 0], { ...clamp, easing: ease });
          return (
            <g key={i}>
              <path d={a.d} fill="none" stroke={C.oroClaro} strokeWidth={a.w ?? 2.6} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={on} />
            </g>
          );
        })}
        {/* one gold canopy over the whole estate */}
        <path d="M520 470 A360 300 0 0 1 1240 470" fill="none" stroke={C.oro} strokeWidth={4} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={canopy} />
        <path d="M880 170 V150" stroke={C.oro} strokeWidth={4} strokeLinecap="round" opacity={glow} />
      </svg>
    </AbsoluteFill>
  );
};

// Phone version: the same scene, scaled into the band at the bottom of the hero
// (where the skyline drawing sits), content centered.
export const WholeEstateBand: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.verdeOscuro, overflow: "hidden" }}>
    <div style={{ position: "absolute", width: 1280, height: 720, left: 0, top: 0, transformOrigin: "0 0", transform: "translate(-148px, -112px) scale(0.85)" }}>
      <WholeEstate />
    </div>
  </AbsoluteFill>
);
