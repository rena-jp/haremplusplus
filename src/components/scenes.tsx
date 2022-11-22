import { useCallback, useEffect, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import { CommonGirlData, QuestData } from '../data/data';
import { CloseButton, format } from './common';

export interface SceneViewerProps {
  girl: CommonGirlData;
  scene: number;
  gameAPI: GameAPI;
  close?(): void;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  girl,
  scene,
  gameAPI,
  close
}) => {
  const [showText, setShowText] = useState(true);
  const [sceneData, setSceneData] = useState<QuestData | undefined>(undefined);
  useEffect(() => {
    gameAPI
      .getQuestStep(girl, scene, true)
      .then((questData) => setSceneData(questData));
  }, []);

  const doUpgrade = useCallback(() => {
    if (sceneData === undefined) {
      return;
    }
    const result = gameAPI.upgrade(girl, sceneData.questId);
    if (close !== undefined) {
      result.then(close);
    }
  }, [girl, gameAPI, sceneData]);
  return (
    <div className="qh-scene-viewer">
      {sceneData === undefined ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="qh-scene-content">
          <div
            className="qh-scene-area"
            style={{ backgroundImage: `url('${sceneData.sceneFull}')` }}
          >
            {/* <img className="qh-scene" src={sceneData.scene} /> */}
            {showText ? (
              <span className="qh-scene-dialogue overlay">
                {sceneData.dialogue}
              </span>
            ) : null}
            <button
              className={`toggle-text overlay ${showText ? 'hide' : 'show'}`}
              onClick={() => setShowText(!showText)}
            ></button>
          </div>
          {sceneData.cost !== undefined ? (
            <button className="hh-game-action" onClick={doUpgrade}>
              {format(sceneData.cost)}
            </button>
          ) : null}
        </div>
      )}
      {close !== undefined ? <CloseButton close={close} /> : null}
    </div>
  );
};
