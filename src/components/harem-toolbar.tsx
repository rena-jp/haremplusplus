import { ReactNode, useContext, useMemo } from 'react';
import { GameAPI } from '../api/GameAPI';
import { Element } from '../data/data';
import { FiltersContext } from '../hooks/filter-hooks';
import { CloseButton, GemsCount, Tooltip } from './common';
import { QuickFilter } from './harem';
import { RequestsMonitor } from './requests-monitor';
import { PulseLoader } from 'react-spinners';
import { Filter } from '../data/filters/filter-api';
import { BlessingAttributeDescription } from './summary';
import { HaremMode } from './harem-widget';

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
  haremMode: HaremMode;
  setHaremMode(mode: HaremMode): void;
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
  gemsCount,
  gameAPI,
  haremMode,
  setHaremMode
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
      <div className="edit-teams">
        <button
          className={`hh-action-button${
            haremMode === 'edit-teams' ? ' active' : ''
          }`}
          onClick={() => {
            if (haremMode === 'edit-teams') {
              setHaremMode('standard');
            } else {
              setHaremMode('edit-teams');
            }
          }}
        >
          Edit teams
        </button>
      </div>

      <div className="spacer" />
      <RequestsMonitor
        gameAPI={gameAPI}
        error={() => (
          <Tooltip
            tooltip={<span>An error occurred while executing an action.</span>}
          >
            <div>⚠️</div>
          </Tooltip>
        )}
      >
        {(requests) => (
          <div className="requests-tracker">
            <Tooltip tooltip={<span>Pending requests: {requests}</span>}>
              <div>
                <PulseLoader color="#b77905" />
              </div>
            </Tooltip>
          </div>
        )}
      </RequestsMonitor>
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
      <FiltersDescription
        filter={activeFilter}
        quickFilters={activeQuickFilters}
        visibleGirlsCount={visibleGirlsCount}
        totalGirlsCount={totalGirlsCount}
      />
    </div>
  );
};

export interface FiltersDescriptionProps {
  filter: Filter;
  quickFilters: QuickFilter[];
  visibleGirlsCount: number;
  totalGirlsCount: number;
}

export const FiltersDescription: React.FC<FiltersDescriptionProps> = ({
  filter,
  quickFilters,
  visibleGirlsCount,
  totalGirlsCount
}) => {
  const filterLabel = useMemo(() => filter.label, [filter]);
  return (
    <Tooltip
      tooltip={
        <DetailedFiltersDescription
          filter={filter}
          quickFilters={quickFilters}
          totalGirlsCount={totalGirlsCount}
          visibleGirlsCount={visibleGirlsCount}
        />
      }
    >
      <div className="active-filter">
        Active Filter: {filterLabel}{' '}
        <span className="filter-girls-count">
          ({visibleGirlsCount}/{totalGirlsCount})
        </span>
      </div>
    </Tooltip>
  );
};

export const DetailedFiltersDescription: React.FC<FiltersDescriptionProps> = ({
  filter,
  quickFilters,
  visibleGirlsCount,
  totalGirlsCount
}) => {
  return (
    <div>
      <p>
        Filter: <FilterDescription filter={filter} />
      </p>
      <p>
        Quick Filters: <QuickFilterDescription quickFilters={quickFilters} />
      </p>
      <p>
        Matched girls: {visibleGirlsCount}/{totalGirlsCount}
      </p>
    </div>
  );
};

interface FilterDescriptionProps {
  filter: Filter;
}

const FilterDescription: React.FC<FilterDescriptionProps> = ({ filter }) => {
  const labels = filter.label.split('&').map((f) => f.trim());
  return (
    <>
      {labels.reduce<ReactNode>(
        (a, b) =>
          a === 'None'
            ? b
            : [
                a,
                <>
                  {' '}
                  &<br />
                </>,
                b
              ],
        'None'
      )}
    </>
  );
};

interface QuickFilterDescriptionProps {
  quickFilters: QuickFilter[];
}

const QuickFilterDescription: React.FC<QuickFilterDescriptionProps> = ({
  quickFilters
}) => {
  return (
    <>
      {quickFilters
        .map<ReactNode>((f) => (
          <BlessingAttributeDescription
            blessing={f.blessing.blessing}
            blessingValue={f.blessing.blessingValue}
          />
        ))
        .reduce<ReactNode>(
          (a, b) =>
            a === 'None'
              ? b
              : [
                  a,
                  <>
                    {' '}
                    OR
                    <br />
                  </>,
                  b
                ],
          'None'
        )}
    </>
  );
};
