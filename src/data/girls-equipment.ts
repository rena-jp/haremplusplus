import { EMPTY_STATS, Equipment, EquipmentData, Stats } from './data';

export const SLOTS_COUNT = 6;

export function getTotalEquipmentStats(equipment: EquipmentData): Stats {
  const equippedItems = [...equipment.items.values()];

  const totalStats = equippedItems
    .filter((item) => item !== undefined)
    .map<Equipment>((item) => item as Equipment)
    .map<Stats>((item) => item.stats)
    .reduce((statsA, statsB) => {
      return {
        hardcore: statsA.hardcore + statsB.hardcore,
        charm: statsA.charm + statsB.charm,
        knowhow: statsA.knowhow + statsB.knowhow
      };
    }, EMPTY_STATS);

  return totalStats;
}

/**
 * Convert a list of equipped items to an array of length 6,
 * where each entry is either undefined (no item equipped for this slot),
 * or the item equipped at this slot.
 * @param items The list of equipped items.
 * @returns A list of slots which are either empty, or contain the corresponding equipped item
 */
export function slotsArray(items: Equipment[]): (Equipment | undefined)[] {
  const result: (Equipment | undefined)[] = [];
  for (let i = 0; i < SLOTS_COUNT; i++) {
    const slotId = i + 1; // Slots are indexed 1 to 6
    const item = items.find((item) => item.slot === slotId);
    result[i] = item;
  }
  return result;
}
