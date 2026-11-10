import { Composition, delayRender, continueRender } from "remotion";
import { useState } from "react";
import { fontsReady } from "./theme";
import { FloodGap } from "./FloodGap";
import { OneInFive } from "./OneInFive";
import { CondoAssessment } from "./CondoAssessment";
import { Vertical, SCENE_FRAMES, END_FRAMES } from "./Vertical";

const shared = { durationInFrames: 300, fps: 30, width: 1280, height: 720 } as const;

export const RemotionRoot: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  fontsReady.then(() => continueRender(handle));
  return (
    <>
      <Composition id="FloodGap" component={FloodGap} {...shared} />
      <Composition id="OneInFive" component={OneInFive} {...shared} />
      <Composition id="CondoAssessment" component={CondoAssessment} {...shared} />
      {(["flood", "umbrella", "condo"] as const).flatMap((scene) =>
        (["es", "en"] as const).map((lang) => (
          <Composition key={scene + lang} id={`Social-${scene}-${lang}`} component={Vertical} defaultProps={{ scene, lang }}
            durationInFrames={SCENE_FRAMES + END_FRAMES} fps={30} width={1080} height={1920} />
        )),
      )}
    </>
  );
};
