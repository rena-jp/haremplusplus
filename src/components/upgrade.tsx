import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  asBook,
  asGift,
  Book,
  CommonGirlData,
  Element,
  Gift,
  isBook,
  isGift,
  Item,
  ItemEntry,
  Rarity
} from '../data/data';
import { useAffectionStats } from '../hooks/girl-aff-hooks';
import { getAwakeningThreshold, useXpStats } from '../hooks/girl-xp-hooks';
import { useInventory } from '../hooks/inventory-data-hook';
import '../style/upgrade.css';
import {
  Tooltip,
  format,
  getDomain,
  ProgressBar,
  CloseButton,
  GemIcon,
  formatCost
} from './common';
import { SimpleGirlTile } from './girl';
import Popup from 'reactjs-popup';
import { useGemsStats } from '../hooks/girl-gems-hooks';
import { OptionsContext } from '../data/options-context';
import { SceneViewer } from './scenes';
import { getDocumentHref } from '../migration';
import { FullMaxOutAffectionResult } from '../data/game-data';
import { fromFulltoMaxOutItems } from '../game-extension/GameAPIImpl';

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
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
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
  close,
  gemsCount,
  consumeGems
}) => {
  const { inventory, loading, consumeItem, consumeItems } =
    useInventory(gameAPI);

  // TODO Update items after calling consumeItems? Probably not necessary; inventory will be updated, and we don't need preserve the selection

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

  const xpStats = useXpStats(currentGirl, asBook(selectedItem?.item));
  const affStats = useAffectionStats(currentGirl, asGift(selectedItem?.item));

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
    const selectionIndex = items.indexOf(selectedItem);
    const selectionCount = selectedItem.count;
    const newItems = consumeItem(selectedItem);
    if (page === 'books' && isBook(selectedItem.item)) {
      gameAPI.useBook(currentGirl, selectedItem.item);
    } else if (page === 'gifts' && isGift(selectedItem.item)) {
      gameAPI.useGift(currentGirl, selectedItem.item);
    }
    if (selectionCount - 1 <= 0) {
      const nextItem =
        newItems.length === 0
          ? undefined
          : newItems.length <= selectionIndex
            ? newItems[newItems.length - 1]
            : newItems[selectionIndex];
      selectItem(nextItem);
    }
  }, [selectedItem, selectItem, currentGirl, gameAPI]);

  const marketType = page === 'books' ? 'potion' : 'gift';

  const domain = getDomain();

  const canUseItem =
    (page === 'books' && xpStats.canUse) ||
    (page === 'gifts' && affStats.canUse);

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
          allGirls={allGirls}
          page={page}
          selectedItem={selectedItem?.item}
          gameAPI={gameAPI}
          gemsCount={gemsCount}
          consumeGems={consumeGems}
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
                href={getDocumentHref(`${domain}/shop.html?type=${marketType}`)}
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
              {page === 'books' ? (
                <MaxXP
                  girl={currentGirl}
                  gameAPI={gameAPI}
                  items={items}
                  consumeItems={consumeItems}
                />
              ) : null}
              {page === 'gifts' ? (
                <>
                  <MaxAffection
                    girl={currentGirl}
                    gameAPI={gameAPI}
                    items={items}
                    consumeItems={consumeItems}
                  />
                  <FullMaxAffection
                    girl={currentGirl}
                    gameAPI={gameAPI}
                    items={items}
                    consumeItems={consumeItems}
                  />
                </>
              ) : null}
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
        <div className="tile-image-area">
          <img src={item.icon} alt={item.label} className="tileImg" />
          <span className="item-count">{itemEntry.count}</span>
        </div>
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
  gameAPI: GameAPI;
}
export interface UpgradeStatusProps extends StatusProps {
  allGirls: CommonGirlData[];
  page: 'books' | 'gifts';
  selectedItem: Item | undefined;
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
}

export const UpgradeStatus: React.FC<UpgradeStatusProps> = ({
  girl,
  allGirls,
  page,
  selectedItem,
  gameAPI,
  gemsCount,
  consumeGems
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
      {page === 'books' ? (
        <XPStatus
          girl={girl}
          allGirls={allGirls}
          book={book}
          gameAPI={gameAPI}
          gemsCount={gemsCount}
          consumeGems={consumeGems}
        />
      ) : null}
      {page === 'gifts' ? (
        <AffStatus girl={girl} gift={gift} gameAPI={gameAPI} />
      ) : null}
    </div>
  );
};

