import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { CommonGirlData, Rarity } from '../data/data';
import '../style/colors.css';
import '../style/girls.css';
import { ElementIcon, Grade, SalaryIcon, UpgradeIcon } from './common';

export interface GirlTileProps {
  girl: CommonGirlData;
  selected: boolean;
  show0Pose: boolean;
}

export interface SimpleGirlTileProps extends GirlTileProps {
  onClick: () => void;
  children?: ReactNode;
  classNames?: string[];
}

export const SimpleGirlTile: React.FC<SimpleGirlTileProps> = ({
  girl,
  selected,
  show0Pose,
  onClick,
  children,
  classNames
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

  return (
    <div
      className={allClassNames.join(' ')}
      onClick={onClick}
      title={girl.name}
    >
      <div className="avatar-area">
        {children}
        <div className="avatar">
          <img src={icon} alt={girl.name} title={girl.name} />
        </div>
        <ElementIcon element={girl.element} />
      </div>
      <Grade
        stars={girl.stars}
        maxStars={girl.maxStars}
        currentStar={girl.currentIcon}
      />
    </div>
  );
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
  payAt
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
    >
      {girl.own ? <span className="girl-header">{displayedLevel}</span> : null}
      <SalaryIcon />
      {girl.upgradeReady ? <UpgradeIcon /> : null}
      {girl.own || girl.shards === 0 ? null : (
        <span className="qh_shards">{girl.shards}/100</span>
      )}
    </SimpleGirlTile>
  );
};

/*
 * We render thousands of girl tiles in a list. Need to memoize it
 * to avoid needless and expensive re-renders. The only variables in a typical
 * use case are selection and salary.
 */
export const GirlTile = React.memo(HaremGirlTile);
