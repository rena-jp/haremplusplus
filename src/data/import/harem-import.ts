import { toElement, toEyeColor, toHairColor } from './attribute-mappings';
import { getBlessings } from './blessing-import';
import {
  BaseGirlData,
  BlessingDefinition,
  EyeColor,
  getBlessingMultiplier,
  getRarity,
  HairColor,
  Pose,
  Rarity,
  Stats,
  Zodiac,
  Zodiacs,
  EventSource,
  CommonGirlData,
  getPoseN,
  HaremData,
  Class,
  Quest,
  EquipmentData,
  Equipment,
  EquipmentStats,
  EMPTY_STATS,
  EquipmentResonance
} from '../data';
import {
  ArmorData,
  CaracsEntry,
  GameBlessingData,
  GameQuests,
  GirlsDataEntry,
  GirlsDataList,
  NumberString,
  ResonanceBonuses
} from '../game-data';
import girlsPoses from './poses.json';
import eventTypes from './events.json';
import { ArmorCaracs } from '../game-data';
import { getTotalEquipmentStats } from '../girls-equipment';

export interface DataFormat {
  blessings: GameBlessingData;
  list: GirlsDataList;
  quests: GameQuests;
}

export namespace DataFormat {
  export function is(object: unknown): object is DataFormat {
    if (typeof object === 'object' && object !== null) {
      return 'blessings' in object && 'list' in object;
    }
    return false;
  }
}

/**
 * Convert the playerData (in-game data object 'girlsDataList' + 'blessings_data')
 * to the HaremData type used by this application.
 *
 * Girls salary are not included.
 *
 * @param playerData The in-game data
 * @returns The HaremData used in this application
 */
export async function toHaremData(playerData: DataFormat): Promise<HaremData> {
  const allGirls: CommonGirlData[] = [];

  const girlsDataList = playerData.list;
  const blessingsData = playerData.blessings;
  const quests = playerData.quests;

  const { currentBlessings, upcomingBlessings } = getBlessings(blessingsData);

  // girlsDataList is an object indexed by girlId: {girlId1: girlData, girlId2: girlData, ...}
  Object.keys(girlsDataList).forEach((key) => {
    const girlData = girlsDataList[key];
    const rarity = getRarity(girlData.rarity);
    const equipmentData =
      girlData.own && girlData.armor !== undefined
        ? importEquipment(girlData.armor)
        : undefined;
    const baseCommonGirl: BaseGirlData = {
      id: String(girlData.id_girl),
      name: girlData.name,
      icon: girlData.ico,
      icon0: get0Pose(girlData.ico),
      poseImage: girlData.avatar,
      poseImage0: get0Pose(girlData.avatar),
      level: girlData.own ? Number(girlData.level) : undefined,
      maxLevel: girlData.own ? girlData.level_cap : undefined,
      class: getClass(girlData.class),
      own: girlData.own,
      rarity: rarity,
      stars: girlData.graded,
      maxStars: Number(girlData.nb_grades),
      shards: girlData.shards,
      recruited: girlData.own ? parseDate(girlData.date_added) : undefined,
      // Blessings
      pose: getPose(girlData),
      hairColor: getHairColor(girlData),
      eyeColor: getEyeColor(girlData),
      zodiac: getZodiac(girlData),
      element: getElement(girlData),
      missingAff: getMissingAff(girlData, rarity),
      currentAffection: girlData.own ? girlData.Affection.cur : 0,
      upgradeReady: girlData.can_upgrade === true,
      currentGXP: girlData.own ? girlData.Xp.cur : 0,
      currentIcon: getCurrentIcon(girlData.avatar),
      salaryTime: girlData.own ? girlData.pay_time : undefined,
      salary: girlData.own ? girlData.salary : undefined,
      missingGems: countMissingGems(
        rarity,
        girlData.own ? girlData.level_cap : 250
      ),
      quests: getQuests(quests, girlData),
      fullName: girlData.ref.full_name ?? '',
      bio: girlData.ref.desc ?? '',
      sources: getSources(girlData),
      variations: girlData.ref.variations.map((v) => String(v)),
      // Lore
      location: girlData.ref.location ?? '',
      career: girlData.ref.career,
      hobby: Array.isArray(girlData.ref.hobbies)
        ? ''
        : girlData.ref.hobbies.hobby,
      birthday: girlData.ref.anniv,
      favoriteFood: Array.isArray(girlData.ref.hobbies)
        ? ''
        : girlData.ref.hobbies.food,
      fetish: Array.isArray(girlData.ref.hobbies)
        ? ''
        : girlData.ref.hobbies.fetish,
      equipment: equipmentData
    };

    const commonGirl: CommonGirlData = {
      ...baseCommonGirl,
      stats: getStats(
        baseCommonGirl,
        girlData.caracs,
        currentBlessings,
        equipmentData
      )
    };

    allGirls.push(commonGirl);
  });

  return {
    allGirls: allGirls,
    activeBlessing: currentBlessings,
    nextBlessing: upcomingBlessings
  };
}

