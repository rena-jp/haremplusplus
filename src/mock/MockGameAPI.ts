import {
  Book,
  CommonGirlData,
  Equipment,
  getPoseN,
  getRarity,
  Gift,
  QuestData,
  Team
} from '../data/data';
import {
  fixBlessing,
  GameBlessingData,
  GameInventory,
  GameQuests,
  GemsData,
  GemsEntry,
  GirlEquipment,
  GirlsDataList,
  GirlsSalaryList
} from '../data/game-data';
import {
  GameAPI,
  MaxOutItems,
  queue,
  RequestEvent,
  RequestEventType,
  RequestListener,
  SalaryDataListener,
  TeamStats
} from '../api/GameAPI';
import { getLevel, getXpStats } from '../hooks/girl-xp-hooks';
import { getAffectionStats, isUpgradeReady } from '../hooks/girl-aff-hooks';
import { getGemsToAwaken, getGemsToCap } from '../hooks/girl-gems-hooks';
import { roundValue } from '../data/common';
// import girls from './girlsDataList-test.json';
import girls from './girlsdatalist-full.json';
import blessings from './blessings-full.json';
import quests from './quests-full.json';
import inventory from './inventory.json';
import girlsInventory from './girls-inventory.json';
// const girlsInventory = { '1': { items: [] } };
// const girls = {};
// const blessings = { active: [], upcoming: [] };
// const quests = {};
// const inventory = { gift: [], potion: [] };

const MOCK_DELAY = 500;

/**
 * Mock implementation of the GameAPI, used to run the game-extension
 * locally (outside of the game), with pre-stored data. Actions are either
 * no-op, or will only modify the data in memory. Actions will never affect
 * the real game.
 */
export class MockGameAPI implements GameAPI {
  private requestListeners = new Set<RequestListener>();
  private reqCount = 0;

  constructor(private updateGirl?: (girl: CommonGirlData) => void) {}

  setUpdateGirl(updateGirl: (girl: CommonGirlData) => void): void {
    this.updateGirl = updateGirl;
  }

  async getGirls(): Promise<GirlsDataList> {
    this.fireRequestEvent('queued');
    return new Promise((resolve, _reject) => {
      this.fireRequestEvent('started');
      setTimeout(() => {
        resolve({ ...girls } as unknown as GirlsDataList); // Trust me bro.
        this.fireRequestEvent('completed');
      }, MOCK_DELAY);
    });
  }

  async getBlessings(): Promise<GameBlessingData> {
    this.fireRequestEvent('queued');
    return new Promise((resolve, _reject) => {
      this.fireRequestEvent('started');
      setTimeout(() => {
        this.fireRequestEvent('completed');

        resolve(fixBlessing({ ...blessings }));
      }, MOCK_DELAY + 200);
    });
  }

  async getQuests(): Promise<GameQuests> {
    this.fireRequestEvent('queued');
    return new Promise((resolve, _reject) => {
      this.fireRequestEvent('started');
      setTimeout(() => {
        resolve({ ...quests } as unknown as GameQuests);
        this.fireRequestEvent('completed');
      }, MOCK_DELAY + 400);
    });
  }

  async getQuestStep(
    girl: CommonGirlData,
    step: number,
    _allowRequest: boolean
  ): Promise<QuestData> {
    this.fireRequestEvent('queued');
    return new Promise((resolve) => {
      this.fireRequestEvent('started');
      setTimeout(() => {
        if (girl.quests[step].done) {
          resolve({
            girlId: girl.id,
            questId: girl.quests[step].idQuest,
            dialogue:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            scene: '/img/scene.jpg', // Scene images are blocked outside of the game; use a local img,
            sceneFull: '/img/scene.jpg',
            step: step
          });
        } else {
          resolve({
            girlId: girl.id,
            questId: girl.quests[step].idQuest,
            cost: 70000,
            dialogue:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            portrait: girl.poseImage,
            scene: '/img/scene.jpg', // Scene images are blocked outside of the game; use a local img,
            sceneFull: '/img/scene.jpg',
            step: step
          });
          this.fireRequestEvent('completed');
        }
      }, 400);
    });
  }

