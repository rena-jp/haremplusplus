import {
  Book,
  CommonGirlData,
  Equipment,
  getPoseN,
  Gift,
  QuestData,
  Team
} from '../data/data';
import {
  ChangePoseResult,
  EquipActionResult,
  fixBlessing,
  GameBlessingData,
  GameInventory,
  GameQuests,
  GameQuestStep,
  GemsData,
  GiftResult,
  GirlEquipment,
  GirlEquipmentResult,
  GirlsDataList,
  GirlsSalaryEntry,
  GirlsSalaryList,
  Hero,
  isUnknownObject,
  MaxOutResult,
  RequestResult,
  TeamCaracsResult,
  TeamDataEntry,
  TeamsData,
  toQuestData,
  UnequipActionResult,
  UpgradeResult,
  XPResult
} from '../data/game-data';
import {
  GameAPI,
  ItemSelection,
  MaxOutItems,
  queue,
  RequestEvent,
  RequestEventType,
  RequestListener,
  SalaryDataListener,
  TeamStats
} from '../api/GameAPI';
import { getGXPToCap, getLevel, getXpStats } from '../hooks/girl-xp-hooks';
import {
  getAffectionStats,
  getAffRange,
  isUpgradeReady
} from '../hooks/girl-aff-hooks';
import { getGemsToAwaken, getGemsToCap } from '../hooks/girl-gems-hooks';
import { roundValue } from '../data/common';
import { importEquipment } from '../data/import/harem-import';

export const REQUEST_GIRLS = 'request_girls';
export type REQUEST_GAME_DATA = 'request_game_data';
export type RESPONSE_GAME_DATA = 'response_game_data';

export interface HaremDataRequest {
  type: REQUEST_GAME_DATA;
  attribute: keyof Window;
}

export interface HaremDataResponse {
  type: RESPONSE_GAME_DATA;
  attribute: keyof Window;
  gameData: unknown;
}

export namespace HaremMessage {
  export function isRequest(value: unknown): value is HaremDataRequest {
    if (isUnknownObject(value)) {
      const type = value.type;
      return type === 'request_game_data' && value.attribute !== undefined;
    }
    return false;
  }

  export function isResponse(value: unknown): value is HaremDataResponse {
    if (isUnknownObject(value)) {
      const type = value.type;
      return (
        type === 'response_game_data' &&
        value.attribute !== undefined &&
        value.gameData !== undefined
      );
    }
    return false;
  }
}

export class GameAPIImpl implements GameAPI {
  private salaryListeners: SalaryDataListener[] = [];
  private requestListeners = new Set<RequestListener>();
  private reqCount = 0;

  constructor(private updateGirl?: (girl: CommonGirlData) => void) {
    this.installRequestsListener();
  }

  setUpdateGirl(updateGirl: (girl: CommonGirlData) => void): void {
    this.updateGirl = updateGirl;
  }

