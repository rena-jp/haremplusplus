import { useCallback, useContext, useMemo, useState } from 'react';
import { BlessingDefinition, EventSource, Team } from '../data/data';
import { Filter } from '../data/filters/filter-api';
import {
  ClassMultiFilter,
  GradeLimitReachedFilter,
  GradeRangeFilter,
  LevelLimitReachedFilter,
  LevelRangeFilter,
  MaxGradeRangeFilter,
  MaxLevelRangeFilter,
  MinimumPotentialFilter,
  RarityMultiFilter,
  ShardsMultiFilter,
  SourceMultiFilter,
  UpgradeReadyFilter,
  EquippedFilter,
  GirlSkillsFilter,
  TeamsFilter,
  BulbFilter,
  GradeSkinFilter
} from '../data/filters/filter-runtime';
import {
  FilterHeader,
  InputControl,
  LabeledToggle,
  NumberInputWithOptions,
  NumberRangeControl,
  Range,
  ToggleList,
  ToggleOption
} from './filter-controls';
import '../style/panels.css';
import { PanelProps } from './panels';
import { FiltersContext } from '../hooks/filter-hooks';

export interface FiltersProps extends PanelProps {
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
  teams: Team[];
}

export const FiltersPanel: React.FC<FiltersProps> = ({
  visible,
  currentBlessings,
  upcomingBlessings,
  teams
}) => {
  const className = `panel filters ${visible ? 'visible' : 'hidden'}`;

  const {
    filters,
    activeFilter,
    clearFilters,
    removeFilter,
    updateFilter,
    getActiveFilter,
    restoreDefaultFilter: restoreDefault,
    persistDefaultFilter: persistDefault,
    isDefaultFilter
  } = useContext(FiltersContext);

  const filterLabel = activeFilter.label;

  return (
    <div className={className}>
      <p>Active filter: {filterLabel}</p>
      <div className="manage-filters">
        <button
          className="hh-action-button"
          disabled={filters.length === 0}
          onClick={() => {
            clearFilters();
          }}
        >
          Clear filters
        </button>
        <button
          className="hh-action-button"
          disabled={isDefaultFilter}
          onClick={() => {
            persistDefault();
          }}
        >
          Save as Default
        </button>
        <button
          className="hh-action-button"
          disabled={isDefaultFilter}
          onClick={() => {
            restoreDefault();
          }}
        >
          Restore Default
        </button>
      </div>
      <div className="filters-list">
        <GradeForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <MaxGradeForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <LevelForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <MaxLevelForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <RarityForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <TeamsForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
          teams={teams}
        />
        <PotentialForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
        />
        <LevelCapReachedForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />

        <AffectionCapReachedForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <ShardsForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <SourceForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <UpgradeReadyForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <ClassForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <EquippedForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <GirlSkillsForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <BulbForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <GradeSkinForm
          getActiveFilter={getActiveFilter}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
      </div>
    </div>
  );
};

const MaxGradeForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const createFilter = useCallback((range: Range) => {
    return range.min !== undefined || range.max !== undefined
      ? new MaxGradeRangeFilter(range.min, range.max)
      : undefined;
  }, []);

  const getRange = useCallback((filter: Filter) => {
    const params = filter.getConfig()?.params;
    const min = getNumberParam(params?.minStars);
    const max = getNumberParam(params?.maxStars);
    return { min, max };
  }, []);

  return (
    <RangeForm
      label="Max Grade"
      description="Filter by the maximum grade (number of stars) the girl can reach"
      createFilter={createFilter}
      filterId={MaxGradeRangeFilter.ID}
      getRange={getRange}
      removeFilter={removeFilter}
      updateFilter={updateFilter}
      getActiveFilter={getActiveFilter}
    />
  );
};

const GradeForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const createFilter = useCallback((range: Range) => {
    return range.min !== undefined || range.max !== undefined
      ? new GradeRangeFilter(range.min, range.max)
      : undefined;
  }, []);

  const getRange = useCallback((filter: Filter) => {
    const params = filter.getConfig()?.params;
    const min = getNumberParam(params?.minStars);
    const max = getNumberParam(params?.maxStars);
    return { min, max };
  }, []);

  return (
    <RangeForm
      label="Grade"
      description="Filter by grade (number of stars) currently unlocked"
      createFilter={createFilter}
      filterId={GradeRangeFilter.ID}
      getRange={getRange}
      removeFilter={removeFilter}
      updateFilter={updateFilter}
      getActiveFilter={getActiveFilter}
    />
  );
};

const LevelForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const createFilter = useCallback((range: Range) => {
    return range.min !== undefined || range.max !== undefined
      ? new LevelRangeFilter(range.min, range.max)
      : undefined;
  }, []);

  const getRange = useCallback((filter: Filter) => {
    const params = filter.getConfig()?.params;
    const min = getNumberParam(params?.minLevel);
    const max = getNumberParam(params?.maxLevel);
    return { min, max };
  }, []);

  return (
    <RangeForm
      label="Level"
      description="Filter by girl level (Min: 0, Max: 750)"
      createFilter={createFilter}
      filterId={LevelRangeFilter.ID}
      getRange={getRange}
      removeFilter={removeFilter}
      updateFilter={updateFilter}
      getActiveFilter={getActiveFilter}
    />
  );
};

const MaxLevelForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const createFilter = useCallback((range: Range) => {
    return range.min !== undefined || range.max !== undefined
      ? new MaxLevelRangeFilter(range.min, range.max)
      : undefined;
  }, []);

  const getRange = useCallback((filter: Filter) => {
    const params = filter.getConfig()?.params;
    const min = getNumberParam(params?.minLevel);
    const max = getNumberParam(params?.maxLevel);
    return { min, max };
  }, []);

  return (
    <RangeForm
      label="Level Cap"
      description="Filter by girl level cap (Awakening cap)"
      createFilter={createFilter}
      filterId={MaxLevelRangeFilter.ID}
      getRange={getRange}
      removeFilter={removeFilter}
      updateFilter={updateFilter}
      getActiveFilter={getActiveFilter}
    />
  );
};

const LevelCapReachedForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Reached',
        description: 'Level Cap Reached'
      },
      {
        label: 'Not Reached',
        description: 'Level Cap not Reached'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    return values.every((v) => !v)
      ? undefined
      : new LevelLimitReachedFilter(values[0] === true);
  }, []);

  const getValues = useCallback((filter: Filter) => {
    if (filter instanceof LevelLimitReachedFilter) {
      return filter.reached ? [true, false] : [false, true];
    } else {
      return [false, false];
    }
  }, []);

  return (
    <ToggleOptionsForm
      label="Level Cap"
      description="Filter girls who have reached (or not) their level cap"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={false}
      filterId={LevelLimitReachedFilter.ID}
    />
  );
};

const AffectionCapReachedForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Reached',
        description: 'Affection Cap Reached'
      },
      {
        label: 'Not Reached',
        description: 'Affection Cap not Reached'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    if (values.every((v) => !v)) {
      return undefined;
    }
    const reached = values[0];
    return new GradeLimitReachedFilter(reached);
  }, []);

  const getValues = useCallback((filter: Filter) => {
    if (filter instanceof GradeLimitReachedFilter) {
      return filter.reached ? [true, false] : [false, true];
    }
    return [false, false];
  }, []);

  return (
    <ToggleOptionsForm
      label="Affection Cap"
      description="Filter girls who have reached (or not) their affection cap"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={false}
      filterId={GradeLimitReachedFilter.ID}
    />
  );
};

const ShardsForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: '100 Shards',
        description: 'Filters girls with 100 Shards (Owned girls)'
      },
      {
        label: 'Some Shards',
        description: 'Filters girls with 1-99 Shards'
      },
      {
        label: '40+ Shards',
        description: 'Filters girls with 40-99 Shards (Eligible in SM shop)'
      },
      {
        label: 'No Shards',
        description: 'Filters girls with No Shards'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    if (values.every((v) => !v)) {
      return undefined;
    }
    return new ShardsMultiFilter(values[0], values[1], values[3], values[2]);
  }, []);

  const getValues = useCallback((filter: Filter) => {
    if (filter instanceof ShardsMultiFilter) {
      const values = [false, false, false];
      if (filter !== undefined) {
        values[0] = filter.allShards;
        values[1] = filter.someShards;
        values[3] = filter.noShards;
        values[2] = filter.smShards;
        return values;
      }
    }
    return options.map((_opt) => false);
  }, []);

  return (
    <ToggleOptionsForm
      label="Shards"
      description="Filter girls based on the number of shards you have"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={true}
      filterId={ShardsMultiFilter.ID}
    />
  );
};

const RarityForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Starting',
        description: 'Filters Starting girls'
      },
      {
        label: 'Common',
        description: 'Filters Common girls'
      },
      {
        label: 'Rare',
        description: 'Filters Rare girls'
      },
      {
        label: 'Epic',
        description: 'Filters Epic girls'
      },
      {
        label: 'Legendary',
        description: 'Filters Legendary girls'
      },
      {
        label: 'Mythic',
        description: 'Filters Mythic girls'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    if (values.every((v) => !v)) {
      return undefined;
    }
    return new RarityMultiFilter(
      values[0],
      values[1],
      values[2],
      values[3],
      values[4],
      values[5]
    );
  }, []);

  const getValues = useCallback((filter: Filter) => {
    const values = options.map((_opt) => false);
    if (filter instanceof RarityMultiFilter) {
      values[0] = filter.starting;
      values[1] = filter.common;
      values[2] = filter.rare;
      values[3] = filter.epic;
      values[4] = filter.legendary;
      values[5] = filter.mythic;
    }
    return values;
  }, []);

  return (
    <ToggleOptionsForm
      label="Rarity"
      description="Filter girls by rarity"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={true}
      cssClasses={['rarity']}
      filterId={RarityMultiFilter.ID}
    />
  );
};

interface SourceToggleOption extends ToggleOption {
  source: EventSource;
}

const SourceForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<SourceToggleOption[]>(
    () => [
      {
        label: 'Mythic',
        description: 'Filters girls from the Mythic Pachinko',
        source: 'MP'
      },
      {
        label: 'Epic',
        description: 'Filters girls from the Epic Pachinko',
        source: 'EP'
      },
      {
        label: 'Great',
        description: 'Filters girls from the Great Pachinko',
        source: 'GP'
      },
      {
        label: 'Event',
        description: 'Filters girls from the Event Pachinko',
        source: 'EvP'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    if (values.every((v) => !v)) {
      return undefined;
    }
    const sources: EventSource[] = values
      .map((value, index) => {
        return value ? options[index].source : undefined;
      })
      .filter((optSource) => optSource !== undefined)
      .map((optSource) => optSource!);
    return new SourceMultiFilter(sources);
  }, []);

  const getValues = useCallback((filter: Filter) => {
    return filter instanceof SourceMultiFilter
      ? options.map((option) => filter.sources.includes(option.source))
      : options.map(() => false);
  }, []);

  return (
    <ToggleOptionsForm
      label="Pachinko"
      description="Filter girls from Pachinko"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={false}
      filterId={SourceMultiFilter.ID}
    />
  );
};

const UpgradeReadyForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Ready to Upgrade',
        description: 'Filter girls that are ready to upgrade'
      },
      {
        label: 'Not ready',
        description: 'Filter girls that are not ready to upgrade'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    return values.every((v) => !v)
      ? undefined
      : new UpgradeReadyFilter(values[0] === true);
  }, []);

  const getValues = useCallback((filter: Filter) => {
    if (filter instanceof UpgradeReadyFilter) {
      return filter.ready ? [true, false] : [false, true];
    } else {
      return [false, false];
    }
  }, []);

  return (
    <ToggleOptionsForm
      label="Ready to Upgrade"
      description="Filter girls that are (not) ready to upgrade"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={false}
      filterId={UpgradeReadyFilter.ID}
    />
  );
};

const EquippedForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Equipped',
        description: 'Filter girls that have at least one item equipped'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    return values[0] ? new EquippedFilter() : undefined;
  }, []);

  const getValues = useCallback((filter: Filter) => {
    return filter instanceof EquippedFilter ? [true] : [false];
  }, []);

  return (
    <ToggleOptionsForm
      label="Equipped Girls"
      description="Filter girls that have at least one item equipped"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={false}
      filterId={EquippedFilter.ID}
    />
  );
};

const GirlSkillsForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const activeFilter = getActiveFilter(GirlSkillsFilter.ID);

  const [localFilter, setLocalFilter] = useState(activeFilter);

  const filterToDisplay = activeFilter ?? localFilter;

  if (localFilter !== filterToDisplay) {
    setLocalFilter(filterToDisplay);
  }

  const values = useMemo(() => {
    if (filterToDisplay instanceof GirlSkillsFilter) {
      return [...filterToDisplay.params];
    } else {
      return Array(6).fill(false);
    }
  }, [filterToDisplay]);

  const clear = useCallback(() => {
    if (localFilter !== undefined) {
      removeFilter(localFilter);
    }
  }, [localFilter]);

  const reapply = useMemo(() => {
    if (localFilter === undefined) return undefined;
    return () => {
      updateFilter(localFilter);
    };
  }, [localFilter]);

  const setActive = useCallback(
    (active: boolean) => {
      if (active && localFilter !== undefined) {
        updateFilter(localFilter);
      }
    },
    [localFilter]
  );

  const options = useMemo<ToggleOption[]>(
    () =>
      [...Array(6)].map((_, i) => ({
        label: `Skill ${i}`,
        description: `Filter girls that have just reached skill ${i}`
      })),
    []
  );

  const setValue = useCallback(
    (option: ToggleOption, value: boolean) => {
      const index = options.indexOf(option);
      values[index] = value;

      const newValues = [...Array(6)].map((_, i) => values[i] === true);
      const newFilter = newValues.every((v) => !v)
        ? undefined
        : new GirlSkillsFilter(newValues);

      if (newFilter === undefined) {
        if (localFilter !== undefined) {
          removeFilter(localFilter);
          setLocalFilter(undefined);
        }
      } else {
        updateFilter(newFilter);
        setLocalFilter(newFilter);
      }
    },
    [values, localFilter]
  );

  const isActive = activeFilter !== undefined;

  const toggleNotZero = useCallback(() => {
    const isPressed = !values[0] && values.slice(1).every(Boolean);
    if (isActive && isPressed) {
      if (localFilter !== undefined) {
        removeFilter(localFilter);
        setLocalFilter(undefined);
      }
    } else {
      const newFilter = new GirlSkillsFilter([false, ...Array(5).fill(true)]);
      updateFilter(newFilter);
      setLocalFilter(newFilter);
    }
  }, [isActive, localFilter]);

  return (
    <div className={`filter-entry${isActive ? '' : ' inactive'} skills`}>
      <FilterHeader
        label="Girl skills"
        description="Filter girl skills"
        isActive={isActive}
        clear={clear}
        reapply={reapply}
      />
      <ToggleList
        options={options}
        values={values}
        setValue={setValue}
        isActive={isActive}
        setActive={setActive}
      />
      <button
        className="toggle hh-action-button notpressed"
        onClick={toggleNotZero}
        title="Not 0"
      >
        Not 0
      </button>
    </div>
  );
};

const BulbForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Maxed bulbs',
        description: 'Filter girls that have maxed bulbs'
      },
      {
        label: 'Some bulbs',
        description: 'Filter girls that have at least one bulb but not maxed'
      },
      {
        label: 'No bulbs',
        description: 'Filter girls that have no bulbs'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    return values.every((v) => !v)
      ? undefined
      : new BulbFilter(
          values[0] === true,
          values[1] === true,
          values[2] === true
        );
  }, []);

  const getValues = useCallback((filter: Filter) => {
    if (filter instanceof BulbFilter) {
      return [filter.maxedBulbs, filter.someBulbs, filter.noBulbs];
    } else {
      return Array(3).fill(false);
    }
  }, []);

  return (
    <ToggleOptionsForm
      label="Bulb"
      description="Filter bulb"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={true}
      filterId={BulbFilter.ID}
    />
  );
};

const GradeSkinForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Owned skins',
        description: 'Filter girls that have at least one owned skins'
      },
      {
        label: 'Unowned skins',
        description: 'Filter girls that have at least one unowned skins'
      },
      {
        label: 'No skins',
        description: 'Filter girls that have no skins'
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    return values.every((v) => !v)
      ? undefined
      : new GradeSkinFilter(
          values[0] === true,
          values[1] === true,
          values[2] === true
        );
  }, []);

  const getValues = useCallback((filter: Filter) => {
    if (filter instanceof GradeSkinFilter) {
      return [filter.hasOwnedSkins, filter.hasUnownedSkins, filter.noSkins];
    } else {
      return Array(3).fill(false);
    }
  }, []);

  return (
    <ToggleOptionsForm
      label="Skin"
      description="Filter skin"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={true}
      filterId={GradeSkinFilter.ID}
    />
  );
};

const ClassForm: React.FC<FormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Hardcore',
        description: 'Filters Hardcore girls',
        styleClasses: ['qh-class', 'hardcore']
      },
      {
        label: 'Charm',
        description: 'Filters Charm girls',
        styleClasses: ['qh-class', 'charm']
      },
      {
        label: 'Knowhow',
        description: 'Filters Knowhow girls',
        styleClasses: ['qh-class', 'knowhow']
      }
    ],
    []
  );

  const createFilter = useCallback((values: boolean[]) => {
    if (values.every((v) => !v)) {
      return undefined;
    }
    return new ClassMultiFilter(values[0], values[1], values[2]);
  }, []);

  const getValues = useCallback((filter: Filter) => {
    const values = options.map((_opt) => false);
    if (filter instanceof ClassMultiFilter) {
      values[0] = filter.hardcore;
      values[1] = filter.charm;
      values[2] = filter.knowhow;
    }
    return values;
  }, []);

  return (
    <ToggleOptionsForm
      label="Class"
      description="Filter girls by class"
      options={options}
      getValues={getValues}
      createFilter={createFilter}
      getActiveFilter={getActiveFilter}
      updateFilter={updateFilter}
      removeFilter={removeFilter}
      multipleChoices={true}
      filterId={ClassMultiFilter.ID}
    />
  );
};

interface PotentialFormProps extends FormProps {
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
}

