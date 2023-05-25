import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { HaremGirlTile, SimpleGirlTile } from '../components/girl';

import ownedGirlData from './girlsData/ownedGirl.json';
import missingGirlData from './girlsData/missingGirl.json';
import partialGirlData from './girlsData/partialGirl.json';
import ownedMythicData from './girlsData/ownedMythic.json';
import upgradeReadyData from './girlsData/upgradeReady.json';
import loadingImgData from './girlsData/loadingImg.json';
import invalidImgData from './girlsData/invalidImg.json';
import { CommonGirlData } from '../data/data';

import './style/mockStyle.css';
import { GirlTooltip } from '../components/girl-tooltip';
import { MockGameAPI } from './MockGameAPI';
import { GameAPI } from '../api/GameAPI';
import { LoadHaremData } from '../hooks/load-harem-data';
import { Teams } from '../components/teams';
import { GameAPIContext } from '../data/game-api-context';
import { useTeams } from '../hooks/teams-hooks';

const ownedGirl = ownedGirlData as CommonGirlData;
const missingGirl = missingGirlData as CommonGirlData;
const partialGirl = partialGirlData as CommonGirlData;
const ownedMythic = ownedMythicData as CommonGirlData;
const upgradeReady = upgradeReadyData as CommonGirlData;
const loadingImg = loadingImgData as CommonGirlData;
const invalidImg = invalidImgData as CommonGirlData;

export function handleTestTiles(): void {
  const root = createRoot();

  const doNothing = () => {
    /* Empty */
  };

  root.render(
    <React.StrictMode>
      <div className="test-container">
        <div className="test-simple-tiles">
          <SimpleGirlTile
            girl={ownedGirl}
            selected={false}
            show0Pose={false}
            onClick={doNothing}
          />
          <SimpleGirlTile
            girl={ownedGirl}
            selected={true}
            show0Pose={false}
            onClick={doNothing}
          />
          <SimpleGirlTile
            girl={missingGirl}
            selected={false}
            show0Pose={false}
            onClick={doNothing}
          />
          <SimpleGirlTile
            girl={partialGirl}
            selected={false}
            show0Pose={false}
            onClick={doNothing}
          />
        </div>
        <div className="test-harem-tiles">
          <HaremGirlTile
            girl={ownedGirl}
            selectGirl={doNothing}
            selected={true}
            collectSalary={doNothing}
            payAt={Date.now() + 60000}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={partialGirl}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={undefined}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={missingGirl}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={undefined}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={ownedMythic}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={undefined}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={upgradeReady}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={undefined}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={upgradeReady}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={Date.now()}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={loadingImg}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={Date.now()}
            show0Pose={false}
          />
          <HaremGirlTile
            girl={invalidImg}
            selectGirl={doNothing}
            selected={false}
            collectSalary={doNothing}
            payAt={Date.now()}
            show0Pose={false}
          />
        </div>
      </div>
    </React.StrictMode>
  );
}

function createRoot(): ReactDOM.Root {
  const targetBody = document.getElementById('hh_hentai');
  if (targetBody === null) {
    return ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  }

  const quickHaremWrapper = document.createElement('div');
  quickHaremWrapper.id = 'quick-harem-wrapper';
  targetBody.appendChild(quickHaremWrapper);
  const root = ReactDOM.createRoot(quickHaremWrapper);
  return root;
}

export function handleTestGirlTooltip() {
  const root = createRoot();

  const content = (
    <div>
      <GirlTooltip girl={ownedGirl} classNames={['show-border']} />
      <GirlTooltip girl={missingGirl} classNames={['show-border']} />
    </div>
  );

  root.render(content);
}

export function handleTestTeams() {
  const root = createRoot();
  const mockAPI = new MockGameAPI();

  const content = <TeamsTest gameAPI={mockAPI} />;

  root.render(content);
}

const TeamsTest: React.FC<{ gameAPI: GameAPI }> = ({ gameAPI }) => {
  const girlListener = useRef<(girl: CommonGirlData) => void>(() => {
    /* No op until set by the teams component */
  });

  const teamsData = useTeams(gameAPI);

  return (
    <div style={{ pointerEvents: 'initial' }}>
      <GameAPIContext.Provider value={{ gameAPI }}>
        <LoadHaremData gameAPI={gameAPI}>
          {({ allGirls }) => {
            return allGirls !== undefined ? (
              <Teams
                allGirls={allGirls}
                girlListener={girlListener}
                show0Pose={false}
                currentBlessings={[]}
                upcomingBlessings={[]}
                teamsData={teamsData}
              />
            ) : null;
          }}
        </LoadHaremData>
      </GameAPIContext.Provider>
    </div>
  );
};
