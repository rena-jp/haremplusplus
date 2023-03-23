import {
  BlessingDefinition,
  CommonGirlData,
  getBlessedStats,
  Rarities,
  Rarity
} from '../data/data';
import { Grade, ElementIcon, StatsList, PoseIcon, format } from './common';
import '../style/girl-tooltip.css';
import '../style/girls.css';

export interface GirlTooltipProps {
  girl: CommonGirlData;
  currentBlessings?: BlessingDefinition[];
  classNames?: string[];
}

export const GirlTooltip: React.FC<GirlTooltipProps> = ({
  girl,
  currentBlessings: currentBlessing,
  classNames
}) => {
  const classes = ['girl-tooltip'];
  classes.push(Rarity[girl.rarity]);
  if (classNames) {
    classes.push(...classNames);
  }

  let totalPower: number;
  let blessed = false;
  if (girl.stats) {
    const blessedStats = getBlessedStats(
      girl,
      girl.stats,
      currentBlessing ?? []
    );
    totalPower =
      blessedStats.charm + blessedStats.hardcore + blessedStats.knowhow;
    blessed = blessedStats.charm > girl.stats.charm;
  } else {
    totalPower = 0;
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
        <StatsDescription girl={girl} currentBlessings={currentBlessing} />
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
