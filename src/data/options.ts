import {
  loadDefaultFilter,
  loadDefaultSort,
  persistDefaultFilter,
  persistDefaultSort
} from './cache';
import { FilterConfig } from './filters/filter-api';
import { DefaultFilterConfig } from './filters/filter-manager';
import { DefaultSortConfig, SortConfig } from './sort';

export interface HaremOptions {
  defaultFilter: FilterConfig | undefined;
  defaultSort: SortConfig;
}

export class OptionsManager {
  private options: Promise<HaremOptions>;

  constructor() {
    this.options = this.loadOptions();
  }

  async getOptions(): Promise<HaremOptions> {
    return this.options;
  }

  async setDefaultFilter(
    filterConfig: FilterConfig | undefined
  ): Promise<void> {
    (await this.options).defaultFilter = filterConfig;
    return persistDefaultFilter(filterConfig);
  }

  async setDefaultSort(sort: SortConfig): Promise<void> {
    (await this.options).defaultSort = sort;
    return persistDefaultSort(sort);
  }

  async loadOptions(): Promise<HaremOptions> {
    const sorter = loadDefaultSort().catch(() => DefaultSortConfig);
    const filter = loadDefaultFilter().catch(() => DefaultFilterConfig);

    return {
      defaultFilter: await filter,
      defaultSort: await sorter
    };
  }
}

/**
 * Global Options Manager instance
 */
export const optionsManager = new OptionsManager();