const PotentialForm: React.FC<PotentialFormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter,
  currentBlessings,
  upcomingBlessings
}) => {
  const options = useMemo<ToggleOption[]>(
    () => [
      {
        label: 'Base',
        description: 'Base Potential (No blessings)'
      },
      {
        label: 'Current',
        description: 'Current Potential (Current blessings)'
      },
      {
        label: 'Upcoming',
        description: 'Upcoming Potential (Upcoming blessings)'
      }
    ],
    []
  );

  const activeFilter = getActiveFilter(MinimumPotentialFilter.ID);
  const active = activeFilter !== undefined;

  const [localFilter, setLocalFilter] = useState(activeFilter);

  if (activeFilter !== undefined && localFilter !== activeFilter) {
    setLocalFilter(activeFilter);
  }

  const filterToDisplay = useMemo(
    () => (active ? activeFilter : localFilter),
    [activeFilter, localFilter]
  );

  const getValues = useCallback((filter: Filter | undefined) => {
    if (filter instanceof MinimumPotentialFilter) {
      switch (filter.blessing) {
        case 'none':
          return [true, false, false];
        case 'current':
          return [false, true, false];
        case 'upcoming':
          return [false, false, true];
      }
    }
    return [false, false, false];
  }, []);

  const values = useMemo(
    () =>
      filterToDisplay === undefined
        ? options.map((_opt) => false)
        : getValues(filterToDisplay),
    [filterToDisplay, getValues]
  );

  const clear = useCallback(() => {
    if (localFilter !== undefined) {
      removeFilter(localFilter);
    }
  }, [localFilter]);

  const reapply = useMemo(() => {
    if (localFilter !== undefined) {
      return () => {
        updateFilter(localFilter);
      };
    }
    return undefined;
  }, [localFilter]);

  const [threshold, setThreshold] = useState<number | undefined>(() => {
    return filterToDisplay instanceof MinimumPotentialFilter
      ? filterToDisplay.threshold
      : 28.57;
  });

  // Update filter when Value or Threshold changes

  const createFilter = useCallback<
    (
      values: boolean[],
      threshold: number | undefined
    ) => MinimumPotentialFilter | undefined
  >(
    (values, threshold) => {
      if (threshold === undefined) {
        return undefined;
      }
      if (values.length !== 3) {
        return undefined;
      }
      if (values.every((v) => !v)) {
        return undefined;
      }
      const blessing = values[0] ? 'none' : values[1] ? 'current' : 'upcoming';
      const blessingDefinition =
        blessing === 'none'
          ? undefined
          : blessing === 'current'
            ? currentBlessings
            : upcomingBlessings;
      return new MinimumPotentialFilter(
        threshold,
        blessing,
        blessingDefinition
      );
    },
    [currentBlessings, upcomingBlessings]
  );

  const createAndSetFilter = useCallback(
    (values: boolean[], threshold: number | undefined) => {
      const newFilter = createFilter(values, threshold);

      if (newFilter === undefined) {
        if (localFilter !== undefined) {
          removeFilter(localFilter);
          setLocalFilter(undefined);
        }
      } else {
        updateFilter(newFilter);
        setLocalFilter(newFilter);
      }
    },
    [createFilter, removeFilter, setLocalFilter, updateFilter, localFilter]
  );

  const setValue = useCallback(
    (option: ToggleOption, value: boolean) => {
      const index = options.indexOf(option);
      values[index] = value;
      if (value) {
        for (let i = 0; i < values.length; i++) {
          if (i !== index) {
            values[i] = false;
          }
        }
      }

      createAndSetFilter(values, threshold);
    },
    [values, localFilter, createAndSetFilter, threshold]
  );

  const updateThreshold = useCallback(
    (threshold: number | undefined) => {
      setThreshold(threshold);
      createAndSetFilter(values, threshold);
    },
    [values]
  );

  const setActive = useCallback(
    (active: boolean) => {
      if (active && reapply !== undefined) {
        reapply();
      }
    },
    [reapply]
  );

  return (
    <NumberInputWithOptions
      label="Potential power"
      cssClasses={['power']}
      description={`Filter girls who have a potential power above the selected threshold
(Normalized value, e.g. 25 for most L5 girls, 28.56 for M6)`}
      setInput={updateThreshold}
      input={threshold}
      reapply={reapply}
      setActive={setActive}
      isActive={active}
      values={values}
      setValue={setValue}
      options={options}
      clear={clear}
    />
  );
};

interface TeamsFormProps extends FormProps {
  teams: Team[];
}

const TeamsForm: React.FC<TeamsFormProps> = ({
  getActiveFilter,
  updateFilter,
  removeFilter,
  teams
}) => {
  const createFilter = useCallback(
    (input: string) => {
      return new TeamsFilter(input, teams);
    },
    [teams]
  );

  const getInput = useCallback((filter: Filter) => {
    const params = filter.getConfig()?.params;
    const input = getStringParam(params?.include);
    return input ?? '';
  }, []);

  return (
    <InputForm
      label="Teams"
      description="Filter girls that belong to a Team. Use optional range for specific teams, e.g. 1; 3-5"
      createFilter={createFilter}
      getInput={getInput}
      removeFilter={removeFilter}
      updateFilter={updateFilter}
      getActiveFilter={getActiveFilter}
      filterId={TeamsFilter.ID}
    />
  );
};

