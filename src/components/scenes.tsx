import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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

  const [checkedImage, setCheckedImage] = useState('');
  const setImage = useCallback(
    (image: string, check?: boolean) => {
      if (check !== false) {
        checkImage(image).then((valid) => {
          if (valid) {
            setCheckedImage(image);
          }
        });
      } else {
        setCheckedImage(image);
      }
    },
    [setCheckedImage]
  );

  useLayoutEffect(() => {
    const quest = girl.quests[scene];
    const questId = quest.idQuest;
    const sceneImage = `/img/quests/${questId}/1/1600x900cut/${questId}.jpg`;
    setImage(sceneImage);
  }, []);

  useEffect(() => {
    let apply = true;
    gameAPI.getQuestStep(girl, scene, true).then((questData) => {
      // Ignore changes if we requested a different scene in the meantime
      if (apply) {
        setSceneData(questData);
        setImage(questData.sceneFull, false); // This is the actual image from the game data; no need to check it
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
      const quest = girl.quests[toScene];
      const questId = quest.idQuest;
      // /img/quests/1002156/1/1600x/1002156.jpg  // Old format
      // /img/quests/1002156/1/1600x900cut/1002156.jpg // New format
      const sceneImage = `/img/quests/${questId}/1/1600x900cut/${questId}.jpg`;
      setImage(sceneImage);
      setSceneData(undefined);
      setSceneText('...');
      setCanUnlock(quest.ready);
      setScene(toScene);
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
          <img className="qh-scene" src={checkedImage} />
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

/**
 * To speed up rendering, we try to guess the scene image before
 * fully loading the scene data. However, this approach doesn't work
 * for older scenes, and we'll reference an image that doesn't exist.
 * This function is use to check if an image is a valid scene before
 * displaying it.
 * @param imageSource the src of the image to check
 */
async function checkImage(imageSource: string): Promise<boolean> {
  const data = await fetch(imageSource, { cache: 'force-cache' });
  const blob = await data.blob();
  return blob.type !== 'image/svg+xml'; // Game uses SVG to display an error-image
}
