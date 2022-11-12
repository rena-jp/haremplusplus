import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import LazyLoad from 'react-lazyload';
import { CommonGirlData, Rarity } from '../data/data';
import '../style/colors.css';
import '../style/girls.css';
import { ElementIcon, Grade, SalaryIcon, UpgradeIcon } from './common';

export interface GirlTileProps {
  girl: CommonGirlData;
  selected: boolean;
  show0Pose: boolean;
  lazy?: boolean;
}

export interface SimpleGirlTileProps extends GirlTileProps {
  onClick: () => void;
  children?: ReactNode;
  avatarOverlay?: ReactNode;
  classNames?: string[];
}

export const SimpleGirlTile: React.FC<SimpleGirlTileProps> = ({
  girl,
  selected,
  show0Pose,
  onClick,
  children,
  avatarOverlay,
  classNames,
  lazy
}) => {
  const rarityCss = Rarity[girl.rarity];

  const allClassNames = ['girlTile', rarityCss];
  if (classNames) {
    allClassNames.push(...classNames);
  }
  if (selected) {
    allClassNames.push('selected');
  }
  allClassNames.push(girl.own ? 'owned' : 'not-owned');

  const icon = show0Pose ? girl.icon0 : girl.icon;

  /**
   * Use a 1x1 transparent image as placeholder. This will force proper image layout during image loading,
   * as well as avoid rendering an alt-text while the image is loading (alt text may still appear for invalid
   * images))
   */
  const placeholder =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  const tileRef = useRef<HTMLDivElement>(null);

  // Note: this effect may be triggered when the selected girl becomes visible (unfiltered)
  // (Not necessarily on an explicit selection change).
  useEffect(() => {
    if (selected && tileRef.current !== null) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio < 0.7) {
          if (selected && tileRef.current !== null) {
            tileRef.current.scrollIntoView({ block: 'nearest' });
          }
        }
        observer.disconnect(); // One-time trigger
      });
      observer.observe(tileRef.current);
    }
  }, [selected]);

  return (
    <div
      className={allClassNames.join(' ')}
      onClick={onClick}
      title={girl.name}
      ref={tileRef}
    >
      {children}
      <div className="avatar-area">
        <WrappedImage
          placeholder={
            <img
              src={placeholder}
              alt={girl.name}
              title={girl.name}
              className="tile-avatar placeholder"
            />
          }
          lazy={lazy !== false} /* True by default */
        >
          <img
            src={icon}
            alt={girl.name}
            title={girl.name}
            className="tile-avatar"
          />
        </WrappedImage>
        <ElementIcon element={girl.element} />
        {avatarOverlay}
      </div>
      <Grade
        stars={girl.stars}
        maxStars={girl.maxStars}
        currentStar={girl.currentIcon}
      />
    </div>
  );
};

interface WrappedImageProps {
  lazy: boolean;
  children: ReactNode;
  placeholder: ReactNode;
}

const WrappedImage: React.FC<WrappedImageProps> = ({
  lazy,
  children,
  placeholder
}) => {
  if (lazy) {
    return (
      <LazyLoad placeholder={placeholder} overflow={true} offset={500}>
        {children}
      </LazyLoad>
    );
  } else {
    return <div className="lazyload-wrapper">{children}</div>;
  }
};

export interface HaremGirlTileProps extends GirlTileProps {
  collectSalary: (girl: CommonGirlData) => void;
  /**
   * Timestamp of next salary, in ms
   */
  payAt: number | undefined;
  selectGirl(girl: CommonGirlData): void;
}

export const HaremGirlTile: React.FC<HaremGirlTileProps> = ({
  girl,
  selected,
  selectGirl,
  show0Pose,
  collectSalary,
  payAt,
  lazy
}) => {
  const selectOnClick = useCallback(() => selectGirl(girl), [selectGirl, girl]);

  const [salaryReady, setSalaryReady] = useState(
    payAt !== undefined && payAt <= Date.now()
  );

  // Add a timeout to show the salary when ready.
  // Update the timers when the harem is shown, remove
  // them when the harem is hidden.
  useEffect(() => {
    if (payAt !== undefined && payAt > Date.now()) {
      setSalaryReady(false);
      const salaryTimeout = setTimeout(() => {
        setSalaryReady(true);
      }, payAt - Date.now());
      return () => clearTimeout(salaryTimeout);
    }
  }, [salaryReady, payAt]);

  const classNames = salaryReady ? ['salary'] : [];
  const displayedLevel =
    girl.level === undefined ? (
      <>&nbsp;</>
    ) : (
      <>
        {girl.level === 750 ? (
          <>{girl.level}</>
        ) : (
          <>
            {girl.level}/{girl.maxLevel}
          </>
        )}
      </>
    );

  const onClick = useCallback(() => {
    selectOnClick();
    if (salaryReady && collectSalary !== undefined) {
      setSalaryReady(false);
      collectSalary(girl);
    }
  }, [collectSalary, selectOnClick, girl, salaryReady]);

  return (
    <SimpleGirlTile
      girl={girl}
      onClick={onClick}
      selected={selected}
      show0Pose={show0Pose}
      classNames={classNames}
      avatarOverlay={
        <>
          <SalaryIcon />
          {girl.own || girl.shards === 0 ? null : (
            <span className="qh_shards">{girl.shards}/100</span>
          )}
        </>
      }
      lazy={lazy}
    >
      {girl.own ? <span className="girl-header">{displayedLevel}</span> : null}
      {girl.upgradeReady ? <UpgradeIcon /> : null}
    </SimpleGirlTile>
  );
};

/*
 * We render thousands of girl tiles in a list. Need to memoize it
 * to avoid needless and expensive re-renders. The only variables in a typical
 * use case are selection and salary.
 */
export const GirlTile = React.memo(HaremGirlTile);
