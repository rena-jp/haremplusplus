import '../style/common.css';
import { Elements, Element, Stats, Class, Poses } from '../data/data';
import { Pose, Zodiac } from '../data/data';
import { PlacesType, Tooltip as ReactTooltip } from 'react-tooltip';
import { ReactNode, useMemo, useState } from 'react';

import 'react-tooltip/dist/react-tooltip.css';

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
  return <div className={elementClasses} />;
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

export function formatCost(cost: number): string {
  if (cost > 1000000000) {
    return (cost / 1000000000).toFixed(1) + 'B';
  }
  if (cost > 1000000) {
    return (cost / 1000000).toFixed(1) + 'M';
  }
  if (cost > 10000) {
    return (cost / 1000).toFixed(1) + 'k';
  }
  return String(cost);
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
    <div className="grade">
      {[...Array(stars)].map((_v, i) => (
        <Star key={`full_${i}`} kind="solid" current={i === currentStar - 1} />
      ))}
      {[...Array(maxStars - stars)].map((_v, i) => (
        <Star key={`empty_${i}`} kind="empty" />
      ))}
    </div>
  );
};

export interface StarProps {
  kind: 'solid' | 'empty';
  current?: boolean;
}
export const Star: React.FC<StarProps> = ({ kind, current }) => {
  const currentStyle = current ? ' current' : '';
  const className = `star ${kind}${currentStyle}`;
  return <div className={className} />;
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
        <hr />
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
  tooltip: ReactNode;
  place?: PlacesType;
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

  const [anchorId] = useState(randomAnchor);

  return (
    <>
      <span
        className={classes.join(' ')}
        data-tooltip-place={place}
        data-tooltip-delay-show={delay}
        data-tooltip-id={anchorId}
      >
        {children}
      </span>
      <ReactTooltip
        className="qh-tooltip"
        classNameArrow="qh-tooltip-arrow"
        id={anchorId}
      >
        {tooltip}
      </ReactTooltip>
    </>
  );
};

function randomAnchor(): string {
  const id = Math.round(Math.random() * 0x10000);
  return `tt-anchor_${id}`;
}

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
      <span className="stat hc-stat">{format(stats.hardcore)}</span>{' '}
      <span className="stat ch-stat">{format(stats.charm)}</span>{' '}
      <span className="stat kh-stat">{format(stats.knowhow)}</span>{' '}
    </div>
  );
};

export interface StatIconProps {
  statClass: Class;
  blessed?: boolean;
}

export const StatIcon: React.FC<StatIconProps> = ({ statClass, blessed }) => {
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

export function getDomain(): string {
  const host = window.location.host;
  const domain = host.includes('localhost')
    ? 'https://www.hentaiheroes.com'
    : '.';
  return domain;
}

export interface ProgressBarProps {
  min: number;
  max: number;
  curr: number;
  extra?: number;
  label?: string;
  overlay?: ReactNode;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  min,
  max,
  curr,
  extra,
  label,
  overlay
}) => {
  const ratio = Math.min(1, Math.max(0, (curr - min) / (max - min)));
  const extraValue = curr + (extra ?? 0);
  const extraRatio = Math.min(1, Math.max(0, (extraValue - min) / (max - min)));

  const classNames = ['qh-progress-bar'];
  if (ratio === 1) {
    classNames.push('full');
  } else if (extraRatio === 1) {
    classNames.push('extra-full');
  }

  const mainWidth = Math.floor(ratio * 100);
  const extraWidth =
    extraRatio === 1 ? 100 - mainWidth : Math.floor((extraRatio - ratio) * 100);

  return (
    <div className={classNames.join(' ')}>
      <div className="raw-track" style={{ width: `${mainWidth}%` }}></div>
      <div className="main-track" style={{ width: `${mainWidth}%` }}></div>
      <div className="extra-track" style={{ width: `${extraWidth}%` }}></div>
      {label !== undefined ? (
        <span className="track-label">{label}</span>
      ) : null}
      {overlay !== undefined ? overlay : null}
    </div>
  );
};

export const BookIcon: React.FC<{ item?: number }> = ({ item }) => {
  const icon = item === undefined ? 'XP2' : `XP${item}`;
  return <img src={`https://hh2.hh-content.com/pictures/items/${icon}.png`} />;
};

export const GiftIcon: React.FC<{ item?: number }> = ({ item }) => {
  const icon = item === undefined ? 'K2' : `K${item}`;
  return <img src={`https://hh2.hh-content.com/pictures/items/${icon}.png`} />;
};

export const EnduranceIcon = () => {
  return (
    <img
      src="https://hh2.hh-content.com/pictures/misc/items_icons/4.png"
      className="endurance-icon"
    />
  );
};

export const EgoIcon = () => {
  return (
    <img src="https://hh2.hh-content.com/caracs/ego.png" className="ego-icon" />
  );
};

export const AttackIcon = () => {
  return (
    <img
      src="https://hh2.hh-content.com/caracs/damage.png"
      className="attack-icon"
    />
  );
};

export const DefenseIcon = () => {
  return (
    <img
      src="https://hh2.hh-content.com/caracs/deff_undefined.png"
      className="defense-icon"
    />
  );
};
