import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, BODY } from "./theme";

// Five more guide explainers. Numbers and short neutral labels only; the words live in the page caption.
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useT = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const k = (a: number, b: number, from = 0, to = 1) => interpolate(frame, [a * fps, b * fps], [from, to], { ...clamp, easing: ease });
  const out = interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames - 1], [1, 0], clamp);
  return { k, out };
};

const Frame: React.FC<{ out: number; children: React.ReactNode }> = ({ out, children }) => (
  <AbsoluteFill style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY }}>
    <AbsoluteFill style={{ opacity: out }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

const Num: React.FC<{ x: number; y: number; size: number; color: string; o: number; children: React.ReactNode; align?: "left" | "center" }> = ({ x, y, size, color, o, children, align = "left" }) => (
  <div style={{ position: "absolute", left: align === "center" ? x - 400 : x, width: align === "center" ? 800 : undefined, textAlign: align, top: y, fontFamily: DISPLAY, fontSize: size, color, opacity: o, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
    {children}
  </div>
);
const Tag: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; align?: "left" | "center"; color?: string }> = ({ x, y, o, children, align = "left", color = C.agua }) => (
  <div style={{ position: "absolute", left: align === "center" ? x - 300 : x, width: align === "center" ? 600 : undefined, textAlign: align, top: y, fontSize: 34, letterSpacing: 5, color, opacity: o, whiteSpace: "nowrap" }}>
    {children}
  </div>
);
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Auto guide: Florida's minimums at registration, $10,000 PIP and $10,000 PDL [1]
export const AutoMinimum: React.FC = () => {
  const { k, out } = useT();
  const car = "M10 70 L22 38 Q28 24 44 24 L116 24 Q132 24 140 38 L154 70 Q164 72 164 84 L164 100 L0 100 L0 84 Q0 72 10 70 Z";
  return (
    <Frame out={out}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <g transform="translate(160 250) scale(1.6)">
          <path d={car} fill={C.verdeSuave} stroke={C.oroPalido} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={k(0, 1)} />
          <circle cx={38} cy={102} r={16} fill={C.verdeOscuro} stroke={C.oroPalido} strokeWidth={2} opacity={k(0.6, 1)} />
          <circle cx={126} cy={102} r={16} fill={C.verdeOscuro} stroke={C.oroPalido} strokeWidth={2} opacity={k(0.6, 1)} />
        </g>
        <line x1={540} x2={540} y1={200} y2={520} stroke={C.verdeSuave} strokeWidth={3} />
      </svg>
      <Num x={600} y={180} size={120} color={C.oro} o={k(1.2, 1.8)}>{money(k(1.2, 3, 0, 10000))}</Num>
      <Tag x={606} y={318} o={k(1.8, 2.4)}>PIP</Tag>
      <Num x={600} y={380} size={120} color={C.oro} o={k(2.8, 3.4)}>{money(k(2.8, 4.6, 0, 10000))}</Num>
      <Tag x={606} y={518} o={k(3.4, 4)}>PDL</Tag>
      <Tag x={160} y={520} o={k(5, 5.8)} color={C.oroPalido}>FL · MIN.</Tag>
    </Frame>
  );
};

// Hurricane and home guide: Marshall Fire, 74% of claimants underinsured, 36% severely [7]
export const Underinsured: React.FC = () => {
  const { k, out } = useT();
  const ring = (r: number, pct: number, color: string, w: number) => {
    const L = 2 * Math.PI * r;
    return <circle cx={420} cy={360} r={r} fill="none" stroke={color} strokeWidth={w} strokeDasharray={`${L * pct} ${L}`} transform="rotate(-90 420 360)" strokeLinecap="round" />;
  };
  return (
    <Frame out={out}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <circle cx={420} cy={360} r={220} fill="none" stroke={C.verdeSuave} strokeWidth={28} />
        <circle cx={420} cy={360} r={160} fill="none" stroke={C.verdeSuave} strokeWidth={28} opacity={k(2.6, 3)} />
        {ring(220, k(0.6, 2.6, 0, 0.74), C.oro, 28)}
        {ring(160, k(3, 4.8, 0, 0.36), C.oroClaro, 28)}
      </svg>
      <Num x={760} y={190} size={140} color={C.oro} o={k(0.8, 1.4)}>{Math.round(k(0.6, 2.6, 0, 74))}%</Num>
      <Num x={760} y={390} size={96} color={C.oroClaro} o={k(3, 3.6)}>{Math.round(k(3, 4.8, 0, 36))}%</Num>
      <Tag x={766} y={530} o={k(5, 5.8)} color={C.oroPalido}>CO · 2021</Tag>
    </Frame>
  );
};

// Cyber guide: IC3 helped freeze $679,013,183 of the $1,163,919,846 criminals tried to steal in 2025, 58% [1]
export const FrozenFunds: React.FC = () => {
  const { k, out } = useT();
  const W = 960;
  return (
    <Frame out={out}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <rect x={160} y={330} width={W * k(0.4, 1.6)} height={70} rx={6} fill={C.verdeSuave} />
        <rect x={160} y={330} width={W * 0.58 * k(2.8, 4.6)} height={70} rx={6} fill={C.oro} />
      </svg>
      <Num x={160} y={190} size={88} color={C.oroPalido} o={k(1, 1.6)}>{money(k(0.4, 2, 0, 1163919846))}</Num>
      <Num x={160} y={430} size={88} color={C.oro} o={k(2.8, 3.4)}>{money(k(2.8, 4.6, 0, 679013183))}</Num>
      <Tag x={900} y={540} o={k(4.8, 5.6)} color={C.oroClaro}>58% · IC3 · 2025</Tag>
    </Frame>
  );
};

// Boats guide: personal watercraft were 17% of registered vessels but 23% of reportable accidents (FWC, 2025) [1]
export const PwcShare: React.FC = () => {
  const { k, out } = useT();
  const bar = (x: number, pct: number, t0: number, color: string) => {
    const h = 380 * pct * 3; // 23% -> 262 px
    const g = k(t0, t0 + 1.6);
    return <rect x={x} y={560 - h * g} width={180} height={h * g} rx={6} fill={color} />;
  };
  return (
    <Frame out={out}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <line x1={300} x2={980} y1={560} y2={560} stroke={C.verdeSuave} strokeWidth={3} />
        {bar(380, 0.17, 0.6, C.verdeSuave)}
        {bar(720, 0.23, 2.4, C.oro)}
      </svg>
      <Num x={470} y={150} size={110} color={C.oroPalido} o={k(1.2, 1.8)} align="center">{Math.round(k(0.6, 2.2, 0, 17))}%</Num>
      <Num x={810} y={100} size={128} color={C.oro} o={k(3, 3.6)} align="center">{Math.round(k(2.4, 4, 0, 23))}%</Num>
      <Tag x={640} y={600} o={k(5, 5.8)} align="center" color={C.oroPalido}>PWC · FL · 2025</Tag>
    </Frame>
  );
};

// Household staff and legacy guide: life insurance coverage among Hispanics fell from 51% (2021) to 40% (2025), LIMRA [7]
export const CoverageDrop: React.FC = () => {
  const { k, out } = useT();
  const bar = (x: number, pct: number, t0: number, color: string) => {
    const h = 520 * pct;
    const g = k(t0, t0 + 1.6);
    return <rect x={x} y={590 - h * g} width={200} height={h * g} rx={6} fill={color} />;
  };
  return (
    <Frame out={out}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <line x1={300} x2={980} y1={590} y2={590} stroke={C.verdeSuave} strokeWidth={3} />
        {bar(370, 0.51, 0.6, C.verdeSuave)}
        {bar(710, 0.4, 2.6, C.oro)}
      </svg>
      <Num x={470} y={150} size={110} color={C.oroPalido} o={k(1.2, 1.8)} align="center">{Math.round(k(0.6, 2.2, 0, 51))}%</Num>
      <Num x={810} y={236} size={128} color={C.oro} o={k(3.2, 3.8)} align="center">{Math.round(k(2.6, 4.2, 0, 40))}%</Num>
      <Tag x={470} y={612} o={k(1.4, 2)} align="center">2021</Tag>
      <Tag x={810} y={612} o={k(3.4, 4)} align="center">2025</Tag>
    </Frame>
  );
};