export interface XpStatusProps extends StatusProps {
  allGirls: CommonGirlData[];
  book: Book | undefined;
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
}

export const XPStatus: React.FC<XpStatusProps> = ({
  girl,
  allGirls,
  book,
  gameAPI,
  gemsCount,
  consumeGems
}) => {
  const nextLevel = girl.level === 750 ? 750 : (girl.level ?? 1) + 1;

  const xpStats = useXpStats(girl, book);
  const gemsStats = useGemsStats(girl);
  const levelReach = xpStats.level;
  const nextCap = xpStats.maxLevel;

  const displayTargetLevel =
    girl.level === nextCap ? nextCap : Math.max(nextLevel, levelReach);

  const currentLevel = girl.level ?? 0;
  const awakenOverlay =
    currentLevel === girl.maxLevel && currentLevel < 750 ? (
      <Awaken
        girl={girl}
        allGirls={allGirls}
        trigger={
          <button className="awaken overlay icon-action">
            <Tooltip tooltip={<span>Awaken</span>}>
              <div className="filler"></div>
            </Tooltip>
          </button>
        }
        gameAPI={gameAPI}
        gemsCount={gemsCount}
        consumeGems={consumeGems}
      />
    ) : null;

  return (
    <div className="xp-status">
      {girl.level! < 750 ? (
        <span>
          Lv. {girl.level} to Lv. {displayTargetLevel}:
          <ProgressBar
            curr={xpStats.currentXp}
            min={xpStats.minXp}
            max={xpStats.maxXp}
            extra={xpStats.xpGain}
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
            extra={xpStats.xpGain}
            label={
              girl.level === nextCap
                ? 'Max.'
                : format(xpStats.maxXpToCap - xpStats.currentXp) + ' XP'
            }
            overlay={awakenOverlay}
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
            extra={xpStats.xpGain}
            label={format(xpStats.xpToMax) + ' XP'}
          />
        </span>
      ) : null}
      {gemsStats.gemsToNextCap > 0 ? (
        <div className="gems-awakening">
          <div className="awaken-summary">
            Gems to next cap: {format(gemsStats.gemsToNextCap ?? 0)}
            <GemIcon element={girl.element} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export interface AffStatusProps extends StatusProps {
  gift: Gift | undefined;
}

export const AffStatus: React.FC<AffStatusProps> = ({
  girl,
  gift,
  gameAPI
}) => {
  const affStats = useAffectionStats(girl, gift);
  const nextGrade = affStats.targetGrade;

  const { minAff, maxAff, affToMax, currentAff } = affStats;

  const upgradeOverlay = girl.upgradeReady ? (
    <Popup
      modal
      trigger={
        <button className="upgrade overlay">
          <Tooltip tooltip={<span>Upgrade</span>}>
            <div className="filler"></div>
          </Tooltip>
        </button>
      }
    >
      {
        ((close: () => void) => (
          <SceneViewer
            girl={girl}
            scene={girl.stars}
            gameAPI={gameAPI}
            close={close}
          />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )) as any
      }
    </Popup>
  ) : null;

  return (
    <div className="aff-status">
      {girl.stars < girl.maxStars ? (
        <span>
          Aff. to grade {nextGrade}:
          <ProgressBar
            curr={currentAff}
            min={minAff}
            max={maxAff}
            extra={affStats.affGain}
            label={
              girl.stars === girl.maxStars
                ? 'Max.'
                : girl.upgradeReady
                  ? 'Ready'
                  : format(affStats.maxAff - affStats.currentAff) + ' Aff'
            }
            overlay={upgradeOverlay}
          />
        </span>
      ) : null}
      <span>
        {girl.stars === girl.maxStars ? (
          <>Grade {girl.maxStars}</>
        ) : (
          <>Aff. to grade {girl.maxStars}:</>
        )}
        <ProgressBar
          curr={currentAff}
          min={0}
          max={affToMax}
          extra={affStats.affGain}
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

export interface MaxXPProps {
  girl: CommonGirlData;
  items: ItemEntry<Item>[];
  gameAPI: GameAPI;
  consumeItems(items: ItemEntry<Item>[]): void;
}

export const MaxXP: React.FC<MaxXPProps> = ({
  girl,
  items,
  gameAPI,
  consumeItems
}) => {
  const canXP = girl.own && girl.level! < girl.maxLevel!;

  return (
    <Popup
      modal
      trigger={
        <button className="hh-action-button max" disabled={!canXP}>
          Max
        </button>
      }
    >
      {
        ((close: () => void) => (
          <MaxItems
            gameAPI={gameAPI}
            girl={girl}
            items={items}
            close={close}
            type="book"
            consumeItems={consumeItems}
          />
          // eslint-disable-next-line
        )) as any
      }
    </Popup>
  );
};

export interface MaxAffProps {
  girl: CommonGirlData;
  gameAPI: GameAPI;
  items: ItemEntry<Item>[];
  consumeItems(items: ItemEntry<Item>[]): void;
}

export const MaxAffection: React.FC<MaxAffProps> = ({
  girl,
  gameAPI,
  items,
  consumeItems
}) => {
  const canUpgrade = girl.missingAff > 0 && !girl.upgradeReady;
  return (
    <Popup
      modal
      trigger={
        <button className="hh-action-button max" disabled={!canUpgrade}>
          Max
        </button>
      }
    >
      {
        ((close: () => void) => (
          <MaxItems
            gameAPI={gameAPI}
            girl={girl}
            items={items}
            close={close}
            type="gift"
            consumeItems={consumeItems}
          />
          // eslint-disable-next-line
        )) as any
      }
    </Popup>
  );
};

export interface FullMaxAffectionProps {
  girl: CommonGirlData;
  gameAPI: GameAPI;
  items: ItemEntry<Item>[];
  consumeItems(items: ItemEntry<Item>[]): void;
}

export const FullMaxAffection: React.FC<FullMaxAffectionProps> = ({
  girl,
  gameAPI,
  items,
  consumeItems
}) => {
  const canFullMaxUpgrade = girl.stars < girl.maxStars && !girl.upgradeReady;
  return (
    <Popup
      modal
      trigger={
        <button
          className="hh-action-button full-max"
          disabled={!canFullMaxUpgrade}
        >
          Full Max
        </button>
      }
    >
      {
        ((close: () => void) => (
          <FullMaxing
            gameAPI={gameAPI}
            girl={girl}
            items={items}
            close={close}
            type="gift"
            consumeItems={consumeItems}
          />
          // eslint-disable-next-line
        )) as any
      }
    </Popup>
  );
};

interface MaxItemsProps {
  girl: CommonGirlData;
  gameAPI: GameAPI;
  items: ItemEntry<Item>[];
  type: 'book' | 'gift';
  close(): void;
  consumeItems(items: ItemEntry<Item>[]): void;
}

const MaxItems: React.FC<MaxItemsProps> = ({
  girl,
  items,
  gameAPI,
  type,
  close,
  consumeItems
}) => {
  const [usedItems, setUsedItems] = useState<ItemEntry<Item>[] | undefined>(
    undefined
  );
  const [excess, setExcess] = useState(0);
  const [ready, setReady] = useState(false);

  const stat = type === 'book' ? 'experience' : 'affection';

  useEffect(() => {
    async function requestItems(): Promise<void> {
      try {
        const usedItems = await gameAPI.requestMaxOut(girl, type);
        if (usedItems.selection.length === 0) {
          setUsedItems([]);
        }
        const newUsedItems = [];
        for (const item of usedItems.selection) {
          const itemEntry = items.find((i) => i.item.itemId === item.id);
          if (itemEntry === undefined) {
            throw new Error(
              'Failed to find item in current inventory: ' +
                JSON.stringify(item)
            );
          }
          const useEntry = {
            item: itemEntry?.item,
            count: item.count
          };
          newUsedItems.push(useEntry);
        }
        setUsedItems(newUsedItems);
        setExcess(usedItems.excess);
      } catch (error) {
        console.error('Error: ', error);
      }

      setReady(true);
    }
    requestItems();
  }, []);

  const confirm = useCallback(() => {
    async function confirmMaxOut() {
      const appliedItems = await gameAPI.confirmMaxOut(girl, type);
      const consumedItems: ItemEntry<Item>[] = [];
      for (const item of appliedItems.selection) {
        const itemEntry = items.find((i) => i.item.itemId === item.id);
        if (itemEntry === undefined) {
          throw new Error(
            'Failed to find item in current inventory: ' + JSON.stringify(item)
          );
        }
        const useEntry = {
          item: itemEntry?.item,
          count: item.count
        };
        consumedItems.push(useEntry);
      }
      consumeItems(consumedItems);
    }
    confirmMaxOut();
    close();
  }, [gameAPI]);

  const message =
    excess < 0 ? (
      <>
        You are about to use all these items even though they are not enough to
        fill the whole {stat} bar
      </>
    ) : (
      <>Filling your {stat} bar will cost you:</>
    );

  const isMaxed =
    (type === 'book' && girl.maxLevel === 750) ||
    (type === 'gift' && girl.stars === girl.maxStars - 1);

  return (
    <div className="qh-popup max-content-popup">
      <CloseButton close={close} />
      {ready && usedItems === undefined ? <p>An error occurred.</p> : null}
      {ready && usedItems !== undefined ? (
        <>
          <h2>{message}</h2>
          <ItemsList
            items={usedItems}
            selectedItem={undefined}
            selectItem={() => {
              /* No selection */
            }}
          />
          {isMaxed && excess > 0 ? (
            <p className="note">
              Note: <span className="value">{excess}</span> {stat} will be lost
              using these items!
            </p>
          ) : null}
          <div className="max-out-actions">
            <span>Do you want to proceed?</span>
            <button
              className="hh-game-action confirm-max-out"
              onClick={confirm}
            >
              Yes
            </button>
            <button className="hh-action-button cancel-max-out" onClick={close}>
              No
            </button>
          </div>
        </>
      ) : null}
      {!ready ? <p>Loading items...</p> : null}
    </div>
  );
};

interface FullMaxingProps {
  girl: CommonGirlData;
  gameAPI: GameAPI;
  items: ItemEntry<Item>[];
  type: 'book' | 'gift'; // Only gift implemented for now
  close(): void;
  consumeItems(items: ItemEntry<Item>[]): void;
}

const FullMaxing: React.FC<FullMaxingProps> = ({
  girl,
  gameAPI,
  items,
  type,
  close,
  consumeItems
}) => {
  const [usedItems, setUsedItems] = useState<ItemEntry<Item>[] | undefined>(
    undefined
  );
  const [ready, setReady] = useState(false);
  const [request, setRequest] = useState<FullMaxOutAffectionResult | undefined>(
    undefined
  );

  const stat = type === 'book' ? 'experience' : 'affection';

  useEffect(() => {
    async function requestFullItems(): Promise<void> {
      try {
        const requestResponse = await gameAPI.requestFullMaxOutAffection(girl); // For now only Affection
        setRequest(requestResponse);
        const itemsInfo = fromFulltoMaxOutItems(requestResponse);
        if (itemsInfo.selection.length === 0) {
          setUsedItems([]);
        }
        const newUsedItems = [];
        for (const item of itemsInfo.selection) {
          const itemEntry = items.find((i) => i.item.itemId === item.id);
          if (itemEntry === undefined) {
            throw new Error(
              'Failed to find item in current inventory: ' +
                JSON.stringify(item)
            );
          }
          const useEntry = {
            item: itemEntry?.item,
            count: item.count
          };
          newUsedItems.push(useEntry);
        }
        setUsedItems(newUsedItems);
      } catch (error) {
        console.error('Error: ', error);
      }
      setReady(true);
    }
    requestFullItems();
  }, [girl, items, gameAPI]);

  const confirm = useCallback(() => {
    async function confirmFullMaxOut() {
      console.log(request);
      if (request === undefined) {
        console.error('No request data available for full max out.');
        return;
      }
      const appliedItems = await gameAPI.confirmFullMaxOutAffection(
        girl,
        request
      );
      const consumedItems: ItemEntry<Item>[] = [];
      for (const item of appliedItems.selection) {
        const itemEntry = items.find((i) => i.item.itemId === item.id);
        if (itemEntry === undefined) {
          throw new Error(
            'Failed to find item in current inventory: ' + JSON.stringify(item)
          );
        }
        const useEntry = {
          item: itemEntry?.item,
          count: item.count
        };
        consumedItems.push(useEntry);
      }
      consumeItems(consumedItems);
    }
    confirmFullMaxOut();
    close();
  }, [request]);

  return (
    <div className="qh-popup full-max-content-popup">
      <CloseButton close={close} />
      {ready && (usedItems === undefined || request === undefined) ? (
        <p>An error occurred.</p>
      ) : null}
      {ready && usedItems !== undefined && request !== undefined ? (
        <>
          <h2>
            {request!.excess > 0 ? (
              <>Maxing your {stat} will cost you:</>
            ) : type === 'gift' ? (
              request.target_grade < girl.maxStars ? (
                <span style={{ color: 'red' }}>
                  You will only go up to {request?.target_grade} for {stat}
                </span>
              ) : (
                <>Maxing your {stat} will cost you:</>
              )
            ) : (
              <>Maxing your {stat} will cost you:</>
            )}
          </h2>
          <ItemsList
            items={usedItems}
            selectedItem={undefined}
            selectItem={() => {
              /* No selection */
            }}
          />
          {request.excess > 0 ? (
            <p className="note">
              Note: <span className="value">{request.excess}</span> {stat} will
              be lost using these items!
            </p>
          ) : null}
          <div className="max-out-actions">
            <span>Do you want to proceed?</span>
            {type === 'gift' ? (
              <button
                className="hh-game-action confirm-full-max-out-affection"
                onClick={confirm}
              >
                {formatCost(request.needed_currency.sc)}
                <div className="currency-icon"></div>
              </button>
            ) : (
              <span>Not yet implemented</span>
            )}
            <button className="hh-action-button cancel-max-out" onClick={close}>
              No
            </button>
          </div>
        </>
      ) : null}
      {!ready ? <p>Loading items...</p> : null}
    </div>
  );
};

export interface AwakenProps {
  girl: CommonGirlData;
  allGirls: CommonGirlData[];
  trigger?: JSX.Element;
  gameAPI: GameAPI;
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
}

export const Awaken: React.FC<AwakenProps> = ({
  girl,
  allGirls,
  trigger,
  gameAPI,
  gemsCount,
  consumeGems
}) => {
  const gemsStats = useGemsStats(girl);
  const { show0Pose } = useContext(OptionsContext);
  const poseImage = show0Pose ? girl?.poseImage0 : girl?.poseImage;
  const currentGems = gemsCount.get(girl.element) ?? 0;
  const doAwaken = useCallback(() => {
    gameAPI
      .awaken(girl)
      .then(() => consumeGems(girl.element, gemsStats.gemsToNextCap));
  }, [gameAPI, gemsStats, gemsStats.gemsToNextCap]);
  const nextAwakeningLevel =
    girl.maxLevel === 750 || girl.maxLevel === undefined
      ? undefined
      : girl.maxLevel + 50;
  const minGirlsToAwaken =
    nextAwakeningLevel === undefined
      ? 0
      : getAwakeningThreshold(nextAwakeningLevel);
  const currentGirls = allGirls
    .filter((g) => g.own)
    .filter((ownedGirl) => ownedGirl.level! >= (girl.maxLevel ?? 0)).length;
  const canAwaken =
    currentGirls >= minGirlsToAwaken && gemsStats.gemsToNextCap <= currentGems;
  return (
    <Popup modal trigger={trigger}>
      {
        ((closePopup: () => void) => (
          <div className="qh-popup awakening-popup">
            <CloseButton close={closePopup} />
            {girl.maxLevel === 750 ? (
              <div>{girl.name} has already reached max level!</div>
            ) : (
              <div className="awakening-popup-content">
                <div className="pose">
                  <img src={poseImage} alt={girl.name} />
                </div>
                <div className="awakening-details">
                  <h2>Awakening</h2>
                  <span>
                    We can feel something growing - could it be{' '}
                    <span className="highlight-value girl-name">
                      {girl.name}
                    </span>
                    's power?
                  </span>
                  <div className="awakening-description">
                    Max level increase: {girl.maxLevel!}{' '}
                    <div className="chevron-right" /> {girl.maxLevel! + 50}
                  </div>
                  <button
                    className="hh-game-action do-awaken"
                    onClick={() => {
                      doAwaken();
                      closePopup();
                    }}
                    disabled={!canAwaken}
                  >
                    <span>Awaken</span>
                    <span className="gems-cost">
                      {format(gemsStats.gemsToNextCap)}/{format(currentGems)}
                      <GemIcon element={girl.element} />
                    </span>
                  </button>
                  {currentGirls < minGirlsToAwaken ? (
                    <div>
                      You need{' '}
                      <span className="highlight-value">
                        {minGirlsToAwaken - currentGirls}
                      </span>{' '}
                      more girls on level{' '}
                      <span className="highlight-value">{girl.maxLevel}</span>{' '}
                      in order to Awaken.
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )) as any
      }
    </Popup>
  );
};
