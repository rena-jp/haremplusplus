import { roundValue } from './common';
import {
  CommonGirlData,
  EMPTY_INVENTORY_STATS,
  EMPTY_STATS,
  Equipment,
  EquipmentData,
  InventoryStats,
  Stats
} from './data';
import { GirlEquipment } from './game-data';
import { importEquipment } from './import/harem-import';

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

export function matchesClassResonance(
  equipment?: Equipment,
  girl?: CommonGirlData
): boolean {
  return (
    girl !== undefined &&
    equipment !== undefined &&
    equipment.resonance.class !== undefined &&
    equipment.resonance.class === girl.class
  );
}

export function matchesElementResonance(
  equipment?: Equipment,
  girl?: CommonGirlData
): boolean {
  return (
    girl !== undefined &&
    equipment !== undefined &&
    equipment.resonance.element !== undefined &&
    equipment.resonance.element === girl.element
  );
}

export function matchesPoseResonance(
  equipment?: Equipment,
  girl?: CommonGirlData
): boolean {
  return (
    girl !== undefined &&
    equipment !== undefined &&
    equipment.resonance.pose !== undefined &&
    equipment.resonance.pose === girl.pose
  );
}

export function getSlotLabel(slotId: number): string {
  switch (slotId) {
    case 1:
      return 'Head';
    case 2:
      return 'Body';
    case 3:
      return 'Pants';
    case 4:
      return 'Boots';
    case 5:
      return 'Accessory';
    case 6:
      return 'Item';

    default:
      return 'Slot';
  }
}

export function updateInventory(
  inventory: EquipmentData,
  update: GirlEquipment[],
  slotToUpdate: number
): EquipmentData {
  // Keep the inventory as-is for unchanged slots. Remove all items
  // for the changed slot.
  const newInventory = [...inventory.items].filter(
    (item) => item.slot !== slotToUpdate
  );
  const qhInventory = importEquipment(update);
  // Add all items of the changed slot based on the inventory update
  newInventory.push(
    ...qhInventory.items.filter((item) => item.slot === slotToUpdate)
  );

  // Sort inventory again
  sortInventory(newInventory);

  return { items: newInventory };
}

export function sortInventory(inventory: Equipment[]): void {
  inventory.sort((e1, e2) => {
    if (e1.rarity !== e2.rarity) {
      return e2.rarity - e1.rarity;
    }
    if (e1.level !== e2.level) {
      return e2.level - e1.level;
    }
    if (e1.slot !== e2.slot) {
      return e1.slot - e2.slot;
    }
    return e1.uid - e2.uid;
  });
}

export function getEquipmentStats(
  girl: CommonGirlData | undefined,
  equipment: Equipment | undefined
): InventoryStats {
  if (equipment === undefined) {
    return EMPTY_INVENTORY_STATS;
  }

  const matchesAtk =
    girl === undefined ? true : matchesPoseResonance(equipment, girl);
  const matchesDef =
    girl === undefined ? true : matchesElementResonance(equipment, girl);
  const matchesEgo =
    girl === undefined ? true : matchesClassResonance(equipment, girl);

  return {
    hardcore: equipment.stats.hardcore,
    charm: equipment.stats.charm,
    knowhow: equipment.stats.knowhow,
    ego: equipment.stats.ego,
    attack: equipment.stats.attack,
    defense: equipment.stats.defense,
    rEgo: matchesEgo ? equipment.resonance.ego : 0,
    rDef: matchesDef ? equipment.resonance.defense : 0,
    rAtk: matchesAtk ? equipment.resonance.attack : 0,
    totalStats:
      equipment.stats.hardcore + equipment.stats.charm + equipment.stats.knowhow
  };
}

export function getTotalInventoryStats(
  girl: CommonGirlData,
  items: Equipment[]
): InventoryStats {
  let totalStats = EMPTY_INVENTORY_STATS;
  for (const item of items) {
    const stats = getEquipmentStats(girl, item);
    totalStats = sumInventoryStats(totalStats, stats);
  }
  return totalStats;
}

export function sumInventoryStats(
  stats1: InventoryStats,
  stats2: InventoryStats
): InventoryStats {
  return {
    attack: roundValue(stats1.attack + stats2.attack),
    defense: roundValue(stats1.defense + stats2.defense),
    ego: roundValue(stats1.ego + stats2.ego),
    hardcore: roundValue(stats1.hardcore + stats2.hardcore),
    charm: roundValue(stats1.charm + stats2.charm),
    knowhow: roundValue(stats1.knowhow + stats2.knowhow),
    totalStats: roundValue(stats1.totalStats + stats2.totalStats),
    rAtk: roundValue(stats1.rAtk + stats2.rAtk),
    rDef: roundValue(stats1.rDef + stats2.rDef),
    rEgo: roundValue(stats1.rEgo + stats2.rEgo)
  };
}

export function diffInventoryStats(
  stats1: InventoryStats,
  stats2: InventoryStats
): InventoryStats {
  return {
    attack: roundValue(stats1.attack - stats2.attack),
    defense: roundValue(stats1.defense - stats2.defense),
    ego: roundValue(stats1.ego - stats2.ego),
    hardcore: roundValue(stats1.hardcore - stats2.hardcore),
    charm: roundValue(stats1.charm - stats2.charm),
    knowhow: roundValue(stats1.knowhow - stats2.knowhow),
    totalStats: roundValue(stats1.totalStats - stats2.totalStats),
    rAtk: roundValue(stats1.rAtk - stats2.rAtk),
    rDef: roundValue(stats1.rDef - stats2.rDef),
    rEgo: roundValue(stats1.rEgo - stats2.rEgo)
  };
}
