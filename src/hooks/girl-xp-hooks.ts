import { useMemo } from 'react';
import {
  Book,
  CommonGirlData,
  Rarity,
  SPECIAL_MYTHIC_BOOK_ID
} from '../data/data';
import { GameRarity } from '../data/game-data';
import fullXpTable from './data/xp-table-full.json';
import awakeningData from './data/awakening.json';

const MAX_LEVEL = 750;
const MIN_LEVEL_CAP = 250;

export interface XpStatsResult {
  //
  // Girl stats
  //

  /**
   * Current girl XP
   */
  currentXp: number;
  /**
   * Min XP from current level to next level
   */
  minXp: number;
  /**
   * Max XP from current level to next level
   */
  maxXp: number;
  /**
   * Min XP from current level cap to next level cap
   */
  minXpToCap: number;
  /**
   * Max XP from current level cap to next level cap
   */
  maxXpToCap: number;
  /**
   * Remaining XP to reach the maximum level
   */
  xpToMax: number;

  //
  // Book stats
  //

  /**
   * Whether the current book can be used (false if book is undefined)
   */
  canUse: boolean;
  /**
   * Xp gain, when using the current book (0 if book is undefined)
   */
  xpGain: number;
  /**
   * Level reached when using the current book (current level if book is undefined)
   */
  level: number;
  /**
   * Level cap reached when using the current book (current level if book is undefined)
   */
  maxLevel: number;
}

export function useXpStats(
  girl: CommonGirlData,
  book: Book | undefined
): XpStatsResult {
  const currentXp = girl.currentGXP;
  return useMemo(() => {
    return getXpStats(girl, book);
  }, [currentXp, girl.rarity, girl.level, girl.maxLevel, book]);
}

export function getXpStats(
  girl: CommonGirlData,
  book: Book | undefined
): XpStatsResult {
  const currentXp = girl.currentGXP;

  const xpRange = getXpRange(girl.level ?? 0, girl);

  const nextCap = girl.maxLevel ?? MIN_LEVEL_CAP;
  const previousCap = nextCap === MIN_LEVEL_CAP ? 0 : nextCap - 50;

  const xpToMax = getMissingGXP(girl);

  if (book !== undefined && book.itemId === SPECIAL_MYTHIC_BOOK_ID) {
    // FIXME: The game seems to use weird restrictions regarding where/when
    // mythic books can be used. It is not (always?) enabled on girls above
    // level 250. For now, only allow using this book on low level girls (Players
    // can still fall back to the original Girl Page to use them in more
    // specific cases)
    const canUse = girl.level !== undefined && girl.level < 100;
    // const canUse = girl.level !== undefined && girl.level < 350;

    if (canUse) {
      const xpTo350 = getGXPToCap(girl, 350);
      return {
        currentXp,
        minXp: xpRange.min,
        maxXp: xpRange.max,
        minXpToCap: getGXPToCap(girl, previousCap),
        maxXpToCap: getGXPToCap(girl, 350),
        xpToMax,
        canUse,
        xpGain: xpTo350 - girl.currentGXP,
        level: 350,
        maxLevel: 350
      };
    } else {
      return {
        currentXp,
        minXp: xpRange.min,
        maxXp: xpRange.max,
        minXpToCap: getGXPToCap(girl, previousCap),
        maxXpToCap: getGXPToCap(girl, nextCap),
        xpToMax,
        canUse,
        level: girl.level ?? 0,
        maxLevel: girl.maxLevel ?? 250,
        xpGain: 0
      };
    }
  } else {
    let overflow = false;
    if (book !== undefined) {
      overflow = book.rarity === Rarity.mythic && book.xp > xpToMax;
    }

    const canXP = girl.own && girl.level! < girl.maxLevel!;
    const canUse = book !== undefined && canXP && !overflow;

    return {
      currentXp,
      minXp: xpRange.min,
      maxXp: xpRange.max,
      minXpToCap: getGXPToCap(girl, previousCap),
      maxXpToCap: getGXPToCap(girl, nextCap),
      xpToMax,
      canUse,
      level: book === undefined ? (girl.level ?? 0) : getLevel(girl, book.xp),
      maxLevel: girl.maxLevel ?? 250,
      xpGain: book?.xp ?? 0
    };
  }
}

function getXpRange(
  level: number,
  girl: CommonGirlData
): { min: number; max: number } {
  const values = getXpEntry(level, girl);
  return { min: values[0]!, max: values[1]! };
}

export function getLevel(girl: CommonGirlData, addXp: number): number {
  const newXpValue = girl.currentGXP + addXp;

  for (let level = girl.level ?? 1; level <= MAX_LEVEL; level++) {
    const values = getXpEntry(level, girl);
    if (
      newXpValue >= values[0]! &&
      (level === MAX_LEVEL || newXpValue < values[1]!)
    ) {
      return level;
    }
  }
  console.error(
    'Failed to compute new level for girl: ',
    girl,
    ' with added xp: ',
    addXp
  );
  return girl.level ?? 0;
}

function getXPTable(girl: CommonGirlData) {
  const gRarity = gameRarity(girl.rarity);
  const xpTable = fullXpTable[gRarity];
  return xpTable;
}

function getXpEntry(level: number, girl: CommonGirlData) {
  const girlLevel = Math.max(1, Math.min(level, MAX_LEVEL));
  const xpTable = getXPTable(girl);
  const levelKey = String(girlLevel) as keyof typeof xpTable;
  return xpTable[levelKey];
}

export function getGXPToCap(girl: CommonGirlData, cap?: number): number {
  if (!girl.own) {
    return 0;
  }
  const currentLevel = girl.level ?? 0;
  if (cap === undefined) {
    cap = Math.min(
      MAX_LEVEL,
      Math.max(MIN_LEVEL_CAP, Math.ceil(currentLevel / 50) * 50)
    );
  }
  const targetXP = getXpEntry(cap, girl);
  return targetXP[0]!;
}

export function getMissingGXP(girl: CommonGirlData): number {
  if (girl.level === MAX_LEVEL) {
    return 0;
  }

  return getGXPToCap(girl, MAX_LEVEL) - girl.currentGXP;
}

/**
 *
 * @param girl
 * @param levelCap
 * @return The amount of GXP required to reach the specified cap, compared to the previous cap.
 * Current girl XP will be deduced.
 */
export function getMissingGXPToCap(
  girl: CommonGirlData,
  levelCap: number
): number {
  const previousCap = levelCap === 250 ? 0 : levelCap - 50;
  const xpToPreviousCap = getGXPToCap(girl, previousCap);
  const xpToCap = getGXPToCap(girl, levelCap);
  const capXpValue = xpToCap - xpToPreviousCap;
  if (girl.currentGXP > xpToPreviousCap) {
    const progress = girl.currentGXP - xpToPreviousCap;
    return capXpValue - progress;
  } else {
    return capXpValue;
  }
}

function gameRarity(rarity: Rarity): GameRarity {
  return Rarity[rarity] as GameRarity;
}

/**
 * Return the number of girls required to awaken toward the specified
 * level.
 * @param level The awakening level (upper bound). For example,
 * "750" represents awakening from level 700 to 750.
 */
export function getAwakeningThreshold(level: number): number {
  for (const entry of awakeningData) {
    if (entry.cap_level === level) {
      return entry.girls_required;
    }
  }
  throw new Error('Unexpected awakening level: ' + level);
}
