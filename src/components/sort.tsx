import { useCallback, useMemo } from 'react';
import { BlessingDefinition } from '../data/data';
import {
  BasePotentialSorter,
  ConfiguredSort,
  CurrentPotentialSorter,
  GradeSorter,
  LevelSorter,
  RaritySorter,
  RecruitedSorter,
  SalarySorter,
  UpcomingPotentialSorter
} from '../data/sort';
import { CloseButton, Tooltip } from './common';
import { PanelProps } from './panels';

export interface SortProps extends PanelProps {
  sortConfig: ConfiguredSort;
  setSortConfig(sorter: ConfiguredSort): void;
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
  persistDefaultSort: () => void;
  isDefaultSort: boolean;
}

export const SortPanel: React.FC<SortProps> = ({
  visible,
  close,
  sortConfig: currentSortConfig,
  setSortConfig,
  currentBlessings,
  upcomingBlessings,
  persistDefaultSort,
  isDefaultSort
}) => {
  // Game sort:
  // - Power
  // - Name

  const allSorters = useMemo(() => {
    return [
      GradeSorter,
      LevelSorter,
      SalarySorter,
      RecruitedSorter,
      RaritySorter,
      BasePotentialSorter,
      CurrentPotentialSorter(currentBlessings),
      UpcomingPotentialSorter(upcomingBlessings)
    ];
  }, [currentBlessings, upcomingBlessings]);

  const configureSort = useCallback(
    (sorter: ConfiguredSort) =>
      toggle(currentSortConfig, setSortConfig, sorter),
    [currentSortConfig, setSortConfig]
  );

  const className = `qh-panel sort ${visible ? 'visible' : 'hidden'}`;
  return (
    <div className={className}>
      <CloseButton close={close} title="Close Sort" />
      <h2>Sort</h2>
      <p>
        Active sort: {currentSortConfig.sorter.label}{' '}
        {currentSortConfig.direction === 'asc' ? '▲' : '▼'}
      </p>
      <p>
        <button
          className="hh-action-button"
          onClick={persistDefaultSort}
          disabled={isDefaultSort}
        >
          Save as default
        </button>
      </p>
      <div className="sort-list">
        {allSorters.map((sorter) => (
          <SortAction
            sorter={sorter}
            currentSort={currentSortConfig}
            configureSort={configureSort}
            key={sorter.id}
          />
        ))}
      </div>
    </div>
  );
};

interface SortActionProps {
  sorter: ConfiguredSort;
  currentSort: ConfiguredSort;
  configureSort(sorter: ConfiguredSort): () => void;
}

const SortAction: React.FC<SortActionProps> = ({
  sorter,
  currentSort,
  configureSort
}) => {
  const sortAction = useCallback(configureSort(sorter), [configureSort]);
  const label = sorter.sorter.label;
  const active = currentSort.id === sorter.id;
  const direction =
    currentSort.id === sorter.id ? currentSort.direction : sorter.direction;

  const description = sorter.sorter.description;

  const labelNode = (
    <>
      {label} {active ? (direction === 'asc' ? '▲' : '▼') : ''}
    </>
  );

  return (
    <button
      className={`hh-action-button sort-action ${
        active ? 'active' : 'inactive'
      }`}
      onClick={sortAction}
    >
      {description ? (
        <Tooltip delay={1000} tooltip={<span>{description}</span>}>
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
    </button>
  );
};

function toggle(
  currentSorter: ConfiguredSort,
  setCurrentSorter: (currentSorter: ConfiguredSort) => void,
  sorter: ConfiguredSort
): () => void {
  return () => {
    if (currentSorter.id === sorter.id) {
      const toggledSorter: ConfiguredSort = {
        ...currentSorter,
        direction: currentSorter.direction === 'asc' ? 'desc' : 'asc'
      };
      setCurrentSorter(toggledSorter);
    } else {
      setCurrentSorter(sorter);
    }
  };
}
