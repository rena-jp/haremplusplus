import { firstToUpper } from '../components/common';

export enum Rarity {
  starting,
  common,
  rare,
  epic,
  legendary,
  mythic
}

export function getRarity(rarity: keyof typeof Rarity): Rarity {
  return Rarity[rarity];
}

export namespace Rarities {
  export function toString(rarity: Rarity): string {
    return Rarity[rarity];
  }

  export function fromString(rarity: keyof typeof Rarity): Rarity {
    return Rarity[rarity];
  }
}

export type EventSource =
  | 'MP' // Done
  | 'EP' // Done
  | 'GP' // Done
  | 'LD' // Done
  | 'ED' // Done
  | 'MD' // Done
  | 'LC' // Done
  | 'CE' // Done
  | 'OD' // Done
  | 'PoP' // Done
  | 'Story' // Done
  | 'CC' // Done
  | 'Champion' // Done
  | 'BB' // Done
  | 'Season' // Done
  | 'PoA' // Done
  | 'League' // Done
  | 'Pantheon' // Done
  | 'KC' // Done
  | 'PoV' // Done
  | 'SE' // Done (Probably. Hard to distinguish from CE; use same IDs)
  | 'Anniv' // Done
  | 'unknown';

export function isEventSource(value: string): value is EventSource {
  return true; // Optimism lvl >9000
}

export interface BaseGirlData {
  id: string;
  name: string;
  icon: string;
  icon0: string;
  poseImage: string;
  poseImage0: string;
  class: Class;
  level?: number;
  maxLevel?: number;
  own: boolean;
  rarity: Rarity;
  maxStars: number;
  stars: number;
  shards: number;
  hairColor: HairColor[];
  eyeColor: EyeColor[];
  zodiac: Zodiac;
  element: Element;
  pose: Pose;
  missingAff: number;
  currentAffection: number;
  upgradeReady: boolean;
  currentGXP: number;
  currentIcon: number;
  missingGems: number;
  fullName: string;
  sources: EventSource[];
  quests: Quest[];
  /** Timestamp */
  recruited?: number;
  /**
   * Salary frequency, in seconds. Only for owned girls.
   */
  salaryTime?: number;
  /**
   * Salary value. Only for owned girls.
   */
  salary?: number;
  /**
   * Variations of this character. Ids.
   */
  variations?: string[];

  // Lore

  bio: string;
  location: string;
  career: string;
  favoriteFood: string;
  birthday: string;
  hobby: string;
  fetish: string;
}

/**
 * "Quests" are upgrade scenes
 */
export interface Quest {
  idQuest: number;
  done: boolean;
  ready: boolean;
}

/**
 * GirlData, imported from the game (harem)
 */
export interface CommonGirlData extends BaseGirlData {
  stats?: Stats;
}

export interface Stats {
  charm: number;
  hardcore: number;
  knowhow: number;
}

export enum Class {
  Hardcore,
  Charm,
  Knowhow
}

export enum Blessing {
  Rarity,
  HairColor,
  EyeColor,
  Zodiac,
  Pose,
  Element
}
export enum HairColor {
  pink,
  red,
  darkBlond,
  white,
  dark,
  blue,
  blond,
  green,
  unknown,
  brown,
  silver,
  purple,
  orange,
  strawberryBlond,
  darkPink,
  black,
  grey,
  golden
}
export enum EyeColor {
  pink,
  blue,
  brown,
  green,
  golden,
  red,
  darkPink,
  orange,
  grey,
  silver,
  black,
  unknown,
  purple
}
export enum Zodiac {
  aries,
  taurus,
  gemini,
  cancer,
  leo,
  virgo,
  libra,
  scorpio,
  sagittarius,
  capricorn,
  aquarius,
  pisces
}
export enum Pose {
  unknown,
  doggie,
  dolphin,
  missionary,
  sodomy,
  sixnine,
  jackhammer,
  nosedive,
  column,
  indian,
  suspended,
  splitting,
  bridge
}

