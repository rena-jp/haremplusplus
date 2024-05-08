import { Element, QuestData, SkillTiers } from './data';

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
      // FIXME: Improve type checking here; format has changed several times...
      if (valueKeys.includes('active') && valueKeys.includes('upcoming')) {
        return true;
      }
    }
    return false;
  }
}

export type GameBlessing = RelativeGameBlessing | AbsoluteGameBlessing;

export type RelativeGameBlessing = {
  title: string;
  description: string;
  icon_url?: string; // Removed?
  remaining_time: number;
  starts_in: number;
};

export type AbsoluteGameBlessing = {
  title: string;
  description: string;
  icon_url?: string; // Removed?
  start_ts: number;
  end_ts: number;
};

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

/**
 * A value that represents a number. In Json, may be serialized
 * either as a string or a number, depending on KK's mood.
 */
export type NumberString = string | number;
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
  id_girl: NumberString;
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
  id_role?: number | null;
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

  // Girls equipment
  armor?: ArmorData[];
  skill_tiers_info: SkillTiers;
  zodiac: string;
  anniversary: string;
  upgrade_quests: number[];
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
  full_name: string | null;
  desc: string | null;
  location: string | null;
  career: string;
  eyes: HtmlString;
  hair: HtmlString;
  hobbies: HobbiesEntry | [];
  anniv: string;
  zodiac: string;
  variations: NumberString[];
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
 * Represents an item currently equipped by a girl.
 */
export interface ArmorData {
  id_girl_armor_equipped: NumberString;
  id_member: NumberString;
  id_girl_item_armor: NumberString;
  level: NumberString;
  class: NumberString;
  class_resonance: ClassResonance;
  element: string; // Element enum, e.g. "", "light", "psychic", ...
  element_resonance: ElementResonance;
  figure: string;
  figure_resonance: FigureResonance;
  id_girl: string;
  caracs: ArmorCaracs;
  slot_index: number;
  skin: ArmorSkin;
  armor: ArmorTypeCaracs;
  rarity: GameRarity;
  type: 'girl_armor';
  resonance_bonuses: ResonanceBonuses;
}

/**
 * Represents an item currently in the inventory.
 */
export interface GirlEquipment {
  id_girl_armor: NumberString;
  id_member: NumberString;
  id_girl_item_armor: NumberString;
  id_item_skin: NumberString;
  id_variation: NumberString;
  level: NumberString;
  caracs: ArmorCaracs;
  slot_index: number;
  armor: ArmorTypeCaracs;
  skin: ArmorSkin;
  variation: unknown; // null?
  rarity: GameRarity;
  type: 'girl_armor';
  resonance_bonuses: ResonanceBonuses;
}

export interface GirlEquipmentResult extends RequestResult {
  items: GirlEquipment[];
}

export namespace GirlEquipmentResult {
  export function is(value: unknown): value is GirlEquipmentResult {
    if (isUnknownObject(value)) {
      if (value.success === true && Array.isArray(value.items)) {
        return true;
      }
    }
    return false;
  }
}

export type ClassResonance = 'ego' | ''; // No more RNG here; ego or nothing
export type ElementResonance = 'defense' | ''; // No more RNG here; defense or nothing
export type FigureResonance = 'damage' | ''; // No more RNG here; defense or nothing

export interface ArmorCaracs {
  carac1: number;
  carac2: number;
  carac3: number;
  damage: number;
  defense: number;
  ego: number;
}

export interface ArmorTypeCaracs extends ArmorCaracs {
  rarity: string;
  id_girl_item_armor: NumberString;
}

export type ResonanceBonuses = EmptyResonance | ResonanceBonusesValue;

export type EmptyResonance = [];

export interface ResonanceBonusesValue {
  class?: ResonanceBonus;
  element?: ResonanceBonus;
  figure?: ResonanceBonus;
}

export interface ResonanceBonus {
  identifier: NumberString;
  resonance: 'ego' | 'defense' | 'damage';
  bonus: number;
}

