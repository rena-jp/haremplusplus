import {
  EventHandler,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState
} from 'react';
import {
  Class,
  CommonGirlData,
  Equipment,
  EquipmentData,
  Rarity
} from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import {
  getSlotLabel,
  matchesClassResonance,
  matchesElementResonance,
  matchesPoseResonance,
  slotsArray
} from '../data/girls-equipment';
import '../style/girls-equipment.css';
import { SharedTooltip, Tooltip } from './common';
import {
  AttackIcon,
  DefenseIcon,
  EgoIcon,
  ElementIcon,
  PoseIcon
} from './common';
import { StatIcon, getDomain } from './common';
import { PulseLoader } from 'react-spinners';
import { QuickEquipment } from './quick-girl-equipment';
import Popup from 'reactjs-popup';
import { roundValue } from '../data/common';
import { GirlsInventory } from './girls-inventory';

export interface EquipmentListProps {
  equipment: EquipmentData;
  girl: CommonGirlData;
  listGirls: CommonGirlData[];
  allGirls: CommonGirlData[];
  showActions?: boolean;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  girl,
  listGirls,
  allGirls,
  showActions
}) => {
  const [loading, setLoading] = useState(false);
  const loadingTimeout = useRef<string | number | NodeJS.Timeout | undefined>();

  const delayedSetLoading = useCallback(
    (loading: boolean) => {
      if (loadingTimeout.current !== undefined) {
        clearTimeout(loadingTimeout.current);
      }
      if (loading) {
        const timeout = setTimeout(() => {
          setLoading(true);
        }, 200);
        loadingTimeout.current = timeout;
      } else {
        setLoading(false);
      }
    },
    [loadingTimeout, setLoading]
  );

  const slots = slotsArray(equipment.items);
  return (
    <>
      <div className="qh-girls-equipment">
        {slots.map((item, index) => (
          <EquipmentTile
            equipment={item}
            key={index}
            girl={girl}
            slotId={index + 1 /* Slots are indexed 1 to 6 */}
            loading={loading}
            setLoading={delayedSetLoading}
          />
        ))}
        {showActions === undefined || showActions ? (
          <>
            <EquipAllAction
              girl={girl}
              loading={loading}
              setLoading={delayedSetLoading}
            />
            <UnequipAllAction
              girl={girl}
              loading={loading}
              setLoading={delayedSetLoading}
            />
            <OpenInventoryAction
              girl={girl}
              listGirls={listGirls}
              allGirls={allGirls}
              loading={loading}
              setLoading={delayedSetLoading}
            />
          </>
        ) : null}
      </div>
    </>
  );
};

interface EquipmentTileProps {
  equipment: Equipment | undefined;
  girl: CommonGirlData;
  slotId: number;
  loading: boolean;
  setLoading(loading: boolean): void;
  classNames?: string[];
  onClick?: EventHandler<MouseEvent<unknown>>;
}

const EquipmentTile: React.FC<EquipmentTileProps> = ({
  equipment,
  girl,
  slotId,
  loading,
  classNames,
  setLoading,
  onClick
}) => {
  const { gameAPI } = useContext(GameAPIContext);
  const domain = getDomain();
  const link = `${domain}/girl/${girl.id}?resource=equipment&equipment-slot=${slotId}`;
  const img = equipment?.icon;

  const tileClassNames = ['item-tile', 'girl-item-tile'];
  if (classNames) {
    tileClassNames.push(...classNames);
  }
  const imgClassNames = ['girls-equipment-icon', 'rarity-bg'];
  if (equipment !== undefined) {
    imgClassNames.push(Rarity[equipment.rarity]);
  } else {
    imgClassNames.push('none');
  }

  const [showQEPopup, setShowQEPopup] = useState(false);
  const openQuickEquipmentPopup = useCallback(() => {
    setShowQEPopup(true);
  }, [gameAPI, girl, slotId]);

  const icon = (
    <img
      src={img}
      className={imgClassNames.join(' ')}
      onClick={
        onClick === undefined
          ? (ev) => {
              ev.preventDefault();
              openQuickEquipmentPopup();
            }
          : onClick
      }
    />
  );

  const unequip = useCallback(() => {
    if (equipment !== undefined && gameAPI !== undefined && !loading) {
      setLoading(true);
      gameAPI.unequipOne(girl, equipment).finally(() => setLoading(false));
    }
  }, [girl, equipment, gameAPI, loading, setLoading]);

  const slotLabel = getSlotLabel(slotId);

  return (
    <div className={tileClassNames.join(' ')} onClick={onClick}>
      {equipment === undefined ? (
        <Tooltip tooltip={slotLabel}>
          <a href={link} rel="noreferrer">
            {icon}
          </a>
        </Tooltip>
      ) : (
        <>
          <Tooltip
            place="left"
            tooltip={
              <EquipmentTooltip
                equipment={equipment}
                currentEquipment={equipment}
                girl={girl}
              />
            }
          >
            <div className="girl-item-icon-wrapper">
              <a href={link} rel="noreferrer">
                {icon}
              </a>
              <Tooltip tooltip="Unequip" cssClasses="unequip-one-decorator">
                <button
                  className="item-action unequip-one"
                  onClick={unequip}
                  disabled={loading}
                ></button>
              </Tooltip>
              <div className="item-level-decorator">{equipment.level}</div>
            </div>
          </Tooltip>
        </>
      )}
      {showQEPopup ? (
        <Popup modal open={showQEPopup} onClose={() => setShowQEPopup(false)}>
          {
            ((close: () => void) => (
              <QuickEquipment girl={girl} slot={slotId} close={close} />
              // eslint-disable-next-line
            )) as any
          }
        </Popup>
      ) : null}
    </div>
  );
};

