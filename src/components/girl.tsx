import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import LazyLoad from 'react-lazyload';
import { BlessingDefinition, CommonGirlData, Rarity } from '../data/data';
import '../style/colors.css';
import '../style/girls.css';
import { ElementIcon, Grade, UpgradeIcon } from './common';
import { EquipmentDecorators } from './girls-equipment';
import { GirlTooltip } from './girl-tooltip';
import ReactDOMServer from 'react-dom/server';

export const GIRL_TOOLTIP_ID = 'harem-tooltip';

export interface GirlTileProps {
  girl: CommonGirlData;
  selected: boolean;
  show0Pose: boolean;
  lazy?: boolean;
  tooltipContent?: string;
}

export interface SimpleGirlTileProps extends GirlTileProps {
  onClick: (event: React.MouseEvent) => void;
  children?: ReactNode;
  avatarOverlay?: ReactNode;
  classNames?: string[];
}

/**
 * A girl tile with element and grade.
 */
export const SimpleGirlTile: React.FC<SimpleGirlTileProps> = ({
  girl,
  selected,
  show0Pose,
  onClick,
  children,
  avatarOverlay,
  classNames,
  lazy,
  tooltipContent
}) => {
  const avatarOverlayWithElement = (
    <>
      {avatarOverlay}
      <ElementIcon element={girl.element} />
    </>
  );

  const bottom = (
    <Grade
      stars={girl.stars}
      maxStars={girl.maxStars}
      currentStar={girl.currentIcon}
    />
  );

  return (
    <BaseGirlTile
      girl={girl}
      onClick={onClick}
      avatarOverlay={avatarOverlayWithElement}
      bottom={bottom}
      selected={selected}
      children={children}
      classNames={classNames}
      lazy={lazy}
      show0Pose={show0Pose}
      tooltipContent={tooltipContent}
    />
  );
};

export interface BaseGirlTileProps {
  girl: CommonGirlData | undefined;
  onClick: (event: React.MouseEvent) => void;
  children?: ReactNode;
  avatarOverlay?: ReactNode;
  bottom?: ReactNode;
  classNames?: string[];
  selected?: boolean;
  show0Pose?: boolean;
  lazy?: boolean;
  tooltipContent?: string;
}

/**
 * Base component showing the girl's avatar, with a rarity background.
 * The component can be extended in various ways with additional overlays.
 *
 * If the girl is not specified, an empty tile (with no rarity background and
 * no avatar) will be displayed.
 */
export const BaseGirlTile: React.FC<BaseGirlTileProps> = ({
  girl,
  onClick,
  children,
  avatarOverlay,
  bottom,
  classNames,
  selected,
  show0Pose,
  lazy,
  tooltipContent
}) => {
  const allClassNames = ['girlTile'];
  if (girl !== undefined) {
    const rarityCss = Rarity[girl.rarity];
    allClassNames.push(rarityCss);
    allClassNames.push(girl.own ? 'owned' : 'not-owned');
  }
  if (classNames) {
    allClassNames.push(...classNames);
  }
  if (selected === true) {
    allClassNames.push('selected');
  }

  const icon =
    girl === undefined ? '' : show0Pose === true ? girl.icon0 : girl.icon;

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
      title={girl?.name}
      ref={tileRef}
      data-tooltip-id={GIRL_TOOLTIP_ID}
      data-tooltip-html={tooltipContent}
    >
      {children}
      <div className="avatar-area">
        <WrappedImage
          placeholder={
            <img
              src={placeholder}
              alt={girl?.name}
              title={girl?.name}
              className="tile-avatar placeholder"
            />
          }
          lazy={lazy !== false} /* True by default */
        >
          <img
            src={icon}
            alt={girl?.name}
            title={girl?.name}
            className="tile-avatar"
          />
        </WrappedImage>
        {avatarOverlay}
      </div>
      {bottom}
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
  selectGirl(girl: CommonGirlData): void;
  currentBlessings?: BlessingDefinition[];
}

/**
 * The girl tile shown in the harem list. Includes level, element and grade.
 */
export const HaremGirlTile: React.FC<HaremGirlTileProps> = ({
  girl,
  selected,
  selectGirl,
  show0Pose,
  lazy,
  currentBlessings
}) => {
  const selectOnClick = useCallback(() => selectGirl(girl), [selectGirl, girl]);

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

  const onClick = selectOnClick;

  const tooltipContent = useMemo(() => {
    return ReactDOMServer.renderToStaticMarkup(
      <GirlTooltip girl={girl} currentBlessings={currentBlessings} />
    );
  }, [girl, currentBlessings]);

  return (
    <SimpleGirlTile
      girl={girl}
      onClick={onClick}
      selected={selected}
      show0Pose={show0Pose}
      avatarOverlay={
        <>
          {girl.equipment && girl.equipment?.items.length > 0 ? (
            <EquipmentDecorators equipment={girl.equipment} />
          ) : null}
          {girl.own || girl.shards === 0 ? null : (
            <span className="qh_shards">{girl.shards}/100</span>
          )}
        </>
      }
      lazy={lazy}
      tooltipContent={tooltipContent}
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
