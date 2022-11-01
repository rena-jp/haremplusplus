import { BlessingDefinition, CommonGirlData } from '../data';
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
  params?: UnknownObject;
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
    upcomingBlessing: BlessingDefinition[]
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

// NEW API WIP

/**
 * The Filters Manager is used to instantiate runtime Filter instances
 * from configurable/serializable FilterConfig.
 */
// export interface FiltersManager {
//   createFilter(config: FilterConfig): Filter | undefined;
//   /**
//    * Restore the default filter state.
//    */
//   restoreDefaultFilter(): void;
//   /**
//    * Save the current filter as the new default.
//    */
//   persistDefaultFilter(): Promise<void>;
//   /**
//    * @Deprecated This should be handled by the manager directly
//    */
//   loadDefaultConfig(): Promise<FilterConfig>;
//   /**
//    * Add a new filter listener, and returns a callback
//    * to dispose the listener.
//    */
//   onFilterChange(listener: (filter: Filter) => void): () => void;
// }

export namespace Filters {
  export function equals(filter1: Filter, filter2: Filter): boolean {
    return deepEqual(filter1.getConfig(), filter2.getConfig());
  }
}
