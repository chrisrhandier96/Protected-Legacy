import { AbsoluteFill, Easing, Interactive, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, BODY } from "./theme";
import { FloodGap } from "./FloodGap";
import { OneInFive } from "./OneInFive";
import { CondoAssessment } from "./CondoAssessment";

// 9:16 social cut: question on top, the landscape explainer in the middle,
// one plain sentence below, then a card that sends people to the guide.
type Key = "flood" | "umbrella" | "condo";
type Lang = "es" | "en";
export type VerticalProps = { scene: Key; lang: Lang };

const COPY: Record<Key, Record<Lang, { q: string; line: string; src: string; path: string }>> = {
  flood: {
    es: { q: "¿Cuánto paga el NFIP por su casa?", line: "Hasta $250,000 por el edificio. Reconstruir esta casa costaría $2,000,000.", src: "Fuente: FEMA, NFIP (2025)", path: "/guias/inundacion" },
    en: { q: "How much does the NFIP pay for your home?", line: "Up to $250,000 for the building. Rebuilding this home would cost $2,000,000.", src: "Source: FEMA, NFIP (2025)", path: "/en/guides/flood" },
  },
  umbrella: {
    es: { q: "¿Y si el otro conductor no tiene seguro?", line: "En Florida, 1 de cada 5 conductores (20.6%) no tenía seguro en 2023.", src: "Fuente: Triple-I, datos del IRC (2023)", path: "/guias/umbrella-responsabilidad" },
    en: { q: "What if the other driver has no insurance?", line: "In Florida, 1 in 5 drivers (20.6%) was uninsured in 2023.", src: "Source: Triple-I, IRC data (2023)", path: "/en/guides/umbrella-liability" },
  },
  condo: {
    es: { q: "¿Su póliza de condominio cubre la evaluación de la asociación?", line: "La ley de Florida exige al menos $2,000 de esa cobertura, con un deducible de no más de $250.", src: "Fuente: Fla. Stat. 627.714", path: "/guias/condominios-y-hoa" },
    en: { q: "Does your condo policy cover the association's assessment?", line: "Florida law requires at least $2,000 of that coverage, with a deductible of no more than $250.", src: "Source: Fla. Stat. 627.714", path: "/en/guides/condos-hoa" },
  },
};
const END: Record<Lang, { k: string; t: string }> = {
  es: { k: "Guía gratuita, en español", t: "Educación, no venta. Consulte a su agente licenciado." },
  en: { k: "Free guide", t: "Education, not a sales pitch. Talk to your licensed agent." },
};

export const SCENE_FRAMES = 300;
export const END_FRAMES = 90;

export const Vertical: React.FC<VerticalProps> = ({ scene, lang }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const c = COPY[scene][lang];
  const Scene = scene === "flood" ? FloodGap : scene === "umbrella" ? OneInFive : CondoAssessment;

  return (
    <AbsoluteFill name="Vertical" style={{ backgroundColor: C.verdeOscuro, fontFamily: BODY, color: C.blanco }}>
      <Sequence durationInFrames={SCENE_FRAMES} layout="absolute-fill">
        <Interactive.Div
          name="Question"
          style={{ position: "absolute", top: 250, left: 90, right: 90, fontFamily: DISPLAY, fontSize: 84, lineHeight: 1.12, textAlign: "center",
            opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], clamp),
            translate: interpolate(frame, [0, 0.6 * fps], ["0px 24px", "0px 0px"], { ...clamp, easing: ease }) }}
        >
          {c.q}
        </Interactive.Div>
        <div style={{ position: "absolute", top: 656, left: 0, width: 1080, height: 608, overflow: "hidden" }}>
          <div style={{ width: 1280, height: 720, scale: "0.84375", transformOrigin: "0 0" }}>
            <Scene />
          </div>
        </div>
        <Interactive.Div
          name="Line"
          style={{ position: "absolute", top: 1330, left: 100, right: 100, fontSize: 50, lineHeight: 1.3, textAlign: "center", color: C.arena,
            opacity: interpolate(frame, [5.5 * fps, 6.3 * fps, 9.2 * fps, 9.9 * fps], [0, 1, 1, 0], clamp) }}
        >
          {c.line}
        </Interactive.Div>
        <div style={{ position: "absolute", bottom: 230, width: 1080, textAlign: "center", fontSize: 30, letterSpacing: 2, color: C.agua,
          opacity: interpolate(frame, [5.5 * fps, 6.3 * fps, 9.2 * fps, 9.9 * fps], [0, 1, 1, 0], clamp) }}>
          {c.src}
        </div>
      </Sequence>
      <Sequence from={SCENE_FRAMES} durationInFrames={END_FRAMES} layout="absolute-fill">
        <EndCard lang={lang} path={c.path} />
      </Sequence>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ lang: Lang; path: string }> = ({ lang, path }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const e = END[lang];
  const show = interpolate(frame, [0, 0.5 * fps], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: show, gap: 36, padding: 90 }}>
      <div style={{ fontSize: 40, letterSpacing: 6, textTransform: "uppercase", color: C.oroClaro }}>{e.k}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 76, color: C.blanco }}>protectedlegacyfl.com</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 52, color: C.oro }}>{path}</div>
      <div style={{ width: 120, height: 3, background: C.oro, opacity: 0.7 }} />
      <div style={{ fontSize: 36, lineHeight: 1.35, color: C.arena, maxWidth: 820 }}>{e.t}</div>
    </AbsoluteFill>
  );
};
