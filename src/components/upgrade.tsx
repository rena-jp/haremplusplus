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
import { useAffectionStats } from '../hooks/girl-aff-hooks';
import { getLevel, useXpStats } from '../hooks/girl-xp-hooks';
import { useInventory } from '../hooks/inventory-data-hook';
import '../style/upgrade.css';
import { Tooltip, format, getDomain, ProgressBar, CloseButton } from './common';
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
  close(): void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({
  currentGirl,
  displayedGirls,
  allGirls,
  gameAPI,
  page,
  setPage,
  selectGirl,
  show0Pose,
  close
}) => {
  const { inventory, loading, consumeItem } = useInventory(gameAPI);

  const items: ItemEntry<Item>[] =
    page === 'books' ? inventory.books : inventory.gifts;

  const [selectedItem, setSelectedItem] = useState<ItemEntry<Item> | undefined>(
    items.length === 0 ? undefined : items[0]
  );
  if (selectedItem !== undefined && !items.includes(selectedItem)) {
    const matchingItem = items.find(
      (item) => item.item.itemId === selectedItem.item.itemId
    );
    if (matchingItem !== selectedItem) {
      setSelectedItem(matchingItem);
    }
  }

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
    consumeItem(selectedItem);
    if (page === 'books' && selectedItem.item.type === 'book') {
      gameAPI.useBook(currentGirl, selectedItem.item as Book);
    } else if (page === 'gifts' && selectedItem.item.type === 'gift') {
      gameAPI.useGift(currentGirl, selectedItem.item as Gift);
    }
  }, [selectedItem, currentGirl, gameAPI]);

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
      <CloseButton close={close} />
      <div className="selector-and-upgrade">
        <h2>{currentGirl.name}</h2>
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
        <UpgradeStatus
          girl={currentGirl}
          page={page}
          selectedItem={selectedItem?.item}
        />
      </div>
      <div className="items-and-actions">
        {loading ? (
          <div>Loading inventory...</div>
        ) : (
          <>
            <ItemsList
              items={items}
              selectedItem={selectedItem}
              selectItem={selectItem}
            />
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
    </div>
  );
};

export interface ItemTileProps {
  itemEntry: ItemEntry<Item>;
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

  // For filtered girls, memoize and do not update: this will ensure the selection remains stable,
  // even if filters change/a girl being upgraded no longer matches the filters.
  // This makes the carousel behavior a lot more predictable.
  const carouselGirls = useMemo(() => {
    const ownedGirls = displayedGirls.filter((girl) => girl.own);
    return ownedGirls;
  }, []);

