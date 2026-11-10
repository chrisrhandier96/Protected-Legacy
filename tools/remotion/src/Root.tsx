import { Composition, delayRender, continueRender } from "remotion";
import { useState } from "react";
import { fontsReady } from "./theme";
import { FloodGap } from "./FloodGap";
import { OneInFive } from "./OneInFive";
import { CondoAssessment } from "./CondoAssessment";
import { WholeEstate, WholeEstateBand } from "./WholeEstate";
import { AutoMinimum, Underinsured, FrozenFunds, PwcShare, CoverageDrop } from "./StatScenes";
import { PolicyEdge, Vacancy, TravelLevels } from "./EdgeScenes";
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
      <Composition id="AutoMinimum" component={AutoMinimum} {...shared} />
      <Composition id="Underinsured" component={Underinsured} {...shared} />
      <Composition id="FrozenFunds" component={FrozenFunds} {...shared} />
      <Composition id="PwcShare" component={PwcShare} {...shared} />
      <Composition id="CoverageDrop" component={CoverageDrop} {...shared} />
      <Composition id="EdgeAviation" component={PolicyEdge} defaultProps={{ icon: "plane" as const }} {...shared} />
      <Composition id="EdgeRental" component={PolicyEdge} defaultProps={{ icon: "suitcase" as const }} {...shared} />
      <Composition id="EdgeBoard" component={PolicyEdge} defaultProps={{ icon: "board" as const }} {...shared} />
      <Composition id="EdgeCollections" component={PolicyEdge} defaultProps={{ icon: "jewel" as const }} {...shared} />
      <Composition id="Vacancy" component={Vacancy} {...shared} />
      <Composition id="TravelLevels" component={TravelLevels} {...shared} />
      <Composition id="WholeEstate" component={WholeEstate} durationInFrames={360} fps={30} width={1280} height={720} />
      <Composition id="WholeEstateBand" component={WholeEstateBand} durationInFrames={360} fps={30} width={1200} height={352} />
      {(["flood", "umbrella", "condo"] as const).flatMap((scene) =>
        (["es", "en"] as const).map((lang) => (
          <Composition key={scene + lang} id={`Social-${scene}-${lang}`} component={Vertical} defaultProps={{ scene, lang }}
            durationInFrames={SCENE_FRAMES + END_FRAMES} fps={30} width={1080} height={1920} />
        )),
      )}
    </>
  );
};
