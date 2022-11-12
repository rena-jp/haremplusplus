import { useCallback, useMemo, useState } from 'react';
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
import { SimpleGirlTile } from './girl';

export type UpgradePage = 'books' | 'gifts';

export interface UpgradePageProps {
  currentGirl: CommonGirlData;
  displayedGirls: CommonGirlData[];
  allGirls: CommonGirlData[];
  gameAPI: GameAPI;
  page: UpgradePage;
  setPage(page: UpgradePage): void;
  selectGirl(girl: CommonGirlData): void;
  show0Pose: boolean;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({
  currentGirl,
  displayedGirls,
  allGirls,
  gameAPI,
  page,
  setPage,
  selectGirl,
  show0Pose
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

  const canXP = currentGirl.own && currentGirl.level! < currentGirl.maxLevel!;
  const canUpgrade = currentGirl.missingAff > 0 && !currentGirl.upgradeReady;
  const isMaxed =
    (page === 'books' && !canXP) || (page === 'gifts' && !canUpgrade);

  const validItemType =
    selectedItem !== undefined &&
    ((selectedItem.item.type === 'book' && page === 'books') ||
      (selectedItem.item.type === 'gift' && page === 'gifts'));

  const canUseItem = validItemType && !isMaxed;

  return (
    <div className="harem-upgrade">
      <h2>{currentGirl.name}</h2>
      {loading ? (
        <div>Loading inventory...</div>
      ) : (
        <>
          <GirlsSelector
            currentGirl={currentGirl}
            displayedGirls={displayedGirls}
            allGirls={allGirls}
            selectGirl={selectGirl}
            show0Pose={show0Pose}
          />
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
              disabled={!canUseItem}
            >
              Use
            </button>
            <button
              className="hh-action-button max"
              onClick={max}
              disabled={isMaxed}
            >
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

export interface GirlSelectorProps {
  currentGirl: CommonGirlData;
  displayedGirls: CommonGirlData[];
  allGirls: CommonGirlData[];
  selectGirl(girl: CommonGirlData): void;
  show0Pose: boolean;
}

export const GirlsSelector: React.FC<GirlSelectorProps> = ({
  currentGirl,
  displayedGirls,
  allGirls,
  selectGirl,
  show0Pose
}) => {
  const allGirlsByDate = useMemo(() => {
    const ownedGirls = allGirls.filter((girl) => girl.own);
    ownedGirls.sort((g1, g2) => (g1.recruited ?? 0) - (g2.recruited ?? 0));
    return ownedGirls;
  }, [allGirls]);

  const ownedDisplayedGirls = useMemo(() => {
    const ownedGirls = displayedGirls.filter((girl) => girl.own);
    return ownedGirls;
  }, [displayedGirls]);

  let previousGirl: CommonGirlData, nextGirl: CommonGirlData;
  let index = ownedDisplayedGirls.findIndex(
    (girl) => girl.id === currentGirl.id
  );
  if (index < 0) {
    index = allGirlsByDate.findIndex((girl) => girl.id === currentGirl.id);
    previousGirl =
      allGirlsByDate[
        (allGirlsByDate.length + index - 1) % allGirlsByDate.length
      ];
    nextGirl = allGirlsByDate[(index + 1) % allGirlsByDate.length];
  } else {
    previousGirl =
      ownedDisplayedGirls[
        (ownedDisplayedGirls.length + index - 1) % ownedDisplayedGirls.length
      ];
    nextGirl = ownedDisplayedGirls[(index + 1) % ownedDisplayedGirls.length];
  }

  const rankCount =
    allGirlsByDate.findIndex((girl) => girl.id === currentGirl.id) + 1;
  const ownedGirlsCount = allGirlsByDate.length;

  return (
    <div className="girls-selector">
      <SimpleGirlTile
        classNames={['previous-girl']}
        girl={previousGirl}
        onClick={() => selectGirl(previousGirl)}
        selected={false}
        show0Pose={show0Pose}
      />
      <SimpleGirlTile
        girl={currentGirl}
        selected={true}
        show0Pose={show0Pose}
        onClick={() => {
          /* Do nothing */
        }}
      />
      <SimpleGirlTile
        classNames={['next-girl']}
        girl={nextGirl}
        onClick={() => selectGirl(nextGirl)}
        selected={false}
        show0Pose={show0Pose}
      />
      <span className="girl-rank">
        {rankCount}/{ownedGirlsCount}
      </span>
    </div>
  );
};