  async getGirls(allowRequest: boolean): Promise<GirlsDataList> {
    // Step 1: Check if the girls data list is already present in the memory.
    // This would only be the case on the harem page.

    const gameGirlsObjects = window.girlsDataList;
    let gameGirls: GirlsDataList | undefined = undefined;
    if (GirlsDataList.isFullHaremData(gameGirlsObjects)) {
      gameGirls = gameGirlsObjects;
      return gameGirls;
    }

    // Step 2: If allowed, send a request to load the harem from the server.
    // This may take a while...

    if (allowRequest) {
      try {
        const haremFrame = await getOrCreateHaremFrame();
        if (!haremFrame.contentWindow) {
          console.error('Found frame, but contentWindow is missing?');
          return Promise.reject(
            'Failed to load harem from the game. Harem Frame not found or not valid.'
          );
        }

        const girlsPromise = new Promise<GirlsDataList>((resolve, reject) => {
          if (!haremFrame || !haremFrame.contentWindow) {
            reject(
              'Harem Frame is no longer available. Cant load girls data...'
            );
            return;
          }
          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              haremFrame.contentWindow?.removeEventListener(
                'message',
                messageListener
              );
              console.warn('Frame timeout. Reject girls promise.');
              reject('Timeout');
            }
          }, 30 * 1000 /* 30s Timeout */);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const messageListener = (event: MessageEvent<any>) => {
            if (event.origin === window.location.origin) {
              const data = event.data;
              if (GirlsDataList.isFullHaremData(data)) {
                resolved = true;
                resolve(data);
                // All done. Clear timeout and message listener.
                clearTimeout(timeout);
                window.removeEventListener('message', messageListener);
              } else {
                // Ignore invalid messages. The original game may send
                // unexpected messages. For now, we don't need to explicitly
                // handle invalid data (e.g. rejecting the promise early).
                // The timeout will take care of that.
              }
            }
          };

          window.addEventListener('message', messageListener);
          haremFrame.contentWindow?.postMessage(
            REQUEST_GIRLS,
            window.location.origin
          );
        });
        return girlsPromise;
      } catch (error) {
        console.error('Error while trying to load or get the frame: ', error);
        return Promise.reject(
          'Failed to load harem from the game. Harem Frame not found or not valid.'
        );
      }
    }

    // Step 3: girlsDataList is not already present, and we didn't allow a request.
    // Nothing we can do...

    return Promise.reject('GirlsDataList is undefined');
  }

  async getQuests(allowRequest: boolean): Promise<GameQuests> {
    return this.requestFromHarem('girl_quests', GameQuests.is, allowRequest);
  }

  async getQuestStep(
    girl: CommonGirlData,
    step: number,
    allowRequest: boolean
  ): Promise<QuestData> {
    const quest = girl.quests[step];
    const questId = quest.idQuest;
    const gameQuestData = await this.requestFromFrame(
      () => getOrCreateUpgradeFrame(questId),
      'questData',
      GameQuestStep.is,
      allowRequest
    );
    const result = toQuestData(girl.id, gameQuestData);
    return result;
  }

  async getBlessings(): Promise<GameBlessingData> {
    // First, check if the blessings data is already available in memory

    const blessingData = window.blessings_data;
    if (GameBlessingData.is(blessingData)) {
      return blessingData;
    }

    // Second, directly fetch the blessings data from the Ajax API

    try {
      const action = {
        action: 'get_girls_blessings'
      };
      const blessings = await this.postRequest(action);
      if (GameBlessingData.is(blessings)) {
        return fixBlessing(blessings);
      }
    } catch (fetchError) {
      console.error('Failed to fetch blessings_data. Error: ', fetchError);
      return Promise.reject('Failed to fetch blessings_data.');
    }

    // Third: No luck...

    return Promise.reject('blessings_data is undefined.');
  }

  async collectSalary(girl: CommonGirlData): Promise<boolean> {
    if (!girl.own) {
      return false;
    }
    const params = {
      class: 'Girl',
      id_girl: girl.id,
      action: 'get_salary'
    };
    try {
      // Immediately update the game data; don't wait for the request.
      // Otherwise, UI won't immediately update.
      const salaryData = this.getSalaryData();
      if (salaryData && girl.salaryTime) {
        const gameGirl = salaryData[girl.id];
        if (gameGirl) {
          refreshSalaryManager(gameGirl, girl.salaryTime, salaryData);
        }
      }

      // Then, post the request. The in-game cash value will be updated only
      // in case of success.

      const result = await this.postRequest(params);
      if (isSalaryResult(result)) {
        this.getHero().update('soft_currency', result.money, true);
        return result.success;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  async changePose(girl: CommonGirlData, pose: number): Promise<boolean> {
    if (pose > girl.stars) {
      console.error(
        "Tried to switch to a pose that isn't unlocked or doesn't exist"
      );
      return false;
    }

    const action = {
      action: 'show_specific_girl_grade',
      class: 'Hero',
      id_girl: girl.id,
      girl_grade: pose,
      check_only: 0
    };
    try {
      // Send the change pose request to the server
      const requestResult = this.postRequest(action);

      if (this.updateGirl !== undefined) {
        // While we wait for the result, update the image to what we expect is going to happen...
        girl.currentIcon = pose;
        girl.poseImage = getPoseN(girl.poseImage, pose);
        girl.icon = getPoseN(girl.icon, pose);
        this.updateGirl(girl);

        // Then wait for the proper result, and refresh again if necessary
        const result = await requestResult;

        if (ChangePoseResult.is(result) && result.success) {
          girl.currentIcon = pose;
          girl.poseImage = result.ava;
          girl.icon = result.ico;
          this.updateGirl(girl);

          return result.success;
        }
      }
    } catch (error) {
      console.error('Error while trying to update the girls pose: ', error);
      return Promise.reject([
        'Error while trying to update the girls pose: ',
        error
      ]);
    }

    return false;
  }

  async postRequest(params: HHAction): Promise<unknown> {
    // Throttle the request. Ensure all requests are executed sequentially,
    // to avoid triggerring Error 500.
    const start = Date.now();
    this.fireRequestEvent('queued');
    return queue(async () => {
      this.fireRequestEvent('started');
      const action = this.paramsToString(params);
      const response = await fetch('/ajax.php', {
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        method: 'POST',
        body: action
      });
      if (response.ok && response.status === 200) {
        const responseJson = await response.json();
        this.fireRequestEvent('completed', true, start);
        return responseJson;
      } else if (response.status === 403) {
        console.error('!!!ERROR 403!!! Slow down...');
        this.fireRequestEvent('completed', false, start);
        throw response;
      }
    });
  }

  getSalaryData(): GirlsSalaryList {
    const salaryManager = window.GirlSalaryManager;
    const girlsMap = salaryManager.girlsMap;
    const result: GirlsSalaryList = {};
    for (const girlId in girlsMap) {
      const girlObj = girlsMap[girlId];
      if (girlObj.gData) {
        const data = girlObj.gData;
        result[girlId] = data;
      }
    }
    return result;
  }

  paramsToString(params: HHAction): string {
    let result = '';
    let separator = '';
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          result += `${separator}${key}=${entry}`;
          separator = '&';
        }
      } else {
        result += `${separator}${key}=${value}`;
      }
      separator = '&';
    }
    return result;
  }

  async getGemsData(allowRequest: boolean): Promise<GemsData> {
    return await this.requestFromHarem(
      'player_gems_amount',
      GemsData.is,
      allowRequest
    );
  }

  // TODO Separate book inventory / gift inventory,
  // as they now require separate requests.
  async getMarketInventory(_allowRequest: boolean): Promise<GameInventory> {
    //requestFromMarket
    const booksAction = {
      action: 'girl_items_inventory',
      type: 'potion'
    };
    const giftsAction = {
      action: 'girl_items_inventory',
      type: 'gift'
    };

    const books = await this.postRequest(booksAction);
    const gifts = await this.postRequest(giftsAction);

    // TODO Add proper type testers
    const booksInventory =
      isUnknownObject(books) &&
      books.success === true &&
      Array.isArray(books.inventory)
        ? books.inventory
        : [];
    const giftsInventory =
      isUnknownObject(gifts) &&
      gifts.success === true &&
      Array.isArray(gifts.inventory)
        ? gifts.inventory
        : [];

    return {
      potion: booksInventory,
      gift: giftsInventory
    };
  }

  async useBook(girl: CommonGirlData, book: Book): Promise<void> {
    if (!girl.own) {
      return;
    }

    const xpStats = getXpStats(girl, book);

    const bookValid = xpStats.canUse;

    if (bookValid) {
      const params = {
        id_girl: girl.id,
        id_item: book.itemId,
        action: 'girl_give_xp'
      };
      this.updateGirlWithBook(girl, book);
      const expectedResult = { ...girl };
      if (this.updateGirl !== undefined) {
        this.updateGirl(girl);
      }
      const result = await this.postRequest(params);
      if (XPResult.is(result) && result.success) {
        if (
          result.xp === expectedResult.currentGXP &&
          result.level === expectedResult.level
        ) {
          // All good, no surprise
          return;
        } else {
          console.warn(
            'Successfully used book, but got unexpected result. Expected: ',
            expectedResult.level,
            expectedResult.currentGXP,
            book.xp,
            'was: ',
            result
          );
        }
      } else {
        console.warn('Failed to use book: ', result);
      }
    } else {
      console.warn("Can't use this book");
    }

    return;
  }

  async awaken(girl: CommonGirlData): Promise<void> {
    if (!girl.own) {
      throw new Error("Can't awaken a girl before obtaining her!");
    }
    if ((girl.maxLevel ?? 0) >= 750) {
      throw new Error('Max level is already reached!');
    }

    const maxLevel = girl.maxLevel ?? 250;
    const gemsUsed = getGemsToAwaken(girl, maxLevel);

    // Update girl level/maxLevel
    girl.missingGems -= gemsUsed;
    girl.maxLevel = maxLevel + 50;
    const newLevel = Math.min(getLevel(girl, 0), girl.maxLevel);
    this.setGirlLevel(girl, newLevel);
    if (this.updateGirl) {
      this.updateGirl(girl);
    }

    const params = {
      action: 'awaken_girl',
      id_girl: girl.id
    };
    const result = await this.postRequest(params);
    if (RequestResult.is(result) && !result.success) {
      console.warn(`Failed to awaken ${girl.name}. Result: `, result);
    }
  }

  async upgrade(girl: CommonGirlData, questId: number): Promise<boolean> {
    if (girl.stars < girl.maxStars && girl.upgradeReady) {
      // class=Quest&action=next&id_quest=10600
      const params = {
        class: 'Quest',
        action: 'next',
        id_quest: questId
      };
      const result = await this.postRequest(params);
      if (UpgradeResult.is(result) && result.success) {
        const newSoftCurrency = result.changes.soft_currency;
        if (newSoftCurrency !== undefined) {
          this.getHero().update('soft_currency', newSoftCurrency, false);
        }
        const currentQuest = girl.stars;
        girl.stars++;
        girl.currentIcon = girl.stars;
        girl.poseImage = getPoseN(girl.poseImage, girl.stars);
        girl.icon = getPoseN(girl.icon, girl.stars);
        girl.upgradeReady = false;
        girl.upgradeReady = isUpgradeReady(girl, 0);
        girl.quests[currentQuest].done = true;
        girl.quests[currentQuest].ready = false;
        if (girl.stars < girl.maxStars) {
          girl.quests[currentQuest + 1].ready = girl.upgradeReady;
        }
        if (this.updateGirl !== undefined) {
          this.updateGirl(girl);
        }
        return true;
      } else {
        console.error('Unexpected result when upgrading the girl: ', result);
      }
    }
    return false;
  }

  getCurrency(): number {
    return this.getHero().currencies.soft_currency;
  }

  async unequipAll(girl: CommonGirlData): Promise<GirlEquipment[]> {
    const action = {
      action: 'girl_equipment_unequip_all',
      id_girl: girl.id
    };
    const result = await this.postRequest(action);
    if (UnequipActionResult.is(result) && result.success) {
      if (girl.equipment && girl.equipment.items.length > 0) {
        girl.equipment.items = [];
        if (this.updateGirl) {
          this.updateGirl(girl);
        }
      }
    } else {
      console.error(
        'UnequipAll: Failed to unequip the girl: invalid request result',
        result
      );
    }
    // TODO Return the updated inventory. Unused for now.
    return [];
  }

  async unequipOne(
    girl: CommonGirlData,
    item: Equipment
  ): Promise<GirlEquipment[]> {
    const action = {
      action: 'girl_equipment_unequip',
      id_girl_armor_equipped: item.uid,
      sort_by: 'resonance',
      sorting_order: 'desc'
    };
    const result = await this.postRequest(action);
    if (UnequipActionResult.is(result) && result.success) {
      if (girl.equipment && girl.equipment.items.length > 0) {
        const itemToRemove = girl.equipment.items.findIndex(
          (equippedItem) => equippedItem.slot === item.slot
        );
        if (itemToRemove > -1) {
          girl.equipment.items.splice(itemToRemove, 1);
          if (this.updateGirl) {
            this.updateGirl(girl);
          }
        }

        const inventory = result.inventory_armor;
        if (inventory !== undefined && inventory !== null) {
          const items = Array.isArray(inventory) ? inventory : [inventory];
          return items;
        }
      }
    } else {
      console.error(
        'UnequipOne: Failed to unequip the girl: invalid request result',
        result
      );
    }
    // TODO Throw?
    return [];
  }

  async equipAll(girl: CommonGirlData): Promise<GirlEquipment[]> {
    const action = {
      action: 'girl_equipment_equip_all',
      id_girl: girl.id
    };
    const result = await this.postRequest(action);
    if (EquipActionResult.is(result) && result.success) {
      const equipped = Array.isArray(result.equipped_armor)
        ? result.equipped_armor
        : [result.equipped_armor];
      girl.equipment = importEquipment(equipped);
      if (this.updateGirl) {
        this.updateGirl(girl);
      }
    } else {
      console.error(
        'EquipAll: Failed to equip the girl: invalid request result',
        result
      );
    }
    // TODO Return the updated inventory. Unused for now.
    return [];
  }

  async equipOne(
    girl: CommonGirlData,
    item: Equipment
  ): Promise<GirlEquipment[]> {
    const params = {
      action: 'girl_equipment_equip',
      id_girl: girl.id,
      id_girl_armor: item.uid,
      sort_by: 'resonance',
      sorting_order: 'desc'
    };
    const result = await this.postRequest(params);
    if (EquipActionResult.is(result) && result.success) {
      const armor = Array.isArray(result.equipped_armor)
        ? result.equipped_armor
        : [result.equipped_armor];
      const equipped = importEquipment(armor);
      if (equipped.items[0]) {
        const equippedItem = equipped.items[0];
        const slot = equippedItem.slot;
        if (girl.equipment && girl.equipment.items.length > 0) {
          const existing = girl.equipment?.items?.findIndex(
            (item) => item.slot === slot
          );
          if (existing > -1) {
            girl.equipment.items[existing] = equippedItem;
          } else {
            girl.equipment.items.push(equippedItem);
          }
        } else {
          girl.equipment = { items: [equippedItem] };
        }
      }

      if (this.updateGirl) {
        this.updateGirl(girl);
      }

      const inventory = result.inventory_armor;
      if (inventory !== undefined && inventory !== null) {
        const items = Array.isArray(inventory) ? inventory : [inventory];
        return items;
      }
    } else {
      console.error(
        'EquipOne: Failed to equip the girl: invalid request result',
        result
      );
    }

    // TODO Throw?
    return [];
  }

  async unequipAllGirls(allGirls: CommonGirlData[]): Promise<GirlEquipment[]> {
    const params = {
      action: 'girl_equipment_unequip_all_girls'
    };
    const result = await this.postRequest(params);
    if (RequestResult.is(result) && result.success) {
      const modifiedGirls: CommonGirlData[] = [];
      for (const girl of allGirls) {
        if (girl.equipment !== undefined && girl.equipment.items.length > 0) {
          girl.equipment.items = [];
          modifiedGirls.push(girl);
        }
      }
      if (this.updateGirl) {
        for (const girl of modifiedGirls) {
          this.updateGirl(girl);
        }
      }
    } else {
      console.error(
        'UnequipAllGirls: Failed to unequip all girls: invalid request result',
        result
      );
    }
    // TODO Return the updated inventory. Unused for now.
    // The game doesn't return incremental updates for this action, so
    // it's probably easier to reload the inventory afterwards.
    return [];
  }

  async getGirlsInventory(
    girl: CommonGirlData,
    slot?: number | undefined,
    sortByRarity = false
  ): Promise<GirlEquipment[]> {
    if (slot !== undefined) {
      const params = {
        action: 'girl_equipment_list',
        slot_index: slot,
        sort_by: sortByRarity ? 'rarity' : 'resonance',
        sorting_order: 'desc',
        page: 1,
        id_girl: girl.id
      };
      const result = await this.postRequest(params);
      if (GirlEquipmentResult.is(result) && result.success) {
        return result.items;
      }
    } else {
      // Return all
      const result: GirlEquipment[] = [];
      for (let slot = 1; slot <= 6; slot++) {
        result.push(...(await this.getGirlsInventory(girl, slot, true)));
      }
      return result;
    }
    return [];
  }

  private updateGirlWithBook(girl: CommonGirlData, book: Book) {
    const xpStats = getXpStats(girl, book);
    this.updateGirlXpStats(girl, xpStats.xpGain, xpStats.maxLevel);
  }

  private updateGirlXpStats(
    girl: CommonGirlData,
    addXp: number,
    maxLevel?: number
  ): void {
    if (maxLevel !== undefined) {
      const gemsUsed = getGemsToCap(girl, maxLevel);
      girl.maxLevel = maxLevel;
      girl.missingGems -= gemsUsed;
    }

    const newLevel = Math.min(getLevel(girl, addXp), girl.maxLevel ?? 250);
    girl.currentGXP += addXp;

    this.setGirlLevel(girl, newLevel);
  }

  private setGirlLevel(girl: CommonGirlData, level: number): void {
    const previousLevel = girl.level ?? 1;
    girl.level = level;

    // Update the stats of the girl after she gains some levels
    if (level != previousLevel && girl.stats !== undefined) {
      girl.stats.hardcore = roundValue(
        (girl.stats.hardcore / previousLevel) * level
      );
      girl.stats.charm = roundValue((girl.stats.charm / previousLevel) * level);
      girl.stats.knowhow = roundValue(
        (girl.stats.knowhow / previousLevel) * level
      );
    }
  }

  async useGift(girl: CommonGirlData, gift: Gift): Promise<void> {
    if (!girl.own) {
      return;
    }

    const affStats = getAffectionStats(girl, gift);

    if (affStats.canUse) {
      const params = {
        action: 'girl_give_affection',
        id_girl: girl.id,
        id_item: gift.itemId
      };
      this.updateGirlWithGift(girl, gift);
      const expectedResult = { ...girl };
      if (this.updateGirl !== undefined) {
        this.updateGirl(girl);
      }
      const result = await this.postRequest(params);
      if (GiftResult.is(result) && result.success) {
        if (
          result.affection === expectedResult.currentAffection &&
          result.can_upgrade.upgradable === expectedResult.upgradeReady
        ) {
          // All good, no surprise
          return;
        } else {
          console.warn(
            'Successfully used gift, but got unexpected result. Expected: ',
            expectedResult.currentAffection,
            expectedResult.upgradeReady,
            gift.aff,
            'was: ',
            result
          );
        }
      } else {
        console.warn('Failed to use gift: ', result);
      }
    } else {
      console.warn("Can't use this gift");
    }
  }

  async requestMaxOut(
    girl: CommonGirlData,
    type: 'book' | 'gift'
  ): Promise<MaxOutItems> {
    const params = {
      action: 'get_girl_fill_items',
      type: type === 'gift' ? 'gift' : 'potion',
      id_girl: girl.id
    };
    const result = await this.postRequest(params);
    if (MaxOutResult.is(result)) {
      return toMaxOutItems(result);
    }
    throw new Error(
      'Failed to get the items list to max out the girl. Result: ' +
        JSON.stringify(result)
    );
  }

  async confirmMaxOut(
    girl: CommonGirlData,
    type: 'book' | 'gift'
  ): Promise<MaxOutItems> {
    const action = type === 'book' ? 'fill_girl_xp' : 'fill_girl_affection';
    const params = {
      action,
      id_girl: girl.id
    };
    const result = await this.postRequest(params);
    if (MaxOutResult.isConfirm(result)) {
      const items = toMaxOutItems(result);
      // TODO Update girl...
      const excess = result.excess; // Excess may be negative if we don't reach next cap
      if (type === 'book') {
        const levelCap = girl.maxLevel ?? 250;
        const xpToCap = getGXPToCap(girl, levelCap) - girl.currentGXP;
        const extraXp = xpToCap + excess;
        this.updateGirlXpStats(girl, extraXp);
      } else {
        const affectionRange = getAffRange(girl);
        const affToGrade = affectionRange.max - girl.currentAffection;
        this.updateGirlAffStats(girl, affToGrade + excess);
      }
      if (this.updateGirl) {
        this.updateGirl(girl);
      }
      // Find how much XP / Aff is required to next threshold
      // Add excess
      // Update girl XP/Aff (+ grade, level, as necessary)

      return items;
    }
    throw new Error(
      'Failed to max out the girl. Result: ' + JSON.stringify(result)
    );
  }

  private updateGirlWithGift(girl: CommonGirlData, gift: Gift): void {
    const affStats = getAffectionStats(girl, gift);
    this.updateGirlAffStats(girl, affStats.affGain);
  }

  private updateGirlAffStats(girl: CommonGirlData, addAff: number): void {
    girl.upgradeReady = isUpgradeReady(girl, addAff);
    girl.currentAffection += addAff;
    girl.missingAff = Math.max(0, girl.missingAff - addAff);
    if (girl.upgradeReady) {
      girl.quests[girl.stars] = {
        ...girl.quests[girl.stars],
        ready: true
      };
    }
  }

  /**
   * Extract data from the harem page.
   * @param attribute The harem property to extract
   * @param typeTester A type tester, to make sure we return a value of the correct type
   * @param allowRequest Whether network requests are allowed. This should be false when requesting directly from the harem.html page,
   * true otherwise (e.g. from the quick-harem on home.html)
   */
  private async requestFromHarem<T>(
    attribute: keyof Window,
    typeTester: (value: unknown) => value is T,
    allowRequest: boolean
  ): Promise<T> {
    return this.requestFromFrame(
      () => getOrCreateHaremFrame(),
      attribute,
      typeTester,
      allowRequest
    );
  }

  /**
   * Extract data from the market page.
   * @param attribute The market property to extract
   * @param typeTester A type tester, to make sure we return a value of the correct type
   * @param allowRequest Whether network requests are allowed. This should be false when requesting directly from the harem.html page,
   * true otherwise (e.g. from the quick-harem on home.html)
   */
  private async requestFromMarket<T>(
    attribute: keyof Window,
    typeTester: (value: unknown) => value is T,
    allowRequest: boolean
  ): Promise<T> {
    return this.requestFromFrame(
      () => getOrCreateMarketFrame(),
      attribute,
      typeTester,
      allowRequest
    );
  }

  private async requestFromTeams<T>(
    attribute: keyof Window,
    typeTester: (value: unknown) => value is T,
    allowRequest: boolean
  ): Promise<T> {
    return this.requestFromFrame(
      () => getOrCreateFrame('teams', 'teams.html', true),
      attribute,
      typeTester,
      allowRequest
    );
  }

  /**
   * Extract data from the page in the given frame.
   * @param frameSupplier A function to retrieve the frame
   * @param attribute The page property to extract
   * @param typeTester A type tester, to make sure we return a value of the correct type
   * @param allowRequest Whether network requests are allowed. This should be false when requesting directly from the harem.html page,
   * true otherwise (e.g. from the quick-harem on home.html)
   */
  private async requestFromFrame<T>(
    frameSupplier: () => Promise<HTMLIFrameElement>,
    attribute: keyof Window,
    typeTester: (value: unknown) => value is T,
    allowRequest: boolean
  ): Promise<T> {
    // Step 1: Check if the value is available on the current page
    const gameData = window[attribute];
    if (typeTester(gameData)) {
      return gameData;
    }

    // Step 2: If allowed, load/reload the frame, and read the data there
    if (allowRequest) {
      // Request from harem frame
      try {
        const gameFrame = await frameSupplier();
        if (!gameFrame.contentWindow) {
          console.error('Found frame, but contentWindow is missing?');
          return Promise.reject(
            'Failed to load requested data from the game. Frame not found or not valid. Data: ' +
              attribute
          );
        }

        const gameDataPromise = new Promise<T>((resolve, reject) => {
          if (!gameFrame || !gameFrame.contentWindow) {
            reject(
              'Harem Frame is no longer available. Cant load game data...'
            );
            return;
          }
          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              gameFrame.contentWindow?.removeEventListener(
                'message',
                messageListener
              );
              console.warn(
                'Frame timeout. Reject game data promise. Attribute: ',
                attribute
              );
              reject('Timeout');
            }
          }, 30 * 1000 /* 30s Timeout */);

          const messageListener = (event: MessageEvent<unknown>) => {
            if (event.origin === window.location.origin) {
              const data = event.data;
              if (HaremMessage.isResponse(data)) {
                if (data.attribute === attribute) {
                  if (typeTester(data.gameData)) {
                    resolved = true;
                    resolve(data.gameData);
                    // All done. Clear timeout and message listener.
                    clearTimeout(timeout);
                    window.removeEventListener('message', messageListener);
                  } else {
                    console.error(
                      'Received a response for our data request, but data type doesnt match. Attribute: ',
                      attribute,
                      'Data: ',
                      data.gameData
                    );
                    // Clear timeout and Reject?
                  }
                } // Else: Ignore harem-reponse for other game attributes
              } // Else: Ignore unrelated message
            }
          };

          window.addEventListener('message', messageListener);
          const requestDataMessage: HaremDataRequest = {
            type: 'request_game_data',
            attribute: attribute
          };
          gameFrame.contentWindow?.postMessage(
            requestDataMessage,
            window.location.origin
          );
        });
        return gameDataPromise;
      } catch (error) {
        console.error('Error while trying to load or get the frame: ', error);
        return Promise.reject(
          'Failed to load gems data from the game. Game Frame not found or not valid.'
        );
      }
    }

    // Step 3: Fail...
    return Promise.reject(
      'Failed to retrieve requested data from the game page: ' + attribute
    );
  }

  /**
   * Original game object "Hero"
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHero(): Hero {
    return window.Hero;
  }

  addSalaryDataListener(listener: SalaryDataListener): void {
    this.salaryListeners.push(listener);
  }

  removeSalaryDataListener(listener: SalaryDataListener): void {
    const index = this.salaryListeners.indexOf(listener);
    if (index >= 0) {
      this.salaryListeners.splice(index, 1);
    }
  }

  addRequestListener(listener: RequestListener): void {
    this.requestListeners.add(listener);
  }

  removeRequestListener(listener: RequestListener): void {
    this.requestListeners.delete(listener);
  }

  private teams: Team[] | undefined;

  async getTeams(refresh: boolean): Promise<Team[]> {
    if (this.teams === undefined || refresh) {
      const teamsData = await this.requestFromTeams(
        'teams_data',
        TeamsData.isTeamsData,
        true
      );
      this.teams = [];

      for (const team of getTeams(teamsData)) {
        this.teams.push(team);
      }
    }

    return this.teams;
  }

  async setTeam(team: Team): Promise<void> {
    if (team.teamId === '') {
      throw Error('Invalid team: missing team id');
    }
    if (!team.active) {
      throw Error('Invalid team: team is inactive');
    }
    if (team.girlIds.filter((girl) => girl !== undefined).length < 3) {
      throw Error('Invalid team: teams must contain at least 3 girls');
    }
    const params = {
      class: 'Hero',
      action: 'edit_team',
      'girls[]': team.girlIds,
      id_team: team.teamId ?? undefined
    };
    const result = await this.postRequest(params);
    if (!isUnknownObject(result) || result.success !== true) {
      console.warn('Failed to update the team: ', team);
    }
    if (team.teamId !== null && this.teams !== undefined) {
      const teamIndex = this.teams?.findIndex((t) => t.teamId === team.teamId);
      if (teamIndex > -1) {
        // Update the local team data
        this.teams[teamIndex] = team;
      } else {
        // Reset the teams and force refreshing the data
        this.teams = undefined;
      }
    } else {
      // Reset the teams and force refreshing the data
      this.teams = undefined;
    }
  }

  async getTeamStats(team: Team): Promise<TeamStats> {
    const params = {
      action: 'team_calculate_caracs',
      'girls[]': team.girlIds
    };
    const result = await this.postRequest(params);
    if (TeamCaracsResult.is(result) && result.success) {
      return {
        damage: result.caracs.damage,
        defense: result.caracs.defense,
        ego: result.caracs.ego,
        chance: result.caracs.chance,
        totalPower: result.total_power
      };
    }
    console.warn('Invalid stats received: ', result);
    return {
      damage: 0,
      defense: 0,
      ego: 0,
      chance: 0,
      totalPower: 0
    };
  }

  private fireRequestEvent(
    type: RequestEventType,
    success = true,
    start?: number
  ): void {
    if (this.requestListeners.size === 0) {
      return;
    }
    if (type === 'queued') {
      this.reqCount++;
    }
    if (type === 'completed') {
      this.reqCount--;
    }
    const delay =
      type === 'completed' && start !== undefined
        ? Date.now() - start
        : undefined;
    const event: RequestEvent = {
      type,
      success,
      pendingRequests: this.reqCount,
      duration: delay
    };
    for (const listener of this.requestListeners) {
      listener(event);
    }
  }

  private installRequestsListener(): void {
    // Intercept responses to ajax requests. For now, this is used to refresh
    // harem salary data when "Collect all" is used from the home page.
    window
      .$(document)
      .ajaxComplete((event: unknown, request: unknown, settings: unknown) => {
        this.handleRequest(event, request, settings);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleRequest(_event: any, request: any, settings: any): void {
    if (settings.url === '/ajax.php' && settings.type === 'POST') {
      const params = settings.data;
      if (params !== undefined && params.includes('action=get_all_salaries')) {
        if (request.responseJSON && request.responseJSON.girls) {
          const girls = request.responseJSON.girls;
          for (const listener of this.salaryListeners) {
            listener(girls);
          }
        }
      }
    }
  }
}

interface HHAction {
  action: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

// Last time the frame was requested.
let lastFrameRequest = 0;
// Several APIs may request the frame to read data from it. Typically,
// we'll get several requests in a row, and they'll all resolve successively
// once the frame is loaded. Make sure we don't force a frame refresh for each request.
// Still keep the delay low, so manual refresh can happen without artifical delays.
const FRAME_REQUEST_DELAY = 2000; /* 2 seconds */

