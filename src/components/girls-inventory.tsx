import {
  EventHandler,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  CommonGirlData,
  EMPTY_INVENTORY_STATS,
  Equipment,
  EquipmentData,
  InventoryStats
} from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import { BaseGirlTile } from './girl';
import { SimpleEquipmentTile } from './girls-equipment';
import { importEquipment } from '../data/import/harem-import';
import '../style/girls-inventory.css';
import {
  diffInventoryStats,
  getEquipmentStats,
  getTotalInventoryStats,
  slotsArray,
  sortInventory,
  sumInventoryStats,
  updateInventory
} from '../data/girls-equipment';
import { AttackIcon, DefenseIcon, EgoIcon, StatIcon, Tooltip } from './common';
import { roundValue } from '../data/common';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Popup from 'reactjs-popup';

export interface GirlsInventoryProps {
  /**
   * A random girl, used to get the inventory from the server
   * (The server can only return inventory for a specific girl)
   */
  girl: CommonGirlData;
  /**
   * The list of girls to show in the equipment screen.
   */
  girls: CommonGirlData[];
  /**
   * The complete list of all girls.
   */
  allGirls: CommonGirlData[];

  close?: () => void;
}

export const GirlsInventory: React.FC<GirlsInventoryProps> = ({
  girl,
  girls,
  allGirls
}) => {
  const displayGirls = useMemo(() => girls.slice(0, 20), [girls]);

  const gameAPI = useContext(GameAPIContext).gameAPI;

  const [inventory, setInventory] = useState<EquipmentData>({ items: [] });
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<Equipment | undefined>(
    undefined
  );

  useEffect(() => {
    if (girls.length > 0 && gameAPI !== undefined) {
      setLoading(true);
      gameAPI
        .getGirlsInventory(girl)
        .then((equip) => importEquipment(equip))
        .then((inventory) => {
          sortInventory(inventory.items);
          return inventory;
        })
        .then(setInventory)
        .then(() => setLoading(false));
    }
  }, [gameAPI]);

  const equipSelected = useCallback(
    async (girl: CommonGirlData) => {
      if (selectedItem === undefined || gameAPI === undefined) {
        // Do nothing
        return;
      }
      setSelectedItem(undefined);
      const inventoryUpdate = await gameAPI.equipOne(girl, selectedItem);
      const slotToUpdate = selectedItem.slot;

      const newInventory = updateInventory(
        inventory,
        inventoryUpdate,
        slotToUpdate
      );
      setInventory(newInventory);
    },
    [selectedItem, setSelectedItem, gameAPI, inventory]
  );

  const unequipOne = useCallback(
    async (girl: CommonGirlData, equipment: Equipment) => {
      if (gameAPI !== undefined) {
        const inventoryUpdate = await gameAPI.unequipOne(girl, equipment);
        const slotToUpdate = equipment.slot;

        const newInventory = updateInventory(
          inventory,
          inventoryUpdate,
          slotToUpdate
        );
        setInventory(newInventory);
      }
    },
    [gameAPI, inventory, setInventory]
  );

  const unequipAll = useCallback(async () => {
    if (gameAPI !== undefined) {
      setInventory({ items: [] });
      setLoading(true);
      await gameAPI.unequipAllGirls(allGirls);
      const inventoryContent = await gameAPI.getGirlsInventory(girl);
      const newInventory = importEquipment(inventoryContent);
      setInventory(newInventory);
      setLoading(false);
    }
  }, [gameAPI, inventory, setInventory, girl, allGirls, setLoading]);

  const showFilterLengthWarning = girls.length > displayGirls.length;

  return (
    <div className="girls-inventory">
      {showFilterLengthWarning ? (
        <p style={{ paddingInline: '10px' }}>
          Too many girls selected. The selection has been truncated to avoid
          issues. Use harem filters to limit the number of girls to equip (Max.:{' '}
          {displayGirls.length} girls)
        </p>
      ) : null}
      <div className="girls-inventory-content">
        <div className="girls-list">
          <GirlInventoryHeader />
          <EquipmentStatsEntry equipment={selectedItem} />
          {displayGirls.map((girl) => (
            <GirlInventoryEntry
              girl={girl}
              key={girl.id}
              selectedEquipment={selectedItem}
              equipSelected={equipSelected}
              unequipOne={unequipOne}
            />
          ))}
          <InventoryTotalStatsEntry girls={girls} />
        </div>
        <InventoryItems
          loading={loading}
          inventory={inventory}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          unequipAll={unequipAll}
        />
      </div>
      <ReactTooltip
        id="equipment-tooltip"
        className="qh-tooltip"
        classNameArrow="qh-tooltip-arrow"
      />
    </div>
  );
};

