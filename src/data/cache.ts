import { GameAPI } from '../api/GameAPI';
import { HaremData, Team } from './data';
import { FilterConfig } from './filters/filter-api';
import { GameBlessing, GameBlessingData, GemsData } from './game-data';
import { SortConfig } from './sort';

const DEPRECATED_CACHES = [
  'harem-cache',
  'gemsData',
  'haremData',
  'qh-filters',
  'harem-cache-0.9.7',
  'harem-cache-0.9.7-dev.1'
];
/**
 * Data cache can and should be cleared after incompatible changes.
 * Clearing it shouldn't affect user settings.
 */
const DATA_CACHE = 'harem-cache-0.10.0';
/**
 * Config cache should be preserved (maybe migrated) as much as possible.
 * Clearing it will remove all user settings, and should be avoided.
 */
const CONFIG_CACHE = 'harem-cache-0.10.0';

async function clearOldCaches(): Promise<void> {
  for (const deprecatedCache of DEPRECATED_CACHES) {
    try {
      if (await caches.has(deprecatedCache)) {
        try {
          console.info('Clear deprecated cache: ', deprecatedCache);
          await caches.delete(deprecatedCache);
        } catch (error) {
          console.error('Failed to clear deprecated cache: ', deprecatedCache);
        }
      }
    } catch (error) {
      // Cache is probably not supported; ignore and do nothing.
    }
  }
}
clearOldCaches();

const GEMS_DATA_REQUEST = '/gemsData.json';

export async function loadGemsData(): Promise<GemsData> {
  try {
    if (await caches.has(DATA_CACHE)) {
      const cache = await caches.open(DATA_CACHE);
      const storedGemsData = await cache.match(new Request(GEMS_DATA_REQUEST));
      if (storedGemsData) {
        return await storedGemsData.json();
      }
    }
  } catch (error) {
    console.warn('Failed to load gems data from cache. Reason: ', error);
  }
  return Promise.reject('Gems data not found');
}