export interface EquipmentDecoratorsProps {
  equipment: EquipmentData;
}

export const EquipmentDecorators: React.FC<EquipmentDecoratorsProps> = ({
  equipment
}) => {
  const slots = slotsArray(equipment.items);
  return (
    <div className="equipment-decorators">
      {slots.map((item, index) => (
        <EquipmentDecorator equipment={item} key={index} />
      ))}
    </div>
  );
};

export interface EquipmentDecoratorProps {
  equipment: Equipment | undefined;
}

export const EquipmentDecorator: React.FC<EquipmentDecoratorProps> = ({
  equipment
}) => {
  const rarityClass =
    equipment === undefined ? 'none' : Rarity[equipment.rarity];
  const level = equipment?.level ?? 0;
  const levelClass = `level${level}`;
  const levelSize = level * 10;
  const classes = ['equipment-decorator', rarityClass, levelClass];
  return (
    <div className={classes.join(' ')}>
      <div
        className={`track ${levelClass}`}
        style={{ height: `${levelSize}%` }}
      ></div>
    </div>
  );
};

export interface EquipmentTooltipProps {
  equipment: Equipment;
  currentEquipment: Equipment | undefined;
  girl: CommonGirlData | undefined;
}

export const EquipmentTooltip: React.FC<EquipmentTooltipProps> = ({
  equipment,
  currentEquipment,
  girl
}) => {
  const tooltipClasses = ['qh-equipment-tooltip', Rarity[equipment.rarity]];

  const hcDiff = getStatsDiff(
    equipment.stats.hardcore,
    currentEquipment?.stats?.hardcore
  );
  const chDiff = getStatsDiff(
    equipment.stats.charm,
    currentEquipment?.stats?.charm
  );
  const khDiff = getStatsDiff(
    equipment.stats.knowhow,
    currentEquipment?.stats?.knowhow
  );
  const egoDiff = getStatsDiff(
    equipment.stats.ego,
    currentEquipment?.stats?.ego
  );
  const attackDiff = getStatsDiff(
    equipment.stats.attack,
    currentEquipment?.stats?.attack
  );
  const defDiff = getStatsDiff(
    equipment.stats.defense,
    currentEquipment?.stats?.defense
  );

  return (
    <div className={tooltipClasses.join(' ')}>
      <h2>
        {equipment.name} Lv. {equipment.level}
      </h2>
      <div className="qh-equipment-stats">
        <span>
          <StatIcon statClass={Class.Hardcore} /> {equipment.stats.hardcore}
          <StatsDiff diff={hcDiff} />
        </span>
        <span>
          <StatIcon statClass={Class.Charm} /> {equipment.stats.charm}
          <StatsDiff diff={chDiff} />
        </span>
        <span>
          <StatIcon statClass={Class.Knowhow} /> {equipment.stats.knowhow}
          <StatsDiff diff={khDiff} />
        </span>
        <span>
          <EgoIcon /> {equipment.stats.ego}
          <StatsDiff diff={egoDiff} />
        </span>
        <span>
          <AttackIcon /> {equipment.stats.attack}
          <StatsDiff diff={attackDiff} />
        </span>
        <span>
          <DefenseIcon /> {equipment.stats.defense}
          <StatsDiff diff={defDiff} />
        </span>
      </div>
      <ResonanceSection
        equipment={equipment}
        currentEquipment={currentEquipment}
        girl={girl}
      />
    </div>
  );
};