function importEquipment(armorData: ArmorData[]): EquipmentData {
  const items: Equipment[] = [];

  for (const armor of armorData) {
    const slot = armor.slot_index;
    const equipment: Equipment = {
      icon: armor.skin.ico,
      name: armor.skin.name,
      level: Number(armor.level),
      rarity: getRarity(armor.rarity),
      slot: slot,
      stats: importEquipmentStats(armor.caracs),
      resonance: importEquipmentResonance(armor.resonance_bonuses),
      uid: Number(armor.id_girl_armor_equipped) // TODO: Is this unique?
    };

    items.push(equipment);
  }

  return {
    items
  };
}

function importEquipmentStats(stats: ArmorCaracs): EquipmentStats {
  return {
    hardcore: Number(stats.carac1),
    charm: Number(stats.carac2),
    knowhow: Number(stats.carac3),
    attack: Number(stats.damage),
    defense: Number(stats.defense),
    ego: Number(stats.ego)
  };
}

function importEquipmentResonance(
  bonuses: ResonanceBonuses
): EquipmentResonance {
  return {
    class: bonuses.class ? getClass(bonuses.class.identifier) : undefined,
    ego: bonuses.class ? bonuses.class.bonus : 0,
    element:
      bonuses.element && typeof bonuses.element.identifier === 'string'
        ? toElement(bonuses.element.identifier)
        : undefined,
    defense: bonuses.element ? bonuses.element.bonus : 0,
    pose: bonuses.figure
      ? getPoseFromValue(String(bonuses.figure.identifier))
      : undefined,
    attack: bonuses.figure ? bonuses.figure.bonus : 0
  };
}

function getClass(gameClass: NumberString): Class {
  switch (gameClass) {
    case '1':
      return Class.Hardcore;
    case '2':
      return Class.Charm;
    case '3':
      return Class.Knowhow;
    default:
      console.warn('Unexpected girl class: ', gameClass);
      return Class.Hardcore;
  }
}

function getCurrentIcon(avatar: string): number {
  const lastSeparator = avatar.lastIndexOf('/'); // http://..../.../ava3.png?v=8
  let iconName = avatar.substring(lastSeparator + 1); // ava3.png?v=8
  const versionIndex = iconName.indexOf('.');
  if (versionIndex > -1) {
    iconName = iconName.substring(0, versionIndex); // ava3
  }

  return Number(iconName.at(iconName.length - 1)); // 3
}

