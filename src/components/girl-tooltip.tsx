import {
  BlessingDefinition,
  CommonGirlData,
  getBlessedStats,
  getBlessingMultiplier,
  Rarities,
  Rarity
} from '../data/data';
import { Grade, ElementIcon, StatsList, PoseIcon } from './common';
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
      <StatsDescription girl={girl} currentBlessings={currentBlessing} />
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
  const multiplier = getBlessingMultiplier(girl, currentBlessing ?? []);

  return (
    <StatsList
      stats={blessedStats}
      blessed={multiplier > 1.001}
      potentialMultiplier={multiplier}
    />
  );
};
