import {
  BlessingDefinition,
  CommonGirlData,
  getBlessedStats,
  getBlessingMultiplier,
  Rarities,
  Rarity
} from '../data/data';
import { Grade, ElementIcon, StatsList, PoseIcon, format } from './common';
import '../style/girl-tooltip.css';
import '../style/girls.css';
import { getTotalEquipmentStats } from '../data/girls-equipment';

export interface GirlTooltipProps {
  girl: CommonGirlData;
  currentBlessings?: BlessingDefinition[];
  classNames?: string[];
}

export const GirlTooltip: React.FC<GirlTooltipProps> = ({
  girl,
  currentBlessings,
  classNames
}) => {
  const classes = ['girl-tooltip'];
  classes.push(Rarity[girl.rarity]);
  if (classNames) {
    classes.push(...classNames);
  }

  let totalPower: number;
  let equippedPower: number;
  let blessed = false;
  if (girl.stats) {
    const blessedStats = getBlessedStats(
      girl,
      girl.stats,
      currentBlessings ?? []
    );
    totalPower =
      blessedStats.charm + blessedStats.hardcore + blessedStats.knowhow;
    blessed = blessedStats.charm > girl.stats.charm;
    if (girl.equipment) {
      const equipmentStats = getTotalEquipmentStats(girl.equipment);
      const blessingMultiplier =
        currentBlessings === undefined
          ? 1
          : getBlessingMultiplier(girl, currentBlessings);
      const rawEquipPower =
        equipmentStats.hardcore + equipmentStats.charm + equipmentStats.knowhow;
      const blessedEquipPower = blessingMultiplier * rawEquipPower;
      equippedPower = totalPower + blessedEquipPower;
    } else {
      equippedPower = totalPower;
    }
  } else {
    totalPower = 0;
    equippedPower = 0;
  }

  return (
    <div className={classes.join(' ')}>
      <h2 className="qh-girl-name">{girl.name}</h2>
      <LevelRarityHeader girl={girl} />
      <Grade
        stars={girl.stars}
        maxStars={girl.maxStars}
        currentStar={girl.currentIcon}
      />
      <div className="element-and-pose">
        <ElementIcon element={girl.element} />
        <PoseIcon pose={girl.pose} />
      </div>
      <div className={`stats-section ${blessed ? ' blessed' : ''}`}>
        Total Power: {format(totalPower)}
        <br />
        Equipped Power: {format(equippedPower)}
        <StatsDescription girl={girl} currentBlessings={currentBlessings} />
      </div>
    </div>
  );
};

const LevelRarityHeader: React.FC<GirlTooltipProps> = ({ girl }) => {
  return (
    <h3>
      &lt;{girl.own && girl.level !== undefined ? <>Lv. {girl.level} </> : null}
      <>{Rarities.toDisplayString(girl.rarity)} girl</>
      &gt;
    </h3>
  );
};

const StatsDescription: React.FC<GirlTooltipProps> = ({
  girl,
  currentBlessings: currentBlessing
}) => {
  if (!girl.stats) {
    return null;
  }
  const blessedStats = getBlessedStats(girl, girl.stats, currentBlessing ?? []);
  const potentialLevelMultiplier = 1 / (girl.level ?? 1);
  const potentialGradeMultiplier =
    (1 + 0.3 * girl.maxStars) / (1 + 0.3 * girl.stars);
  const potentialMultiplier =
    potentialLevelMultiplier * potentialGradeMultiplier;

  return (
    <StatsList
      stats={blessedStats}
      blessed={blessedStats.charm > girl.stats.charm}
      potentialMultiplier={potentialMultiplier}
    />
  );
};
