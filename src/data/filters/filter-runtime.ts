import { roundValue } from '../common';
import {
  BlessingDefinition,
  Class,
  CommonGirlData,
  EventSource,
  getBasePower,
  getBlessedStats,
  isEventSource,
  Rarity,
  Team
} from '../data';
import { UnknownObject } from '../game-data';
import { Filter, FilterConfig, FilterFactory } from './filter-api';

export abstract class AbstractFilter implements Filter {
  abstract id: string;
  type?: string = undefined;
  label = '';
  abstract includes(girl: CommonGirlData): boolean;
  getConfig(): FilterConfig {
    const config = {
      id: this.id,
      type: this.type ?? this.id,
      params: this.getParams()
    };
    return config;
  }
  abstract getParams(): UnknownObject | undefined;
}

export class GradeRangeFilter extends AbstractFilter {
  static ID = 'grade-range';
  id = GradeRangeFilter.ID;

  constructor(
    public minStars?: number,
    public maxStars?: number
  ) {
    super();
    this.label =
      maxStars === undefined
        ? `Grade: ≥ ${minStars}`
        : minStars === undefined
          ? `Grade: ≤ ${maxStars}`
          : maxStars === minStars
            ? `Grade: ${minStars}`
            : `Grade: ${minStars}-${maxStars}`;
  }

  includes(girl: CommonGirlData): boolean {
    return (
      (this.minStars === undefined || girl.stars >= this.minStars) &&
      (this.maxStars === undefined || girl.stars <= this.maxStars)
    );
  }

  getParams() {
    return {
      minStars: this.minStars,
      maxStars: this.maxStars
    };
  }

  static FACTORY: FilterFactory<GradeRangeFilter> = {
    type: GradeRangeFilter.ID,
    create: (config) => {
      const minStars = numberParam(config, 'minStars');
      const maxStars = numberParam(config, 'maxStars');
      if (minStars) {
        return new GradeRangeFilter(minStars, maxStars);
      }
      return undefined;
    }
  };
}

export class MaxGradeRangeFilter extends AbstractFilter {
  static ID = 'max-grade-range';
  id = MaxGradeRangeFilter.ID;

  constructor(
    public minStars?: number,
    public maxStars?: number
  ) {
    super();
    this.label =
      maxStars === undefined
        ? `Max Grade: ≥ ${minStars}`
        : minStars === undefined
          ? `Max Grade: ≤ ${maxStars}`
          : maxStars === minStars
            ? `Max Grade: ${minStars}`
            : `Max Grade: ${minStars}-${maxStars}`;
  }

  includes(girl: CommonGirlData): boolean {
    return (
      (this.minStars === undefined || girl.maxStars >= this.minStars) &&
      (this.maxStars === undefined || girl.maxStars <= this.maxStars)
    );
  }

  getParams() {
    return {
      minStars: this.minStars,
      maxStars: this.maxStars
    };
  }

  static FACTORY: FilterFactory<MaxGradeRangeFilter> = {
    type: MaxGradeRangeFilter.ID,
    create: (config) => {
      const minStars = numberParam(config, 'minStars');
      const maxStars = numberParam(config, 'maxStars');
      if (minStars) {
        return new MaxGradeRangeFilter(minStars, maxStars);
      }
      return undefined;
    }
  };
}

export class LevelRangeFilter extends AbstractFilter {
  static ID = 'level-range';
  id = LevelRangeFilter.ID;

  constructor(
    public minLevel?: number,
    public maxLevel?: number
  ) {
    super();
    this.label =
      maxLevel === undefined
        ? `Level: ≥ ${minLevel}`
        : minLevel === undefined
          ? `Level: ≤ ${maxLevel}`
          : maxLevel === minLevel
            ? `Level: ${minLevel}`
            : `Level: ${minLevel}-${maxLevel}`;
  }

  includes(girl: CommonGirlData): boolean {
    const level = girl.level ?? 0;
    return (
      (this.minLevel === undefined || level >= this.minLevel) &&
      (this.maxLevel === undefined || level <= this.maxLevel)
    );
  }

  getParams() {
    return {
      minLevel: this.minLevel,
      maxLevel: this.maxLevel
    };
  }

