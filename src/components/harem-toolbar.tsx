import { useContext, useMemo } from 'react';
import { GameAPI } from '../api/GameAPI';
import { Element } from '../data/data';
import { FiltersContext } from '../hooks/filter-hooks';
import { CloseButton, GemsCount, Tooltip } from './common';
import { QuickFilter } from './harem';

export interface HaremToolbarProps {
  gameAPI: GameAPI;
  loading: boolean;
  refresh(): Promise<void>;
  visibleGirlsCount: number;
  totalGirlsCount: number;
  // Quick filters
  activeQuickFilters: QuickFilter[];
  clearQuickFilters(): void;
  // Others
  show0Pose: boolean;
  toggle0Pose(): void;
  /**
   * An optional callback that can be invoked
   * to close the harem, when displayed as a popup
   */
  close?: () => void;
  toggleTab(): void;
  isOpenTab: boolean;
  gemsCount: Map<Element, number>;
}

export const HaremToolbar: React.FC<HaremToolbarProps> = ({
  visibleGirlsCount,
  totalGirlsCount,
  activeQuickFilters,
  clearQuickFilters,
  show0Pose,
  toggle0Pose,
  loading,
  refresh,
  close,
  toggleTab,
  isOpenTab,
  gemsCount
}) => {
  const {
    activeFilter,
    filters,
    searchText,
    setSearchText,
    restoreDefaultFilter,
    clearFilters,
    isDefaultFilter
  } = useContext(FiltersContext);

  const filterLabel = useMemo(() => activeFilter.label, [activeFilter]);

  return (
    <div className="harem-toolbar">
      <div className="quick-search">
        <input
          className="hh-text-input"
          onChange={(event) => setSearchText(event.target.value)}
          value={searchText}
        />
      </div>
      <div className="clear-filters quick">
        <button
          className="hh-action-button"
          disabled={activeQuickFilters.length === 0}
          onClick={clearQuickFilters}
        >
          Clear quick filters
        </button>
      </div>
      <div className="restore-default-filter">
        <button
          className="hh-action-button"
          disabled={isDefaultFilter}
          onClick={restoreDefaultFilter}
        >
          Restore default filters
        </button>
      </div>
      <div className="clear-filters">
        <button
          className="hh-action-button"
          disabled={activeQuickFilters.length === 0 && filters.length === 0}
          onClick={() => {
            clearQuickFilters();
            clearFilters();
          }}
        >
          Clear all filters
        </button>
      </div>
      <div className="quick-filters">
        <p className="toggle0pose">
          <label
            htmlFor="0pose"
            title="Show the 0-star pose for each girl. Can be used for screenshots, to avoid spoilers"
          >
            Show 0 Pose:{' '}
          </label>
          <input
            id="0pose"
            type="checkbox"
            onChange={toggle0Pose}
            checked={show0Pose}
          />
        </p>
      </div>
      <div className="owned-gems-summary">
        <GemsCount gemsCount={gemsCount} />
      </div>

      <button
        className={`hh-action-button filter-sort-icon ${
          isOpenTab ? 'open' : 'closed'
        }`}
        onClick={toggleTab}
      >
        <Tooltip tooltip={<span>Filter & sort</span>}>
          <div className="filler" />
        </Tooltip>
      </button>

      <button
        className="hh-action-button refresh"
        onClick={refresh}
        disabled={loading}
      >
        <Tooltip tooltip={<span>{loading ? 'Refreshing...' : 'Refresh'}</span>}>
          🍋
        </Tooltip>
      </button>
      {close === undefined ? null : (
        <CloseButton title="Close harem" close={close} />
      )}
      <div className="break" />
      <div className="active-filter">
        Active Filter: {filterLabel}{' '}
        <span className="filter-girls-count">
          ({visibleGirlsCount}/{totalGirlsCount})
        </span>
      </div>
    </div>
  );
};
