import { useCallback, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  Book,
  CommonGirlData,
  Gift,
  Item,
  ItemEntry,
  Rarity
} from '../data/data';
import { useInventory } from '../hooks/inventory-data-hook';
import '../style/upgrade.css';
import { Tooltip, format, getDomain } from './common';

export type UpgradePage = 'books' | 'gifts';

export interface UpgradePageProps {
  currentGirl: CommonGirlData;
  displayedGirls: CommonGirlData[];
  gameAPI: GameAPI;
  page: UpgradePage;
  setPage(page: UpgradePage): void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({
  currentGirl,
  gameAPI,
  page,
  setPage
}) => {
  const { inventory, loading } = useInventory(gameAPI);

  const items = page === 'books' ? inventory.books : inventory.gifts;

  const [selectedItem, setSelectedItem] = useState<ItemEntry<Item> | undefined>(
    items.length === 0 ? undefined : items[0]
  );

  const selectItem = useCallback(
    (item: ItemEntry<Item> | undefined) => {
      setSelectedItem(item);
    },
    [setSelectedItem]
  );

  const useItem = useCallback(() => {
    if (selectedItem === undefined) {
      return;
    }
    if (page === 'books' && selectedItem.item.type === 'book') {
      gameAPI.useBook(currentGirl, selectedItem.item as Book);
    } else if (page === 'gifts' && selectedItem.item.type === 'gift') {
      gameAPI.useGift(currentGirl, selectedItem.item as Gift);
    }
  }, [selectedItem]);

  const max = useCallback(() => {
    if (page === 'books') {
      gameAPI.maxXP(currentGirl);
    } else if (page === 'gifts') {
      gameAPI.maxAff(currentGirl);
    }
  }, []);

  const marketType = page === 'books' ? 'potion' : 'gift';

  const domain = getDomain();

  return (
    <div className="harem-upgrade">
      <h2>{currentGirl.name}</h2>
      {loading ? (
        <div>Loading inventory...</div>
      ) : (
        <>
          <div className="harem-upgrade-pages">
            <span
              className={`${page === 'books' ? 'active' : 'inactive'}`}
              onClick={() => setPage('books')}
            >
              Books
            </span>
            <span
              className={`${page === 'gifts' ? 'active' : 'inactive'}`}
              onClick={() => setPage('gifts')}
            >
              Gifts
            </span>
          </div>
          <div className="upgrade-items-list">
            {items.map((itemEntry) => (
              <ItemTile
                itemEntry={itemEntry}
                girl={currentGirl}
                selected={selectedItem === itemEntry}
                select={selectItem}
                key={itemEntry.item.itemId}
              />
            ))}
          </div>
          <div className="harem-upgrade-actions">
            <a
              className="hh-action-button go-to-market"
              href={`${domain}/shop.html?type=${marketType}`}
            >
              Go to Market
            </a>
            <div className="spacer" />
            <button
              className="hh-action-button use"
              onClick={useItem}
              disabled={selectedItem === undefined}
            >
              Use
            </button>
            <button className="hh-action-button max" onClick={max}>
              Max
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export interface ItemTileProps {
  itemEntry: ItemEntry<Item>;
  girl: CommonGirlData;
  selected: boolean;
  select(item: ItemEntry<Item> | undefined): void;
}

export const ItemTile: React.FC<ItemTileProps> = ({
  itemEntry,
  select,
  selected
}) => {
  const { item } = itemEntry;

  const rarityCss = Rarity[item.rarity];
  const classNames = ['tile', 'itemTile', rarityCss];
  if (selected) {
    classNames.push('selected');
  }

  const value =
    item.type === 'book'
      ? format((item as Book).xp) + ' XP'
      : format((item as Gift).aff) + ' Aff';

  return (
    <Tooltip
      tooltip={
        <span>
          {item.label} ({value})
        </span>
      }
      place="top"
    >
      <div className={classNames.join(' ')} onClick={() => select(itemEntry)}>
        <img src={item.icon} alt={item.label} className="tileImg" />
        <span className="item-count">{itemEntry.count}</span>
      </div>
    </Tooltip>
  );
};