interface GirlsInventoryEntryProps {
  girl: CommonGirlData;
  selectedEquipment: Equipment | undefined;
  equipSelected(girl: CommonGirlData): Promise<void>;
  unequipOne(girl: CommonGirlData, equipment: Equipment): void;
}

const GirlInventoryEntry: React.FC<GirlsInventoryEntryProps> = ({
  girl,
  selectedEquipment,
  equipSelected,
  unequipOne
}) => {
  const girlOnClick = useCallback(() => {
    /* Nothing */
  }, []);

  const highlightSlot = selectedEquipment?.slot;

  const equippedItems = girl.equipment ?? { items: [] };
  const items = slotsArray(equippedItems.items);

  return (
    <>
      <BaseGirlTile girl={girl} onClick={girlOnClick} />
      {items.map((item, index) => {
        const selectedSlot = index + 1 === highlightSlot;
        const classNames = ['item-slot'];
        if (selectedSlot) {
          classNames.push('selected');
        }
        return (
          <EquipmentTile
            classNames={classNames}
            equipment={item}
            girl={girl}
            slotId={index + 1}
            key={index}
            onClick={() => equipSelected(girl)}
            unequipOne={
              selectedEquipment === undefined ? unequipOne : undefined
            }
          />
        );
      })}
      {selectedEquipment === undefined ? <InventoryPlaceholder /> : null}
      <EquipmentStatsDetails
        girl={girl}
        equipment={selectedEquipment}
        refEquipment={
          selectedEquipment === undefined
            ? undefined
            : equippedItems.items.find(
                (item) => item.slot === selectedEquipment.slot
              )
        }
      />
    </>
  );
};

interface EquipmentStatsDetailsProps {
  girl: CommonGirlData;
  equipment: Equipment | undefined;
  refEquipment: Equipment | undefined;
}

const EquipmentStatsDetails: React.FC<EquipmentStatsDetailsProps> = ({
  girl,
  equipment,
  refEquipment
}) => {
  return equipment === undefined ? (
    <EquipmentStatsTotal girl={girl} />
  ) : (
    <EquipmentStatsDiff
      girl={girl}
      equipment={equipment}
      refEquipment={refEquipment}
    />
  );
};

interface EquipmentStatsTotalProps {
  girl: CommonGirlData;
}

const EquipmentStatsTotal: React.FC<EquipmentStatsTotalProps> = ({ girl }) => {
  const stats = getTotalInventoryStats(girl, girl.equipment?.items ?? []);
  return (
    <>
      <div className="stat total-stats">
        <span className="stat-value">{stats.totalStats}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.ego}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.attack}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.defense}</span>
      </div>
      <div className="stat-res">
        <span className="stat-value">
          {stats.rEgo > 0 ? stats.rEgo + '%' : ''}
        </span>
      </div>
      <div className="stat-res">
        <span className="stat-value">
          {stats.rDef > 0 ? stats.rDef + '%' : ''}
        </span>
      </div>
      <div className="stat-res">
        <span className="stat-value">
          {stats.rAtk > 0 ? stats.rAtk + '%' : ''}
        </span>
      </div>
    </>
  );
};

const EquipmentStatsDiff: React.FC<EquipmentStatsDetailsProps> = ({
  girl,
  equipment,
  refEquipment
}) => {
  const stats = getEquipmentStats(girl, equipment);
  const statsDiff = getStatsDiff(girl, equipment, refEquipment);

  return (
    <>
      <div className="stat total-stats stat-diff">
        <span className="stat-value">{stats.totalStats}</span>
        <StatDiff value={statsDiff.totalStats} force={true} />
      </div>
      <div className="stat stat-diff">
        <span className="stat-value">{stats.ego}</span>
        <StatDiff value={statsDiff.ego} force={equipment !== undefined} />
      </div>
      <div className="stat stat-diff">
        <span className="stat-value">{stats.attack}</span>
        <StatDiff value={statsDiff.attack} force={equipment !== undefined} />
      </div>
      <div className="stat stat-diff">
        <span className="stat-value">{stats.defense}</span>
        <StatDiff value={statsDiff.defense} force={equipment !== undefined} />
      </div>
      <div className="stat-res stat-diff">
        <span className="stat-value">{stats.rEgo}%</span>
        <StatDiff value={statsDiff.rEgo} />
      </div>
      <div className="stat-res stat-diff">
        <span className="stat-value">{stats.rDef}%</span>
        <StatDiff value={statsDiff.rDef} />
      </div>
      <div className="stat-res stat-diff">
        <span className="stat-value"> {stats.rAtk}%</span>
        <StatDiff value={statsDiff.rAtk} />
      </div>
    </>
  );
};

