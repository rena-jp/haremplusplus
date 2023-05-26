import {
  Book,
  CommonGirlData,
  Equipment,
  Gift,
  QuestData,
  Team
} from '../data/data';
import {
  GameBlessingData,
  GameInventory,
  GameQuests,
  GemsData,
  GirlEquipment,
  GirlsDataList,
  GirlsSalaryList
} from '../data/game-data';

/**
 * API to fetch data from the Game, or to trigger some actions.
 */
export interface GameAPI {
  /**
   * Get the girls data list from the game.
   * @param allowRequest If true, a request may be sent to the server to load the girls.
   * If false, this method will only check the current memory (Which would only
   * work on the in-game harem page)
   */
  getGirls(allowRequest: boolean): Promise<GirlsDataList>;
  /**
   * Get the quests list from the game.
   * @param allowRequest If true, a request may be sent to the server to load the quests.
   * If false, this method will only check the current memory (Which would only
   * work on the in-game harem page)
   */
  getQuests(allowRequest: boolean): Promise<GameQuests>;
  /**
   * Returns the current blessings. May send an Ajax request to the server.
   */
  getBlessings(): Promise<GameBlessingData>;
  /**
   * Returns the current inventory.
   * * @param allowRequest If true, a request may be sent to the server to load the inventory.
   * If false, this method will only check the current memory (Which would only
   * work on the in-game market page)
   */
  getMarketInventory(allowRequest: boolean): Promise<GameInventory>;
  /**
   * Use a book to increase the XP of the selected girl.
   * @param girl
   * @param book
   */
  useBook(girl: CommonGirlData, book: Book): Promise<void>;
  /**
   * Use a gift to increase the Affection of the selected girl.
   * @param girl
   * @param gift
   */
  useGift(girl: CommonGirlData, gift: Gift): Promise<void>;
  /**
   * Request "max out" for XP or Affection. This will return a list
   * of items necessary to max out XP/Affection for the selected girl.
   * This action doesn't apply any change (See #confirmMaxOut()).
   * @param girl The girl to max out
   * @param type The type of items to use ('book' for XP, 'gift' for Affection)
   * @return The list of items that will be used to max out the selected stat
   */
  requestMaxOut(
    girl: CommonGirlData,
    type: 'book' | 'gift'
  ): Promise<MaxOutItems>;
  /**
   * Max out the XP or Affection of the selected girl. Items will be consumed.
   *
   * @param girl  The girl to max out
   * @param type The type of items to use ('book' for XP, 'gift' for Affection)
   * @return The list of items that were consumed by this action.
   */
  confirmMaxOut(
    girl: CommonGirlData,
    type: 'book' | 'gift'
  ): Promise<MaxOutItems>;
  /**
   * Awaken the selected girl.
   * @param girl
   */
  awaken(girl: CommonGirlData): Promise<void>;
  /**
   * Upgrade the girl to the next grade
   * @param girl The girl to upgrade
   * @param questId The id of the upgrade quest
   */
  upgrade(girl: CommonGirlData, questId: number): Promise<boolean>;
  /**
   * Collect salary for the selected girl. If the action succeeds,
   * the callback will be invoked with an updated version of the girls data.
   * @param girl The girl to collect salary from.
   * @returns A Boolean Promise, resolving to true if salary collection was successful,
   * or false if it was unsuccessful.
   */
  collectSalary(girl: CommonGirlData): Promise<boolean>;
  /**
   * Return the quest data (dialogue, cost, image...) for upgrading a girl (or viewing a past scene)
   * @param girl
   * @param step
   * @param allowRequest
   */
  getQuestStep(
    girl: CommonGirlData,
    step: number,
    allowRequest: boolean
  ): Promise<QuestData>;
  /**
   * Return the current salary data for all girls
   */
  getSalaryData(): GirlsSalaryList;
  /**
   * Change the selected pose for the girl. If the action succeeds,
   * the callback will be invoked with an updated version of the girls data.
   * @param girl The girl for which the pose should be changed.
   * @param pose The new pose (Star number: [0-6])
   * @returns A Boolean Promise, resolving to true if pose modification was successful,
   * or false if it was unsuccessful.
   */
  changePose(girl: CommonGirlData, pose: number): Promise<boolean>;

  /**
   * Set an updateGirl callback, to be invoked when a girl object is modified
   * by this GameAPI.
   * @param updateGirl The callback.
   */
  setUpdateGirl(updateGirl: (girl: CommonGirlData) => void): void;

  /**
   * Return the gems data from the game (Number of gems per element)
   */
  getGemsData(allowRequest: boolean): Promise<GemsData>;