/**
 * The GameAPI uses an IFrame to render the harem in the background, then extract
 * girls data from it once it's ready. This function creates or returns the existing frame.
 */
async function getOrCreateHaremFrame(): Promise<HTMLIFrameElement> {
  const refreshFrame = lastFrameRequest + FRAME_REQUEST_DELAY < Date.now();
  lastFrameRequest = Date.now();
  return getOrCreateFrame('harem-frame', 'harem.html', refreshFrame);
}

/**
 * The GameAPI uses an IFrame to render the market in the background, then extract
 * inventory data from it once it's ready. This function creates or returns the existing frame.
 */
async function getOrCreateMarketFrame(): Promise<HTMLIFrameElement> {
  return getOrCreateFrame('market-frame', 'shop.html', true);
}

async function getOrCreateUpgradeFrame(
  questId: number
): Promise<HTMLIFrameElement> {
  // This frame is a bit special: the URL is different for each girl, so we need
  // to change the frame src each time, and refresh it.
  // Optional: we could dispose the frame after using it, but we don't cache the quest
  // data, so we'd have to reload it again. Probably easier to just keep the frame around...
  return getOrCreateFrame(
    `upgrade-frame-${questId}`,
    `quest/${questId}`,
    false
  );
}

/**
 * The GameAPI uses hidden IFrames to render various game pages in the background, then extract
 * data from it once it's ready. This function creates or returns the existing frame for the specified
 * page.
 */
