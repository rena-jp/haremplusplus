import { useMemo } from 'react';
import { CommonGirlData, Rarity } from '../data/data';
import { GameRarity } from '../data/game-data';
import fullXpTable from './data/xp-table-full.json';

const MAX_LEVEL = 750;
const MIN_LEVEL_CAP = 250;

export interface XpStatsResult {
  currentXp: number;
  minXp: number;
  maxXp: number;
  minXpToCap: number;
  maxXpToCap: number;
  xpToMax: number;
}

export function useXpStats(girl: CommonGirlData): XpStatsResult {
  const currentXp = girl.currentGXP;

  return useMemo(() => {
    const xpRange = getXpRange(girl.level ?? 0, girl);

    const nextCap = girl.maxLevel ?? MIN_LEVEL_CAP;
    const previousCap = nextCap === MIN_LEVEL_CAP ? 0 : nextCap - 50;
    return {
      currentXp,
      minXp: xpRange.min,
      maxXp: xpRange.max,
      minXpToCap: getGXPToCap(girl, previousCap),
      maxXpToCap: getGXPToCap(girl, nextCap),
      xpToMax: getMissingGXP(girl)
    };
  }, [currentXp, girl.rarity, girl.level, girl.maxLevel]);
}

function getXpRange(
  level: number,
  girl: CommonGirlData
): { min: number; max: number } {
  const values = getXpEntry(level, girl);
  return { min: values[0], max: values[1] };
}

export function getLevel(girl: CommonGirlData, addXp: number): number {
  const newXpValue = girl.currentGXP + addXp;

  for (let level = girl.level ?? 1; level <= MAX_LEVEL; level++) {
    const values = getXpEntry(level, girl);
    if (
      newXpValue >= values[0] &&
      (level === MAX_LEVEL || newXpValue < values[1])
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

function getGXPToCap(girl: CommonGirlData, cap?: number): number {
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
  return targetXP[0];
}

export function getMissingGXP(girl: CommonGirlData): number {
  if (girl.level === MAX_LEVEL) {
    return 0;
  }

  return getGXPToCap(girl, MAX_LEVEL) - girl.currentGXP;
}

function gameRarity(rarity: Rarity): GameRarity {
  return Rarity[rarity] as GameRarity;
}
