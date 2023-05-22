import {
  BlessingDefinition,
  CommonGirlData,
  getNormalizedPower,
  getPower
} from './data';

export type SortDirection = 'asc' | 'desc';

export interface ConfiguredSort {
  sorter: Sorter;
  direction: SortDirection;
  id: string;
}

export interface Sorter {
  label: string;
  sort(girls: CommonGirlData[]): CommonGirlData[];
  description?: string;
}

export function sorter(label: string, ...comparators: Comparator[]): Sorter {
  return {
    label,
    sort: (girls) => {
      const sortedGirls = [...girls];
      sortedGirls.sort((g1, g2) => {
        for (const compare of comparators) {
          const order = compare(g1, g2);
          if (order !== 0) {
            return order;
          }
        }
        return 0;
      });
      return sortedGirls;
    }
  };
}

export type Comparator = (
  girl1: CommonGirlData,
  girl2: CommonGirlData
) => number;

export function asc(comparator: Comparator): Comparator {
  return comparator;
}
export function desc(comparator: Comparator): Comparator {
  return (g1, g2) => -1 * comparator(g1, g2);
}
export function reverse(sorter: Sorter): Sorter {
  return {
    label: `${sorter.label} ▼`,
    sort: (girls) => sorter.sort(girls).reverse()
  };
}

export function level(): Comparator {
  return (g1, g2) => (g1.level ?? 0) - (g2.level ?? 0);
}

export function maxLevel(): Comparator {
  return (g1, g2) => (g1.maxLevel ?? 0) - (g2.maxLevel ?? 0);
}

export function grade(): Comparator {
  return (g1, g2) => g1.stars - g2.stars;
}

export function maxGrade(): Comparator {
  return (g1, g2) => g1.maxStars - g2.maxStars;
}

export function recruited(): Comparator {
  return (g1, g2) => (g1.recruited ?? 0) - (g2.recruited ?? 0);
}

export function levelGroup(levelThreshold: number): Comparator {
  return (g1, g2) => {
    const lvl1 = g1.level ?? 0;
    const lvl2 = g2.level ?? 0;
    if (lvl1 >= levelThreshold && lvl2 < levelThreshold) {
      return 1;
    } else if (lvl1 < levelThreshold && lvl2 >= levelThreshold) {
      return -1;
    }
    return 0;
  };
}

export function maxLevelGroup(levelThreshold: number): Comparator {
  return (g1, g2) => {
    const lvl1 = g1.maxLevel ?? 0;
    const lvl2 = g2.maxLevel ?? 0;
    if (lvl1 >= levelThreshold && lvl2 < levelThreshold) {
      return 1;
    } else if (lvl1 < levelThreshold && lvl2 >= levelThreshold) {
      return -1;
    }
    return 0;
  };
}

export function name(): Comparator {
  return (g1, g2) =>
    g1.name.toLocaleLowerCase().localeCompare(g2.name.toLocaleLowerCase());
}

export function id(): Comparator {
  return (g1, g2) => Number(g1.id) - Number(g2.id);
}

export function own(): Comparator {
  return (g1, g2) => (g1.own === g2.own ? 0 : g1.own ? 1 : -1);
}

export function rarity(): Comparator {
  return (g1, g2) => g1.rarity - g2.rarity;
}

export function shards(): Comparator {
  return (g1, g2) => g1.shards - g2.shards;
}

export function salary(): Comparator {
  return (g1, g2) => (g1.salary ?? 0) - (g2.salary ?? 0);
}

export function potential(blessings: BlessingDefinition[]): Comparator {
  return (g1, g2) =>
    getNormalizedPower(g1, blessings) - getNormalizedPower(g2, blessings);
}

export function power(blessings: BlessingDefinition[]): Comparator {
  return (g1, g2) => getPower(g1, blessings) - getPower(g2, blessings);
}

export const LevelSorter: ConfiguredSort = {
  id: 'level',
  direction: 'desc',
  sorter: sorter(
    'Level',
    maxLevel(),
    level(),
    rarity(),
    maxGrade(),
    grade(),
    shards(),
    id()
  )
};

export const GradeSorter: ConfiguredSort = {
  id: 'grade',
  direction: 'desc',
  sorter: sorter(
    'Grade',
    grade(),
    maxGrade(),
    rarity(),
    maxLevel(),
    level(),
    shards(),
    id()
  )
};

export const SalarySorter: ConfiguredSort = {
  id: 'salary',
  direction: 'desc',
  sorter: sorter('Salary', salary(), rarity(), maxGrade(), shards(), id())
};

export const PvPValueSorter: ConfiguredSort = {
  id: 'pvpValue',
  direction: 'desc',
  sorter: {
    label: 'PvP Value',
    description:
      'Similar to sort by Grade, but places lvl 700/750 girls at a higher position',
    sort: (girls) => {
      const sortedGirls = [...girls];
      sortGirls(sortedGirls);
      return sortedGirls.reverse();
    }
  }
};

export const RaritySorter: ConfiguredSort = {
  id: 'rarity',
  direction: 'desc',
  sorter: sorter(
    'Rarity',
    rarity(),
    maxGrade(),
    grade(),
    level(),
    shards(),
    id()
  )
};