  async collectSalary(girl: CommonGirlData): Promise<boolean> {
    try {
      const result = await this.mockRequest(() => {
        return {
          success: true,
          money: 850,
          time: girl.salaryTime
        };
      }, Math.random() < 0.5);
      return result.success;
    } catch (error) {
      console.warn('Failed to collect salary. Reason: ', error);
      return false;
    }
  }

  async changePose(girl: CommonGirlData, pose: number): Promise<boolean> {
    if (pose > girl.stars) {
      console.error(
        "Tried to switch to a pose that isn't unlocked or doesn't exist"
      );
      return false;
    }
    girl.currentIcon = pose;
    girl.poseImage = getPoseN(girl.poseImage, pose);
    girl.icon = getPoseN(girl.icon, pose);
    if (this.updateGirl !== undefined) {
      this.updateGirl(girl);
    }
    return true;
  }

  getSalaryData(): GirlsSalaryList {
    return {};
  }

  async getGemsData(): Promise<GemsData> {
    function entry(amount: number): GemsEntry {
      return {
        amount: String(amount),
        gem: {
          flavor: 'Mock',
          ico: 'none',
          type: '??'
        }
      };
    }
    this.fireRequestEvent('queued');
    return new Promise((resolve) => {
      this.fireRequestEvent('started');
      setTimeout(() => {
        resolve({
          darkness: entry(1000),
          fire: entry(49555),
          light: entry(15000),
          nature: entry(2750),
          psychic: entry(42),
          stone: entry(12500),
          sun: entry(9001),
          water: entry(30000 + Math.ceil(Math.random() * 69999))
        });
        this.fireRequestEvent('completed');
      }, 100);
    });
  }

