import React, { useCallback, useMemo, useState } from 'react';
import {
  BlessingDefinition,
  BlessingType,
  CommonGirlData,
  Element
} from '../data/data';
import '../style/harem.css';
import '../style/controls.css';
import { Summary } from './summary';
import { TraitsSummary } from './traits-summary';
import { GameAPI } from '../api/GameAPI';
import { Tab, TabFolder } from './tabs';
import { FiltersPanel } from './filters';
import { SortPanel } from './sort';
import { HaremOptions } from '../data/options';
import { HaremMode, HaremWidget } from './harem-widget';
import { HaremToolbar } from './harem-toolbar';
import { useQuickFilters } from '../hooks/quick-filter-hooks';
import { useSorter } from '../hooks/sort-hooks';
import { useTraitsFilter } from '../hooks/traits-filter-hooks';
import { FiltersContext, useFilters } from '../hooks/filter-hooks';
import { useApplyFilters } from '../hooks/girls-data-hooks';
import { useTeams } from '../hooks/teams-hooks';
import { SkillsSummary } from './skill-summary';
import { useSkillFilter } from '../hooks/skill-filter-hooks';

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
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
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
  options,
  gemsCount,
  consumeGems
}) => {
  const tabs = useMemo<Tab[]>(() => {
    const summary: Tab = { id: 'summary', label: 'Summary' };
    const sort: Tab = { id: 'sort', label: 'Sort' };
    const _presets: Tab = { id: 'presets', label: 'Presets' };
    const filters: Tab = { id: 'filters', label: 'Filters' };
    const traits: Tab = { id: 'traits', label: 'Traits' };
    const skill: Tab = { id: 'skill', label: 'Skill & Role' };
    return [summary, filters, sort, traits, skill];
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

  const teamsData = useTeams(gameAPI);

  const filtersState = useFilters(
    options,
    currentBlessings,
    upcomingBlessings,
    teamsData.teams
  );
  const sorterState = useSorter(options, currentBlessings, upcomingBlessings);
  const quickFiltersState = useQuickFilters(
    options,
    currentBlessings,
    upcomingBlessings
  );
  const traitsFilterState = useTraitsFilter();
  const skillFilterState = useSkillFilter();
  const { filteredGirls, quickFilteredGirls, matchedGirls } = useApplyFilters(
    allGirls,
    sorterState.sorter,
    filtersState.activeFilter,
    quickFiltersState.activeQuickFilters,
    traitsFilterState.traitsFilter,
    skillFilterState.skillFilter,
    filtersState.searchText
  );

  const [displayedTab, setDisplayedTab] = useState(activeTab);

  const [haremMode, setHaremMode] = useState<HaremMode>('standard');

  // When hiding the entire tabs panel, keep the current tab displayed (to avoid content disappearing
  // while the panel is sliding away)
  if (activeTab !== undefined && activeTab !== displayedTab) {
    setDisplayedTab((previousDisplayedTab) => {
      if (activeTab !== undefined) {
        return activeTab;
      } else {
        return previousDisplayedTab;
      }
    });
  }

  const togglePanel = useCallback(() => {
    if (activeTab === undefined) {
      toggleTab(displayedTab ?? tabs[1]);
    } else {
      toggleTab(activeTab);
    }
  }, [tabs, toggleTab, activeTab]);

  const classNames = ['qh-harem', haremMode];

  return (
    <>
      <FiltersContext.Provider value={filtersState}>
        <TabFolder tabs={tabs} toggleTab={toggleTab} activeTab={activeTab}>
          <Summary
            filteredGirls={filteredGirls}
            allGirls={allGirls}
            toggleFilter={quickFiltersState.toggleQuickFilter}
            clearFilters={quickFiltersState.clearQuickFilters}
            filters={quickFiltersState.activeQuickFilters}
            currentBlessings={currentBlessings}
            nextBlessings={upcomingBlessings}
            visible={displayedTab?.id === 'summary'}
            close={closePanel}
          />
          <TraitsSummary
            allGirls={allGirls}
            filteredGirls={quickFilteredGirls}
            traitsFilterState={traitsFilterState}
            visible={displayedTab?.id === 'traits'}
            close={closePanel}
          />
          <SkillsSummary
            allGirls={allGirls}
            filteredGirls={filteredGirls}
            skillFilterState={skillFilterState}
            visible={displayedTab?.id === 'skill'}
            close={closePanel}
          />
          <FiltersPanel
            visible={displayedTab?.id === 'filters'}
            close={closePanel}
            currentBlessings={currentBlessings}
            upcomingBlessings={upcomingBlessings}
            teams={teamsData.teams}
          />
          <SortPanel
            visible={displayedTab?.id === 'sort'}
            close={closePanel}
            sortConfig={sorterState.sortConfig}
            setSortConfig={sorterState.setSortConfig}
            currentBlessings={currentBlessings}
            upcomingBlessings={upcomingBlessings}
            persistDefaultSort={sorterState.persistDefaultSort}
            isDefaultSort={sorterState.isDefaultSort}
          />
        </TabFolder>
        <div className={classNames.join(' ')}>
          <HaremToolbar
            gameAPI={gameAPI}
            loading={loading}
            refresh={refresh}
            close={close}
            totalGirlsCount={allGirls.length}
            visibleGirlsCount={matchedGirls.length}
            activeQuickFilters={quickFiltersState.activeQuickFilters}
            clearQuickFilters={quickFiltersState.clearQuickFilters}
            traitsFilter={traitsFilterState.traitsFilter}
            clearTraitsFilter={traitsFilterState.clearTraits}
            toggleTab={togglePanel}
            isOpenTab={activeTab !== undefined}
            gemsCount={gemsCount}
            haremMode={haremMode}
            setHaremMode={setHaremMode}
          />
          <HaremWidget
            allGirls={allGirls}
            girls={matchedGirls}
            currentBlessings={currentBlessings}
            upcomingBlessings={upcomingBlessings}
            visible={haremVisible}
            gameAPI={gameAPI}
            gemsCount={gemsCount}
            consumeGems={consumeGems}
            haremMode={haremMode}
            setHaremMode={setHaremMode}
            teamsData={teamsData}
            setSingleTrait={traitsFilterState.toggleSingleTrait}
          />
        </div>
      </FiltersContext.Provider>
    </>
  );
};