  static FACTORY: FilterFactory<LevelRangeFilter> = {
    type: LevelRangeFilter.ID,
    create: (config) => {
      const minLevel = numberParam(config, 'minLevel');
      const maxLevel = numberParam(config, 'maxLevel');
      if (minLevel) {
        return new LevelRangeFilter(minLevel, maxLevel);
      }
      return undefined;
    }
  };
}

export class MaxLevelRangeFilter extends AbstractFilter {
  static ID = 'max-level-range';
  id = MaxLevelRangeFilter.ID;

  constructor(
    public minLevel?: number,
    public maxLevel?: number
  ) {
    super();
    this.label =
      maxLevel === undefined
        ? `Level Cap Range: ≥ ${minLevel}`
        : minLevel === undefined
          ? `Level Cap Range: ≤ ${maxLevel}`
          : maxLevel === minLevel
            ? `Level Cap: ${minLevel}`
            : `Level Cap Range: ${minLevel}-${maxLevel}`;
  }

  includes(girl: CommonGirlData): boolean {
    const levelCap = girl.maxLevel ?? 250;
    return (
      (this.minLevel === undefined || levelCap >= this.minLevel) &&
      (this.maxLevel === undefined || levelCap <= this.maxLevel)
    );
  }

  getParams() {
    return {
      minLevel: this.minLevel,
      maxLevel: this.maxLevel
    };
  }

  static FACTORY: FilterFactory<MaxLevelRangeFilter> = {
    type: MaxLevelRangeFilter.ID,
    create: (config) => {
      const minLevel = numberParam(config, 'minLevel');
      const maxLevel = numberParam(config, 'maxLevel');
      if (minLevel) {
        return new MaxLevelRangeFilter(minLevel, maxLevel);
      }
      return undefined;
    }
  };
}

/**
 * Filter by level limit reached. Level limit is reached
 * if the girl's level corresponds to her current maximum
 * awakening level.
 */
export class LevelLimitReachedFilter extends AbstractFilter {
  static ID = 'level-limit-reached';
  id = LevelLimitReachedFilter.ID;

  /**
   * @param reached Whether to check for "limit reached" or "limit not reached"
   */
  constructor(public reached: boolean) {
    super();
    this.label = `Level Limit ${reached ? 'reached' : 'not reached'}`;
  }

  includes(girl: CommonGirlData): boolean {
    const level = girl.level ?? 0;
    const maxLevel = girl.maxLevel ?? 250;
    return level >= maxLevel === this.reached;
  }

  getParams() {
    return {
      reached: this.reached
    };
  }

  static FACTORY: FilterFactory<LevelLimitReachedFilter> = {
    type: LevelLimitReachedFilter.ID,
    create: (config) => {
      const reached = booleanParam(config, 'reached');
      return new LevelLimitReachedFilter(reached === true);
    }
  };
}

/**
 * Filter by grade limit reached. Grade limit is reached
 * if the girl's stars corresponds to her max stars.
 */
export class GradeLimitReachedFilter extends AbstractFilter {
  static ID = 'grade-limit-reached';
  id = GradeLimitReachedFilter.ID;

  /**
   * @param reached Whether to check for "limit reached" or "limit not reached"
   */
  constructor(public reached: boolean) {
    super();
    this.label = `Grade Limit ${reached ? 'reached' : 'not reached'}`;
  }

  includes(girl: CommonGirlData): boolean {
    return (girl.stars === girl.maxStars) === this.reached;
  }

  getParams() {
    return {
      reached: this.reached
    };
  }

  static FACTORY: FilterFactory<GradeLimitReachedFilter> = {
    type: GradeLimitReachedFilter.ID,
    create: (config) => {
      const reached = booleanParam(config, 'reached');
      return new GradeLimitReachedFilter(reached === true);
    }
  };
}

/**
 * Filter girls that are ready to upgrade.
 */
export class UpgradeReadyFilter extends AbstractFilter {
  static ID = 'upgrade-ready';
  id = UpgradeReadyFilter.ID;

  constructor(public ready: boolean) {
    super();
    this.label = ready ? 'Upgrade ready' : 'Not upgrade ready';
  }

  includes(girl: CommonGirlData): boolean {
    return girl.upgradeReady === this.ready;
  }

  getParams() {
    return {
      ready: this.ready
    };
  }

  static FACTORY: FilterFactory<UpgradeReadyFilter> = {
    type: UpgradeReadyFilter.ID,
    create: (config) => {
      const ready = booleanParam(config, 'ready') ?? true;
      return new UpgradeReadyFilter(ready);
    }
  };
}

