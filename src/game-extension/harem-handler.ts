import {GameName, HaremData} from '../data/data';
import {
  GameBlessingData,
  GameQuests,
  GemsData,
  GirlsDataList
} from '../data/game-data';
import { DataFormat, toHaremData } from '../data/import/harem-import';
import { GameAPIImpl, REQUEST_GIRLS } from './GameAPIImpl';
import {
  loadBlessings,
  persistGemsData,
  persistHaremData
} from '../data/cache';
import { MockGameAPI } from '../mock/MockGameAPI';
import { loadAndDispatch } from './frame-utils';

const gameAPI =
  window.location.host === 'localhost:3000'
    ? new MockGameAPI()
    : new GameAPIImpl();

/**
 * This function is executed when we load the harem page (Directly, or in a hidden rendered frame),
 * inside of the main game.
 *
 */
export async function handleHarem(): Promise<void> {
  const girlsPromise = updateGirlsAndDispatch();
  const gemsPromise = updateGemsAndDispatch();
  const questsPromise = updateQuestsAndDispatch();

  await Promise.allSettled([girlsPromise, gemsPromise, questsPromise]);
}

async function updateGirlsAndDispatch(): Promise<void> {
  try {
    const girls = await gameAPI.getGirls(false);
    writeDataToCache(girls, gameAPI.getGameName());
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(girls, window.location.origin);

      const messageListener = (event: MessageEvent) => {
        if (event.origin === window.origin) {
          const message = event.data;
          if (
            message === REQUEST_GIRLS &&
            window.parent &&
            window.parent !== window
          ) {
            window.parent.postMessage(girls, window.location.origin);
          }
        }
      };
      window.addEventListener('message', messageListener);
    }
  } catch (error) {
    console.error('Failed to get girls data from harem. Reason: ', error);
  }
}

async function updateGemsAndDispatch(): Promise<void> {
  const gemsData = await loadAndDispatch<GemsData>('player_gems_amount', () =>
    gameAPI.getGemsData(false)
  );
  writeGemsDataToCache(gemsData);
}

async function updateQuestsAndDispatch(): Promise<void> {
  await loadAndDispatch<GameQuests>('girl_quests', () =>
    gameAPI.getQuests(false)
  );
}

/**
 * Load the blessings, and convert the data (blessings + girls) to the extension harem format.
 * @param girls The girlsDataList from the game.
 * @param gameName The game name
 * @returns An empty promise.
 */
async function writeDataToCache(
  girls: GirlsDataList,
  gameName: GameName
): Promise<void> {
  let blessings: GameBlessingData = { active: [], upcoming: [] };
  try {
    blessings = await loadBlessings(gameAPI);
  } catch (error) {
    console.error(
      'Failed to retrieve blessings. Fallback to empty blessings... Reason: ',
      error
    );
  }

  const quests = await gameAPI.getQuests(false);

  try {
    const playerData: DataFormat = { list: girls, blessings, quests };
    let haremData: HaremData;
    try {
      haremData = await toHaremData(playerData, gameName);
    } catch (error) {
      console.error(
        'Error when converting girls data list to harem data. Data format: ',
        playerData
      );
      return Promise.reject([
        'Error when converting girls data list to harem data',
        error
      ]);
    }
    await persistHaremData(haremData);
  } catch (error) {
    console.error('Failed to persist data to cache. Reason: ', error);
    return Promise.reject('Failed to persist data to cache. Reason: ' + error);
  }
}

async function writeGemsDataToCache(gemsData: GemsData): Promise<void> {
  return persistGemsData(gemsData);
}
