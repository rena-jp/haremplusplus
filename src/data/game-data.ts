import { Element } from './data';

export interface GameBlessingData {
  active: GameBlessing[];
  upcoming: GameBlessing[];
}

export namespace GameBlessingData {
  export function is(value: unknown): value is GameBlessingData {
    if (isUnknownObject(value)) {
      const valueKeys = Object.keys(value);
      if (valueKeys.length === 0) {
        return false;
      }
      if (valueKeys.includes('active') && valueKeys.includes('upcoming')) {
        return true;
      }
    }
    return false;
  }
}

export interface GameBlessing {
  title: string;
  description: string;
  icon_url?: string; // Removed?
  start_ts: number;
  end_ts: number;
}

export interface GirlsDataList {
  [key: string]: GirlsDataEntry;
}

export namespace GirlsDataList {
  export function isFullHaremData(
    gameGirls: unknown
  ): gameGirls is GirlsDataList {
    if (!gameGirls) {
      return false;
    }
    if (isUnknownObject(gameGirls)) {
      const girlKeys = Object.keys(gameGirls);
      if (girlKeys.length === 0) {
        return false;
      }
      // Only test the first girl. Assume that all thousand girls have a similar data format.
      const anyGirl = gameGirls[girlKeys[0]];
      if (isUnknownObject(anyGirl)) {
        // Test a few keys that are specifically defined in the harem,
        // but missing from the compact girlsDataList
        if (anyGirl.id_girl && anyGirl.name && anyGirl.ref) {
          return true;
        }
      }
    }

    return false;
  }
}

/**
 * Object with unknown properties.
 */
export interface UnknownObject {
  [key: string]: unknown;
}

export function isUnknownObject(value: unknown): value is UnknownObject {
  return !!value && typeof value === 'object';
}

export type NumberString = string;
export type DateString = string;
export type HtmlString = string;
export type GirlsDataEntry = OwnedGirlEntry | MissingGirlEntry;

export type GameRarity =
  | 'starting'
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface CommonGirlsDataEntry {
  id_girl: string;
  nb_grades: NumberString;
  class: NumberString;
  /**
   * The girl's favorite position (pose, figure).
   * Undefined for girls that are not owned.
   */
  figure?: string;
  rarity: GameRarity;
  element: string;
  name: string;
  eye_color1: string;
  eye_color2: string;
  hair_color1: string;
  hair_color2: string;
  shards: number;
  level?: NumberString;
  fav_graded?: NumberString;
  graded: number;
  date_added?: DateString;
  awakening_level?: NumberString;
  Affection?: AffectionEntry;
  can_upgrade?: boolean;
  /**
   * The current pose avatar (small icon)
   */
  ico: string;
  /**
   * The current pose image (full picture)
   */
  avatar: string;
  caracs?: CaracsEntry;
  caracs_sum?: number;
  element_data: ElementEntry;
  /**
   * The icon for the girl's favorite pose (position, figure).
   */
  position_img?: string;
  level_cap?: number;
  /**
   * Salary amount.
   */
  salary?: number;
  /**
   * Salary time, in seconds, relative to "now". Updated every second by GirlSalaryManager
   */
  pay_in?: number;
  /**
   * Salary frequency, in seconds.
   */
  pay_time?: number;
  /**
   * Salary amount per hour.
   */
  salary_per_hour?: number;
  Xp?: XpEntry;
  own: boolean;
  awakening_costs: number;
  ref: RefEntry;
  source?: SourceEntry;
  source_selectors: SourceSelectorsEntry | [];
  html: HtmlString;
}
export interface OwnedGirlEntry extends CommonGirlsDataEntry {
  own: true;
  figure: string;
  level: NumberString;
  fav_graded: NumberString;
  date_added: DateString;
  awakening_level: NumberString;
  Affection: AffectionEntry;
  can_upgrade: boolean;
  caracs: CaracsEntry;
  caracs_sum: number;
  position_img: string;
  level_cap: number;
  salary: number;
  pay_in: number;
  pay_time: number;
  salary_per_hour: number;
  Xp: XpEntry;
}
export interface MissingGirlEntry extends CommonGirlsDataEntry {
  own: false;
  source?: SourceEntry;
}

export interface AffectionEntry {
  cur: number;
  min: number;
  max: number;
  level: number;
  left: number;
  ratio: number;
  maxed: boolean;
}

export interface CaracsEntry {
  carac1: number;
  carac2: number;
  carac3: number;
}

export interface ElementEntry {
  type: string;
  ico_url: string;
  flavor: string;
  // etc.
}

export interface XpEntry {
  cur: number;
  min: number;
  max: number;
  level: number;
  left: number;
  ratio: number;
  maxed: boolean;
}

export interface RefEntry {
  id_girl_ref: string;
  id_girl_clicker?: string;
  full_name: string;
  desc: string;
  location: string;
  career: string;
  eyes: HtmlString;
  hair: HtmlString;
  hobbies: HobbiesEntry;
  anniv: string;
  zodiac: string;
  variations: string[];
}

export interface HobbiesEntry {
  food: string;
  hobby: string;
  fetish: string;
}

export interface SourceSelectorsEntry {
  [key: string]: number[];
}

export interface SourceEntry {
  name: string;
  group: {
    name: string;
    id: number;
  };
  ongoing: boolean;
  sentence: string;
  anchor_source: {
    url: string;
    label: string;
    disabled: boolean;
  };
  anchor_win_from: {
    url: string;
    label: string;
    disabled: boolean;
  }[];
}