export class EquippedFilter extends AbstractFilter {
  static ID = 'equipped';
  id = EquippedFilter.ID;

  constructor() {
    super();
    this.label = 'Equipped';
  }

  includes(girl: CommonGirlData): boolean {
    return girl.equipment !== undefined && girl.equipment.items.length > 0;
  }

  getParams() {
    return undefined;
  }

  static FACTORY: FilterFactory<EquippedFilter> = {
    type: EquippedFilter.ID,
    create: (_config) => {
      return new EquippedFilter();
    }
  };
}

export class GirlSkillsFilter extends AbstractFilter {
  static ID = 'skilled';
  id = GirlSkillsFilter.ID;

  constructor(public params: boolean[]) {
    super();
    this.label = `Skill ${params
      .map((e, i) => (e ? String(i) : false))
      .filter(Boolean)
      .join(', ')}`;
  }

  includes(girl: CommonGirlData): boolean {
    if (girl.skillTiers == null) return false;
    const skillTiers = Object.values(girl.skillTiers);
    const tier = skillTiers
      .filter((e) => e.skill_points_used > 0)
      .reduce((p, c) => Math.max(p, c.tier), 0);
    return this.params[tier];
  }

  getParams() {
    return {
      params: this.params
    };
  }

  static FACTORY: FilterFactory<GirlSkillsFilter> = {
    type: GirlSkillsFilter.ID,
    create: (config) => {
      const params = config.params?.params;
      return new GirlSkillsFilter(
        Array.isArray(params) ? params : Array(6).fill(false)
      );
    }
  };
}

export class BulbFilter extends AbstractFilter {
  static ID = 'bulbs';
  id = BulbFilter.ID;

  constructor(
    public maxedBulbs: boolean,
    public someBulbs: boolean,
    public noBulbs: boolean
  ) {
    super();
    const list: string[] = [];
    if (maxedBulbs) list.push('Maxed');
    if (someBulbs) list.push('Some');
    if (noBulbs) list.push('No');
    this.label = `${list.join(', ')} bulbs`;
  }

  includes(girl: CommonGirlData): boolean {
    if (girl.skillTiers == null) return false;
    const skillTiers = Object.values(girl.skillTiers);
    const hasSkills = skillTiers.some((e) => e.skill_points_used > 0);
    if (this.noBulbs && !hasSkills) return true;
    const maxPointsPerTierMap = {
      [Rarity.starting]: [6, 6, 3, 3, 1],
      [Rarity.common]: [6, 6, 3, 3, 1],
      [Rarity.rare]: [6, 7, 3, 3, 2],
      [Rarity.epic]: [6, 8, 4, 4, 3],
      [Rarity.legendary]: [6, 9, 4, 4, 4],
      [Rarity.mythic]: [6, 10, 5, 5, 5]
    };
    const maxPointsPerTier = maxPointsPerTierMap[girl.rarity];
    const isMaxed = skillTiers.every(
      (e) => e.skill_points_used >= maxPointsPerTier[e.tier - 1]
    );
    if (this.maxedBulbs && isMaxed) return true;
    if (this.someBulbs && hasSkills && !isMaxed) return true;
    return false;
  }

  getParams() {
    return {
      maxedBulbs: this.maxedBulbs,
      someBulbs: this.someBulbs,
      noBulbs: this.noBulbs
    };
  }

  static FACTORY: FilterFactory<BulbFilter> = {
    type: BulbFilter.ID,
    create: (config) => {
      const maxedBulbs = booleanParam(config, 'maxedBulbs');
      const someBulbs = booleanParam(config, 'someBulbs');
      const noBulbs = booleanParam(config, 'noBulbs');
      return new BulbFilter(
        maxedBulbs === true,
        someBulbs === true,
        noBulbs === true
      );
    }
  };
}

export class GradeSkinFilter extends AbstractFilter {
  static ID = 'skins';
  id = GradeSkinFilter.ID;

  constructor(
    public hasOwnedSkins: boolean,
    public hasUnownedSkins: boolean,
    public noSkins: boolean
  ) {
    super();
    const list: string[] = [];
    if (hasOwnedSkins) list.push('Owned');
    if (hasUnownedSkins) list.push('Unowned');
    if (noSkins) list.push('No');
    this.label = `${list.join(', ')} skins`;
  }