export interface ArmorSkin {
  subtype: NumberString;
  wearer: 'girl';
  weight: NumberString; // WTF?!
  name: string;
  ico: string;
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

export type QuestStatus = 'done' | 'todo' | 'later';

/**
 * Quest details (Upgrade scene)
 */
export interface GameQuest {
  id_quest: number;
  win: { grade: NumberString[] };
  type: 'girl_grade';
  name: string;
  num_step: 255;
  status: QuestStatus;
  url: string;
  begin_step: 1;
}

declare global {
  export interface Window {
    girls_data_list: GirlsDataList | GirlsSalaryList;
    girl_quests: GameQuests | undefined;
    player_gems_amount: GemsData;
    Hero?: Hero;
    blessings_data: unknown;
    GirlSalaryManager?: GirlSalaryManager;
    Collect?: Collect;
    /**
     * Predefined js class
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Girl?: any;
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

    // Note: this isn't actually a global variable. The quest_handler
    // exposes it at runtime. It may not be immediately available.
    setQuestData?(questData: GameQuestStep): void;
    questData?: GameQuestStep;
    loadingAnimation?: { isLoading: boolean };
    teams_data?: TeamsData;
    hh_ajax?(
      params: any,
      callback?: any,
      err_callback?: any
    ): { promise(): Promise<any> };
    getDocumentHref?(url?: string): string;
    shared?: {
      Hero: Hero;
      Girl: any;
      GirlSalaryManager: GirlSalaryManager;
      general: {
        getDocumentHref(url?: string): string;
        hh_ajax(
          params: any,
          callback?: any,
          err_callback?: any
        ): { promise(): Promise<any> };
        Collect: Collect;
      };
      animations: {
        loadingAnimation: { isLoading: boolean };
      };
    };
  }
}

export interface TeamsData {
  [key: NumberString]: TeamDataEntry; // Index starts at "1" up to "16"
}

export namespace TeamsData {
  export function isTeamsData(value: unknown): value is TeamsData {
    if (isUnknownObject(value)) {
      for (const key in value) {
        const entry = value[key];
        if (!TeamsData.is(entry)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  export function is(object: unknown): object is TeamDataEntry {
    if (isUnknownObject(object)) {
      return (
        (isUnknownObject(object.caracs) &&
          Array.isArray(object.girls_ids) &&
          typeof object.total_power === 'number' &&
          object.id_team === null) ||
        (Number(object.id_team) > 0 && typeof object.locked === 'boolean')
      );
    }
    return false;
  }
}

export interface TeamDataEntry {
  caracs: TeamCaracsEntry;
  girls_ids: NumberString[];
  id_team: NumberString | null;
  total_power: number;
  locked: boolean;
  // Other unused attributes...
  girls: unknown[];
}

export interface TeamCaracsEntry {
  chance: number;
  damage: number;
  defense: number;
  ego: number;
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
  currencies: Currencies;
  energies: unknown;
  energy_fields: unknown;
  infos: HeroInfos;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(property: string, value: any, add: boolean): void;
}

// Properties of game object "window.Hero.infos"
export interface HeroInfos {
  Xp: unknown;
  xp: number;
  id: number;
  level: number;
  name: string;
  carac1: number;
  carac2: number;
  carac3: number;
  caracs: unknown;
  // etc.
}

export interface Currencies {
  frames: number;
  soft_currency: number;
  hard_currency: number;
  sultry_coins: number;
  ticket: number;
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

export interface TeamCaracsResult {
  success: boolean;
  total_power: number;
  caracs: {
    ego: number;
    damage: number;
    defense: number;
    chance: number;
  };
}

export namespace TeamCaracsResult {
  export function is(value: unknown): value is TeamCaracsResult {
    if (isUnknownObject(value)) {
      if (
        value.success === true &&
        typeof value.total_power === 'number' &&
        isUnknownObject(value.caracs)
      ) {
        // TODO also check for caracs
        return true;
      }
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

export interface RequestResult {
  success: boolean;
}

export namespace RequestResult {
  export function is(object: unknown): object is RequestResult & UnknownObject {
    if (isUnknownObject(object)) {
      return typeof object.success === 'boolean';
    }
    return false;
  }
}

export interface SuccessXPResult {
  success: true;
  can_pex: boolean;
  xp: number;
  level_up: boolean;
  level: number;
  girl: unknown | null; // Subset of GirlsDataEntry. Contains updated data about aff/xp status. null when using a single item?
}
export interface FailedResult {
  success: false;
}

export type XPResult = SuccessXPResult | FailedResult;

export namespace XPResult {
  export function is(object: unknown): object is XPResult {
    if (isUnknownObject(object)) {
      if (typeof object.success === 'boolean') {
        if (object.success) {
          return (
            typeof object.can_pex === 'boolean' &&
            typeof object.xp === 'number' &&
            typeof object.level_up === 'boolean' &&
            typeof object.level === 'number' &&
            (isUnknownObject(object.girl) || object.girl === null)
          );
        } else {
          return true;
        }
      }
    }
    return false;
  }
}

export interface SuccessGiftResult {
  can_upgrade: { upgradable: true; quest: string } | { upgradable: false };
  affection: number;
  success: true;
}

export type GiftResult = FailedResult | SuccessGiftResult;

export namespace GiftResult {
  export function is(object: unknown): object is GiftResult {
    if (isUnknownObject(object)) {
      if (typeof object.success === 'boolean') {
        if (object.success) {
          return (
            isUnknownObject(object.can_upgrade) &&
            typeof (object.can_upgrade.upgradable === 'boolean') &&
            typeof object.affection === 'number'
          );
        } else {
          return true;
        }
      }
    }
    return false;
  }
}

export interface GameQuestStep {
  id: number;
  currentStepNum: number;
  steps: GameQuestStepData[] | string[][];
  tutorialData: unknown;
  status: QuestStatus;
  questNavData: unknown;
  questGradeData: unknown[];
  questType: string;
  questWin: unknown;
  quest_fullscreen: unknown;
  angel_enabled: unknown; // Tutorial
}

export interface GameQuestStepData {
  num_step: number;
  portrait: string;
  picture: string;
  item: null;
  cost?: { $: number; HC: number };
  win: unknown[]; // Don't care
  dialogue: string;
  end: boolean;
}

export namespace GameQuestStep {
  export function is(object: unknown): object is GameQuestStep {
    if (isUnknownObject(object)) {
      return (
        typeof object.id === 'number' &&
        typeof object.currentStepNum === 'number' &&
        Array.isArray(object.steps) &&
        object.questType === 'girl_grade'
      );
    }
    return false;
  }
}

export interface UpgradeResult extends RequestResult {
  success: true;
  next_step: unknown;
  changes: {
    soft_currency?: number;
    hard_currency?: number;
  };
}

export namespace UpgradeResult {
  export function is(object: unknown): object is UpgradeResult {
    if (RequestResult.is(object)) {
      return (
        isUnknownObject(object.next_step) && isUnknownObject(object.changes)
      );
    }
    return false;
  }
}

export function toQuestData(
  girlId: string,
  gameQuestStep: GameQuestStep
): QuestData {
  const data = gameQuestStep.steps[0];
  if (Array.isArray(data)) {
    // For some reason, the scene picture is not directly part of the data when the scene
    // has already been unlocked (past scenes). We need to rebuild it...
    // In this case, there is also no cost and no portrait.
    const scene = `/img/quests/${gameQuestStep.id}/1/800x450cut/${data[2].split('?')[0]}.jpg`;
    return {
      girlId,
      questId: gameQuestStep.id,
      dialogue: data[0],
      scene,
      sceneFull: resizeScene(scene),
      step: gameQuestStep.currentStepNum
    };
  } else {
    return {
      girlId,
      questId: gameQuestStep.id,
      cost: data.cost?.$,
      dialogue: data.dialogue,
      portrait: data.portrait,
      scene: data.picture,
      sceneFull: resizeScene(data.picture),
      step: gameQuestStep.currentStepNum
    };
  }
}

function resizeScene(picture: string): string {
  // picture may use different formats:
  // /img/quests/1002156/1/800x/1002156.jpg  // Half size, old
  // /img/quests/1002156/1/1600x/1002156.jpg  // Full size, old
  // /img/quests/1002156/1/800x450cut/1002156.jpg // Half size, new
  // /img/quests/1002156/1/1600x900cut/1002156.jpg // Full size, new
  if (picture.includes('/800x/')) {
    return picture.replace('/800x/', '/1600x/');
  } else if (picture.includes('/800x450cut/')) {
    return picture.replace('/800x450cut/', '/1600x900cut/');
  }
  return picture;
}

export interface MaxOutResult extends RequestResult {
  selection: { [key: string]: number };
  excess: number;
  success: true;
}
export interface MaxOutConfirmResult extends MaxOutResult {
  girlData: unknown;
}

export namespace MaxOutResult {
  export function is(object: unknown): object is MaxOutResult {
    if (isUnknownObject(object)) {
      return (
        object.success === true &&
        typeof object.excess === 'number' &&
        isUnknownObject(object.selection)
      );
    }
    return false;
  }

  export function isConfirm(object: unknown): object is MaxOutConfirmResult {
    return (
      isUnknownObject(object) &&
      isUnknownObject(object.girl_data) &&
      MaxOutResult.is(object)
    );
  }
}

export function fixBlessing(blessing: GameBlessingData): GameBlessingData {
  const active = blessing.active.map(toAbsoluteTime);
  const upcoming = blessing.upcoming.map(toAbsoluteTime);

  return { active, upcoming };
}

export function toAbsoluteTime(blessing: GameBlessing): AbsoluteGameBlessing {
  if ('start_ts' in blessing) {
    return blessing;
  }
  const now = Date.now();
  return {
    description: blessing.description,
    title: blessing.title,
    icon_url: blessing.icon_url,
    start_ts: now + blessing.starts_in,
    end_ts: now + blessing.remaining_time
  };
}

export interface UnequipActionResult extends RequestResult {
  unequipped_armor: ArmorData[] | ArmorData | null;

  /** Present for equip-all / unequip-all */
  caracs?: {
    carac1: number;
    carac2: number;
    carac3: number;
  };

  inventory_armor: GirlEquipment[] | GirlEquipment | null | undefined;
}

export interface EquipActionResult extends UnequipActionResult {
  equipped_armor: ArmorData[] | ArmorData;
}

export namespace UnequipActionResult {
  export function is(value: unknown): value is UnequipActionResult {
    if (RequestResult.is(value) && value.success) {
      if (
        value.unequipped_armor !== undefined &&
        (value.caracs === undefined || isUnknownObject(value.caracs))
      ) {
        return true;
      }
    }
    return false;
  }
}

export namespace EquipActionResult {
  export function is(value: unknown): value is EquipActionResult {
    if (UnequipActionResult.is(value)) {
      const action = value as UnknownObject;
      if (
        Array.isArray(action.equipped_armor) ||
        isUnknownObject(action.equipped_armor)
      ) {
        return true;
      }
    }
    return false;
  }
}
