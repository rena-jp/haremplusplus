import React, { useCallback, useEffect, useState } from 'react';
import { CommonGirlData, Rarity } from '../data/data';
import '../style/colors.css';
import '../style/girls.css';
import { ElementIcon, Grade, SalaryIcon, UpgradeIcon } from './common';

export interface GirlProps {
  girl: CommonGirlData;
  selected: boolean;
  selectGirl: (girl: CommonGirlData) => void;
  show0Pose: boolean;
  collectSalary: (girl: CommonGirlData) => void;
  /**
   * Timestamp of next salary, in ms
   */
  payAt: number | undefined;
}

const SimpleGirlTile: React.FC<GirlProps> = ({
  girl,
  selected,
  selectGirl,
  show0Pose,
  collectSalary,
  payAt
}) => {
  const selectOnClick = useCallback(() => selectGirl(girl), [selectGirl, girl]);
  const selectedCss = selected ? 'selected' : '';
  const ownCss = girl.own ? 'owned' : 'not-owned';
  const rarityCss = Rarity[girl.rarity];

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

  const classNames = `${selectedCss} girlTile ${ownCss} ${rarityCss} ${
    salaryReady ? 'salary' : ''
  }`;
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

  const icon = show0Pose ? girl.icon0 : girl.icon;

  const onClick = useCallback(() => {
    selectOnClick();
    if (salaryReady && collectSalary !== undefined) {
      setSalaryReady(false);
      collectSalary(girl);
    }
  }, [collectSalary, selectOnClick, girl, salaryReady]);

  return (
    <div className={classNames} onClick={onClick} title={girl.name}>
      {girl.own ? <span className="girl-header">{displayedLevel}</span> : null}
      <div className="avatar-area">
        <div className="avatar">
          <img src={icon} alt={girl.name} title={girl.name} />
        </div>
        <ElementIcon element={girl.element} />
        <SalaryIcon />
        {girl.upgradeReady ? <UpgradeIcon /> : null}
        {girl.own || girl.shards === 0 ? null : (
          <span className="qh_shards">{girl.shards}/100</span>
        )}
      </div>
      <Grade
        stars={girl.stars}
        maxStars={girl.maxStars}
        currentStar={girl.currentIcon}
      />
    </div>
  );
};

/*
 * We render thousands of girl tiles in a list. Need to memoize it
 * to avoid needless and expensive re-renders. The only variables in a typical
 * use case are selection and salary.
 */
export const GirlTile = React.memo(SimpleGirlTile);