  includes(girl: CommonGirlData): boolean {
    if (girl.gradeSkins == null) return false;

    if (this.hasOwnedSkins) {
      const hasOwnedSkins = girl.gradeSkins.some(
        (e) => e.is_released && e.is_owned
      );
      if (hasOwnedSkins) return true;
    }

    if (this.hasUnownedSkins) {
      const hasUnownedSkins = girl.gradeSkins.some(
        (e) => e.is_released && !e.is_owned
      );
      if (hasUnownedSkins) return true;
    }

    if (this.noSkins) {
      const noSkins = girl.gradeSkins.every((e) => !e.is_released);
      if (noSkins) return true;
    }

    return false;
  }

  getParams() {
    return {
      hasOwnedSkins: this.hasOwnedSkins,
      hasUnownedSkins: this.hasUnownedSkins,
      noSkins: this.noSkins
    };
  }

  static FACTORY: FilterFactory<GradeSkinFilter> = {
    type: GradeSkinFilter.ID,
    create: (config) => {
      const hasOwnedSkins = booleanParam(config, 'hasOwnedSkins');
      const hasUnownedSkins = booleanParam(config, 'hasUnownedSkins');
      const noSkins = booleanParam(config, 'noSkins');
      return new GradeSkinFilter(
        hasOwnedSkins === true,
        hasUnownedSkins === true,
        noSkins === true
      );
    }
  };
}

export class SourceFilter extends AbstractFilter {
  static ID = 'source-event';
  id = SourceFilter.ID;

  constructor(private source: EventSource) {
    super();
    this.label = `Source ${source}`;
  }

  includes(girl: CommonGirlData): boolean {
    return girl.sources.includes(this.source);
  }

  getParams() {
    return {
      source: this.source
    };
  }

  static FACTORY: FilterFactory<SourceFilter> = {
    type: SourceFilter.ID,
    create: (config) => {
      const source = stringParam(config, 'source');
      if (source && isEventSource(source)) {
        return new SourceFilter(source);
      }
      return undefined;
    }
  };
}

export class ClassFilter extends AbstractFilter {
  static ID = 'class-filter';
  id = ClassFilter.ID;

  constructor(private classs: Class) {
    super();
    this.label = `Class ${Class[classs]}`;
  }

  includes(girl: CommonGirlData): boolean {
    return girl.class === this.classs;
  }

  getParams() {
    return {
      class: this.classs
    };
  }

  static FACTORY: FilterFactory<ClassFilter> = {
    type: ClassFilter.ID,
    create: (config) => {
      const classs = numberParam(config, 'class');
      if (classs) {
        return new ClassFilter(classs);
      }
      return undefined;
    }
  };
}

/**
 * Filter girls with a total power above the threshold. If blessing is specified,
 * the blessed stats will be used (Blessing may match the current blessing,
 * or the upcoming blessing - or any other blessing).
 *
 * Note: girls that aren't currently owned don't have known stats at the moment.
 * Consequently, they will always be excluded by this filter.
 */
export class MinimumPowerFilter extends AbstractFilter {
  static ID = 'minimum-power';
  id = MinimumPowerFilter.ID;

  /**
   * @param threshold The minimum power for a girl to be retained by this filter. The value is the "Total Power" (sum of all stats).
   * @param blessing The blessing type (none, current or upcoming)
   * @param blessingDefinition The blessing definition value matching the selected blessing (or undefined is the blessing is 'none').
   */
  constructor(
    public threshold: number,
    public blessing: BlessingFilterConfig,
    private blessingDefinition?: BlessingDefinition[]
  ) {
    super();
    const prefix =
      blessing === 'none'
        ? 'Base Total Power'
        : blessing === 'current'
          ? 'Current Total Power'
          : 'Upcoming Total Power';
    this.label = `${prefix} ≥ ${threshold}`;
  }

  includes(girl: CommonGirlData): boolean {
    if (girl.stats === undefined) {
      return false;
    }
    const stats =
      this.blessingDefinition === undefined
        ? girl.stats!
        : getBlessedStats(girl, girl.stats!, this.blessingDefinition);
    const total =
      (stats.charm + stats.hardcore + stats.knowhow) / (girl.level ?? 1);
    return total >= this.threshold;
  }

  getParams() {
    return {
      threshold: this.threshold,
      blessing: this.blessing
    };
  }