export namespace Poses {
  export function toString(pose: Pose): string {
    return Pose[pose];
  }
}

export enum Element {
  red,
  blue,
  yellow,
  orange,
  green,
  purple,
  white,
  dark
}

export namespace Blessings {
  export function values(): Blessing[] {
    return Object.values(Blessing).filter(
      (v) => !isNaN(Number(v))
    ) as Blessing[];
  }

  export function getEnumType(
    blessing: Blessing
  ):
    | typeof HairColor
    | typeof Rarity
    | typeof EyeColor
    | typeof Zodiac
    | typeof Pose
    | typeof Element {
    switch (blessing) {
      case Blessing.HairColor:
        return HairColor;
      case Blessing.Rarity:
        return Rarity;
      case Blessing.EyeColor:
        return EyeColor;
      case Blessing.Zodiac:
        return Zodiac;
      case Blessing.Pose:
        return Pose;
      case Blessing.Element:
        return Element;
    }
  }

  export function toString(blessing: Blessing): string {
    return Blessing[blessing];
  }

  export function fromString(blessing: keyof typeof Blessing): Blessing {
    return Blessing[blessing];
  }

  export function stringValue(
    blessing: Blessing,
    blessingValue: HairColor | Rarity | EyeColor | Zodiac | Pose | Element
  ): string {
    const valueType = getEnumType(blessing);
    return valueType[blessingValue];
  }

  export function toDisplayString(
    blessing: Blessing,
    blessingValue: HairColor | Rarity | EyeColor | Zodiac | Pose | Element
  ): string {
    if (blessing === Blessing.Zodiac) {
      return Zodiacs.toDisplayString(blessingValue as Zodiac);
    }
    return stringValue(blessing, blessingValue);
  }

  export function getBlessingValue(
    girl: BaseGirlData,
    blessing: Blessing
  ): number | number[] {
    switch (blessing) {
      case Blessing.HairColor:
        return girl.hairColor;
      case Blessing.Rarity:
        return girl.rarity;
      case Blessing.EyeColor:
        return girl.eyeColor;
      case Blessing.Zodiac:
        return girl.zodiac;
      case Blessing.Pose:
        return girl.pose;
      case Blessing.Element:
        return girl.element;
    }
  }
}

export namespace Elements {
  export function values(): Element[] {
    return Object.values(Element).filter((v) => !isNaN(Number(v))) as Element[];
  }

  export function toString(element: Element): string {
    return Element[element];
  }
}

export namespace Zodiacs {
  export const Symbols = [
    '♈︎',
    '♉︎',
    '♊︎',
    '♋︎',
    '♌︎',
    '♍︎',
    '♎︎',
    '♏︎',
    '♐︎',
    '♑︎',
    '♒︎',
    '♓︎'
  ];

  export function fromString(zodiac: keyof typeof Zodiac): Zodiac {
    return Zodiac[zodiac];
  }

  export function fromSymbol(zodiacSymbol: string): Zodiac | undefined {
    switch (zodiacSymbol) {
      case '♈︎':
        return Zodiac.aries;
      case '♉︎':
        return Zodiac.taurus;
      case '♊︎':
        return Zodiac.gemini;
      case '♋︎':
        return Zodiac.cancer;
      case '♌︎':
        return Zodiac.leo;
      case '♍︎':
        return Zodiac.virgo;
      case '♎︎':
        return Zodiac.libra;
      case '♏︎':
        return Zodiac.scorpio;
      case '♐︎':
        return Zodiac.sagittarius;
      case '♑︎':
        return Zodiac.capricorn;
      case '♒︎':
        return Zodiac.aquarius;
      case '♓︎':
        return Zodiac.pisces;
    }
    console.error('Unknown Zodiac symbol: ', zodiacSymbol);
    return undefined;
  }