function getNumberParam(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function getStringParam(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

interface FormProps {
  updateFilter(filter: Filter): void;
  removeFilter(filter: Filter): void;
  getActiveFilter(filterId: string): Filter | undefined;
  cssClasses?: string[];
}

interface LabeledProps {
  label: string;
  description: string;
}

interface InputFormProps extends FormProps, LabeledProps {
  createFilter(input: string): Filter | undefined;
  getInput(filter: Filter): string;
  filterId: string;
}

const InputForm: React.FC<InputFormProps> = ({
  label,
  description,
  updateFilter,
  removeFilter,
  getActiveFilter,
  createFilter,
  filterId,
  getInput
}) => {
  const activeFilter = getActiveFilter(filterId);
  const active = activeFilter !== undefined;

  const [localFilter, setLocalFilter] = useState<Filter | undefined>(
    activeFilter
  );

  // If the filter is active: display input from props (currently applied filter).
  // Otherwise: display input from saved (disabled) filter. This allows saving
  // the input values while the filter is disabled, to easily restore it later on.
  const filterToDisplay = useMemo(
    () => (active ? activeFilter : localFilter),
    [activeFilter, localFilter]
  );

  if (activeFilter !== undefined && localFilter !== activeFilter) {
    // The filter was updated externally (e.g. via restore defaults).
    // In this case, update our local values.
    setLocalFilter(activeFilter);
  }

  const input = useMemo<string>(
    () => (filterToDisplay === undefined ? '' : getInput(filterToDisplay)),
    [filterToDisplay]
  );

  const setInput = useCallback(
    (input: string) => {
      const newFilter = createFilter(input);
      if (newFilter) {
        // Valid; Enable or Update
        updateFilter(newFilter);
        setLocalFilter(newFilter);
      } else {
        // Invalid; Disable
        if (localFilter !== undefined) {
          removeFilter(localFilter);
        }
        setLocalFilter(undefined);
      }
    },
    [localFilter, createFilter]
  );

  const clear = useCallback(() => {
    if (localFilter !== undefined) {
      removeFilter(localFilter);
    }
  }, [localFilter]);

  const reapply = useMemo(() => {
    if (localFilter !== undefined) {
      return () => {
        const newLocalFilter = createFilter(getInput(localFilter));
        if (newLocalFilter !== undefined) {
          setLocalFilter(newLocalFilter);
          updateFilter(newLocalFilter);
        }
      };
    } else {
      return () => {
        const newLocalFilter = createFilter('');
        if (newLocalFilter !== undefined) {
          setLocalFilter(newLocalFilter);
          updateFilter(newLocalFilter);
        }
      };
    }
  }, [localFilter, createFilter, setLocalFilter, updateFilter]);

  return (
    <InputControl
      label={label}
      description={description}
      input={input}
      isActive={active}
      setInput={setInput}
      clear={clear}
      reapply={reapply}
    />
  );
};

interface RangeFormProps extends FormProps, LabeledProps {
  createFilter(range: Range): Filter | undefined;
  filterId: string;
  getRange(filter: Filter): Range;
}

const RangeForm: React.FC<RangeFormProps> = ({
  label,
  description,
  updateFilter,
  removeFilter,
  getActiveFilter,
  createFilter,
  filterId,
  getRange
}) => {
  const activeFilter = getActiveFilter(filterId);
  const active = activeFilter !== undefined;

  const [localFilter, setLocalFilter] = useState<Filter | undefined>(
    activeFilter
  );

  // If the filter is active: display min/max from props (currently applied filter).
  // Otherwise: display min/max from saved (disabled) filter. This allows saving
  // the input values while the filter is disabled, to easily restore it later on.
  const filterToDisplay = useMemo(
    () => (active ? activeFilter : localFilter),
    [activeFilter, localFilter]
  );

  if (activeFilter !== undefined && localFilter !== activeFilter) {
    // The filter was updated externally (e.g. via restore defaults).
    // In this case, update our local values.
    setLocalFilter(activeFilter);
  }

  const range = useMemo<Range>(
    () =>
      filterToDisplay === undefined
        ? { min: undefined, max: undefined }
        : getRange(filterToDisplay),
    [filterToDisplay]
  );

  const setRange = useCallback(
    (range: Range) => {
      const newFilter = createFilter(range);
      if (newFilter) {
        // Valid; Enable or Update
        updateFilter(newFilter);
        setLocalFilter(newFilter);
      } else {
        // Invalid; Disable
        if (localFilter !== undefined) {
          removeFilter(localFilter);
        }
        setLocalFilter(undefined);
      }
    },
    [localFilter]
  );

  const clear = useCallback(() => {
    if (localFilter !== undefined) {
      removeFilter(localFilter);
    }
  }, [localFilter]);

  const reapply = useMemo(() => {
    if (localFilter !== undefined) {
      return () => {
        updateFilter(localFilter);
      };
    }
    return undefined;
  }, [localFilter]);

  return (
    <NumberRangeControl
      label={label}
      description={description}
      range={range}
      isActive={active}
      setRange={setRange}
      clear={clear}
      reapply={reapply}
    />
  );
};

interface ToggleOptionsFormProps extends FormProps, LabeledProps {
  options: ToggleOption[];
  createFilter(values: boolean[]): Filter | undefined;
  getValues(filter: Filter): boolean[];
  filterId: string;
  multipleChoices: boolean;
}

const ToggleOptionsForm: React.FC<ToggleOptionsFormProps> = ({
  label,
  description,
  options,
  removeFilter,
  updateFilter,
  createFilter,
  filterId,
  getActiveFilter,
  getValues,
  multipleChoices,
  cssClasses
}) => {
  const activeFilter = getActiveFilter(filterId);
  const active = activeFilter !== undefined;

  const [localFilter, setLocalFilter] = useState(activeFilter);

  if (activeFilter !== undefined && localFilter !== activeFilter) {
    setLocalFilter(activeFilter);
  }

  const filterToDisplay = useMemo(
    () => (active ? activeFilter : localFilter),
    [activeFilter, localFilter]
  );

  const values = useMemo(
    () =>
      filterToDisplay === undefined
        ? options.map((_opt) => false)
        : getValues(filterToDisplay),
    [filterToDisplay, getValues]
  );

  const clear = useCallback(() => {
    if (localFilter !== undefined) {
      removeFilter(localFilter);
    }
  }, [localFilter]);

  const reapply = useMemo(() => {
    if (localFilter !== undefined) {
      return () => {
        updateFilter(localFilter);
      };
    }
    return undefined;
  }, [localFilter]);

  const setValue = useCallback(
    (option: ToggleOption, value: boolean) => {
      const index = options.indexOf(option);
      values[index] = value;
      if (value && !multipleChoices) {
        for (let i = 0; i < values.length; i++) {
          if (i !== index) {
            values[i] = false;
          }
        }
      }

      const newFilter = createFilter(values);

      if (newFilter === undefined) {
        if (localFilter !== undefined) {
          removeFilter(localFilter);
          setLocalFilter(undefined);
        }
      } else {
        updateFilter(newFilter);
        setLocalFilter(newFilter);
      }
    },
    [values, localFilter]
  );

  const setActive = useCallback(
    (active: boolean) => {
      if (localFilter !== undefined) {
        if (active) {
          updateFilter(localFilter);
        } else {
          removeFilter(localFilter);
        }
      }
    },
    [localFilter]
  );

  return (
    <LabeledToggle
      label={label}
      description={description}
      clear={clear}
      isActive={active}
      reapply={reapply}
      setActive={setActive}
      setValue={setValue}
      values={values}
      options={options}
      cssClasses={cssClasses}
    />
  );
};