  static FACTORY: FilterFactory<MinimumPowerFilter> = {
    type: MinimumPowerFilter.ID,
    create: (config, _filtersManager, currentBlessing, upcomingBlessing) => {
      const threshold = numberParam(config, 'threshold');
      const blessing = stringParam(config, 'blessing');
      if (threshold !== undefined && blessing !== undefined) {
        switch (blessing) {
          case 'none':
            return new MinimumPowerFilter(threshold, blessing);
          case 'current':
            return new MinimumPowerFilter(threshold, blessing, currentBlessing);
          case 'upcoming':
            return new MinimumPowerFilter(
              threshold,
              blessing,
              upcomingBlessing
            );
        }
      }
      return undefined;
    }
  };
}

/**
 * Similar to MinimumPower, but using normalized "potential" base power.
 * The value is normalized to Level 1 and max stars (e.g. 25 for most L5 girls).
 */
export class MinimumPotentialFilter extends AbstractFilter {
  static ID = 'potential-power';
  id = MinimumPotentialFilter.ID;

  /**
   * @param threshold The minimum power for a girl to be retained by this filter. The value is the "Total Power" (sum of all stats).
   * @param blessing The blessing type (none, current or upcoming)
   * @param blessingDefinition The blessing definition value matching the selected blessing (or undefined is the blessing is 'none').
   */
  constructor(
    public threshold: number,
    public blessing: BlessingFilterConfig,
    private blessingDefinition?: BlessingDefinition[]
  ) {
    super();
    const prefix =
      blessing === 'none'
        ? 'Base Total Power'
        : blessing === 'current'
          ? 'Current Total Power'
          : 'Upcoming Total Power';
    this.label = `${prefix} ≥ ${threshold}`;
  }

  includes(girl: CommonGirlData): boolean {
    if (girl.stats === undefined) {
      return false;
    }
    const stats =
      this.blessingDefinition === undefined
        ? girl.stats!
        : getBlessedStats(girl, girl.stats!, this.blessingDefinition);
    const total = getBasePower(
      stats,
      girl.level ?? 1,
      girl.stars,
      girl.maxStars
    );

    // Round to a few decimal places; otherwise girls at 24.999999999 power may be excluded from a >= 25 filter
    const totalValue = roundValue(total, 5);

    return totalValue >= this.threshold;
  }

  getParams() {
    return {
      threshold: this.threshold,
      blessing: this.blessing
    };
  }

  static FACTORY: FilterFactory<MinimumPotentialFilter> = {
    type: MinimumPotentialFilter.ID,
    create: (config, _filtersManager, currentBlessing, upcomingBlessing) => {
      const threshold = numberParam(config, 'threshold');
      const blessing = stringParam(config, 'blessing');
      if (threshold !== undefined && blessing !== undefined) {
        switch (blessing) {
          case 'none':
            return new MinimumPotentialFilter(threshold, blessing);
          case 'current':
            return new MinimumPotentialFilter(
              threshold,
              blessing,
              currentBlessing
            );
          case 'upcoming':
            return new MinimumPotentialFilter(
              threshold,
              blessing,
              upcomingBlessing
            );
        }
      }
      return undefined;
    }
  };
}

export class ShardsFilter extends AbstractFilter {
  static ID = 'owned-shards';
  id = ShardsFilter.ID;

  constructor(private shards: ShardsCategory) {
    super();
    this.label =
      shards === 'allshards'
        ? 'Owned girls'
        : shards === 'noshards'
          ? 'Girls with 0 shard'
          : shards === '40shards'
            ? 'Girl with 40-99 shards'
            : 'Girls with some shards';
  }

  includes(girl: CommonGirlData): boolean {
    switch (this.shards) {
      case 'allshards':
        return girl.shards >= 100;
      case 'someshards':
        return girl.shards > 0 && girl.shards < 100;
      case 'noshards':
        return girl.shards === 0;
      case '40shards':
        return girl.shards >= 40 && girl.shards < 100;
      default:
        return false;
    }
  }

  getParams() {
    return {
      shards: this.shards
    };
  }

  static FACTORY: FilterFactory<ShardsFilter> = {
    type: ShardsFilter.ID,
    create: (config) => {
      const shards = stringParam(config, 'shards');
      if (shards && isShardsCategory(shards)) {
        return new ShardsFilter(shards);
      }
      return undefined;
    }
  };
}

