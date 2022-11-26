import { useCallback, useContext, useMemo, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  Book,
  CommonGirlData,
  Element,
  Gift,
  Item,
  ItemEntry,
  Rarity
} from '../data/data';
import { useAffectionStats } from '../hooks/girl-aff-hooks';
import { getLevel, useXpStats } from '../hooks/girl-xp-hooks';
import { useInventory } from '../hooks/inventory-data-hook';
import '../style/upgrade.css';
import {
  Tooltip,
  format,
  getDomain,
  ProgressBar,
  CloseButton,
  GemIcon
} from './common';
import { SimpleGirlTile } from './girl';
import Popup from 'reactjs-popup';
import { useGemsStats } from '../hooks/girl-gems-hooks';
import { OptionsContext } from '../data/options-context';
import { SceneViewer } from './scenes';

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
    const selectionIndex = items.indexOf(selectedItem);
    const selectionCount = selectedItem.count;
    const newItems = consumeItem(selectedItem);
    if (page === 'books' && selectedItem.item.type === 'book') {
      gameAPI.useBook(currentGirl, selectedItem.item as Book);
    } else if (page === 'gifts' && selectedItem.item.type === 'gift') {
      gameAPI.useGift(currentGirl, selectedItem.item as Gift);
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
              {page === 'books' ? <MaxXP girl={currentGirl} /> : null}
              {page === 'gifts' ? <MaxAffection girl={currentGirl} /> : null}
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
  gameAPI: GameAPI;
}
export interface UpgradeStatusProps extends StatusProps {
  page: 'books' | 'gifts';
  selectedItem: Item | undefined;
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
}

export const UpgradeStatus: React.FC<UpgradeStatusProps> = ({
  girl,
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
  book: Book | undefined;
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
}

export const XPStatus: React.FC<XpStatusProps> = ({
  girl,
  book,
  gameAPI,
  gemsCount,
  consumeGems
}) => {
  const levelReach =
    book === undefined ? girl.level ?? 0 : getLevel(girl, book.xp);
  const nextLevel = girl.level === 750 ? 750 : (girl.level ?? 1) + 1;
  const nextCap = girl.maxLevel!;

  const xpStats = useXpStats(girl);
  const gemsStats = useGemsStats(girl);

  const displayTargetLevel =
    girl.level === nextCap ? nextCap : Math.max(nextLevel, levelReach);

  const currentLevel = girl.level ?? 0;
  const awakenOverlay =
    currentLevel === girl.maxLevel && currentLevel < 750 ? (
      <Awaken
        girl={girl}
        trigger={
          <button className="awaken overlay">
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
      <Popup>
        <div>Test popup content</div>
      </Popup>
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
            extra={book?.xp ?? 0}
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
  const nextGrade = girl.stars + 1;

  const affStats = useAffectionStats(girl);

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
            extra={gift?.aff ?? 0}
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

export interface MaxXPProps {
  girl: CommonGirlData;
}

export const MaxXP: React.FC<MaxXPProps> = ({ girl }) => {
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
        ((closePopup: () => void) => (
          <div className="qh-popup max-content-popup">
            <CloseButton close={closePopup} />
            <p>Max out XP for girl {girl.name}. Coming soon... Maybe?</p>
          </div>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )) as any
      }
    </Popup>
  );
};

export interface MaxAffProps {
  girl: CommonGirlData;
}

export const MaxAffection: React.FC<MaxAffProps> = ({ girl }) => {
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
          <div className="qh-popup max-content-popup">
            <CloseButton close={close} />
            <p>Max out Affection for girl {girl.name}. Coming soon... Maybe?</p>
          </div>
          // eslint-disable-next-line
        )) as any
      }
    </Popup>
  );
};

export interface AwakenProps {
  girl: CommonGirlData;
  trigger?: JSX.Element;
  gameAPI: GameAPI;
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
}

export const Awaken: React.FC<AwakenProps> = ({
  girl,
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
                    <span className="girl-name">{girl.name}</span>'s power?
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
                    disabled={gemsStats.gemsToNextCap > currentGems}
                  >
                    <span>Awaken</span>
                    <span className="gems-cost">
                      {format(gemsStats.gemsToNextCap)}/{format(currentGems)}
                      <GemIcon element={girl.element} />
                    </span>
                  </button>
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
