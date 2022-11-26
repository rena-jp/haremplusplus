import { useCallback, useEffect, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import { CommonGirlData, QuestData } from '../data/data';
import { CloseButton, formatCost } from './common';
import '../style/scene-viewer.css';

export interface SceneViewerProps {
  girl: CommonGirlData;
  scene: number;
  gameAPI: GameAPI;
  close?(): void;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  girl,
  scene: initialScene,
  gameAPI,
  close
}) => {
  const [scene, setScene] = useState(initialScene);

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
    let apply = true;
    gameAPI.getQuestStep(girl, scene, true).then((questData) => {
      // Ignore changes if we requested a different scene in the meantime
      if (apply) {
        setSceneData(questData);
        setImage(questData.sceneFull);
        setSceneText(questData.dialogue);
        setCanUnlock(questData.cost !== undefined);
      }
    });
    return () => {
      apply = false;
    };
  }, [scene]);

  const doUpgrade = useCallback(() => {
    if (sceneData === undefined) {
      return;
    }
    const result = gameAPI.upgrade(girl, sceneData.questId);
    if (close !== undefined) {
      result.then(close);
    }
  }, [girl, gameAPI, sceneData]);

  const canAfford =
    sceneData?.cost !== undefined && gameAPI.getCurrency() >= sceneData.cost;

  const goToScene = useCallback(
    (toScene: number) => {
      console.log('Go to scene: ', toScene);
      setScene(toScene);
      const quest = girl.quests[toScene];
      const questId = quest.idQuest;
      const sceneImage = `/img/quests/${questId}/1/1600x/${questId}.jpg`;
      setImage(sceneImage);
      setSceneData(undefined);
      setSceneText('...');
      setCanUnlock(quest.ready);
    },
    [girl]
  );

  const goToPreviousScene =
    scene === 0 ? undefined : () => goToScene(scene - 1);

  const nextScene = scene + 1;
  const nextSceneReady =
    nextScene === girl.stars &&
    girl.quests.length > nextScene &&
    girl.quests[nextScene].ready;
  const goToNextScene =
    nextSceneReady || nextScene < girl.stars
      ? () => goToScene(nextScene)
      : undefined;

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
        <div className="side-bar">
          <div className="navigate">
            <button
              className="previous"
              onClick={goToPreviousScene}
              style={{
                visibility:
                  goToPreviousScene === undefined ? 'hidden' : 'visible'
              }}
            />
            <button
              className="next"
              onClick={goToNextScene}
              style={{
                visibility: goToNextScene === undefined ? 'hidden' : 'visible'
              }}
            />
          </div>
          <button
            className="upgrade hh-game-action"
            onClick={doUpgrade}
            disabled={!canUnlock || !canAfford}
            style={{ visibility: canUnlock ? 'visible' : 'hidden' }}
          >
            {sceneData?.cost === undefined ? '???' : formatCost(sceneData.cost)}
            <div className="currency-icon" />
          </button>
        </div>
      </div>
      {close !== undefined ? <CloseButton close={close} /> : null}
    </div>
  );
};
