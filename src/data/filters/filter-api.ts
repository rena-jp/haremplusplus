import { BlessingDefinition, CommonGirlData, Team } from '../data';
import { UnknownObject } from '../game-data';
import deepEqual from 'deep-equal';

/**
 * Filter description. Can persisted to and loaded from the game settings.
 * Plain Json Object.
 */
export interface FilterConfig {
  /**
   * The ID of the filter config. The ID is used to uniquely identify
   * configs, in order to update them when their parameters change.
   */
  id: string;
  /**
   * The filter type. Used to find the Filter implementation for this config.
   */
  type: string;
  /**
   * The config parameters. Specific to each config type.
   */
  params?: UnknownObject | undefined;
}

/**
 * Filter instance. Can be created from a FilterConfig,
 * and used to apply filters to the girls list. Runtime object.
 */
export interface Filter {
  id: string;
  type?: string;
  label: string;
  includes(girl: CommonGirlData): boolean;
  getConfig(): FilterConfig;
}

export interface FilterFactory<T extends Filter> {
  type: string;
  create(
    filterConfig: FilterConfig,
    filterManager: FiltersManager,
    currentBlessing: BlessingDefinition[],
    upcomingBlessing: BlessingDefinition[],
    teams: Team[]
  ): T | undefined;
}

/**
 * The Filters Manager is used to instantiate runtime Filter instances
 * from configurable/serializable FilterConfig.
 */
export interface FiltersManager {
  createFilter(config: FilterConfig): Filter | undefined;
  persistDefaultFilter(filter: Filter): Promise<void>;
}

export namespace Filters {
  export function equals(filter1: Filter, filter2: Filter): boolean {
    return deepEqual(filter1.getConfig(), filter2.getConfig());
  }
}