const GirlInventoryHeader: React.FC = () => {
  return (
    <>
      <div className="header"></div>
      <InventoryPlaceholder showAsItem={false} />
      <div className="header item-slot"></div>
      <div className="header item-slot"></div>
      <div className="header item-slot"></div>
      <div className="header item-slot"></div>
      <div className="header item-slot"></div>
      <div className="header item-slot"></div>
      <div className="header stat total-stats">
        <StatIcon statClass="rainbow" />
      </div>
      <div className="header stat">
        <EgoIcon />
      </div>
      <div className="header stat">
        <AttackIcon />
      </div>
      <div className="header stat">
        <DefenseIcon />
      </div>
      <div className="header stat-res">
        <EgoIcon />%
      </div>
      <div className="header stat-res">
        <DefenseIcon />%
      </div>
      <div className="header stat-res">
        <AttackIcon />%
      </div>
    </>
  );
};

interface EquipmentStatsEntryProps {
  equipment: Equipment | undefined;
}

const EquipmentStatsEntry: React.FC<EquipmentStatsEntryProps> = ({
  equipment
}) => {
  const stats = getEquipmentStats(undefined, equipment);
  const itemSlot = equipment?.slot;
  const slots = slotsArray([]);

  return (
    <>
      <div className="equipment" />
      {slots.map((_slot, slotIndex) => {
        const selected = slotIndex + 1 === itemSlot;
        const classNames = ['item-slot', 'equipment'];
        if (selected) {
          classNames.push('selected');
        }
        return selected ? (
          <SimpleEquipmentTile
            equipment={equipment}
            slotId={slotIndex + 1}
            key={slotIndex}
            classNames={classNames}
          />
        ) : (
          <div className={classNames.join(' ')} key={slotIndex} />
        );
      })}
      {equipment === undefined ? <InventoryPlaceholder /> : null}
      <div className="equipment stat total-stats">
        <span className="stat-value">{stats.totalStats}</span>
      </div>
      <div className="equipment stat">
        <span className="stat-value">{stats.ego}</span>
      </div>
      <div className="equipment stat">
        <span className="stat-value">{stats.attack}</span>
      </div>
      <div className="equipment stat">
        <span className="stat-value">{stats.defense}</span>
      </div>
      <div className="equipment stat-res">
        <span className="stat-value">
          {stats.rEgo > 0 ? `${stats.rEgo}%` : ''}
        </span>
      </div>
      <div className="equipment stat-res">
        <span className="stat-value">
          {stats.rDef > 0 ? `${stats.rDef}%` : ''}
        </span>
      </div>
      <div className="equipment stat-res">
        <span className="stat-value">
          {stats.rAtk > 0 ? `${stats.rAtk}%` : ''}
        </span>
      </div>
    </>
  );
};

interface InventoryTotalStatsEntryProps {
  girls: CommonGirlData[];
}

const InventoryTotalStatsEntry: React.FC<InventoryTotalStatsEntryProps> = ({
  girls
}) => {
  let allTotalStats = EMPTY_INVENTORY_STATS;
  for (const girl of girls) {
    const girlStats = getTotalInventoryStats(girl, girl.equipment?.items ?? []);
    allTotalStats = sumInventoryStats(allTotalStats, girlStats);
  }
  return (
    <>
      <div className="inventory-footer total">Total:</div>

      <div className="stat total-stats">
        <span className="stat-value">{allTotalStats.totalStats}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{allTotalStats.ego}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{allTotalStats.attack}</span>
      </div>
      <div className="stat">
        <span className="stat-value">{allTotalStats.defense}</span>
      </div>
      <div className="stat-res">
        <span className="stat-value">
          {allTotalStats.rEgo > 0 ? `${allTotalStats.rEgo}%` : ''}
        </span>
      </div>
      <div className="stat-res">
        <span className="stat-value">
          {allTotalStats.rDef > 0 ? `${allTotalStats.rDef}%` : ''}
        </span>
      </div>
      <div className="stat-res">
        <span className="stat-value">
          {allTotalStats.rAtk > 0 ? `${allTotalStats.rAtk}%` : ''}
        </span>
      </div>
    </>
  );
};

