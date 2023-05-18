import { useCallback, useContext } from 'react';
import {
  Class,
  CommonGirlData,
  Equipment,
  EquipmentData,
  Rarity
} from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import { slotsArray } from '../data/girls-equipment';
import '../style/girls-equipment.css';
import { Tooltip } from './common';
import {
  AttackIcon,
  DefenseIcon,
  EgoIcon,
  ElementIcon,
  PoseIcon
} from './common';
import { StatIcon, getDomain } from './common';

export interface EquipmentListProps {
  equipment: EquipmentData;
  girl: CommonGirlData;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  girl
}) => {
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
          />
        ))}
        <EquipAllAction girl={girl} />
        <UnequipAllAction girl={girl} />
      </div>
    </>
  );
};

interface EquipmentTileProps {
  equipment: Equipment | undefined;
  girl: CommonGirlData;
  slotId: number;
}

const EquipmentTile: React.FC<EquipmentTileProps> = ({
  equipment,
  girl,
  slotId
}) => {
  const domain = getDomain();
  const link = `${domain}/girl/${girl.id}?resource=equipment&equipment-slot=${slotId}`;
  const img = equipment?.icon;

  const tileClassNames = ['item-tile'];
  const imgClassNames = ['girls-equipment-icon', 'rarity-bg'];
  if (equipment !== undefined) {
    imgClassNames.push(Rarity[equipment.rarity]);
  } else {
    imgClassNames.push('none');
  }
  const icon = <img src={img} className={imgClassNames.join(' ')} />;
  return (
    <div className={tileClassNames.join(' ')}>
      <a href={link} rel="noreferrer">
        {equipment === undefined ? (
          icon
        ) : (
          <Tooltip
            place="bottom"
            tooltip={<EquipmentTooltip equipment={equipment} girl={girl} />}
          >
            {icon}
          </Tooltip>
        )}
      </a>
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
  girl?: CommonGirlData;
}

export const EquipmentTooltip: React.FC<EquipmentTooltipProps> = ({
  equipment,
  girl
}) => {
  const tooltipClasses = ['qh-equipment-tooltip', Rarity[equipment.rarity]];

  const matchesClassResonance =
    girl &&
    equipment.resonance.class !== undefined &&
    equipment.resonance.class === girl.class;
  const matchesElementResonance =
    girl &&
    equipment.resonance.element !== undefined &&
    equipment.resonance.element === girl.element;
  const matchesPoseResonance =
    girl &&
    equipment.resonance.pose !== undefined &&
    equipment.resonance.pose === girl.pose;

  return (
    <div className={tooltipClasses.join(' ')}>
      <h2>
        {equipment.name} Lv. {equipment.level}
      </h2>
      <div className="qh-equipment-stats">
        <span>
          <StatIcon statClass={Class.Hardcore} /> {equipment.stats.hardcore}
        </span>
        <span>
          <StatIcon statClass={Class.Charm} /> {equipment.stats.charm}
        </span>
        <span>
          <StatIcon statClass={Class.Knowhow} /> {equipment.stats.knowhow}
        </span>
        <span>
          <EgoIcon /> {equipment.stats.ego}
        </span>
        <span>
          <AttackIcon /> {equipment.stats.attack}
        </span>
        <span>
          <DefenseIcon /> {equipment.stats.defense}
        </span>
      </div>
      {equipment.resonance.class !== undefined ||
      equipment.resonance.element !== undefined ||
      equipment.resonance.pose !== undefined ? (
        <div className="qh-equipment-resonance">
          <h3>Resonance Bonus</h3>
          {equipment.resonance.class !== undefined ? (
            <span
              className={
                girl
                  ? matchesClassResonance
                    ? 'active-resonance'
                    : 'inactive-resonance'
                  : ''
              }
            >
              <StatIcon statClass={equipment.resonance.class} />: <EgoIcon /> +
              {equipment.resonance.ego}%
            </span>
          ) : null}
          {equipment.resonance.element !== undefined ? (
            <span
              className={
                girl
                  ? matchesElementResonance
                    ? 'active-resonance'
                    : 'inactive-resonance'
                  : ''
              }
            >
              <ElementIcon element={equipment.resonance.element} />:{' '}
              <DefenseIcon /> +{equipment.resonance.defense}%
            </span>
          ) : null}
          {equipment.resonance.pose !== undefined ? (
            <span
              className={
                girl
                  ? matchesPoseResonance
                    ? 'active-resonance'
                    : 'inactive-resonance'
                  : ''
              }
            >
              <PoseIcon pose={equipment.resonance.pose} />: <AttackIcon /> +
              {equipment.resonance.attack}%
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

interface EquipAllActionProps {
  girl: CommonGirlData;
}

const EquipAllAction: React.FC<EquipAllActionProps> = ({ girl }) => {
  const { gameAPI } = useContext(GameAPIContext);
  const onClick = useCallback(() => {
    gameAPI?.equipAll(girl);
  }, [gameAPI, girl]);

  return (
    <div className="item-tile">
      <Tooltip tooltip="Equip All">
        <button className="item-action equip-all" onClick={onClick}></button>
      </Tooltip>
    </div>
  );
};

const UnequipAllAction: React.FC<EquipAllActionProps> = ({ girl }) => {
  const { gameAPI } = useContext(GameAPIContext);
  const onClick = useCallback(() => {
    gameAPI?.unequipAll(girl);
  }, [gameAPI, girl]);

  return (
    <div className="item-tile">
      <Tooltip tooltip="Unequip All">
        <button className="item-action unequip-all" onClick={onClick}></button>
      </Tooltip>
    </div>
  );
};
