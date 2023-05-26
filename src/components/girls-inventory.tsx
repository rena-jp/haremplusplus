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
  Equipment,
  EquipmentData,
  EquipmentStats
} from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import { BaseGirlTile } from './girl';
import { SimpleEquipmentTile } from './girls-equipment';
import { importEquipment } from '../data/import/harem-import';
import '../style/girls-inventory.css';
import {
  matchesClassResonance,
  matchesElementResonance,
  matchesPoseResonance,
  slotsArray,
  sortInventory,
  updateInventory
} from '../data/girls-equipment';
import { AttackIcon, DefenseIcon, EgoIcon, StatIcon, Tooltip } from './common';
import { roundValue } from '../data/common';

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

  close?: () => void;
}

export const GirlsInventory: React.FC<GirlsInventoryProps> = ({
  girl,
  girls
}) => {
  const displayGirls = useMemo(() => girls.slice(0, 20), [girls]);

  const gameAPI = useContext(GameAPIContext).gameAPI;

  const [inventory, setInventory] = useState<EquipmentData>({ items: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (displayGirls.length > 0 && gameAPI !== undefined) {
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

  const [selectedItem, setSelectedItem] = useState<Equipment | undefined>(
    undefined
  );

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
        </div>
        <div className="qh-inventory">
          {loading ? <span>Loading inventory...</span> : null}
          {loading === false && inventory.items.length === 0 ? (
            <span>Inventory is empty.</span>
          ) : null}
          {inventory.items.map((item) => {
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
      </div>
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
  const stats = getEquipmentStats(girl, equipment);
  const statsDiff = getStatsDiff(girl, equipment, refEquipment);

  return (
    <>
      <div className="stat total-stats">
        <span className="stat-value">{stats.totalStats}</span>
        <StatDiff value={statsDiff.totalStats} force={true} />
      </div>
      <div className="stat">
        <span className="stat-value">{stats.ego}</span>
        <StatDiff value={statsDiff.ego} force={equipment !== undefined} />
      </div>
      <div className="stat">
        <span className="stat-value">{stats.attack}</span>
        <StatDiff value={statsDiff.attack} force={equipment !== undefined} />
      </div>
      <div className="stat">
        <span className="stat-value">{stats.defense}</span>
        <StatDiff value={statsDiff.defense} force={equipment !== undefined} />
      </div>
      <div className="stat-res">
        <span className="stat-value">{stats.rEgo}%</span>
        <StatDiff value={statsDiff.rEgo} />
      </div>
      <div className="stat-res">
        <span className="stat-value">{stats.rDef}%</span>
        <StatDiff value={statsDiff.rDef} />
      </div>
      <div className="stat-res">
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

function getStatsDiff(
  girl: CommonGirlData,
  equipment: Equipment | undefined,
  refEquipment: Equipment | undefined
): InventoryStats {
  const equipStats = getEquipmentStats(girl, equipment);
  const refEquipStats = getEquipmentStats(girl, refEquipment);
  return {
    hardcore: equipStats.hardcore - refEquipStats.hardcore,
    charm: equipStats.charm - refEquipStats.charm,
    knowhow: equipStats.knowhow - refEquipStats.knowhow,
    ego: equipStats.ego - refEquipStats.ego,
    defense: equipStats.defense - refEquipStats.defense,
    attack: equipStats.attack - refEquipStats.attack,
    rEgo: equipStats.rEgo - refEquipStats.rEgo,
    rDef: equipStats.rDef - refEquipStats.rDef,
    rAtk: equipStats.rAtk - refEquipStats.rAtk,
    totalStats: equipStats.totalStats - refEquipStats.totalStats
  };
}

function getEquipmentStats(
  girl: CommonGirlData | undefined,
  equipment: Equipment | undefined
): InventoryStats {
  if (equipment === undefined) {
    return {
      attack: 0,
      charm: 0,
      defense: 0,
      ego: 0,
      hardcore: 0,
      knowhow: 0,
      rAtk: 0,
      rDef: 0,
      rEgo: 0,
      totalStats: 0
    };
  }

  const matchesAtk =
    girl === undefined ? true : matchesPoseResonance(equipment, girl);
  const matchesDef =
    girl === undefined ? true : matchesElementResonance(equipment, girl);
  const matchesEgo =
    girl === undefined ? true : matchesClassResonance(equipment, girl);

  return {
    hardcore: equipment.stats.hardcore,
    charm: equipment.stats.charm,
    knowhow: equipment.stats.knowhow,
    ego: equipment.stats.ego,
    attack: equipment.stats.attack,
    defense: equipment.stats.defense,
    rEgo: matchesEgo ? equipment.resonance.ego : 0,
    rDef: matchesDef ? equipment.resonance.defense : 0,
    rAtk: matchesAtk ? equipment.resonance.attack : 0,
    totalStats:
      equipment.stats.hardcore + equipment.stats.charm + equipment.stats.knowhow
  };
}

interface InventoryStats extends EquipmentStats {
  rEgo: number;
  rDef: number;
  rAtk: number;

  totalStats: number;
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
