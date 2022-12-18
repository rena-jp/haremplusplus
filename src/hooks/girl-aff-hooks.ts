import { useMemo } from 'react';
import {
  CommonGirlData,
  Gift,
  Rarity,
  SPECIAL_MYTHIC_GIFT_ID
} from '../data/data';

export interface AffStatsResult {
  minAff: number;
  maxAff: number;
  affToMax: number;
  currentAff: number;
  canUse: boolean;
}

export function useAffectionStats(
  girl: CommonGirlData,
  gift: Gift | undefined
): AffStatsResult {
  const result = useMemo(() => {
    return getAffectionStats(girl, gift);
  }, [girl.currentAffection, girl.stars]);
  return result;
}

export function getAffectionStats(
  girl: CommonGirlData,
  gift: Gift | undefined
): AffStatsResult {
  const affRange = getAffRange(girl);

  if (gift !== undefined && gift.itemId === SPECIAL_MYTHIC_GIFT_ID) {
    // TODO Implement mythic gift
    return {
      minAff: affRange.min,
      maxAff: affRange.max,
      affToMax: girl.currentAffection + girl.missingAff,
      currentAff: girl.currentAffection,
      canUse: false
    };
  } else {
    let overflow = false;
    if (gift !== undefined) {
      overflow =
        gift.rarity === Rarity.mythic &&
        gift.type === 'gift' &&
        gift.aff > girl.missingAff;
    }
    const canUpgrade = girl.missingAff > 0 && !girl.upgradeReady;
    const canUse = canUpgrade && !overflow;

    return {
      minAff: affRange.min,
      maxAff: affRange.max,
      affToMax: girl.currentAffection + girl.missingAff,
      currentAff: girl.currentAffection,
      canUse
    };
  }
}

export function getAffRange(girl: CommonGirlData): {
  min: number;
  max: number;
} {
  const star = girl.stars;
  const multiplier = getAffMultiplier(girl.rarity);
  if (star === girl.maxStars) {
    const min = getStarValue(star - 1);
    const max = getStarValue(star);
    return { min: min * multiplier, max: max * multiplier };
  } else {
    const min = getStarValue(star);
    const max = getStarValue(star + 1);
    return { min: min * multiplier, max: max * multiplier };
  }
}

function getStarValue(star: number): number {
  switch (star) {
    case 0:
      return 0;
    case 1:
      return 180;
    case 2:
      return 630;
    case 3:
      return 1755;
    case 4:
      return 4005;
    case 5:
      return 8505;
    case 6:
      return 17505;
  }
  return 0;
}

function getAffMultiplier(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.starting:
      return 0.5;
    case Rarity.common:
      return 1;
    case Rarity.rare:
      return 3;
    case Rarity.epic:
      return 7;
    case Rarity.legendary:
      return 10;
    case Rarity.mythic:
      return 25;
  }
}

export function isUpgradeReady(
  girl: CommonGirlData,
  extraAffection: number
): boolean {
  if (girl.upgradeReady) {
    return true;
  }
  if (girl.stars === girl.maxStars) {
    return false;
  }
  const newAffection = girl.currentAffection + extraAffection;
  const range = getAffRange(girl);
  return newAffection >= range.max;
}