export class ShardsMultiFilter extends AbstractFilter {
  static ID = 'shards';
  id = ShardsMultiFilter.ID;
  private filters: Filter[] = [];
  private orFilter: SimpleFilter | undefined;

  constructor(
    public allShards: boolean,
    public someShards: boolean,
    public noShards: boolean,
    public smShards: boolean
  ) {
    super();
    if (allShards) {
      this.filters.push(new ShardsFilter('allshards'));
    }
    if (someShards) {
      this.filters.push(new ShardsFilter('someshards'));
    }
    if (noShards) {
      this.filters.push(new ShardsFilter('noshards'));
    }
    if (smShards) {
      this.filters.push(new ShardsFilter('40shards'));
    }
    this.orFilter =
      this.filters.length === 0 ? undefined : or('', ...this.filters);
    this.label = this.orFilter === undefined ? '' : this.orFilter.label;
  }

  includes(girl: CommonGirlData): boolean {
    return this.orFilter === undefined ? false : this.orFilter.includes(girl);
  }

  getParams() {
    return {
      allShards: this.allShards,
      someShards: this.someShards,
      noShards: this.noShards,
      smShards: this.smShards
    };
  }

  static FACTORY: FilterFactory<ShardsMultiFilter> = {
    type: ShardsMultiFilter.ID,
    create: (config) => {
      const allShards = booleanParam(config, 'allShards');
      const someShards = booleanParam(config, 'someShards');
      const noShards = booleanParam(config, 'noShards');
      const smShards = booleanParam(config, 'smShards') ?? false;
      if (
        allShards !== undefined &&
        someShards !== undefined &&
        noShards !== undefined &&
        smShards !== undefined
      ) {
        return new ShardsMultiFilter(allShards, someShards, noShards, smShards);
      }
      return undefined;
    }
  };
}

export class RarityFilter extends AbstractFilter {
  static ID = 'rarity-filter';
  id = RarityFilter.ID;

  constructor(private rarity: Rarity) {
    super();
    switch (rarity) {
      case Rarity.starting:
        this.label = 'Starting Girls';
        break;
      case Rarity.common:
        this.label = 'Common Girls';
        break;
      case Rarity.rare:
        this.label = 'Rare Girls';
        break;
      case Rarity.epic:
        this.label = 'Epic Girls';
        break;
      case Rarity.legendary:
        this.label = 'Legendary Girls';
        break;
      case Rarity.mythic:
        this.label = 'Mythic Girls';
        break;
    }
  }

  includes(girl: CommonGirlData): boolean {
    return girl.rarity === this.rarity;
  }

  getParams() {
    return {
      rarity: this.rarity
    };
  }

  static FACTORY: FilterFactory<RarityFilter> = {
    type: RarityFilter.ID,
    create: (config) => {
      const rarity = numberParam(config, 'rarity');
      if (
        rarity !== undefined &&
        rarity >= Rarity.starting &&
        rarity <= Rarity.mythic
      ) {
        return new RarityFilter(rarity);
      }
      return undefined;
    }
  };
}

export class TeamsFilter extends AbstractFilter {
  static ID = 'teams-filter';
  id = TeamsFilter.ID;

  constructor(
    private include: string,
    private teams: Team[]
  ) {
    super();
    const filteredTeams = this.getFilteredTeams();
    this.label =
      teams.length === 0
        ? 'Loading teams...'
        : filteredTeams.length === this.teams.length
          ? 'All teams'
          : `Teams ${include}`;
  }

  includes(girl: CommonGirlData): boolean {
    if (this.teams.length === 0) {
      // Teams are not loaded yet; just display everything
      return true;
    }
    const teams = this.getFilteredTeams();
    return teams.some(
      (team) => team.active && team.girlIds.some((id) => id === girl.id)
    );
  }

  private getFilteredTeams(): Team[] {
    const groups = this.include.split(';');
    const teams: Set<number> = new Set();
    for (const group of groups) {
      if (group.includes('-')) {
        const range = group.split('-');
        const min = Number(range[0]);
        const max = Number(range[1]);
        if (!isNaN(min) && !isNaN(max) && min > 0) {
          for (let i = min; i <= max; i++) {
            teams.add(i);
            if (i >= 16) {
              break;
            }
          }
        }
      } else {
        const value = Number(group);
        if (!isNaN(value) && value > 0 && value <= 16) {
          teams.add(value);
        }
      }
    }
    if (teams.size === 0) {
      return this.teams;
    }
    const result: Team[] = [];
    for (const teamNumber of teams) {
      if (teamNumber < this.teams.length) {
        result.push(this.teams[teamNumber - 1]);
      }
    }
    return result;
  }