  export function toDisplayString(zodiac: Zodiac): string {
    const name = Zodiac[zodiac];
    return Symbols[zodiac] + ' ' + firstToUpper(name);
  }
}

export interface BlessingType {
  blessing: Blessing;
  blessingValue: Rarity | HairColor | EyeColor | Zodiac | Pose | Element;
}

export interface BlessingDefinition extends BlessingType {
  blessingBonus: number;
}

export function allBlessingTypes(): BlessingType[] {
  const result: BlessingType[] = [];
  for (const blessing of Blessings.values()) {
    const values = Blessings.getEnumType(blessing);
    for (const value of Object.keys(values).filter((k) => !isNaN(Number(k)))) {
      result.push({ blessing: blessing, blessingValue: Number(value) });
    }
  }
  return result;
}

export function getBlessingMultiplier(
  girl: BaseGirlData,
  blessings: BlessingDefinition[]
): number {
  let multiplier = 1.0;

  for (const blessing of blessings) {
    if (matchesBlessing(girl, blessing)) {
      multiplier *= 1 + blessing.blessingBonus / 100.0;
    }
  }

  return multiplier;
}

export function getMatchingGirls(
  girls: CommonGirlData[],
  blessing: BlessingType,
  excludeCommonRare = false
): CommonGirlData[] {
  return girls.filter((girl) =>
    matchesBlessing(girl, blessing, excludeCommonRare)
  );
}

export function matchesBlessings(
  girl: BaseGirlData,
  blessings: BlessingDefinition[]
): boolean {
  return blessings.some((blessing) => matchesBlessing(girl, blessing));
}

export function matchesBlessing(
  girl: BaseGirlData,
  blessing: BlessingType,
  excludeCommonRare = false
): boolean {
  const blessingValue = Blessings.getBlessingValue(girl, blessing.blessing);

  if (excludeCommonRare && blessing.blessing !== Blessing.Rarity) {
    if (
      girl.rarity === Rarity.starting ||
      girl.rarity === Rarity.common ||
      girl.rarity === Rarity.rare
    ) {
      return false;
    }
  }

  // Special case: "Rarity Common" blessing should also include starting girls
  if (
    blessing.blessing === Blessing.Rarity &&
    blessing.blessingValue === Rarity.common &&
    girl.rarity === Rarity.starting
  ) {
    return true;
  }

  if (typeof blessingValue === 'number') {
    return blessingValue === blessing.blessingValue;
  } else {
    return (
      blessingValue.find((value) => value === blessing.blessingValue) !==
      undefined
    );
  }
}

export function getBlessedStats(
  girl: CommonGirlData,
  stats: Stats,
  blessing: BlessingDefinition[]
): Stats {
  const blessingMultiplier = getBlessingMultiplier(girl, blessing);
  return {
    hardcore: Number((stats.hardcore * blessingMultiplier).toFixed(2)),
    charm: Number((stats.charm * blessingMultiplier).toFixed(2)),
    knowhow: Number((stats.knowhow * blessingMultiplier).toFixed(2))
  };
}

export function getTotalPower(stats: Stats): number {
  return stats.hardcore + stats.charm + stats.knowhow;
}

export function getBasePower(
  stats: Stats,
  level: number,
  stars: number,
  maxStars: number
): number {
  const starMultiplier = 1 + stars * 0.3;
  const maxStarMultiplier = 1 + maxStars * 0.3;

  return (getTotalPower(stats) / level / starMultiplier) * maxStarMultiplier;
}

export function getNormalizedPower(
  girl: CommonGirlData,
  blessings: BlessingDefinition[]
): number {
  const stats = girl.stats;
  if (stats === undefined) {
    return 0;
  }
  const basePower = getBasePower(
    stats,
    girl.level ?? 1,
    girl.stars,
    girl.maxStars
  );
  const multiplier = getBlessingMultiplier(girl, blessings);
  const total = basePower * multiplier;
  const roundedTotal = parseFloat(total.toFixed(3));
  return roundedTotal;
}

