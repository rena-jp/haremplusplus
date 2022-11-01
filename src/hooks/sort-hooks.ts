import { useCallback, useMemo, useState } from 'react';
import { BlessingDefinition } from '../data/data';
import { HaremOptions, optionsManager } from '../data/options';
import {
  ConfiguredSort,
  getConfiguredSorter,
  GradeSorter,
  reverse,
  Sorter
} from '../data/sort';

export interface SorterState {
  sorter: Sorter;
  sortConfig: ConfiguredSort;
  setSortConfig(sortConfig: ConfiguredSort): void;
  persistDefaultSort(): void;
  isDefaultSort: boolean;
}

export const useSorter: (
  options: HaremOptions,
  currentBlessings: BlessingDefinition[],
  upcomingBlessings: BlessingDefinition[]
) => SorterState = (options, currentBlessings, upcomingBlessings) => {
  const [defaultSortConfig, setDefaultSortConfig] = useState(
    options.defaultSort
  );

  const [sortConfig, setSortConfig] = useState<ConfiguredSort>(() => {
    const configuredSorter = getConfiguredSorter(
      defaultSortConfig,
      currentBlessings,
      upcomingBlessings
    );
    return configuredSorter === undefined ? GradeSorter : configuredSorter;
  });

  const sorter = useMemo(() => {
    return sortConfig.direction === 'desc'
      ? reverse(sortConfig.sorter)
      : sortConfig.sorter;
  }, [sortConfig]);

  const persistDefaultSort = useCallback(() => {
    const newDefault = {
      sort: sortConfig.id,
      direction: sortConfig.direction
    };
    optionsManager.setDefaultSort(newDefault);
    setDefaultSortConfig(newDefault);
  }, [sortConfig]);

  const isDefaultSort = useMemo(() => {
    return (
      sortConfig.id === defaultSortConfig.sort &&
      sortConfig.direction === defaultSortConfig.direction
    );
  }, [sortConfig, defaultSortConfig]);

  return {
    sorter,
    sortConfig,
    setSortConfig,
    persistDefaultSort,
    isDefaultSort
  };
};