async function getOrCreateFrame(
  id: string,
  url: string,
  refreshFrame: boolean
): Promise<HTMLIFrameElement> {
  return queue(() =>
    new Promise<HTMLIFrameElement>((resolve, reject) => {
      // Tentative fix: attempt to prevent the game from dispatching
      // a process_rewards_queue request while the (harem) frame is loading,
      // which would likely cause a 403 error
      window.loadingAnimation.isLoading = true;

      let frame = document.getElementById(id) as HTMLIFrameElement;
      if (frame) {
        if (refreshFrame && frame.contentWindow) {
          const initial = Date.now();
          frame.onload = () => {
            const final = Date.now();
            const delay = final - initial;
            console.info(`${id} frame reloaded in ${delay} ms`);
            resolve(frame);
          };
          frame.contentWindow.location.reload();
        } else {
          resolve(frame);
        }
      } else {
        const wrapper = document.getElementById('quick-harem-wrapper');
        if (wrapper) {
          frame = document.createElement('iframe');
          frame.setAttribute('id', id);
          frame.setAttribute('src', url);
          frame.setAttribute('style', 'display: none;');
          wrapper.appendChild(frame);
          const initialLoad = Date.now();
          frame.onload = () => {
            const finalLoad = Date.now();
            const loadDelay = finalLoad - initialLoad;
            console.info(`${id} frame loaded in ${loadDelay}ms`);
            resolve(frame);
          };
        } else {
          reject('#quick-harem-wrapper not found; abort');
        }
      }
    }).then((res) => {
      window.loadingAnimation.isLoading = false;
      return res;
    })
  );
}