export function equalBlessing(
  blessing1: BlessingType,
  blessing2: BlessingType
): boolean {
  return (
    blessing1.blessing === blessing2.blessing &&
    blessing1.blessingValue === blessing2.blessingValue
  );
}

/**
 * Replace a girl value in an array of girls. This function is a no-op if the girl
 * is already present in the array (same reference, nothing to change), or if no
 * girl with the same ID is present (nothing to replace).
 *
 * @param girls The array of girls.
 * @param girl The girl to insert in the array
 */
export function replace(girls: CommonGirlData[], girl: CommonGirlData): void {
  const indexToReplace = girls.findIndex((g) => g !== girl && g.id === girl.id);
  if (indexToReplace > -1) {
    girls[indexToReplace] = girl;
  }
}

export interface HaremData {
  allGirls: CommonGirlData[];
  activeBlessing: BlessingDefinition[];
  nextBlessing: BlessingDefinition[];
}

export function getPoseN(avatar: string, pose: number): string {
  const lastSeparator = avatar.lastIndexOf('/'); // http://..../.../ava3.png?v=8
  const filePath = avatar.substring(0, lastSeparator + 1); // http://..../.../
  let iconName = avatar.substring(lastSeparator + 1); // ava3.png?v=8
  const versionIndex = iconName.indexOf('.');
  if (versionIndex > -1) {
    iconName = iconName.substring(0, versionIndex); // ava3
  }
  return filePath + iconName.substring(0, iconName.length - 1) + `${pose}.png`; // http://..../.../ava1.png
}

export interface Inventory {
  books: BookEntry[];
  gifts: GiftEntry[];
}

export interface ItemEntry<T extends Item> {
  count: number;
  item: T;
}

export interface BookEntry extends ItemEntry<Book> {
  book: Book;
}

export interface GiftEntry extends ItemEntry<Gift> {
  gift: Gift;
}

export interface Item {
  type: string;
  itemId: number;
  label: string;
  rarity: Rarity;
  icon: string;
}

export interface Book extends Item {
  type: 'book';
  xp: number;
}

export interface Gift extends Item {
  type: 'gift';
  aff: number;
}

export function getSourceLabel(source: EventSource): string {
  switch (source) {
    case 'Anniv':
      return 'Anniversary';
    case 'BB':
      return 'Boss Bang';
    case 'CC':
      return 'Club Champion';
    case 'CE':
      return 'Classic Event';
    case 'Champion':
      return 'Champion';
    case 'ED':
      return 'Epic Days';
    case 'EP':
      return 'Epic Pachinko';
    case 'GP':
      return 'Great Pachinko';
    case 'KC':
      return 'Kinky Cumpetition';
    case 'LC':
      return 'Legendary Contest';
    case 'LD':
      return 'Legendary Days';
    case 'League':
      return 'League';
    case 'MD':
      return 'Mythic Days';
    case 'MP':
      return 'Mythic Pachinko';
    case 'OD':
      return 'Orgy Days';
    case 'Pantheon':
      return 'Pantheon';
    case 'PoA':
      return 'Path of Attraction';
    case 'PoP':
      return 'Places of Power';
    case 'PoV':
      return 'Path of Valor';
    case 'SE':
      return 'Seasonal Event';
    case 'Season':
      return 'Season';
    case 'Story':
      return 'Story';
    case 'unknown':
      return 'Unknown';
  }
}

export interface QuestData {
  girlId: string;
  questId: number;
  step: number;
  /** Scene image (800x?)*/
  scene: string;
  /** High quality scene image (1600x) */
  sceneFull: string;
  dialogue: string;
  portrait?: string;
  cost?: number;
}

export const SPECIAL_MYTHIC_BOOK_ID = 631;
export const SPECIAL_MYTHIC_GIFT_ID = 627;
