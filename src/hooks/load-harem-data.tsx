import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  loadBlessings,
  loadGemsData,
  loadHaremData,
  persistGemsData,
  persistHaremData
} from '../data/cache';
import {
  BlessingDefinition,
  CommonGirlData,
  Element,
  Equipment,
  EquipmentData,
  HaremData,
  replace,
  SkillTiers,
  Stats
} from '../data/data';
import {
  countGems,
  GameBlessingData,
  GameQuests,
  GirlsDataList
} from '../data/game-data';
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
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
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

  const updateGirl = useCallback(
    (girl: CommonGirlData) => {
      if (allGirls.current !== undefined) {
        const newGirl: CommonGirlData = { ...girl };
        replace(allGirls.current, newGirl);
        const newAllGirls = [...allGirls.current];
        setAllGirls(newAllGirls);
        // Also update the cache after each update
        if (currentBlessings !== undefined && upcomingBlessings !== undefined) {
          const haremData: HaremData = {
            activeBlessing: currentBlessings,
            nextBlessing: upcomingBlessings,
            allGirls: newAllGirls
          };
          persistHaremData(haremData);
        }
      } else {
        console.warn('Tried to update girl data, but data is not loaded yet');
      }
    },
    [currentBlessings, upcomingBlessings]
  );

  useMemo(() => {
    gameAPI.setUpdateGirl(updateGirl);
  }, [gameAPI, updateGirl]);

  const [gemsCount, setGemsCount] = useState<Map<Element, number>>(new Map());
  const consumeGems = useCallback(
    (element: Element, gems: number) => {
      setGemsCount((previousCount) => {
        const gemsCount = previousCount.get(element);
        if (gemsCount) {
          // TODO Update cache
          const newCount = gemsCount - gems;
          previousCount.set(element, newCount);
        }
        return new Map(previousCount);
      });
    },
    [setGemsCount]
  );

  useEffect(() => {
    // Immediately load gems data from cache (if available), then load
    // gems data from the game (To ensure up-to-date data)
    loadGemsData()
      .then((gemsData) => setGemsCount(countGems(gemsData)))
      .catch(() => undefined)
      .then(() => gameAPI.getGemsData(true))
      .then((data) => {
        persistGemsData(data);
        setGemsCount(countGems(data));
      });
  }, []);

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

      const loadGemsData = gameAPI.getGemsData(true).then((data) => {
        persistGemsData(data);
        setGemsCount(countGems(data));
      });
      await Promise.allSettled([loadGirls, loadQuests, loadGemsData]);
    } catch (error) {
      console.warn('Error while refreshing: ', error);
    }

    setLoadingData(false);
  }, [gameAPI]);

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
    loading,
    gemsCount,
    consumeGems
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
    girl1.currentGXP === girl2.currentGXP && // Level test
    girl1.currentAffection === girl2.currentAffection && // Grade test
    girl1.stars === girl2.stars && // Unlocked Grade
    girl1.maxLevel === girl2.maxLevel && // Max level/Awakening test
    girl1.icon === girl2.icon && // Current pose test
    girl1.birthday === girl2.birthday && // Language test. Birthday is more likely to be translated in all languages.
    girl1.variations?.length === girl2.variations?.length &&
    girl1.pose === girl2.pose && // Maybe the pose was unknown, and now it's not
    equalStats(girl1.stats, girl2.stats) && // Workaround for stats refresh issue; also accounts for stats that may be adjusted after BC
    equalEquipment(girl1.equipment, girl2.equipment) && // Maybe equipment has changed
    equalSkillTiers(girl1.skillTiers, girl2.skillTiers)
  );
}

function equalStats(stats1?: Stats, stats2?: Stats): boolean {
  return (
    stats1?.charm === stats2?.charm &&
    stats1?.hardcore === stats2?.hardcore &&
    stats1?.knowhow === stats2?.knowhow
  );
}

function equalEquipment(
  equip1: EquipmentData | undefined,
  equip2: EquipmentData | undefined
): boolean {
  if (equip1 === equip2) {
    return true;
  }
  if (equip1 === undefined || equip2 === undefined) {
    return false;
  }
  if (equip1.items.length !== equip2.items.length) {
    return false;
  }
  for (let i = 0; i < equip1.items.length; i++) {
    const item1 = equip1.items[i];
    const item2 = equip2.items[i];
    if (!equalItem(item1, item2)) {
      return false;
    }
  }
  return true;
}

function equalItem(item1: Equipment, item2: Equipment): boolean {
  return (
    item1.rarity === item2.rarity &&
    item1.level === item2.level &&
    item1.uid === item2.uid
  );
}

function equalSkillTiers(
  skillTiers1?: SkillTiers,
  skillTiers2?: SkillTiers
): boolean {
  if (skillTiers1 === skillTiers2) return true;
  if (skillTiers1 === undefined || skillTiers2 === undefined) return false;
  return Array(5)
    .fill(0)
    .every(
      (_, i) =>
        skillTiers1[i + 1]?.skill_points_used ===
        skillTiers2[i + 1]?.skill_points_used
    );
}
