import { useMemo } from 'react';
import {
  CommonGirlData,
  Gift,
  Rarity,
  SPECIAL_MYTHIC_GIFT_ID
} from '../data/data';

export interface AffStatsResult {
  //
  // Girl stats
  //
  /**
   * Min affection from current grade to next grade
   */
  minAff: number;
  /**
   * Max affection from current grade to next grade
   */
  maxAff: number;
  /**
   * Remaining Affection to reach the maximum grade
   */
  affToMax: number;
  /**
   * Current girl Affection
   */
  currentAff: number;
  //
  // Gift stats
  //

  /**
   * Whether the current gift can be used (false if gift is undefined)
   */
  canUse: boolean;
  /**
   * Affection gain, when using the current gift (0 if gift is undefined)
   */
  affGain: number;
  /**
   * Grade reached when using the current gift (current grade if gift is undefined)
   */
  targetGrade: number;
}

export function useAffectionStats(
  girl: CommonGirlData,
  gift: Gift | undefined
): AffStatsResult {
  const result = useMemo(() => {
    return getAffectionStats(girl, gift);
  }, [girl.currentAffection, girl.stars, gift?.itemId]);
  return result;
}

export function getAffectionStats(
  girl: CommonGirlData,
  gift: Gift | undefined
): AffStatsResult {
  const affRange = getAffRange(girl);
  const targetGrade = Math.min(girl.stars + 1, girl.maxStars);

  if (gift !== undefined && gift.itemId === SPECIAL_MYTHIC_GIFT_ID) {
    const multiplier = getAffMultiplier(girl.rarity);
    const targetAff = getStarValue(2) * multiplier;

    // FIXME check the game restrictions for using mythic gifts
    const canUse = girl.currentAffection < getStarValue(1) * multiplier;
    // const canUse = girl.currentAffection < targetAff * multiplier;

    if (canUse) {
      return {
        minAff: affRange.min,
        maxAff: targetAff,
        affToMax: girl.currentAffection + girl.missingAff,
        currentAff: girl.currentAffection,
        canUse,
        affGain: targetAff - girl.currentAffection,
        targetGrade: 2
      };
    } else {
      return {
        minAff: affRange.min,
        maxAff: affRange.max,
        affToMax: girl.currentAffection + girl.missingAff,
        currentAff: girl.currentAffection,
        canUse,
        affGain: 0,
        targetGrade
      };
    }
  } else {
    let overflow = false;
    if (gift !== undefined) {
      overflow = gift.rarity === Rarity.mythic && gift.aff > girl.missingAff;
    }
    const canUpgrade = girl.missingAff > 0 && !girl.upgradeReady;
    const canUse = canUpgrade && !overflow;

    return {
      minAff: affRange.min,
      maxAff: affRange.max,
      affToMax: girl.currentAffection + girl.missingAff,
      currentAff: girl.currentAffection,
      canUse,
      affGain: gift?.aff ?? 0,
      targetGrade
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
