import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { BlessingDefinition, Team } from '../data/data';
import {
  Filter,
  FilterConfig,
  FiltersManager
} from '../data/filters/filter-api';
import {
  configsEqual,
  FiltersManagerImpl
} from '../data/filters/filter-manager';
import { RootFilter } from '../data/filters/filter-runtime';
import { HaremOptions } from '../data/options';
import { Sorter } from '../data/sort';

export const FiltersContext = React.createContext<FilterState>({
  filters: [],
  activeFilter: new RootFilter([]),
  searchText: '',
  isDefaultFilter: true,
  restoreDefaultFilter: () => {
    /* Empty */
  },
  persistDefaultFilter: () => {
    /* Empty */
  },
  clearFilters: () => {
    /* Empty */
  },
  getActiveFilter: (_id) => undefined,
  updateFilter: () => {
    /* Empty */
  },
  removeFilter: () => {
    /* Empty */
  },
  isActive: () => false,
  setSearchText: (_searchText) => {
    /* Empty */
  }
});

export interface FilterContext {
  filters: Filter[];
  activeFilter: Filter;
}

export interface FilterState {
  // State
  filters: Filter[];
  activeFilter: Filter;
  searchText: string;
  isDefaultFilter: boolean;
  // Callbacks
  restoreDefaultFilter(): void;
  persistDefaultFilter(): void;
  clearFilters(): void;
  getActiveFilter(id: string): Filter | undefined;
  updateFilter(filter: Filter): void;
  removeFilter(filter: Filter): void;
  isActive(filter: Filter): boolean;
  setSearchText(searchText: string): void;
}

export function useFilters(
  options: HaremOptions,
  currentBlessings: BlessingDefinition[],
  upcomingBlessings: BlessingDefinition[],
  teams: Team[]
) {
  const [searchText, setSearchValue] = useState('');
  const setSearchText = useCallback((search: string) => {
    setSearchValue(search);
  }, []);

  const filtersManager = useMemo(
    () => new FiltersManagerImpl(currentBlessings, upcomingBlessings, teams),
    [currentBlessings, upcomingBlessings, teams]
  );

  const [defaultFilterConfig, setDefaultFilterConfig] = useState(() => {
    // Ensure we use a valid config: try to instantiate the filter, and read
    // the config from the runtime filter (or empty filter if the config is invalid)
    const config = options.defaultFilter;
    const filters = getFilters(config, filtersManager);
    return new RootFilter(filters).getConfig();
  });

  // Filters, append, remove. Callbacks.

  const [filters, setFiltersValue] = useState<Filter[]>(() => {
    return defaultFilterConfig === undefined
      ? []
      : getFilters(defaultFilterConfig, filtersManager);
  });
  const filtersRef = useRef(filters);
  const setFilters = useCallback((filters: Filter[]) => {
    setFiltersValue(filters);
    filtersRef.current = filters;
  }, []);

  const updateFilter = useCallback((filterToAppend: Filter) => {
    const existing = filtersRef.current.findIndex(
      (f) => f.id === filterToAppend.id
    );
    if (existing >= 0) {
      filtersRef.current[existing] = filterToAppend;
    } else {
      filtersRef.current.push(filterToAppend);
    }
    setFilters([...filtersRef.current]);
  }, []);
  const removeFilter = useCallback((filterToRemove: Filter) => {
    const existing = filtersRef.current.findIndex(
      (f) => f.id === filterToRemove.id
    );
    if (existing >= 0) {
      filtersRef.current.splice(existing, 1);
    }
    setFilters([...filtersRef.current]);
  }, []);
  const isActive = useCallback((filter: Filter) => {
    return filtersRef.current.some((f) => f.id === filter.id);
  }, []);

  // Aggregated filter. Only used for rendering.
  const activeFilter = useMemo(() => {
    return new RootFilter(filters);
  }, [filters]);

  // Update the active filter(s) when blessings or teams change
  useEffect(() => {
    const currentFilters = filtersRef.current;
    const config = new RootFilter(currentFilters).getConfig();
    const updatedFilter = getFilters(config, filtersManager);
    setFilters(updatedFilter);
  }, [currentBlessings, upcomingBlessings, teams, filtersManager]);

  const isDefaultFilter = useMemo(() => {
    const result =
      defaultFilterConfig !== undefined &&
      configsEqual(activeFilter.getConfig(), defaultFilterConfig);
    return result;
  }, [activeFilter, defaultFilterConfig]);

  const persistDefaultFilter = useCallback(() => {
    filtersManager.persistDefaultFilter(activeFilter);
    setDefaultFilterConfig(activeFilter.getConfig());
  }, [filtersManager, activeFilter]);

  const restoreDefaultFilter = useCallback(async () => {
    const filters = getFilters(defaultFilterConfig, filtersManager);
    setFilters(filters);
  }, [defaultFilterConfig, filtersManager]);

  const getActiveFilter = useCallback((filterId: string) => {
    const match = filtersRef.current.find((f) => f.id === filterId);
    return match;
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  return {
    activeFilter,
    searchText,
    isDefaultFilter,
    filters,
    restoreDefaultFilter,
    persistDefaultFilter,
    isActive,
    getActiveFilter,
    clearFilters,
    updateFilter,
    removeFilter,
    setSearchText
  };
}

function getFilters(
  filterConfig: FilterConfig | undefined,
  filtersManager: FiltersManager
): Filter[] {
  const filter =
    filterConfig === undefined
      ? undefined
      : filtersManager.createFilter(filterConfig);
  if (filter === undefined) {
    return [];
  } else if (filter instanceof RootFilter) {
    return filter.filters;
  } else {
    return [filter];
  }
}