interface SalaryResult {
  success: boolean;
  money: number;
  time: number;
}

function isSalaryResult(data: unknown): data is SalaryResult {
  if (isUnknownObject(data)) {
    if (data.success && typeof data['money'] === 'number') {
      return true;
    }
  }
  return false;
}

function refreshSalaryManager(
  girlSalaryEntry: GirlsSalaryEntry,
  salaryTime: number,
  salaryData: GirlsSalaryList
): void {
  // Refresh the salaryManager (Used to update the collectButton when girls are ready,
  // including the Tooltips)
  const salaryManager = window.GirlSalaryManager;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownedGirls: { [key: string]: any } = {};

  girlSalaryEntry.pay_in = salaryTime + 10;

  // FIXME: Is there a better way to refresh, relying more heavily
  // on the GirlSalaryManager? Each time we reset the manager, we
  // introduce (minor) delay inconsistencies in the timers.

  for (const girlId in salaryData) {
    ownedGirls[girlId] = new window.Girl(salaryData[girlId]);
    ownedGirls[girlId]['gId'] = parseInt(girlId, 10);
  }
  salaryManager.init(ownedGirls, true);

  // Refresh the collect all button
  const collectButton = window.$('#collect_all');
  const salarySum = collectButton.find('.sum');
  const newAmount = Math.max(
    0,
    parseInt(salarySum.attr('amount'), 10) - girlSalaryEntry.salary
  );
  salarySum.attr('amount', newAmount);
  const collectStr = window.GT.design.harem_collect;
  const amountTxt = window.number_format_lang(newAmount, 0);
  salarySum.text(collectStr + ' ' + amountTxt);

  window.Collect.changeDisableBtnState(newAmount <= 0);
}

function toMaxOutItems(result: MaxOutResult): MaxOutItems {
  const excess = result.excess;
  const selection: ItemSelection[] = Object.keys(result.selection).map(
    (key) => {
      return {
        id: Number(key),
        count: result.selection[key]
      };
    }
  );
  return {
    excess,
    selection
  };
}

export function getTeams(teamData: TeamsData): Team[] {
  const result: Team[] = [];
  for (const teamIndex in teamData) {
    const teamEntry = teamData[teamIndex];
    result.push(getTeam(teamEntry));
  }
  return result;
}

export function getTeam(teamEntry: TeamDataEntry): Team {
  return {
    active: !teamEntry.locked,
    girlIds: teamEntry.girls_ids,
    teamId: teamEntry.id_team === null ? null : String(teamEntry.id_team),
    stats: { ...teamEntry.caracs, totalPower: teamEntry.total_power }
  };
}