interface StatsDiffProps {
  diff: number | undefined;
}

const StatsDiff: React.FC<StatsDiffProps> = ({ diff }) => {
  if (diff === undefined || diff === 0) {
    return null;
  }

  const className = diff > 0 ? 'positive' : 'negative';
  const sign = diff > 0 ? '+' : '';
  return (
    <span className={`stats-diff ${className}`}>
      ({`${sign}${roundValue(diff)}`})
    </span>
  );
};

interface ResonanceSectionProps {
  equipment: Equipment;
  currentEquipment?: Equipment;
  girl?: CommonGirlData;
}

const ResonanceSection: React.FC<ResonanceSectionProps> = ({
  equipment,
  currentEquipment,
  girl
}) => {
  const matchesClass = matchesClassResonance(equipment, girl);
  const matchesElement = matchesElementResonance(equipment, girl);
  const matchesPose = matchesPoseResonance(equipment, girl);

  const egoValue = equipment.resonance.ego;
  const activeEgoValue = matchesClass ? egoValue : 0;
  const refEgo = matchesClassResonance(currentEquipment, girl)
    ? currentEquipment!.resonance.ego
    : 0;
  const currentClass = matchesClassResonance(currentEquipment, girl)
    ? currentEquipment?.resonance.class
    : undefined;

  const defValue = equipment.resonance.defense;
  const activeDefValue = matchesElement ? defValue : 0;
  const refDef = matchesElementResonance(currentEquipment, girl)
    ? currentEquipment!.resonance.defense
    : 0;
  const currentElement = matchesElementResonance(currentEquipment, girl)
    ? currentEquipment?.resonance.element
    : undefined;

  const attValue = equipment.resonance.attack;
  const activeAttValue = matchesPose ? attValue : 0;
  const refAtt = matchesPoseResonance(currentEquipment, girl)
    ? currentEquipment!.resonance.attack
    : 0;
  const currentPose = matchesPoseResonance(currentEquipment, girl)
    ? currentEquipment?.resonance.pose
    : undefined;

  const displayClass = equipment.resonance.class ?? currentClass;
  const displayElement = equipment.resonance.element ?? currentElement;
  const displayPose = equipment.resonance.pose ?? currentPose;

  const activeClass = displayClass === equipment.resonance.class;
  const activeElement = displayElement === equipment.resonance.element;
  const activePose = displayPose === equipment.resonance.pose;

  return displayClass !== undefined ||
    displayElement !== undefined ||
    displayPose !== undefined ? (
    <>
      <h3>Resonance Bonus</h3>
      <div className="qh-equipment-resonance">
        {displayClass !== undefined ? (
          <span
            className={
              girl
                ? activeClass
                  ? matchesClass
                    ? 'active-resonance'
                    : 'inactive-resonance'
                  : 'disabled-resonance'
                : ''
            }
          >
            <StatIcon statClass={displayClass} />: <EgoIcon /> +
            {equipment.resonance.ego}%
            <StatsDiff diff={activeEgoValue - refEgo} />
          </span>
        ) : null}
        {displayElement !== undefined ? (
          <span
            className={
              girl
                ? activeElement
                  ? matchesElement
                    ? 'active-resonance'
                    : 'inactive-resonance'
                  : 'disabled-resonance'
                : ''
            }
          >
            <ElementIcon element={displayElement} />: <DefenseIcon />+
            {equipment.resonance.defense}%
            <StatsDiff diff={activeDefValue - refDef} />
          </span>
        ) : null}
        {displayPose !== undefined ? (
          <span
            className={
              girl
                ? activePose
                  ? matchesPose
                    ? 'active-resonance'
                    : 'inactive-resonance'
                  : 'disabled-resonance'
                : ''
            }
          >
            <PoseIcon pose={displayPose} />: <AttackIcon /> +
            {equipment.resonance.attack}%
            <StatsDiff diff={activeAttValue - refAtt} />
          </span>
        ) : null}
      </div>
    </>
  ) : null;
};

interface EquipAllActionProps {
  girl: CommonGirlData;
  loading: boolean;
  setLoading(loading: boolean): void;
}

