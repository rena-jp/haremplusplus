import {
  Filter,
  FilterConfig,
  FilterFactory,
  FiltersManager
} from './filter-api';
import deepEqual from 'deep-equal';
import {
  GradeLimitReachedFilter,
  GradeRangeFilter,
  LevelLimitReachedFilter,
  LevelRangeFilter,
  MaxGradeRangeFilter,
  MaxLevelRangeFilter,
  MinimumPotentialFilter,
  RarityMultiFilter,
  RootFilter,
  ShardsMultiFilter,
  SourceMultiFilter,
  UpgradeReadyFilter
} from './filter-runtime';
import { BlessingDefinition } from '../data';
import { optionsManager } from '../options';

export class FiltersManagerImpl implements FiltersManager {
  private configHandlers: Map<string, FilterFactory<Filter>> = new Map();

  constructor(
    private currentBlessing: BlessingDefinition[],
    private upcomingBlessing: BlessingDefinition[]
  ) {
    this.register(GradeRangeFilter.FACTORY);
    this.register(MaxGradeRangeFilter.FACTORY);
    this.register(GradeLimitReachedFilter.FACTORY);

    this.register(LevelRangeFilter.FACTORY);
    this.register(MaxLevelRangeFilter.FACTORY);
    this.register(LevelLimitReachedFilter.FACTORY);

    this.register(UpgradeReadyFilter.FACTORY);
    this.register(MinimumPotentialFilter.FACTORY);

    this.register(RarityMultiFilter.FACTORY);

    this.register(ShardsMultiFilter.FACTORY);
    this.register(SourceMultiFilter.FACTORY);

    this.register(RootFilter.FACTORY);
  }

  private register(factory: FilterFactory<Filter>): void {
    this.configHandlers.set(factory.type, factory);
  }

  createFilter(config: FilterConfig): Filter | undefined {
    const factory = this.getFilterFactory(config.type ?? config.id);
    if (factory) {
      return factory.create(
        config,
        this,
        this.currentBlessing,
        this.upcomingBlessing
      );
    }
    console.error(
      'Failed to create filter. Unknown filter type: ' +
        (config.type ?? config.id)
    );
    return undefined;
  }

  persistDefaultFilter(filter: Filter): Promise<void> {
    const config = filter?.getConfig();
    return optionsManager.setDefaultFilter(config);
  }

  getFilterFactory(configId: string): FilterFactory<Filter> | undefined {
    return this.configHandlers.get(configId);
  }
}

export const DefaultFilterConfig = new MaxGradeRangeFilter(5).getConfig();

export function filtersEqual(filter1: Filter, filter2: Filter): boolean {
  return deepEqual(filter1.getConfig(), filter2.getConfig());
}

export function configsEqual(
  config1: FilterConfig,
  config2: FilterConfig
): boolean {
  return deepEqual(config1, config2);
}