export interface GirlsSalaryList {
  [key: string]: GirlsSalaryEntry;
}

export interface GirlsSalaryEntry {
  salary: number;
  /**
   * Pay in N seconds
   */
  pay_in: number;
}

/**
 * A map of ID girl -> Quest list
 */
export interface GameQuests {
  [key: string]: GameQuestList | undefined;
}

export namespace GameQuests {
  export function is(value: unknown): value is GameQuests {
    if (isUnknownObject(value)) {
      return isQuestList(value['1']);
    }
    return false;
  }

  export function isQuestList(value: unknown): value is GameQuestList {
    if (isUnknownObject(value)) {
      return isQuest(value['1']);
    }
    return false;
  }
  export function isQuest(value: unknown): value is GameQuest {
    if (isUnknownObject(value)) {
      return (
        typeof value.id_quest === 'number' &&
        value.type === 'girl_grade' &&
        typeof value.status === 'string'
      );
    }
    return false;
  }
}

/**
 * A map of grade # -> Quest description
 */
export interface GameQuestList {
  [key: string]: GameQuest | undefined;
}

/**
 * Quest details (Upgrade scene)
 */
export interface GameQuest {
  id_quest: number;
  win: { grade: NumberString[] };
  type: 'girl_grade';
  name: string;
  num_step: 255;
  status: 'done' | 'todo' | 'later';
  url: string;
  begin_step: 1;
}

export interface GameWindow extends Window {
  girlsDataList: GirlsDataList | GirlsSalaryList;
  girl_quests: GameQuests | undefined;
  player_gems_amount: GemsData;
  Hero: Hero;
  blessings_data: unknown;
  GirlSalaryManager: GirlSalaryManager;
  Collect: Collect;
  /**
   * Predefined js class
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Girl: any;
  /**
   * JQuery
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $: any;
  /**
   * Game Translation object
   */
  GT: GT;
  number_format_lang(value: number, decimals?: number): string;
  notificationData: {
    [key: string]: string;
  };
  player_inventory: GameInventory | undefined;
}

export interface GemsData {
  darkness: GemsEntry;
  fire: GemsEntry;
  light: GemsEntry;
  nature: GemsEntry;
  psychic: GemsEntry;
  stone: GemsEntry;
  sun: GemsEntry;
  water: GemsEntry;
}

export namespace GemsData {
  export function is(object: unknown): object is GemsData {
    if (isUnknownObject(object)) {
      if (isUnknownObject(object.darkness)) {
        return (
          typeof object.darkness.amount === 'string' ||
          typeof object.darkness.amount === 'number'
        );
      }
    }
    return false;
  }
}

export interface GemsEntry {
  amount: NumberString;
  gem: { flavor: string; ico: string; type: string };
}

export interface GT {
  design: { [key: string]: string };
  // Etc.
}

export interface GirlSalaryManager {
  updateHomepageTimer(): void;
  init(girls: { [key: string]: unknown }, isHome: boolean): void;
  girlsMap: { [key: string]: GirlObject };
}

export interface GirlObject {
  gData: GirlsSalaryEntry;
  gId: NumberString;
  readyForCollect: boolean;
}

export interface Collect {
  changeDisableBtnState(disabled: boolean): void;
}

/**
 * Game object "window.Hero"
 */
export interface Hero {
  caracs: string[];
  energies: unknown;
  energy_fields: unknown;
  infos: HeroInfos;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(property: string, value: any, add: boolean): void;
}

// Properties of game object "window.Hero.infos"
export interface HeroInfos {
  Xp: unknown;
  // etc.
  level: number;
  name: string;
}

export function getGameWindow(): GameWindow {
  return window as unknown as GameWindow;
}

export interface ChangePoseResult {
  success: boolean;
  ico: string;
  ava: string;
}

export namespace ChangePoseResult {
  export function is(object: unknown): object is ChangePoseResult {
    if (isUnknownObject(object)) {
      return (
        typeof object.success === 'boolean' &&
        typeof object.ico === 'string' &&
        typeof object.ava === 'string'
      );
    }
    return false;
  }
}

export function countGems(data: GemsData): Map<Element, number> {
  const result = new Map<Element, number>();
  result.set(Element.dark, Number(data.darkness.amount));
  result.set(Element.blue, Number(data.water.amount));
  result.set(Element.yellow, Number(data.sun.amount));
  result.set(Element.green, Number(data.nature.amount));
  result.set(Element.orange, Number(data.stone.amount));
  result.set(Element.purple, Number(data.psychic.amount));
  result.set(Element.red, Number(data.fire.amount));
  result.set(Element.white, Number(data.light.amount));
  return result;
}

export interface GameInventory {
  gift: InventoryItem[];
  potion: InventoryItem[];
}

export namespace GameInventory {
  export function is(object: unknown): object is GameInventory {
    if (isUnknownObject(object)) {
      return Array.isArray(object.gift) && Array.isArray(object.potion);
    }
    return false;
  }
}

export interface InventoryItem {
  id_item: NumberString;
  id_member: NumberString;
  item: GameItem;
  price_buy: number;
  price_sell: number;
  quantity: NumberString;
}

export interface GameItem {
  carac1: NumberString;
  carac2: NumberString;
  carac3: NumberString;
  chance: NumberString;
  currency: string;
  damage: NumberString;
  display_price: number;
  duration: NumberString;
  ego: NumberString;
  endurance: NumberString;
  ico: string;
  id_item: NumberString;
  identifier: string;
  name: string;
  price: NumberString;
  rarity: GameRarity;
  skin: string;
  type: string;
  value: NumberString;
}