function getStatsDiff(
  girl: CommonGirlData,
  equipment: Equipment | undefined,
  refEquipment: Equipment | undefined
): InventoryStats {
  const equipStats = getEquipmentStats(girl, equipment);
  const refEquipStats = getEquipmentStats(girl, refEquipment);
  return diffInventoryStats(equipStats, refEquipStats);
}

interface StatDiffProps {
  value: number;
  /**
   * By default, 0-value will be hidden (empty cell). If force
   * is true, 0 values will be displayed.
   */
  force?: boolean;
}
const StatDiff: React.FC<StatDiffProps> = ({ value, force }) => {
  return (
    <span
      className={`stat-bonus ${value > 0 ? 'pos' : value < 0 ? 'neg' : ''}`}
    >
      {value === 0 && !force ? '' : roundValue(value)}
    </span>
  );
};

interface EquipmentTileProps {
  equipment: Equipment | undefined;
  girl: CommonGirlData;
  slotId: number;
  classNames?: string[];
  onClick?: EventHandler<MouseEvent<unknown>>;
  unequipOne?: (girl: CommonGirlData, equipment: Equipment) => void;
}

const EquipmentTile: React.FC<EquipmentTileProps> = ({
  equipment,
  girl,
  slotId,
  classNames,
  onClick,
  unequipOne
}) => {
  return (
    <SimpleEquipmentTile
      equipment={equipment}
      girl={girl}
      slotId={slotId}
      onClick={onClick}
      classNames={classNames}
    >
      <Tooltip tooltip="Unequip" cssClasses="unequip-one-decorator">
        {unequipOne === undefined ? null : (
          <button
            className="item-action unequip-one"
            onClick={(ev) => {
              if (equipment !== undefined) unequipOne(girl, equipment);
              ev.preventDefault();
            }}
          ></button>
        )}
      </Tooltip>
    </SimpleEquipmentTile>
  );
};

interface InventoryPlaceholderProps {
  showAsItem?: boolean;
}
const InventoryPlaceholder: React.FC<InventoryPlaceholderProps> = ({
  showAsItem
}) => {
  return (
    <div className="inv-placeholder item-slot">
      {showAsItem !== false ? (
        <SimpleEquipmentTile slotId={0} equipment={undefined} />
      ) : null}
    </div>
  );
};

interface InventoryItemsProps {
  inventory: EquipmentData;
  loading: boolean;
  selectedItem: Equipment | undefined;
  setSelectedItem(item: Equipment | undefined): void;
  unequipAll(): void;
}

const InventoryItems: React.FC<InventoryItemsProps> = ({
  inventory,
  loading,
  selectedItem,
  setSelectedItem,
  unequipAll
}) => {
  return (
    <div className="qh-inventory">
      <div className="qh-inventory-items">
        {loading ? <span>Loading inventory...</span> : null}
        {loading === false && inventory.items.length === 0 ? (
          <span>Inventory is empty.</span>
        ) : null}
        {inventory.items.slice(0, 50).map((item) => {
          const classNames =
            item === selectedItem ? ['item-slot', 'selected'] : ['item-slot'];
          return (
            <SimpleEquipmentTile
              equipment={item}
              classNames={classNames}
              slotId={item.slot}
              key={item.uid}
              onClick={(ev) => {
                ev.preventDefault();
                setSelectedItem(item === selectedItem ? undefined : item);
              }}
            />
          );
        })}
      </div>
      <div className="qh-inventory-actions">
        <Popup
          modal
          nested
          trigger={
            <button className="hh-action-button">Unequip All girls</button>
          }
        >
          {
            ((close: () => void) => (
              <div className="unequip-all-confirm-popup">
                <h2>Unequip All Girls</h2>
                <p>
                  This action unequips all items from all owned girls (including
                  the ones not currently displayed in the Inventory) . Do you
                  want to continue?
                </p>
                <div className="qh-actions">
                  <button
                    className="hh-action-button hh-game-action"
                    onClick={() => {
                      unequipAll();
                      close();
                    }}
                  >
                    Unequip All Girls
                  </button>
                  <button className="hh-action-button" onClick={close}>
                    Cancel
                  </button>
                </div>
              </div>
              // eslint-disable-next-line
            )) as any
          }
        </Popup>
      </div>
    </div>
  );
};