export async function persistGemsData(gemsData: GemsData): Promise<void> {
  try {
    const cache = await caches.open(DATA_CACHE);
    await cache.put(
      new Request(GEMS_DATA_REQUEST),
      new Response(JSON.stringify(gemsData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return;
  } catch (error) {
    console.error('[Gems] Failed to persist gems data. Reason: ', error);
    return Promise.reject([
      '[Gems] Failed to persist gems data. Reason: ',
      error
    ]);
  }
}
const HAREM_DATA_REQUEST = '/quickHaremData.json';

export async function loadHaremData(): Promise<HaremData> {
  try {
    if (await caches.has(DATA_CACHE)) {
      const cache = await caches.open(DATA_CACHE);
      const storedHaremData = await cache.match(
        new Request(HAREM_DATA_REQUEST)
      );
      if (storedHaremData) {
        return await storedHaremData.json();
      }
    }
  } catch (error) {
    console.warn('Failed to load harem data from cache. Reason: ', error);
  }
  return Promise.reject('Failed to load harem data from cache');
}

export async function persistHaremData(harem: HaremData): Promise<void> {
  if (harem.allGirls.length > 0) {
    try {
      const cache = await caches.open(DATA_CACHE);
      await cache.put(
        new Request(HAREM_DATA_REQUEST),
        new Response(JSON.stringify(harem), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      return;
    } catch (error) {
      console.error('[Girls] Failed to persist harem data. Reason: ', error);
      return Promise.reject([
        '[Girls] Failed to persist harem data. Reason: ',
        error
      ]);
    }
  }
}

const BLESSINGS_REQUEST = '/blessings.json';

async function loadBlessingsData(): Promise<GameBlessingData> {
  try {
    if (await caches.has(DATA_CACHE)) {
      const cache = await caches.open(DATA_CACHE);
      const storedBlessingsData = await cache.match(
        new Request(BLESSINGS_REQUEST)
      );
      if (storedBlessingsData) {
        return await storedBlessingsData.json();
      }
    }
  } catch (error) {
    console.warn('Failed to load blessings data from cache. Reason: ', error);
  }
  return Promise.reject('Blessings data not found');
}

async function persistBlessingsData(
  blessingsData: GameBlessingData
): Promise<void> {
  try {
    const cache = await caches.open(DATA_CACHE);
    await cache.put(
      new Request(BLESSINGS_REQUEST),
      new Response(JSON.stringify(blessingsData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return;
  } catch (error) {
    console.error(
      '[Blessings] Failed to persist blessings data. Reason: ',
      error
    );
    return Promise.reject([
      '[Blessings] Failed to persist blessings data. Reason: ',
      error
    ]);
  }
}

/**
 * Load the blessing definitions from cache, and call the game
 * API if necessary (when cached blessings are missing or outdated).
 * @param gameAPI
 */
export async function loadBlessings(
  gameAPI: GameAPI
): Promise<GameBlessingData> {
  try {
    const blessingsData = await loadBlessingsData();
    if (blessingsData && blessingsData.active.length > 0) {
      if (
        // Blessings only change once a week; so if we have a version in
        // cache that hasn't expired, there's no need to refresh.
        blessingsData.active.every((blessing) => isActive(blessing))
      ) {
        return blessingsData;
      }
    }
  } catch (error) {
    // Failed to load blessings from cache. The cache is probably empty;
    // let's just try to pull data from the game instead.
  }
  try {
    const blessingsData = await gameAPI.getBlessings();
    persistBlessingsData(blessingsData);
    return blessingsData;
  } catch (error) {
    console.error('Failed to load blessings from the game.');
    return Promise.reject('Failed to load blessings from the game.');
  }
}

const FILTERS_REQUEST = '/qh-default-filter';

function isActive(blessing: GameBlessing): boolean {
  if ('end_ts' in blessing) {
    return blessing.end_ts > Date.now();
  }
  // If blessing is stored with relative time, discard it and
  // always fetch fresh data.
  return false;
}

export async function persistDefaultFilter(
  filter: FilterConfig | undefined
): Promise<void> {
  try {
    const cache = await caches.open(CONFIG_CACHE);
    if (filter === undefined) {
      await cache.delete(FILTERS_REQUEST);
    } else {
      await cache.put(
        new Request(FILTERS_REQUEST),
        new Response(JSON.stringify(filter), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    return;
  } catch (error) {
    console.error('[Filter] Failed to persist filter. Reason: ', error);
    return Promise.reject([
      '[Filter] Failed to persist filter. Reason: ',
      error
    ]);
  }
}

export async function loadDefaultFilter(): Promise<FilterConfig> {
  try {
    if (await caches.has(CONFIG_CACHE)) {
      const cache = await caches.open(CONFIG_CACHE);
      const storedFilter = await cache.match(new Request(FILTERS_REQUEST));
      if (storedFilter) {
        const defaultConfig = await storedFilter.json();
        return defaultConfig.id && defaultConfig.type
          ? defaultConfig
          : undefined;
      }
    }
  } catch (error) {
    console.warn(
      'An error occurred while trying to load filters from cache:',
      error
    );
  }
  return Promise.reject('Failed to load filters from cache');
}

const SORT_REQUEST = '/qh-default-sort';

export async function persistDefaultSort(
  sort: SortConfig | undefined
): Promise<void> {
  try {
    const cache = await caches.open(CONFIG_CACHE);
    if (sort === undefined) {
      await cache.delete(SORT_REQUEST);
    } else {
      await cache.put(
        new Request(SORT_REQUEST),
        new Response(JSON.stringify(sort), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    return;
  } catch (error) {
    console.error('[Sorter] Failed to persist sorter. Reason: ', error);
    return Promise.reject([
      '[Sorter] Failed to persist sorter. Reason: ',
      error
    ]);
  }
}

export async function loadDefaultSort(): Promise<SortConfig> {
  try {
    if (await caches.has(CONFIG_CACHE)) {
      const cache = await caches.open(CONFIG_CACHE);
      const storedSorter = await cache.match(new Request(SORT_REQUEST));
      if (storedSorter) {
        const defaultConfig = await storedSorter.json();
        return defaultConfig.sort && defaultConfig.direction
          ? defaultConfig
          : undefined;
      }
    }
  } catch (error) {
    console.warn(
      'An error occurred while trying to load sorter from cache:',
      error
    );
  }
  return Promise.reject('Failed to load sorter from cache');
}

const TEAMS_REQUEST = 'teams.json';

export async function persistTeams(teams: Team[]): Promise<void> {
  try {
    const cache = await caches.open(DATA_CACHE);
    await cache.put(
      new Request(TEAMS_REQUEST),
      new Response(JSON.stringify(teams), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch (error) {
    console.error('[Teams] Failed to persist teams. Reason: ', error);
    return Promise.reject(['[Teams] Failed to persist teams. Reason: ', error]);
  }
}

export async function loadTeams(): Promise<Team[] | undefined> {
  try {
    if (await caches.has(DATA_CACHE)) {
      const cache = await caches.open(DATA_CACHE);
      const storedTeams = await cache.match(new Request(TEAMS_REQUEST));
      if (storedTeams) {
        const teams = await storedTeams.json();
        return Array.isArray(teams) ? teams : undefined;
      }
    }
  } catch (error) {
    console.warn(
      'An error occurred while trying to load teams from cache:',
      error
    );
  }
  return Promise.reject('Failed to load teams from cache');
}