  // We still need to get up-to-date data: retrieve the current girl object
  // from allGirls, when it is modified.
  const ownedDisplayedGirls = useMemo(() => {
    return carouselGirls.map(
      (carouselGirl) =>
        allGirls.find((girl) => girl.id === carouselGirl.id) ?? carouselGirl
    );
  }, [allGirls, carouselGirls]);

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

export interface StatusProps {
  girl: CommonGirlData;
}
export interface UpgradeStatusProps extends StatusProps {
  page: 'books' | 'gifts';
  selectedItem: Item | undefined;
}

export const UpgradeStatus: React.FC<UpgradeStatusProps> = ({
  girl,
  page,
  selectedItem
}) => {
  const book =
    selectedItem !== undefined && selectedItem.type === 'book'
      ? (selectedItem as Book)
      : undefined;
  const gift =
    selectedItem !== undefined && selectedItem.type === 'gift'
      ? (selectedItem as Gift)
      : undefined;
  return (
    <div className="upgrade-status">
      {page === 'books' ? <XPStatus girl={girl} book={book} /> : null}
      {page === 'gifts' ? <AffStatus girl={girl} gift={gift} /> : null}
    </div>
  );
};

export interface XpStatusProps extends StatusProps {
  book: Book | undefined;
}

export const XPStatus: React.FC<XpStatusProps> = ({ girl, book }) => {
  const levelReach =
    book === undefined ? girl.level ?? 0 : getLevel(girl, book.xp);
  const nextLevel = girl.level === 750 ? 750 : (girl.level ?? 1) + 1;
  const nextCap = girl.maxLevel!;

  const xpStats = useXpStats(girl);

  const displayTargetLevel =
    girl.level === nextCap ? nextCap : Math.max(nextLevel, levelReach);

  return (
    <div className="xp-status">
      {girl.level! < 750 ? (
        <span>
          Lv. {girl.level} to Lv. {displayTargetLevel}:
          <ProgressBar
            curr={xpStats.currentXp}
            min={xpStats.minXp}
            max={xpStats.maxXp}
            extra={book?.xp ?? 0}
            label={
              girl.level === girl.maxLevel
                ? 'Max.'
                : format(xpStats.maxXp - xpStats.currentXp) + ' XP'
            }
          />
        </span>
      ) : (
        <span>
          Lv. 750
          <ProgressBar min={0} max={100} curr={100} label="Max." />
        </span>
      )}
      {girl.level! < nextCap || nextCap < 750 ? (
        <span>
          To Lv. {nextCap}:{' '}
          <ProgressBar
            curr={xpStats.currentXp}
            min={xpStats.minXpToCap}
            max={xpStats.maxXpToCap}
            extra={book?.xp ?? 0}
            label={
              girl.level === nextCap
                ? 'Max.'
                : format(xpStats.maxXpToCap - xpStats.currentXp) + ' XP'
            }
          />
        </span>
      ) : null}
      {xpStats.xpToMax > 0 ? (
        <span>
          To Lv. 750:{' '}
          <ProgressBar
            curr={xpStats.currentXp}
            min={0}
            max={xpStats.currentXp + xpStats.xpToMax}
            extra={book?.xp ?? 0}
            label={format(xpStats.xpToMax) + ' XP'}
          />
        </span>
      ) : null}
      {/* {girl.gemsToCap ?? 0 > 0 ? (
        <span>
          Gems to next cap: {format(girl.gemsToCap ?? 0)}
          <GemIcon element={girl.element} />
        </span>
      ) : null} */}
    </div>
  );
};

export interface AffStatusProps extends StatusProps {
  gift: Gift | undefined;
}

export const AffStatus: React.FC<AffStatusProps> = ({ girl, gift }) => {
  const nextGrade = girl.stars + 1;

  const affStats = useAffectionStats(girl);

  const { minAff, maxAff, affToMax, currentAff } = affStats;

  console.log('Min: ', minAff, 'Max: ', maxAff);

  return (
    <div className="aff-status">
      {girl.stars < girl.maxStars ? (
        <span>
          Aff. to grade {nextGrade}:
          <ProgressBar
            curr={currentAff}
            min={minAff}
            max={maxAff}
            extra={gift?.aff ?? 0}
            label={
              girl.stars === girl.maxStars
                ? 'Max.'
                : girl.upgradeReady
                ? 'Ready'
                : format(affStats.maxAff - affStats.currentAff) + ' Aff'
            }
          />
        </span>
      ) : null}
      <span>
        Aff. to grade {girl.maxStars}:
        <ProgressBar
          curr={currentAff}
          min={0}
          max={affToMax}
          extra={gift?.aff ?? 0}
          label={
            girl.stars === girl.maxStars
              ? 'Max.'
              : currentAff === affToMax
              ? 'Ready'
              : format(affStats.affToMax - affStats.currentAff) + ' Aff'
          }
        />
      </span>
    </div>
  );
};

export interface ItemsListProps {
  items: ItemEntry<Item>[];
  selectedItem: ItemEntry<Item> | undefined;
  selectItem(item: ItemEntry<Item>): void;
}

const ItemsList: React.FC<ItemsListProps> = ({
  items,
  selectedItem,
  selectItem
}) => {
  const totalValue = items
    .map((item) => getValue(item.item) * item.count)
    .reduce((a, b) => a + b, 0);
  const unit =
    items.length === 0 ? '' : items[0].item.type === 'book' ? 'XP' : 'Aff';
  return (
    <div className="qh-inventory">
      <h3>
        Total: {format(totalValue)} {unit}
      </h3>
      <div className="upgrade-items-list">
        {items.map((itemEntry) => (
          <ItemTile
            itemEntry={itemEntry}
            selected={selectedItem === itemEntry}
            select={selectItem}
            key={itemEntry.item.itemId}
          />
        ))}
      </div>
    </div>
  );
};

function getValue(item: Item): number {
  if (item.type === 'book') {
    return (item as Book).xp;
  } else if (item.type === 'gift') {
    return (item as Gift).aff;
  }
  return 0;
}