export const RecruitedSorter: ConfiguredSort = {
  id: 'date',
  direction: 'desc',
  sorter: sorter(
    'Recruitment Date',
    recruited(),
    rarity(),
    maxGrade(),
    shards(),
    id()
  )
};

export function PotentialSorter(
  sortId: string,
  label: string,
  blessings: BlessingDefinition[]
): ConfiguredSort {
  return {
    id: sortId,
    direction: 'desc',
    sorter: sorter(
      label,
      potential(blessings),
      rarity(),
      maxGrade(),
      grade(),
      level(),
      shards(),
      id()
    )
  };
}

export function PowerSorter(
  sortId: string,
  label: string,
  blessings: BlessingDefinition[]
): ConfiguredSort {
  return {
    id: sortId,
    direction: 'desc',
    sorter: sorter(
      label,
      power(blessings),
      rarity(),
      maxGrade(),
      grade(),
      level(),
      shards(),
      id()
    )
  };
}

export const CurrentPotentialID = 'current-potential';
export function CurrentPotentialSorter(
  blessings: BlessingDefinition[]
): ConfiguredSort {
  return PotentialSorter(CurrentPotentialID, 'Current Potential', blessings);
}

export const UpcomingPotentialID = 'upcoming-potential';
export function UpcomingPotentialSorter(
  blessings: BlessingDefinition[]
): ConfiguredSort {
  return PotentialSorter(UpcomingPotentialID, 'Upcoming Potential', blessings);
}

export const BasePotentialSorter = PotentialSorter(
  'base-potential',
  'Base Potential',
  []
);

export const CurrentPowerID = 'current-power';
export function CurrentPowerSorter(
  blessings: BlessingDefinition[]
): ConfiguredSort {
  return PowerSorter(CurrentPowerID, 'Current Power', blessings);
}

export const UpcomingPowerID = 'upcoming-power';
export function UpcomingPowerSorter(
  blessings: BlessingDefinition[]
): ConfiguredSort {
  return PowerSorter(UpcomingPowerID, 'Upcoming Power', blessings);
}

export const BasePowerSorter = PowerSorter('base-power', 'Base Power', []);

export function sortGirls(girls: CommonGirlData[]): void {
  girls.sort((girl1, girl2) => {
    // Owned girls always on top
    if (girl1.own !== girl2.own) {
      return girl1.own ? -1 : 1;
    }

    // 5-stars Lvl 700+ on Top
    if (
      girl1.maxLevel !== girl2.maxLevel &&
      girl1.maxStars >= 5 &&
      girl2.maxStars >= 5
    ) {
      const level1 = girl1.own ? girl1.maxLevel! : 0;
      const level2 = girl2.own ? girl2.maxLevel! : 0;

      if (level1 >= 700 || level2 >= 700) {
        // Group level 701+ on top
        if (level1 > 700 && level2 <= 700) {
          return -1;
        } else if (level1 <= 700 && level2 > 700) {
          return 1;
        }

        // Group level 700 on top
        if (level1 === 700 && level2 < 700) {
          return -1;
        } else if (level1 < 700 && level2 === 700) {
          return 1;
        }
      }
    }

    // Sort by Grade, Rarity
    if (girl1.maxStars !== girl2.maxStars) {
      return girl2.maxStars - girl1.maxStars;
    }

    if (girl1.rarity !== girl2.rarity) {
      return girl2.rarity - girl1.rarity;
    }

    if (girl1.shards !== girl2.shards) {
      return girl2.shards - girl1.shards;
    }

    // Sort by level
    if (girl1.level !== girl2.level) {
      return (girl2.level || -1) - (girl1.level || -1);
    }

    // Sort by ID
    return Number(girl1.id) - Number(girl2.id);
  });
}

export function getConfiguredSorter(
  sortConfig: SortConfig,
  currentBlessings: BlessingDefinition[],
  upcomingBlessings: BlessingDefinition[]
): ConfiguredSort | undefined {
  const direction: SortDirection =
    sortConfig.direction === 'asc' ? 'asc' : 'desc';
  switch (sortConfig.sort) {
    case LevelSorter.id:
      return { ...LevelSorter, direction };
    case GradeSorter.id:
      return { ...GradeSorter, direction };
    case SalarySorter.id:
      return { ...SalarySorter, direction };
    case RaritySorter.id:
      return { ...RaritySorter, direction };
    case RecruitedSorter.id:
      return { ...RecruitedSorter, direction };
    case BasePotentialSorter.id:
      return { ...BasePotentialSorter, direction };
    case CurrentPotentialID:
      return CurrentPotentialSorter(currentBlessings);
    case UpcomingPotentialID:
      return UpcomingPotentialSorter(upcomingBlessings);
    case PvPValueSorter.id:
      return PvPValueSorter;
    case BasePowerSorter.id:
      return BasePowerSorter;
    case CurrentPowerID:
      return CurrentPowerSorter(currentBlessings);
    case UpcomingPowerID:
      return UpcomingPowerSorter(upcomingBlessings);
  }
  console.warn('Unknown sort ID: ', sortConfig.sort);
  return undefined;
}

export interface SortConfig {
  /**
   * ID of the Sorter to use
   */
  sort: string;

  /**
   * Direction of the Sort
   */
  direction: SortDirection;
}

export const DefaultSortConfig: SortConfig = {
  sort: GradeSorter.id,
  direction: GradeSorter.direction
};
