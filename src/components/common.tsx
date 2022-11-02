import '../style/common.css';
import { Elements, Element, Stats, Class, Poses } from '../data/data';
import { Pose, Zodiac } from '../data/data';
import ReactDOMServer from 'react-dom/server';
import ReactTooltip from 'react-tooltip';
import { ReactElement, ReactNode, useEffect, useMemo } from 'react';

export type GemType = Element | 'rainbow';

export interface GemProps {
  element: GemType;
  className?: string;
  noTitle?: boolean;
}

export const GemIcon: React.FC<GemProps> = ({
  element,
  className,
  noTitle
}) => {
  const icon = getGemIcon(element);
  const elementName =
    element === 'rainbow' ? 'rainbow' : Elements.toString(element);
  const cssClass = `elementIcon ${className ?? ''}`;
  const title = noTitle === true ? undefined : elementName;
  return (
    <img src={icon} title={title} alt={elementName} className={cssClass} />
  );
};

export function getGemIcon(element: GemType): string {
  switch (element) {
    case 'rainbow':
      return 'https://hh2.hh-content.com/pictures/design/gems/all.png';
    case Element.blue:
      return 'https://hh2.hh-content.com/pictures/design/gems/water.png';
    case Element.red:
      return 'https://hh2.hh-content.com/pictures/design/gems/fire.png';
    case Element.dark:
      return 'https://hh2.hh-content.com/pictures/design/gems/darkness.png';
    case Element.green:
      return 'https://hh2.hh-content.com/pictures/design/gems/nature.png';
    case Element.orange:
      return 'https://hh2.hh-content.com/pictures/design/gems/stone.png';
    case Element.purple:
      return 'https://hh2.hh-content.com/pictures/design/gems/psychic.png';
    case Element.white:
      return 'https://hh2.hh-content.com/pictures/design/gems/light.png';
    case Element.yellow:
      return 'https://hh2.hh-content.com/pictures/design/gems/sun.png';
  }
}

interface ElementProps {
  element: Element | 'rainbow';
}
export const ElementIcon: React.FC<ElementProps> = ({ element }) => {
  const elementName =
    element === 'rainbow' ? 'rainbow' : Elements.toString(element);
  const elementClasses = `element ${elementName}`;
  return <span className={elementClasses} />;
};

export const SalaryIcon: React.FC = () => {
  return <div className="soft_currency" />;
};

export const UpgradeIcon: React.FC = () => {
  return <div className="upgrade-girl" />;
};

export function getElementIcon(element: Element | 'rainbow'): string {
  switch (element) {
    case 'rainbow':
      return 'https://hh.hh-content.com/pictures/girls_elements/Multicolored.png';
    case Element.blue:
      return 'https://hh.hh-content.com/pictures/girls_elements/Sensual.png';
    case Element.red:
      return 'https://hh.hh-content.com/pictures/girls_elements/Eccentric.png';
    case Element.dark:
      return 'https://hh.hh-content.com/pictures/girls_elements/Multicolored.png';
    case Element.green:
      return 'https://hh.hh-content.com/pictures/girls_elements/Exhibitionist.png';
    case Element.orange:
      return 'https://hh.hh-content.com/pictures/girls_elements/Physical.png';
    case Element.purple:
      return 'https://hh.hh-content.com/pictures/girls_elements/Voyeurs.png';
    case Element.white:
      return 'https://hh.hh-content.com/pictures/girls_elements/Submissive.png';
    case Element.yellow:
      return 'https://hh.hh-content.com/pictures/girls_elements/Playful.png';
  }
}

export interface ZodiacProps {
  zodiac: Zodiac;
}

export const ZodiacElement: React.FC<ZodiacProps> = ({ zodiac }) => {
  return <span className={`zodiac ${Zodiac[zodiac]}`}>{Zodiac[zodiac]}</span>;
};

export interface PoseProps {
  pose: Pose;
}

export const PoseElement: React.FC<PoseProps> = ({ pose }) => {
  return <span className={`pose ${Pose[pose]}`}>{Pose[pose]}</span>;
};

export function format(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function firstToUpper(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.substring(0, 1).toUpperCase() + value.substring(1);
}

export function formatTime(value: number): string {
  const seconds = value;
  const minutes = Math.round((value / 60) * 100) / 100;
  const hours = Math.round((value / 3600) * 100) / 100;
  if (hours > 1) {
    const min = (value / 60) % 60;
    const h = Math.floor(hours);
    return min > 0 ? `${h}h ${min}min` : `${h}h`;
  } else if (Number(minutes) > 1) {
    return `${minutes} minutes`;
  } else {
    return `${seconds} seconds`;
  }
}

export interface GradeProps {
  stars: number;
  maxStars: number;
  currentStar: number;
}
export const Grade: React.FC<GradeProps> = ({
  stars,
  maxStars,
  currentStar
}) => {
  return (
    <span className="grade">
      {[...Array(stars)].map((_v, i) => (
        <Star key={`full_${i}`} kind="solid" current={i === currentStar - 1} />
      ))}
      {[...Array(maxStars - stars)].map((_v, i) => (
        <Star key={`empty_${i}`} kind="empty" />
      ))}
    </span>
  );
};

export interface StarProps {
  kind: 'solid' | 'empty';
  current?: boolean;
}
export const Star: React.FC<StarProps> = ({ kind, current }) => {
  const currentStyle = current ? ' current' : '';
  const className = `star ${kind}${currentStyle}`;
  return <span className={className} />;
};

export interface GemsCountProps {
  gemsCount: Map<Element, number | undefined>;
}

export const GemsCount: React.FC<GemsCountProps> = ({ gemsCount }) => {
  const tooltipContent = useMemo(() => {
    const totalCount = [...gemsCount.values()].reduce(
      (a, b) => (a ?? 0) + (b ?? 0),
      0
    );
    return (
      <div className="gems-count-details">
        {Elements.values().map((element) => (
          <GemsCountEntry
            key={element}
            element={element}
            count={gemsCount.get(element) ?? 0}
          />
        ))}
        <GemsCountEntry
          key="rainbow"
          element="rainbow"
          count={totalCount ?? 0}
        />
      </div>
    );
  }, [gemsCount]);

  return (
    <Tooltip cssClasses="gems-count" place="bottom" tooltip={tooltipContent}>
      <GemIcon element="rainbow" noTitle={true} />
    </Tooltip>
  );
};

export interface TooltipProps {
  children: ReactNode;
  tooltip: ReactElement;
  place?: string;
  cssClasses?: string | string[];
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  tooltip,
  children,
  place,
  cssClasses,
  delay
}) => {
  const classes =
    cssClasses === undefined
      ? []
      : Array.isArray(cssClasses)
      ? cssClasses
      : [cssClasses];
  classes.push('qh-tooltip-wrapper');

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  return (
    <>
      <span
        className={classes.join(' ')}
        data-html={true}
        data-place={place}
        data-delay-show={delay}
        data-tip={ReactDOMServer.renderToString(
          <div className="qh-tooltip">{tooltip}</div>
        )}
      >
        {children}
      </span>
    </>
  );
};