  async getMarketInventory(_allowRequest: boolean): Promise<GameInventory> {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve({ ...inventory } as GameInventory);
      }, 200);
    });
  }

  async useBook(girl: CommonGirlData, book: Book): Promise<void> {
    if (!girl.own) {
      return;
    }
    const xpStats = getXpStats(girl, book);
    if (xpStats.canUse) {
      updateGirlWithBook(girl, book);

      if (this.updateGirl !== undefined) {
        this.updateGirl(girl);
      }
    }

    await this.mockRequest(
      () => {
        return undefined;
      },
      true,
      75
    );
  }

  async requestMaxOut(
    girl: CommonGirlData,
    type: 'gift' | 'book'
  ): Promise<MaxOutItems> {
    if (type === 'book' && girl.level === girl.maxLevel) {
      throw new Error('Girl XP is already maxed out');
    }
    if (type === 'gift' && girl.stars === girl.maxStars) {
      throw new Error('Girl Affection is already maxed out');
    }
    return this.mockRequest(
      () => {
        if (type === 'gift') {
          const result: MaxOutItems = {
            excess: 12,
            selection: [
              {
                id: 184,
                count: 30
              }
            ]
          };
          return result;
        } else if (type === 'book') {
          const result: MaxOutItems = {
            excess: 37,
            selection: [
              {
                id: 323,
                count: 2
              },
              {
                id: 321,
                count: 1
              },
              {
                id: 51,
                count: 1
              },
              { id: 48, count: 1 },
              { id: 52, count: 1 }
            ]
          };
          return result;
        }
        throw new Error('Invalid item type: ' + type);
      },
      true,
      200
    );
  }

  async confirmMaxOut(
    girl: CommonGirlData,
    type: 'book' | 'gift'
  ): Promise<MaxOutItems> {
    console.log('Max out: ', type, girl.name);
    return this.mockRequest(
      () => {
        if (type === 'gift') {
          const result: MaxOutItems = {
            excess: 12,
            selection: [
              {
                id: 184,
                count: 30
              }
            ]
          };
          return result;
        } else if (type === 'book') {
          const result: MaxOutItems = {
            excess: 37,
            selection: [
              {
                id: 323,
                count: 2
              },
              {
                id: 321,
                count: 1
              },
              {
                id: 51,
                count: 1
              },
              { id: 48, count: 1 },
              { id: 52, count: 1 }
            ]
          };
          return result;
        }
        throw new Error('Invalid item type: ' + type);
      },
      true,
      200
    );
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
    setGirlLevel(girl, newLevel);

    if (this.updateGirl) {
      this.updateGirl(girl);
    }
  }

  async upgrade(girl: CommonGirlData, questId: number): Promise<boolean> {
    return new Promise((resolve) =>
      setTimeout(() => {
        if (
          girl.stars < girl.maxStars &&
          girl.upgradeReady &&
          girl.quests[girl.stars].idQuest === questId
        ) {
          const currentQuest = girl.stars;
          girl.stars++;
          girl.currentIcon = girl.stars;
          girl.poseImage = getPoseN(girl.poseImage, girl.stars);
          girl.upgradeReady = false;
          girl.upgradeReady = isUpgradeReady(girl, 0);
          girl.quests[currentQuest].done = true;
          girl.quests[currentQuest].ready = false;
          if (girl.stars < girl.maxStars) {
            girl.quests[currentQuest + 1].ready = girl.upgradeReady;
          }
          if (this.updateGirl) {
            this.updateGirl(girl);
          }
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300)
    );
  }

  async useGift(girl: CommonGirlData, gift: Gift): Promise<void> {
    if (!girl.own) {
      return;
    }
    this.fireRequestEvent('queued');
    this.fireRequestEvent('started');
    const affStats = getAffectionStats(girl, gift);
    if (affStats.canUse) {
      updateGirlAffStats(girl, gift);
      if (this.updateGirl !== undefined) {
        this.updateGirl(girl);
      }
    }
    this.fireRequestEvent('completed');
    return;
  }

  async equipAll(_girl: CommonGirlData): Promise<GirlEquipment[]> {
    // TODO mock
    console.log('Mock Equip All (Not supported yet)');
    return [];
  }

  async unequipAll(girl: CommonGirlData): Promise<GirlEquipment[]> {
    const result = new Promise<GirlEquipment[]>((resolve, _reject) => {
      setTimeout(() => {
        if (girl.equipment && girl.equipment.items.length > 0) {
          girl.equipment.items = [];
          if (this.updateGirl) {
            this.updateGirl(girl);
            resolve([]);
          }
        }
      }, 150);
    });
    return result;
  }

  async equipOne(
    _girl: CommonGirlData,
    _item: Equipment
  ): Promise<GirlEquipment[]> {
    // TODO mock
    console.log('Mock Equip One (Not supported yet)');

    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve([]);
      }, 150);
    });
  }

  async unequipOne(
    girl: CommonGirlData,
    item: Equipment
  ): Promise<GirlEquipment[]> {
    const result = new Promise<GirlEquipment[]>((resolve, _reject) => {
      setTimeout(() => {
        if (girl.equipment && girl.equipment.items) {
          const itemToRemove = girl.equipment.items.findIndex(
            (equippedItem) => equippedItem.slot === item.slot
          );
          if (itemToRemove > -1) {
            girl.equipment.items.splice(itemToRemove, 1);
            if (this.updateGirl) {
              this.updateGirl(girl);
            }
          }
        }
        resolve([]);
      }, 150);
    });
    return result;
  }

  async unequipAllGirls(allGirls: CommonGirlData[]): Promise<GirlEquipment[]> {
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
    return [];
  }

  async getGirlsInventory(
    girl: CommonGirlData,
    slot?: number | undefined
  ): Promise<GirlEquipment[]> {
    const result = new Promise<GirlEquipment[]>((resolve, reject) => {
      setTimeout(async () => {
        if (slot !== undefined) {
          const slotKey = String(slot);
          const inventoryInSlot = { ...girlsInventory }[slotKey];
          if (
            inventoryInSlot &&
            'items' in inventoryInSlot &&
            Array.isArray(inventoryInSlot.items)
          ) {
            resolve(inventoryInSlot.items as unknown[] as GirlEquipment[]);
          } else {
            reject('Missing inventory or invalid slot?');
          }
        } else {
          // Return all
          const result: GirlEquipment[] = [];
          for (let slot = 1; slot <= 6; slot++) {
            result.push(...(await this.getGirlsInventory(girl, slot)));
          }
          result.sort((e1, e2) => getRarity(e2.rarity) - getRarity(e1.rarity));
          resolve(result);
        }
      }, 150);
    });
    return result;
  }

  getCurrency(): number {
    return 45000000;
  }

  addRequestListener(listener: RequestListener): void {
    this.requestListeners.add(listener);
  }

  removeRequestListener(listener: RequestListener): void {
    this.requestListeners.delete(listener);
  }

  private teams: Team[] | undefined;

  async getTeams(refresh: boolean): Promise<Team[]> {
    return new Promise((resolve) => {
      if (this.teams !== undefined && !refresh) {
        resolve(this.teams);
      } else {
        setTimeout(() => {
          this.teams = [
            {
              girlIds: ['948443498', '886658459', '861690823', '690645314'],
              teamId: '3680617',
              active: true,
              stats: undefined
            },
            {
              girlIds: [
                '886658459',
                '861690823',
                '690645314',
                '948443498',
                '249762992',
                '98',
                '1247315'
              ],
              teamId: '3680618',
              active: true,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: true,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: true,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: true,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: true,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            },
            {
              girlIds: [],
              teamId: null,
              active: false,
              stats: undefined
            }
          ];
          resolve(this.teams);
        }, 1000);
      }
    });
  }

  async setTeam(team: Team): Promise<void> {
    if (this.teams === undefined) {
      this.teams = await this.getTeams(false);
    }
    const currentTeam = this.teams.findIndex((t) => t.teamId === team.teamId);
    if (currentTeam >= 0) {
      this.teams[currentTeam] = team;
    } else {
      this.teams.push(team);
    }
  }

  async getTeamStats(team: Team): Promise<TeamStats> {
    if (team.girlIds.length > 0) {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          resolve({
            damage: 100000,
            defense: 53000,
            ego: 700000,
            chance: 96000,
            totalPower: 175000
          });
        }, 150);
      });
    } else {
      return {
        damage: 0,
        defense: 0,
        ego: 0,
        chance: 0,
        totalPower: 0
      };
    }
  }

  private fireRequestEvent(type: RequestEventType, success = true): void {
    if (this.requestListeners.size === 0) {
      return;
    }
    if (type === 'queued') {
      this.reqCount++;
    }
    if (type === 'completed') {
      this.reqCount--;
    }
    const event: RequestEvent = {
      type,
      success,
      pendingRequests: this.reqCount
    };
    for (const listener of this.requestListeners) {
      listener(event);
    }
  }

  /**
   * Mock a request execution that takes 100ms to execute, then
   * returns the result.
   *
   * @param result A provider for the result to be returned upon request success
   * @param success A boolean indicating if the mock request should be successful. If false, the promise will be rejected.
   */
  private async mockRequest<T>(
    result: () => T,
    success = true,
    delay = 100
  ): Promise<T> {
    this.fireRequestEvent('queued');
    return queue(
      () =>
        new Promise<T>((resolve, reject) => {
          this.fireRequestEvent('started');
          setTimeout(() => {
            this.fireRequestEvent('completed', success);
            if (success) {
              resolve(result());
            } else {
              reject('Mock Error');
            }
          }, delay);
        })
    );
  }

  addSalaryDataListener(_listener: SalaryDataListener): void {
    // Not supported in mock
  }

  removeSalaryDataListener(_listener: SalaryDataListener): void {
    // Not supported in mock
  }
}

function updateGirlWithBook(girl: CommonGirlData, book: Book) {
  const xpStats = getXpStats(girl, book);
  updateGirlXpStats(girl, xpStats.xpGain, xpStats.maxLevel);
}

function updateGirlXpStats(
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
  setGirlLevel(girl, newLevel);
}

function setGirlLevel(girl: CommonGirlData, level: number): void {
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

function updateGirlAffStats(girl: CommonGirlData, gift: Gift): void {
  const affStats = getAffectionStats(girl, gift);
  girl.upgradeReady = isUpgradeReady(girl, affStats.affGain);
  girl.currentAffection += affStats.affGain;
  girl.missingAff = Math.max(0, girl.missingAff - affStats.affGain);
  if (girl.upgradeReady) {
    girl.quests[girl.stars] = {
      ...girl.quests[girl.stars],
      ready: true
    };
  }
}