function getSources(girlData: GirlsDataEntry): EventSource[] {
  if (Array.isArray(girlData.source_selectors)) {
    // Cross-promo girls have a [] source instead of an object
    // Alt. Lyrsa as well
    return ['unknown'];
  }
  const sources: Set<EventSource> = new Set();
  if (girlData.rarity === 'mythic') {
    sources.add('MD');
    return [...sources.values()];
  }
  if (girlData.source_selectors.pachinko) {
    if (Number(girlData.nb_grades) === 1) {
      sources.add('GP');
    } else {
      let isEp = false;
      let isMp = false;
      if (girlData.source_selectors.pachinko.length === 2) {
        isMp = true;
        isEp = true;
      } else if (girlData.source?.name === 'pachinko_epic') {
        isEp = true;
      } else if (girlData.source_selectors.pachinko.length === 1) {
        isMp = true;
      }

      if (isEp && !isMp) {
        // console.log('Maybe EP exclusive: ', girlData.name);
        isMp = true; // FIXME: We don't know if some girls are really EP-Exclusive... Assuming they are not...
      }

      if (isEp) {
        sources.add('EP');
      }
      if (isMp) {
        sources.add('MP');
      }
    }
  }
  if (girlData.source_selectors.world) {
    sources.add('Story');
  }
  if (girlData.source_selectors.poa_step) {
    sources.add('PoA');
  }
  if (girlData.source_selectors.season_tier) {
    sources.add('Season');
  }
  if (girlData.source_selectors.champion) {
    sources.add('Champion');
  }
  if (girlData.source_selectors.club_champion) {
    sources.add('CC');
  }
  if (girlData.source_selectors.boss_bang) {
    sources.add('BB');
  }
  if (girlData.source_selectors.pop) {
    sources.add('PoP');
  }
  if (girlData.source_selectors.legendary_contest) {
    sources.add('LC');
  }
  if (girlData.source_selectors.pantheon) {
    sources.add('Pantheon');
  }
  if (girlData.source_selectors.league) {
    sources.add('League');
  }
  if (girlData.source_selectors.kinky) {
    sources.add('KC');
  }
  if (girlData.source_selectors.path_of_valor) {
    sources.add('PoV');
  }
  if (girlData.source && girlData.source.name === 'seasonal_event') {
    sources.add('SE');
  }
  if (girlData.source_selectors.cumback_contest) {
    sources.add('CbC');
  }
  if (girlData.source_selectors.double_penetration) {
    sources.add('DP');
  }
  if (girlData.source_selectors.seasonal_event) {
    sources.add('SE');
  }
  if (girlData.source_selectors.event) {
    getEventTypes(girlData.source_selectors.event).forEach((source) =>
      sources.add(source)
    );
  }
  return [...sources.values()];
}

function getEventTypes(events: number[]): EventSource[] {
  const eventTypes = new Set<EventSource>();
  events.forEach((eventId) => eventTypes.add(getEventType(eventId)));
  return [...eventTypes];
}

function getEventType(eventId: number): EventSource {
  // TODO... Detect LD/CE/OD Events....
  // Careful: SE and Classic/OD/LD use the same selector (event: [1] may correspond to SE_1 or Classic_1)
  // For owned girls, it's not possible to distinguish SE vs Classic
  const eventType = eventTypes[String(eventId) as keyof typeof eventTypes];
  if (eventType !== undefined) {
    return eventType as EventSource;
  }
  return 'unknown';
}

function get0Pose(avatar: string): string {
  return getPoseN(avatar, 0);
}

interface GirlsPose {
  [key: string]: number;
}

function getPose(girlData: GirlsDataEntry): Pose {
  if (girlData.figure === undefined) {
    const girlId = girlData.id_girl;
    const knownPose = (girlsPoses as GirlsPose)[girlId];
    if (knownPose) {
      return knownPose;
    }
  }
  return getPoseFromValue(girlData.figure);
}

function getPoseFromValue(value: string | undefined): Pose {
  return value === undefined ? Pose.unknown : Number(value);
}

function getMissingAff(girlData: GirlsDataEntry, rarity: Rarity): number {
  const multiplier = getAffMultiplier(rarity);
  const target = Math.ceil(
    multiplier * getStarValue(Number(girlData.nb_grades))
  );
  const current = girlData.own ? girlData.Affection.cur : 0;
  return Math.max(0, target - current);
}

function getStarValue(star: number): number {
  switch (star) {
    case 1:
      return 180;
    case 3:
      return 1755;
    case 5:
      return 8505;
    case 6:
      return 17505;
  }
  return 0;
}

