import { GameAPI } from '../api/GameAPI';
import { HaremData } from './data';
import { FilterConfig } from './filters/filter-api';
import { GameBlessingData, GemsData } from './game-data';
import { SortConfig } from './sort';

const DEPRECATED_CACHES = [
  'harem-cache',
  'gemsData',
  'haremData',
  'qh-filters',
  'harem-cache-0.9.7'
];
const CACHE = 'harem-cache-0.9.7-dev.1';

async function clearOldCaches(): Promise<void> {
  for (const deprecatedCache of DEPRECATED_CACHES) {
    try {
      if (await caches.has(deprecatedCache)) {
        console.info('Clear deprecated cache: ', deprecatedCache);
        await caches.delete(deprecatedCache);
      }
    } catch (error) {
      console.error('Failed to clear deprecated cache: ', deprecatedCache);
    }
  }
}
clearOldCaches();

const GEMS_DATA_REQUEST = '/gemsData.json';

export async function loadGemsData(): Promise<GemsData> {
  try {
    if (await caches.has(CACHE)) {
      const cache = await caches.open(CACHE);
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
    const cache = await caches.open(CACHE);
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
    if (await caches.has(CACHE)) {
      const cache = await caches.open(CACHE);
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
      const cache = await caches.open(CACHE);
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
    if (await caches.has(CACHE)) {
      const cache = await caches.open(CACHE);
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
    const cache = await caches.open(CACHE);
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
        blessingsData.active.every(
          (blessing) => (blessing.end_ts ?? 0) * 1000 > Date.now()
        )
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

export async function persistDefaultFilter(
  filter: FilterConfig | undefined
): Promise<void> {
  try {
    const cache = await caches.open(CACHE);
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
    if (await caches.has(CACHE)) {
      const cache = await caches.open(CACHE);
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
    const cache = await caches.open(CACHE);
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
    if (await caches.has(CACHE)) {
      const cache = await caches.open(CACHE);
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
