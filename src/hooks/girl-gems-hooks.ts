import { useMemo } from 'react';
import { CommonGirlData, Rarity } from '../data/data';
import gemsTable from './data/gems-table.json';

export interface GemsStats {
  gemsToMax: number;
  gemsToNextCap: number;
}

export function useGemsStats(girl: CommonGirlData): GemsStats {
  return useMemo(() => {
    const gemsToNextCap = getGemsToAwaken(girl, girl.maxLevel!);
    return {
      gemsToMax: girl.missingGems,
      gemsToNextCap
    };
  }, [girl.level, girl.maxLevel]);
}

export function getGemsToAwaken(
  girl: CommonGirlData,
  maxLevel: number
): number {
  if (maxLevel < 750) {
    const multiplier = getRarityMultiplier(girl.rarity);
    const nextCap = maxLevel + 50;
    const gemsToPrevious =
      gemsTable[String(maxLevel) as keyof typeof gemsTable];
    const gemsToNext = gemsTable[String(nextCap) as keyof typeof gemsTable];
    return (gemsToNext - gemsToPrevious) * multiplier;
  }
  return 0;
}

export function getGemsToCap(girl: CommonGirlData, cap: number): number {
  const currentCap = girl.maxLevel ?? 250;
  const multiplier = getRarityMultiplier(girl.rarity);
  const gemsToPrevious =
    gemsTable[String(currentCap) as keyof typeof gemsTable];
  const gemsToNext = gemsTable[String(cap) as keyof typeof gemsTable];
  return (gemsToNext - gemsToPrevious) * multiplier;
}

function getRarityMultiplier(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.starting:
    case Rarity.common:
      return 1;
    case Rarity.rare:
      return 2;
    case Rarity.epic:
      return 3;
    case Rarity.legendary:
      return 4;
    case Rarity.mythic:
      return 5;
  }
}