function getQuests(questsData: GameQuests, girl: GirlsDataEntry): Quest[] {
  const result: Quest[] = [];

  if (!girl.own) {
    return result;
  }

  const id = girl.id_girl;
  const maxStars = Number(girl.nb_grades);

  const girlQuestsData = questsData[id];
  if (girlQuestsData) {
    for (let i = 1; i <= maxStars; i++) {
      const girlQuest = girlQuestsData[i];
      if (girlQuest) {
        const quest: Quest = {
          idQuest: girlQuest.id_quest,
          done: girlQuest.status === 'done',
          ready: girlQuest.status === 'todo'
        };
        result.push(quest);
      } else {
        console.warn('Failed to find upgrade quest #', i, 'for girl', id);
      }
    }
  } else {
    console.warn('Failed to find upgrade quests for girl: ', id);
  }
  return result;
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

function getHairColor(girlData: GirlsDataEntry): HairColor[] {
  const hairColor = [toHairColor(girlData.hair_color1)];
  if (girlData.hair_color2 !== '') {
    hairColor.push(toHairColor(girlData.hair_color2));
  }
  return hairColor;
}

function getEyeColor(girlData: GirlsDataEntry): EyeColor[] {
  const eyeColor = [toEyeColor(girlData.eye_color1)];
  if (girlData.eye_color2 !== '') {
    eyeColor.push(toEyeColor(girlData.eye_color2));
  }
  return eyeColor;
}

function getZodiac(girlData: GirlsDataEntry): Zodiac {
  const zodiac = girlData.ref.zodiac.substring(0, 2);
  const result = Zodiacs.fromSymbol(zodiac);
  if (result === undefined) {
    throw `Unexpected zodiac value: "${girlData.ref.zodiac}"`;
  }
  return result;
}

function getElement(girlData: GirlsDataEntry) {
  return toElement(girlData.element);
}

function countMissingGems(rarity: Rarity, levelCap: number): number {
  const rarityMultiplier = Math.max(1, rarity);
  if (Number.isNaN(levelCap)) {
    return 1880 * rarityMultiplier;
  }
  switch (levelCap) {
    case 250:
      return 1880 * rarityMultiplier;
    case 300:
      return (1880 - 40) * rarityMultiplier;
    case 350:
      return (1880 - 100) * rarityMultiplier;
    case 400:
      return (1880 - 180) * rarityMultiplier;
    case 450:
      return (1880 - 280) * rarityMultiplier;
    case 500:
      return (1880 - 405) * rarityMultiplier;
    case 550:
      return (1880 - 555) * rarityMultiplier;
    case 600:
      return (1880 - 755) * rarityMultiplier;
    case 650:
      return (1880 - 1030) * rarityMultiplier;
    case 700:
      return (1880 - 1380) * rarityMultiplier;
    case 750:
      return 0;
    default:
      console.error('Unexpected level cap: ' + levelCap);
      return 1880 * rarityMultiplier;
  }
}

function getStats(
  girl: BaseGirlData,
  caracsData: CaracsEntry | undefined,
  blessings: BlessingDefinition[],
  equipmentData: EquipmentData | undefined
): Stats | undefined {
  if (caracsData) {
    const hcRaw: number = caracsData.carac1;
    const chRaw: number = caracsData.carac2;
    const khRaw: number = caracsData.carac3;

    const multiplier = getBlessingMultiplier(girl, blessings);

    const equipmentStats = equipmentData
      ? getTotalEquipmentStats(equipmentData)
      : EMPTY_STATS;
    return {
      hardcore: Number(
        (hcRaw / multiplier - equipmentStats.hardcore).toFixed(2)
      ),
      charm: Number((chRaw / multiplier - equipmentStats.charm).toFixed(2)),
      knowhow: Number((khRaw / multiplier - equipmentStats.knowhow).toFixed(2))
    };
  }
  return undefined;
}

function parseDate(date: string): number {
  return Date.parse(date);
}
