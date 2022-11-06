import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { GameAPI } from '../api/GameAPI';
import { loadBlessings, loadHaremData, persistHaremData } from '../data/cache';
import {
  BlessingDefinition,
  CommonGirlData,
  HaremData,
  replace
} from '../data/data';
import { GameBlessingData, GameQuests, GirlsDataList } from '../data/game-data';
import { DataFormat, toHaremData } from '../data/import/harem-import';

export interface LoadHaremDataProps {
  gameAPI: GameAPI;
  children(state: LoadHaremDataResult): ReactElement | null;
}

export interface LoadHaremDataResult {
  allGirls?: CommonGirlData[];
  currentBlessings?: BlessingDefinition[];
  upcomingBlessings?: BlessingDefinition[];
  refresh(): Promise<void>;
  loading: boolean;
}

export const LoadHaremData: React.FC<LoadHaremDataProps> = ({
  gameAPI,
  children
}) => {
  const [currentBlessings, setCurrentBlessings] = useState<
    BlessingDefinition[] | undefined
  >();
  const [upcomingBlessings, setUpcomingBlessings] = useState<
    BlessingDefinition[] | undefined
  >();

  const [loading, setLoading] = useState(true);
  const loadingData = useRef(false);

  const [allGirlsValue, setAllGirlsValue] = useState<
    CommonGirlData[] | undefined
  >();
  const allGirls = useRef<CommonGirlData[] | undefined>(allGirlsValue);

  const setLoadingData = useCallback((newLoading: boolean) => {
    setLoading(newLoading);
    loadingData.current = newLoading;
  }, []);

  const setAllGirls = useCallback((girls: CommonGirlData[]) => {
    allGirls.current = girls;
    setAllGirlsValue(girls);
  }, []);

  const [gameGirls, setGameGirls] = useState<GirlsDataList | undefined>(
    undefined
  );
  const [gameBlessings, setGameBlessings] = useState<
    GameBlessingData | undefined
  >(undefined);

  const [gameQuests, setGameQuests] = useState<GameQuests | undefined>();

  const updateGirl = useCallback((girl: CommonGirlData) => {
    if (allGirls.current !== undefined) {
      const newGirl: CommonGirlData = { ...girl };
      replace(allGirls.current, newGirl);
      setAllGirls([...allGirls.current]);
    } else {
      console.warn('Tried to update girl data, but data is not loaded yet');
    }
  }, []);

  useMemo(() => {
    gameAPI.setUpdateGirl(updateGirl);
  }, [gameAPI, updateGirl]);

  const refresh = useCallback<() => Promise<void>>(async () => {
    if (loadingData.current) {
      return Promise.reject('Refresh is already in progress');
    }

    setLoadingData(true);

    try {
      const loadGirls = gameAPI
        .getGirls(true)
        .then((girls) => {
          setGameGirls(girls);
        })
        .catch((reason) => {
          console.warn('Failed to get game girls: ', reason);
        });

      const loadQuests = gameAPI
        .getQuests(true)
        .then((quests) => setGameQuests(quests))
        .catch((reason) => {
          console.warn('Failed to get girls quests: ', reason);
        });
      await Promise.allSettled([loadGirls, loadQuests]);
    } catch (error) {
      console.warn('Error while refreshing: ', error);
    }

    setLoadingData(false);
  }, []);

  // Immediately load the data, only once.
  useEffect(() => {
    // Note: in dev mode with Strict Mode enabled, the extension
    // will be rendered twice, which may cause this refresh() to
    // be invoked twice and cause an exception ("Already loading...")
    refresh();
  }, []);

  useEffect(() => {
    // Immediately load the blessings, only once.
    loadBlessings(gameAPI)
      .then((blessings) => {
        setGameBlessings(blessings);
      })
      .catch((reason) => {
        console.warn('Failed to get game blessings: ', reason);
      });
  }, []);

  const updateResult = useCallback((haremData: HaremData) => {
    // Persist harem data after each update
    persistHaremData(haremData);
    // TODO reconcile with current data, if any. Avoid full rewrite.
    const currentGirls = allGirls.current;
    const updatedGirls = reconcileGirls(currentGirls, haremData.allGirls);
    setAllGirls(updatedGirls);
    setCurrentBlessings(haremData.activeBlessing);
    setUpcomingBlessings(haremData.nextBlessing);
  }, []);

  useMemo(() => {
    // FIXME: This memo will be invoked 3 times if all 3 values
    // change. This is fine on initial load (as the memo won't do
    // anything until all 3 values are present), but may become
    // overkill for later refreshes. Refresh should happen only
    // once if 2 values change at the same time.
    if (gameGirls && gameBlessings && gameQuests) {
      const gameData: DataFormat = {
        blessings: gameBlessings,
        list: gameGirls,
        quests: gameQuests
      };
      toHaremData(gameData).then(updateResult);
    }
  }, [gameGirls, gameBlessings, gameQuests]);

  // Load from cache
  useEffect(() => {
    if (!gameGirls) {
      loadHaremData()
        .catch((error) => {
          console.info(
            'Failed to load initial harem data from cache. Private mode or first time?',
            error
          );
          return emptyHarem;
        })
        .then((cacheData) => {
          if (allGirls.current) {
            // Unlikely: data would have loaded from the game faster than
            // from the cache. Ignore the cache in that case...
          } else {
            updateResult(cacheData);
          }
        });
    }
  }, []);

  const result: LoadHaremDataResult = {
    allGirls: allGirlsValue,
    currentBlessings,
    upcomingBlessings,
    refresh,
    loading
  };

  return children(result);
};