  /**
   * Add a listener to be notified when the SalaryData is updated
   * (When "Collect all" is pressed). Note: no update will be triggered
   * for individual girls salary updates; only full updates from Collect
   * All will cause listeners to be notified.
   * @param listener
   */
  addSalaryDataListener(listener: SalaryDataListener): void;

  /**
   * Remove a salary listener.
   * @param listener
   */
  removeSalaryDataListener(listener: SalaryDataListener): void;

  /**
   * Get the current amount of currency owned by the player
   */
  getCurrency(): number;

  /**
   * Install a listener to be notified when requests are processed.
   * @param listener the listener.
   */
  addRequestListener(listener: RequestListener): void;

  /**
   * Remove a request listener.
   * @param listener the listener.
   */
  removeRequestListener(listener: RequestListener): void;

  /**
   * Get the list of teams.
   */
  getTeams(refresh: boolean): Promise<Team[]>;

  /**
   * Update the specified team.
   * @param team the team to update.
   */
  setTeam(team: Team): Promise<void>;

  /**
   * Request current stats for the given team.
   * @param team the team
   */
  getTeamStats(team: Team): Promise<TeamStats>;

  /**
   * Automatically equip the girl with the best available
   * items.
   * @param girl the girl to equip
   * @return the updated inventory
   */
  equipAll(girl: CommonGirlData): Promise<GirlEquipment[]>;

  /**
   * Unequip all items from this girl.
   * @param girl the girl to unequip
   * @return the updated inventory
   */
  unequipAll(girl: CommonGirlData): Promise<GirlEquipment[]>;

  /**
   * Equip a single item for this girl.
   * @param girl the girl to equip
   * @param item the item to equip
   * @return the updated inventory
   */
  equipOne(girl: CommonGirlData, item: Equipment): Promise<GirlEquipment[]>;

  /**
   * Unequip a single item from this girl.
   * @param girl the girl to unequip
   * @param item the item to unequip
   * @return the updated inventory
   */
  unequipOne(girl: CommonGirlData, item: Equipment): Promise<GirlEquipment[]>;

  /**
   * Unequip all items from all girls.
   *
   * @param allGirls all girls data
   * @return the updated inventory
   */
  unequipAllGirls(allGirls: CommonGirlData[]): Promise<GirlEquipment[]>;

  /**
   * Return the inventory for girls equipment.
   * @param girl the selected girl. May be used to sort inventory by matching resonance.
   * @param slot if specified, only items for this slot will be returned.
   * Otherwise, all items will be returned.
   */
  getGirlsInventory(
    girl: CommonGirlData,
    slot?: number
  ): Promise<GirlEquipment[]>;
}

export type TeamStats = {
  ego: number;
  damage: number;
  defense: number;
  chance: number;
  totalPower: number;
};

export type SalaryDataListener = (data: GirlsSalaryList) => void;

export type RequestListener = (event: RequestEvent) => void;

export type RequestEventType = 'queued' | 'started' | 'completed';

export interface RequestEvent {
  type: RequestEventType;
  success: boolean;
  pendingRequests: number;
  duration?: number; // If type==='completed', delay between 'queued' and 'completed' events
}

const requestsQueue: Promise<unknown>[] = [];
let lastExecution = 0;
/** Minimum time between the end of a request and the beginning of the next, in ms */
const MIN_DELAY = 0;

/**
 * The game server doesn't like parallel requests, and may
 * throw 403 Forbidden as a result. Use this function to queue
 * server requests, ensuring they run sequentially.
 * @param request The request to execute.
 * @returns A promise that will be resolved (or rejected) when the request completes.
 */
export async function queue<T>(request: () => Promise<T>): Promise<T> {
  const clearCallback = () => {
    const resultIndex = requestsQueue.indexOf(result); // Should always be 0
    if (resultIndex > -1) {
      // Remove all previous requests from the queue
      requestsQueue.splice(0, resultIndex + 1);
      lastExecution = Date.now();
    }
  };

  const waitAndExecute = async () => {
    const delay = Date.now() - lastExecution;
    lastExecution = Date.now();
    if (delay < MIN_DELAY) {
      return await new Promise<T>((resolve, reject) => {
        setTimeout(() => {
          request().then(resolve).catch(reject);
        }, MIN_DELAY - delay);
      });
    }
    return await request();
  };

  const result = Promise.allSettled(requestsQueue)
    .catch(async (_error) => {
      return waitAndExecute();
    })
    .then(async () => {
      return waitAndExecute();
    })
    .then((value) => {
      clearCallback();
      return value;
    })
    .catch((error) => {
      clearCallback();
      throw error;
    });
  requestsQueue.push(result);
  return await result;
}

export interface MaxOutItems {
  excess: number;
  selection: ItemSelection[];
}

export interface ItemSelection {
  id: number;
  count: number;
}