  getParams() {
    return {
      include: this.include
    };
  }

  static FACTORY: FilterFactory<TeamsFilter> = {
    type: TeamsFilter.ID,
    create: (
      config,
      _filtersManager,
      _currentBlessings,
      _upcomingBlessings,
      teams: Team[]
    ) => {
      const include = stringParam(config, 'include');
      return new TeamsFilter(include ?? '', teams);
    }
  };
}

export class RarityMultiFilter extends AbstractFilter {
  static ID = 'rarity';
  id = RarityMultiFilter.ID;
  private filters: Filter[] = [];
  private orFilter: SimpleFilter | undefined;

  constructor(
    public starting: boolean,
    public common: boolean,
    public rare: boolean,
    public epic: boolean,
    public legendary: boolean,
    public mythic: boolean
  ) {
    super();
    if (starting) {
      this.filters.push(new RarityFilter(Rarity.starting));
    }
    if (common) {
      this.filters.push(new RarityFilter(Rarity.common));
    }
    if (rare) {
      this.filters.push(new RarityFilter(Rarity.rare));
    }
    if (epic) {
      this.filters.push(new RarityFilter(Rarity.epic));
    }
    if (legendary) {
      this.filters.push(new RarityFilter(Rarity.legendary));
    }
    if (mythic) {
      this.filters.push(new RarityFilter(Rarity.mythic));
    }
    this.orFilter =
      this.filters.length === 0 ? undefined : or('', ...this.filters);
    this.label = this.orFilter === undefined ? '' : this.orFilter.label;
  }

  includes(girl: CommonGirlData): boolean {
    return this.orFilter === undefined ? false : this.orFilter.includes(girl);
  }

  getParams() {
    return {
      starting: this.starting,
      common: this.common,
      rare: this.rare,
      epic: this.epic,
      legendary: this.legendary,
      mythic: this.mythic
    };
  }

  static FACTORY: FilterFactory<RarityMultiFilter> = {
    type: RarityMultiFilter.ID,
    create: (config) => {
      const starting = booleanParam(config, 'starting');
      const common = booleanParam(config, 'common');
      const rare = booleanParam(config, 'rare');
      const epic = booleanParam(config, 'epic');
      const legendary = booleanParam(config, 'legendary');
      const mythic = booleanParam(config, 'mythic');
      if (
        starting !== undefined &&
        common !== undefined &&
        rare !== undefined &&
        epic !== undefined &&
        legendary !== undefined &&
        mythic !== undefined
      ) {
        return new RarityMultiFilter(
          starting,
          common,
          rare,
          epic,
          legendary,
          mythic
        );
      }
      return undefined;
    }
  };
}

export class ClassMultiFilter extends AbstractFilter {
  static ID = 'class';
  id = ClassMultiFilter.ID;
  private filters: Filter[] = [];
  private orFilter: SimpleFilter | undefined;

  constructor(
    public hardcore: boolean,
    public charm: boolean,
    public knowhow: boolean
  ) {
    super();
    if (hardcore) {
      this.filters.push(new ClassFilter(Class.Hardcore));
    }
    if (charm) {
      this.filters.push(new ClassFilter(Class.Charm));
    }
    if (knowhow) {
      this.filters.push(new ClassFilter(Class.Knowhow));
    }
    this.orFilter =
      this.filters.length === 0 ? undefined : or('', ...this.filters);
    this.label = this.orFilter === undefined ? '' : this.orFilter.label;
  }

  includes(girl: CommonGirlData): boolean {
    return this.orFilter === undefined ? false : this.orFilter.includes(girl);
  }

  getParams() {
    return {
      hardcore: this.hardcore,
      charm: this.charm,
      knowhow: this.knowhow
    };
  }

  static FACTORY: FilterFactory<ClassMultiFilter> = {
    type: ClassMultiFilter.ID,
    create: (config) => {
      const hardcore = booleanParam(config, 'hardcore');
      const charm = booleanParam(config, 'charm');
      const knowhow = booleanParam(config, 'knowhow');
      if (
        hardcore !== undefined &&
        charm !== undefined &&
        knowhow !== undefined
      ) {
        return new ClassMultiFilter(hardcore, charm, knowhow);
      }
      return undefined;
    }
  };
}

