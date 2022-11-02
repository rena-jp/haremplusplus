import { useMemo } from 'react';
import { QuickFilter } from '../components/harem';
import { CommonGirlData, matchesBlessing } from '../data/data';
import { Filter } from '../data/filters/filter-api';
import { Sorter } from '../data/sort';

export const useApplyFilters = (
  allGirls: CommonGirlData[],
  sorter: Sorter | undefined,
  activeFilter: Filter | undefined,
  quickFilters: QuickFilter[],
  searchText: string
) => {
  const sortedGirls = useMemo(() => {
    return sorter === undefined ? allGirls : sorter.sort(allGirls);
  }, [sorter, allGirls]);

  const filteredGirls = useMemo(() => {
    return activeFilter === undefined
      ? sortedGirls
      : sortedGirls.filter((girl) => activeFilter?.includes(girl));
  }, [sortedGirls, activeFilter]);

  const quickFilteredGirls = useMemo(
    () => filterGirls(filteredGirls, quickFilters),
    [filteredGirls, quickFilters]
  );

  const textFilter = useMemo(
    () => quickFilteredGirls.filter((girl) => matchesSearch(girl, searchText)),
    [quickFilteredGirls, searchText]
  );

  return {
    filteredGirls,
    matchedGirls: textFilter
  };
};

function filterGirls(
  girls: CommonGirlData[],
  filters: QuickFilter[]
): CommonGirlData[] {
  return girls.filter((girl) => matchesFilters(girl, filters));
}

function matchesFilters(girl: CommonGirlData, filters: QuickFilter[]): boolean {
  if (filters.length === 0) {
    return true;
  }

  for (const filter of filters) {
    if (matchesBlessing(girl, filter.blessing, false)) {
      return true;
    }
  }

  return false;
}

function matchesSearch(girl: CommonGirlData, search: string): boolean {
  if (search === undefined || search.length === 0) {
    return true;
  }
  const lowerSearch = search.toLowerCase();
  // The game uses ’ instead of ' for quotes in names. Search both.
  const replaceQuotes = lowerSearch.replaceAll("'", '’');

  return (
    girl.name.toLowerCase().includes(lowerSearch) ||
    girl.name.toLowerCase().includes(replaceQuotes) ||
    girl.fullName.toLowerCase().includes(lowerSearch) ||
    girl.fullName.toLowerCase().includes(replaceQuotes) ||
    girl.id === search
    // || girl.bio.toLowerCase().includes(lowerSearch)
  );
}
