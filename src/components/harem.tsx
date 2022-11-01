import React, { useCallback, useMemo, useState } from 'react';
import { BlessingDefinition, BlessingType, CommonGirlData } from '../data/data';
import '../style/harem.css';
import '../style/controls.css';
import { Summary } from './summary';
import { GameAPI } from '../api/GameAPI';
import { Tab, TabFolder } from './tabs';
import { FiltersPanel } from './filters';
import { SortPanel } from './sort';
import { HaremOptions } from '../data/options';
import { HaremWidget } from './harem-widget';
import { HaremToolbar } from './harem-toolbar';
import { useQuickFilters } from '../hooks/quick-filter-hooks';
import { useSorter } from '../hooks/sort-hooks';
import { FiltersContext, useFilters } from '../hooks/filter-hooks';
import { useApplyFilters } from '../hooks/girls-data-hooks';

export interface HaremProps {
  allGirls: CommonGirlData[];
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
  loading: boolean;
  refresh(): Promise<void>;
  haremVisible: boolean;
  gameAPI: GameAPI;
  options: HaremOptions;
  close(): void;
}

/**
 * Quick filter for specific blessing-related attribute.
 * These filters are managed by the Summary panel, and are
 * not persisted.
 */
export interface QuickFilter {
  blessing: BlessingType;
}

export const Harem: React.FC<HaremProps> = ({
  allGirls,
  currentBlessings,
  upcomingBlessings,
  haremVisible,
  gameAPI,
  loading,
  refresh,
  close,
  options
}) => {
  const tabs = useMemo<Tab[]>(() => {
    const summary: Tab = { id: 'summary', label: 'Summary' };
    const sort: Tab = { id: 'sort', label: 'Sort' };
    const _presets: Tab = { id: 'presets', label: 'Presets' };
    const filters: Tab = { id: 'filters', label: 'Filters' };
    return [summary, filters, sort];
  }, []);

  const [activeTab, setActiveTab] = useState<Tab | undefined>(undefined);
  const toggleTab = useCallback(
    (tab: Tab) => {
      if (activeTab === tab) {
        setActiveTab(undefined);
        return;
      }
      setActiveTab(tab);
    },
    [activeTab, setActiveTab, tabs]
  );

  const closePanel = useCallback(() => {
    setActiveTab(undefined);
  }, [setActiveTab]);

  const filtersState = useFilters(options, currentBlessings, upcomingBlessings);
  const sorterState = useSorter(options, currentBlessings, upcomingBlessings);
  const quickFiltersState = useQuickFilters(
    options,
    currentBlessings,
    upcomingBlessings
  );
  const { filteredGirls, matchedGirls } = useApplyFilters(
    allGirls,
    sorterState.sorter,
    filtersState.activeFilter,
    quickFiltersState.activeQuickFilters,
    filtersState.searchText
  );

  const [is0Pose, set0Pose] = useState(false);

  const toggle0Pose = useCallback(
    () => set0Pose(!is0Pose),
    [set0Pose, is0Pose]
  );

  return (
    <>
      <FiltersContext.Provider value={filtersState}>
        <TabFolder tabs={tabs} toggleTab={toggleTab} activeTab={activeTab} />
        <Summary
          filteredGirls={filteredGirls}
          allGirls={allGirls}
          toggleFilter={quickFiltersState.toggleQuickFilter}
          clearFilters={quickFiltersState.clearQuickFilters}
          filters={quickFiltersState.activeQuickFilters}
          currentBlessings={currentBlessings}
          nextBlessings={upcomingBlessings}
          visible={activeTab?.id === 'summary'}
          close={closePanel}
        />
        <FiltersPanel
          visible={activeTab?.id === 'filters'}
          close={closePanel}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
        />
        <SortPanel
          visible={activeTab?.id === 'sort'}
          close={closePanel}
          sortConfig={sorterState.sortConfig}
          setSortConfig={sorterState.setSortConfig}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
          persistDefaultSort={sorterState.persistDefaultSort}
          isDefaultSort={sorterState.isDefaultSort}
        />
        <HaremToolbar
          gameAPI={gameAPI}
          loading={loading}
          refresh={refresh}
          close={close}
          totalGirlsCount={allGirls.length}
          visibleGirlsCount={matchedGirls.length}
          activeQuickFilters={quickFiltersState.activeQuickFilters}
          clearQuickFilters={quickFiltersState.clearQuickFilters}
          show0Pose={is0Pose}
          toggle0Pose={toggle0Pose}
        />
        <HaremWidget
          allGirls={allGirls}
          girls={matchedGirls}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
          show0Pose={is0Pose}
          visible={haremVisible}
          gameAPI={gameAPI}
        />
      </FiltersContext.Provider>
    </>
  );
};