export class SourceMultiFilter extends AbstractFilter {
  static ID = 'sources';
  id = SourceMultiFilter.ID;
  private filters: Filter[] = [];
  private orFilter: SimpleFilter | undefined;

  constructor(public sources: EventSource[]) {
    super();
    for (const source of sources) {
      this.filters.push(new SourceFilter(source));
    }
    this.orFilter =
      this.filters.length === 0 ? undefined : or('', ...this.filters);
    this.label = this.orFilter?.label ?? '';
  }

  includes(girl: CommonGirlData): boolean {
    return this.orFilter === undefined ? false : this.orFilter.includes(girl);
  }

  getParams() {
    return {
      sources: this.sources
    };
  }

  static FACTORY: FilterFactory<SourceMultiFilter> = {
    type: SourceMultiFilter.ID,
    create: (config) => {
      const sources = config.params?.sources;
      if (Array.isArray(sources)) {
        const allSources = sources
          .filter((source) => isEventSource(source))
          .map((source) => source as EventSource);
        return new SourceMultiFilter(allSources);
      }
      return undefined;
    }
  };
}

interface SimpleFilter {
  label: string;
  includes(girl: CommonGirlData): boolean;
}

/**
 * Compose multiple filters with an AND operator (all filters must match)
 * @param label
 * @param filters
 * @returns
 */
export function and(label: string, ...filters: Filter[]): SimpleFilter {
  const displayLabel =
    label === '' ? filters.map((f) => f.label).join(' & ') : label;
  return {
    label: displayLabel,
    includes: (girl) => {
      return filters.every((filter) => filter.includes(girl));
    }
  };
}

/**
 * Compose multiple filters with an OR operator (any filter must match)
 * @param filters
 * @returns
 */
export function or(label: string, ...filters: Filter[]): SimpleFilter {
  const displayLabel =
    label === '' ? filters.map((filter) => filter.label).join(' | ') : label;
  return {
    label: displayLabel,
    includes: (girl) => {
      return filters.some((filter) => filter.includes(girl));
    }
  };
}

function numberParam(
  config: FilterConfig,
  paramName: string
): number | undefined {
  if (config.params) {
    const value = config.params[paramName];
    if (typeof value === 'number') {
      return value;
    }
  }
  return undefined;
}

function stringParam(
  config: FilterConfig,
  paramName: string
): string | undefined {
  if (config.params) {
    const value = config.params[paramName];
    if (typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}

function booleanParam(
  config: FilterConfig,
  paramName: string
): boolean | undefined {
  if (config.params) {
    const value = config.params[paramName];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

export type BlessingFilterConfig = 'current' | 'upcoming' | 'none';

export function isBlessingFilterConfig(
  value: string
): value is BlessingFilterConfig {
  return value === 'current' || value === 'upcoming' || value === 'none';
}

export type ShardsCategory =
  | 'allshards'
  | 'noshards'
  | 'someshards'
  | '40shards';

export function isShardsCategory(value: string): value is ShardsCategory {
  return (
    value === 'allshards' ||
    value === 'noshards' ||
    value === 'someshards' ||
    value === '40shards'
  );
}

export class RootFilter extends AbstractFilter {
  private static ID = 'root';
  id = RootFilter.ID;

  private andFilter: SimpleFilter | undefined;

  constructor(public filters: Filter[]) {
    super();
    this.andFilter = filters.length === 0 ? undefined : and('', ...filters);
    this.label = this.andFilter === undefined ? 'None' : this.andFilter.label;
  }

  includes(girl: CommonGirlData): boolean {
    return this.andFilter === undefined ? true : this.andFilter.includes(girl);
  }

  getParams() {
    return {
      filters: this.filters.map((filter) => filter.getConfig())
    };
  }

  static FACTORY: FilterFactory<RootFilter> = {
    type: RootFilter.ID,
    create: (config, filterManager) => {
      const childConfigs = config.params?.filters;
      if (Array.isArray(childConfigs)) {
        const allFilters = childConfigs
          .map((config) => filterManager.createFilter(config))
          .filter((filter) => filter !== undefined)
          .map((filter) => filter as Filter);
        return new RootFilter(allFilters);
      }
      return undefined;
    }
  };
}