const EquipAllAction: React.FC<EquipAllActionProps> = ({
  girl,
  loading,
  setLoading
}) => {
  const { gameAPI } = useContext(GameAPIContext);
  const onClick = useCallback(() => {
    if (!loading) {
      setLoading(true);
      gameAPI?.equipAll(girl).finally(() => setLoading(false));
    }
  }, [gameAPI, girl, loading, setLoading]);

  return (
    <div className="item-tile">
      <Tooltip tooltip="Equip All">
        <button
          className="item-action equip-all"
          onClick={onClick}
          disabled={loading}
        >
          {loading ? <PulseLoader color="#b77905" /> : null}
        </button>
      </Tooltip>
    </div>
  );
};

const UnequipAllAction: React.FC<EquipAllActionProps> = ({
  girl,
  loading,
  setLoading
}) => {
  const { gameAPI } = useContext(GameAPIContext);
  const onClick = useCallback(() => {
    if (!loading) {
      setLoading(true);
      gameAPI?.unequipAll(girl).finally(() => setLoading(false));
    }
  }, [gameAPI, girl, loading, setLoading]);

  return (
    <div className="item-tile">
      <Tooltip tooltip="Unequip All">
        <button
          className="item-action unequip-all"
          onClick={onClick}
          disabled={loading}
        >
          {loading ? <PulseLoader color="#b77905" /> : null}
        </button>
      </Tooltip>
    </div>
  );
};

interface OpenInventoryActionProps extends EquipAllActionProps {
  listGirls: CommonGirlData[];
  allGirls: CommonGirlData[];
}

const OpenInventoryAction: React.FC<OpenInventoryActionProps> = ({
  girl,
  listGirls,
  allGirls,
  loading
}) => {
  const [showInventoryPopup, setShowInventoryPopup] = useState(false);

  return (
    <div className="item-tile">
      <Tooltip tooltip="Open Inventory">
        <button
          className="item-action open-inventory"
          onClick={() => setShowInventoryPopup(true)}
          disabled={loading}
        >
          {loading ? <PulseLoader color="#b77905" /> : null}
        </button>
      </Tooltip>
      {showInventoryPopup ? (
        <Popup
          modal
          nested
          open={showInventoryPopup}
          onClose={() => setShowInventoryPopup(false)}
        >
          {
            <GirlsInventory
              girl={girl}
              girls={listGirls}
              allGirls={allGirls}
              close={() => setShowInventoryPopup(false)}
            />
          }
        </Popup>
      ) : null}
    </div>
  );
};

function getStatsDiff(
  newValue: number,
  refValue: number | undefined
): number | undefined {
  if (refValue === undefined) {
    return newValue;
  }
  return newValue - refValue;
}

export interface SimpleEquipmentTileProps {
  equipment: Equipment | undefined;
  slotId: number;
  classNames?: string[];
  children?: ReactNode;
  girl?: CommonGirlData;
  onClick?: EventHandler<MouseEvent<unknown>>;
}

export const SimpleEquipmentTile: React.FC<SimpleEquipmentTileProps> = ({
  equipment,
  classNames,
  slotId,
  children,
  girl,
  onClick
}) => {
  const img = equipment?.icon;

  const tileClassNames = ['item-tile', 'girl-item-tile'];
  if (classNames) {
    tileClassNames.push(...classNames);
  }
  const imgClassNames = ['girls-equipment-icon', 'rarity-bg'];
  if (equipment !== undefined) {
    imgClassNames.push(Rarity[equipment.rarity]);
  } else {
    imgClassNames.push('none');
  }

  const icon = <img src={img} className={imgClassNames.join(' ')} />;

  const slotLabel = getSlotLabel(slotId);

  return (
    <div className={tileClassNames.join(' ')} onClick={onClick}>
      {equipment === undefined ? (
        <Tooltip tooltip={slotLabel}>{icon}</Tooltip>
      ) : (
        <>
          <SharedTooltip
            place="right"
            tooltip={
              <EquipmentTooltip
                equipment={equipment}
                currentEquipment={equipment}
                girl={girl}
              />
            }
            tooltipId="equipment-tooltip"
          >
            <div className="girl-item-icon-wrapper">
              {icon}
              <div className="item-level-decorator">{equipment.level}</div>
              {children}
            </div>
          </SharedTooltip>
        </>
      )}
    </div>
  );
};
