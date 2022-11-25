import { useCallback, useEffect, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import { CommonGirlData, QuestData } from '../data/data';
import { CloseButton, format } from './common';
import '../style/scene-viewer.css';

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
  const [sceneText, setSceneText] = useState('...');
  const [canUnlock, setCanUnlock] = useState(() => {
    const quest = girl.quests[scene];
    return quest.ready;
  });
  const [image, setImage] = useState(() => {
    const quest = girl.quests[scene];
    const questId = quest.idQuest;
    const sceneImage = `/img/quests/${questId}/1/1600x/${questId}.jpg`;
    return sceneImage;
  });

  useEffect(() => {
    gameAPI.getQuestStep(girl, scene, true).then((questData) => {
      setSceneData(questData);
      setImage(questData.sceneFull);
      setSceneText(questData.dialogue);
      setCanUnlock(questData.cost !== undefined);
    });
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
      <h2>{girl.name}</h2>
      <div className="qh-scene-content">
        <div className="qh-scene-area">
          <img className="qh-scene" src={image} />
          {showText ? (
            <span className="qh-scene-dialogue overlay">{sceneText}</span>
          ) : null}
          <button
            className={`toggle-text overlay ${showText ? 'hide' : 'show'}`}
            onClick={() => setShowText(!showText)}
          ></button>
        </div>
        {canUnlock ? (
          <button className="hh-game-action" onClick={doUpgrade}>
            {sceneData?.cost === undefined ? '???' : format(sceneData.cost)}
          </button>
        ) : null}
      </div>
      {close !== undefined ? <CloseButton close={close} /> : null}
    </div>
  );
};
