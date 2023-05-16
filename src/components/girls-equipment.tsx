import { Class, Equipment, EquipmentData, Rarity } from '../data/data';
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
  girlId: string;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  girlId
}) => {
  const slots = slotsArray(equipment.items);
  return (
    <>
      <div className="qh-girls-equipment">
        {slots.map((item, index) => (
          <EquipmentTile
            equipment={item}
            key={index}
            girlId={girlId}
            slotId={index + 1 /* Slots are indexed 1 to 6 */}
          />
        ))}
        {/* TODO Add actions equip all / unequip all */}
      </div>
    </>
  );
};

interface EquipmentTileProps {
  equipment: Equipment | undefined;
  girlId: string;
  slotId: number;
}

const EquipmentTile: React.FC<EquipmentTileProps> = ({
  equipment,
  girlId,
  slotId
}) => {
  const domain = getDomain();
  const link = `${domain}/girl/${girlId}?resource=equipment&equipment-slot=${slotId}`;
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
            tooltip={<EquipmentTooltip equipment={equipment} />}
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
}

export const EquipmentTooltip: React.FC<EquipmentTooltipProps> = ({
  equipment
}) => {
  const tooltipClasses = ['qh-equipment-tooltip', Rarity[equipment.rarity]];
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
            <span>
              <StatIcon statClass={equipment.resonance.class} />: <EgoIcon /> +
              {equipment.resonance.ego}%
            </span>
          ) : null}
          {equipment.resonance.element !== undefined ? (
            <span>
              <ElementIcon element={equipment.resonance.element} />:{' '}
              <DefenseIcon /> +{equipment.resonance.defense}%
            </span>
          ) : null}
          {equipment.resonance.pose !== undefined ? (
            <span>
              <PoseIcon pose={equipment.resonance.pose} />: <AttackIcon /> +
              {equipment.resonance.attack}%
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