interface GemsCountEntryProps {
  element: Element | 'rainbow';
  count: number;
}

const GemsCountEntry: React.FC<GemsCountEntryProps> = ({ element, count }) => {
  return (
    <span>
      <GemIcon element={element} /> {format(count)}
    </span>
  );
};

export const TooltipConfiguration: React.FC = () => (
  <ReactTooltip effect="solid" border={true} borderColor="goldenrod" />
);

export interface StatsDescriptionProps {
  baseStats: Stats;
  currentStats: Stats;
  upcomingStats: Stats;
  potentialMultiplier: number;
  blessed: boolean;
  statIcon?: Class;
}

export const StatsDescriptionTooltip: React.FC<StatsDescriptionProps> = ({
  baseStats,
  currentStats,
  upcomingStats,
  potentialMultiplier,
  blessed,
  statIcon
}) => {
  // https://hh2.hh-content.com/pictures/misc/items_icons/3.png
  return (
    <span className="stats-description">
      <Tooltip
        place="bottom"
        tooltip={
          <StatsDescription
            baseStats={baseStats}
            blessed={blessed}
            currentStats={currentStats}
            upcomingStats={upcomingStats}
            potentialMultiplier={potentialMultiplier}
          />
        }
      >
        <StatIcon statClass={statIcon ?? Class.Knowhow} blessed={blessed} />
      </Tooltip>
    </span>
  );
};

export const StatsDescription: React.FC<StatsDescriptionProps> = ({
  baseStats,
  currentStats,
  upcomingStats,
  potentialMultiplier
}) => {
  return (
    <div className="detailed-stats">
      <div className="base-stats">
        Base{' '}
        <StatsList
          stats={baseStats}
          potentialMultiplier={potentialMultiplier}
          blessed={false}
        />
      </div>
      <div
        className={`current-stats${
          currentStats.charm > baseStats.charm ? ' blessed' : ''
        }`}
      >
        Current{' '}
        <StatsList
          stats={currentStats}
          potentialMultiplier={potentialMultiplier}
          blessed={currentStats.charm > baseStats.charm}
        />
      </div>
      <div
        className={`upcoming-stats${
          upcomingStats.charm > baseStats.charm ? ' blessed' : ''
        }`}
      >
        Upcoming{' '}
        <StatsList
          stats={upcomingStats}
          potentialMultiplier={potentialMultiplier}
          blessed={false}
        />
      </div>
    </div>
  );
};

export interface StatsProps {
  stats: Stats;
  potentialMultiplier: number;
  blessed: boolean;
}

export const StatsList: React.FC<StatsProps> = ({
  stats,
  potentialMultiplier,
  blessed
}) => {
  const potential = (
    (stats.hardcore + stats.charm + stats.knowhow) *
    potentialMultiplier
  ).toFixed(2);
  return (
    <div className={`stats-list${blessed ? ' blessed' : ''}`}>
      <span className="potential">{potential}</span>{' '}
      <span className="stat hc-stat">
        <StatIcon statClass={Class.Hardcore} /> {format(stats.hardcore)}
      </span>{' '}
      <span className="stat ch-stat">
        <StatIcon statClass={Class.Charm} /> {format(stats.charm)}
      </span>{' '}
      <span className="stat kh-stat">
        <StatIcon statClass={Class.Knowhow} /> {format(stats.knowhow)}
      </span>{' '}
    </div>
  );
};

export interface StatIconProps {
  statClass: Class;
  blessed?: boolean;
}

export const StatIcon: React.FC<StatIconProps> = ({ statClass, blessed }) => {
  console.log('Blessed: ', blessed);
  return (
    <span
      className={`stat-icon class_${statClass}${
        blessed === true ? ' blessed' : ''
      }`}
    />
  );
};

export interface PoseIconProps {
  pose: Pose;
}

export const PoseIcon: React.FC<PoseIconProps> = ({ pose }) => {
  const poseName = Poses.toString(pose);
  return <span className={`pose-icon ${poseName}`} />;
};

export interface CloseButtonProps {
  close: () => void;
  title?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ close, title }) => {
  return <div className="close-popup" onClick={close} title={title}></div>;
};