const emptyHarem: HaremData = {
  allGirls: [],
  activeBlessing: [],
  nextBlessing: []
};

/**
 * Compare 2 lists of girls and return the updated list, with minimal amount of changes (to limit needs to re-render).
 * @param currentGirls
 *  The current list of girls
 * @param newGirls
 *  The new list of girls
 * @return The updated list of girls
 */
function reconcileGirls(
  currentGirls: CommonGirlData[] | undefined,
  newGirls: CommonGirlData[]
): CommonGirlData[] {
  if (currentGirls === undefined || currentGirls.length === 0) {
    return newGirls;
  }
  const existingGirls = new Map<string, CommonGirlData>();
  currentGirls.forEach((girl) => existingGirls.set(girl.id, girl));
  const result: CommonGirlData[] = [];
  let changes = currentGirls.length !== newGirls.length;
  for (const girl of newGirls) {
    const existingGirl = existingGirls.get(girl.id);
    if (existingGirl === undefined || !quickEqualGirls(existingGirl, girl)) {
      changes = true;
      result.push(girl);
    } else {
      result.push(existingGirl); // Keep the exact same object to avoid unnecessary re-render
    }
  }
  return changes ? result : currentGirls;
}

/**
 * Quickly compare 2 states of the same girl. This is a quick compare that only
 * checks the variables that are more likely to change (such as XP/Level and Aff/Grade),
 * in order to efficiently re-render the harem after a full refresh.
 * @param girl1 the first girl to compare
 * @param girl2 the second girl to compare
 * @returns true if the values are "probably equal", false otherwise.
 */
function quickEqualGirls(
  girl1: CommonGirlData,
  girl2: CommonGirlData
): boolean {
  if (girl1.id !== girl2.id) {
    return false;
  }

  // Only do a quick test. DeepEqual is too expensive to apply on every refresh (600ms for all girls);
  // only check for variables that are likely to change (1~2ms for all girls)
  return (
    girl1.shards === girl2.shards && // Owned/Not owned
    girl1.missingGXP === girl2.missingGXP && // Level test
    girl1.missingAff === girl2.missingAff && // Grade test
    girl1.stars === girl2.stars && // Unlocked Grade
    girl1.missingGems === girl2.missingGems && // Max level/Awakening test
    girl1.icon === girl2.icon && // Current pose test
    girl1.bio === girl2.bio && // Language test
    girl1.variations?.length === girl2.variations?.length
  );
}
