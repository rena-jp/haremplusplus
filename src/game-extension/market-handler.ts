import { MockGameAPI } from '../mock/MockGameAPI';
import { loadAndDispatch } from './frame-utils';
import { GameAPIImpl } from './GameAPIImpl';

const gameAPI =
  window.location.host === 'localhost:3000'
    ? new MockGameAPI()
    : new GameAPIImpl();

export async function handleMarket(): Promise<void> {
  const inventoryPromise = updateInventoryAndDispatch();
  await inventoryPromise;
  return;
}

async function updateInventoryAndDispatch(): Promise<void> {
  await loadAndDispatch('player_inventory', () =>
    gameAPI.getMarketInventory(false)
  );
}
