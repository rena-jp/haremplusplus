import React, { useCallback, useMemo, useState } from 'react';
import {
  allBlessingTypes,
  Blessing,
  BlessingDefinition,
  Blessings,
  BlessingType,
  CommonGirlData,
  Element,
  Elements,
  equalBlessing,
  EyeColor,
  getMatchingGirls,
  HairColor,
  Pose,
  Poses,
  Rarity
} from '../data/data';
import { getMissingGXP } from '../hooks/girl-xp-hooks';
import '../style/harem.css';
import { ElementIcon, format, GemIcon, PoseIcon, Tooltip } from './common';
import { QuickFilter } from './harem';
import { PanelProps } from './panels';

export interface SummaryProps extends PanelProps {
  filteredGirls: CommonGirlData[];
  allGirls: CommonGirlData[];
  toggleFilter(blessing: BlessingType | BlessingType[]): void;
  clearFilters(): void;
  filters: QuickFilter[];
  currentBlessings: BlessingDefinition[];
  nextBlessings: BlessingDefinition[];
}

export const Summary: React.FC<SummaryProps> = ({
  filteredGirls,
  allGirls,
  filters,
  toggleFilter,
  currentBlessings,
  nextBlessings,
  visible
}) => {
  const [filteredOnly, setFilteredOnly] = useState(true);

  const girls = useMemo(
    () => (filteredOnly ? filteredGirls : allGirls),
    [filteredOnly, filteredGirls, allGirls]
  );

  const missingGXPAll = format(
    girls
      .filter((girl) => girl.own)
      .map((girl) => getMissingGXP(girl))
      .reduce((a, b) => a + b, 0)
  );
  const missingGXPELM = format(
    girls
      .filter((girl) => girl.own && girl.rarity > Rarity.rare)
      .map((girl) => getMissingGXP(girl))
      .reduce((a, b) => a + b, 0)
  );

  const missingAffAll = format(
    girls
      .filter((girl) => girl.own)
      .map((girl) => girl.missingAff)
      .reduce((a, b) => a + b, 0)
  );
  const missingAffELM = format(
    girls
      .filter((girl) => girl.own && girl.rarity > Rarity.rare)
      .map((girl) => girl.missingAff)
      .reduce((a, b) => a + b, 0)
  );

  const owned = allGirls.filter((g) => g.own).length;
  const total = allGirls.length;
  const missing = owned - total;
  const pct = ((owned / total) * 100).toFixed(2);

  const toggleFilteredOnly = useCallback(
    () => setFilteredOnly(!filteredOnly),
    [filteredOnly, setFilteredOnly]
  );

  const [lmOnly, setLMOnly] = useState(true);
  const toggleLMOnly = useCallback(
    () => setLMOnly(!lmOnly),
    [lmOnly, setLMOnly]
  );

  const epPool = allGirls.filter((girl) => girl.sources.includes('EP'));
  const mpPool = allGirls.filter((girl) => girl.sources.includes('MP'));
  const totalEp = epPool.length;
  const totalMp = mpPool.length;
  const ownedEP = epPool.filter((girl) => girl.own).length;
  const ownedMP = mpPool.filter((girl) => girl.own).length;
  const missingEp = ownedEP - totalEp;
  const missingMp = ownedMP - totalMp;

  const className = `panel summary ${visible ? 'visible' : 'hidden'}`;

  return (
    <div className={className}>
      <div className="summary-content">
        <p>
          Total girls: {owned}/{total} ({missing}) {pct}% <br />
          Epic Pachinko: {ownedEP}/{totalEp} ({missingEp}) <br />
          Mythic Pachinko: {ownedMP}/{totalMp} ({missingMp})
        </p>
        <p>
          <label
            htmlFor="pvponly"
            title="Summary: show only the girls that match the current filter"
          >
            Show filtered Girls only:{' '}
          </label>
          <input
            id="pvponly"
            type="checkbox"
            onChange={toggleFilteredOnly}
            checked={filteredOnly}
          />
          <br />
          <label
            htmlFor="lmonly"
            title="Summary: show Epic/Legendary/Mythic girls only"
          >
            Show E/L/M Girls only:{' '}
          </label>
          <input
            id="lmonly"
            type="checkbox"
            onChange={toggleLMOnly}
            checked={lmOnly}
          />
        </p>
        <BlessingsList
          toggleFilter={toggleFilter}
          currentBlessing={currentBlessings}
          nextBlessing={nextBlessings}
        />
        <BlessingSummaries
          girls={girls}
          excludeCommonRare={lmOnly}
          filters={filters}
          toggleFilter={toggleFilter}
        />
        <div className="resources-summary">
          <p>
            Total missing Affection:{' '}
            {missingAffAll > missingAffELM ? (
              <>
                <span title="Epic, Legendary & Mythic">{missingAffELM}</span>{' '}
                <span title="All rarities">({missingAffAll})</span>
              </>
            ) : (
              <span>{missingAffELM}</span>
            )}
          </p>
          <p>
            Total missing Girls XP:{' '}
            <span title="Epic, Legendary & Mythic">{missingGXPELM}</span> (
            <span title="All rarities">{missingGXPAll}</span>)
          </p>
          <GemsSummary girls={girls} />
        </div>
      </div>
    </div>
  );
};

export interface BlessingSummariesProps {
  girls: CommonGirlData[];
  excludeCommonRare: boolean;
  toggleFilter(blessing: BlessingType | BlessingType[]): void;
  filters: QuickFilter[];
}

export const BlessingSummaries: React.FC<BlessingSummariesProps> = ({
  girls,
  excludeCommonRare,
  filters,
  toggleFilter
}) => {
  const blessings: Map<Blessing, BlessingType[]> = new Map();
  for (const blessingType of allBlessingTypes()) {
    if (!blessings.has(blessingType.blessing)) {
      blessings.set(blessingType.blessing, []);
    }
    blessings.get(blessingType.blessing)!.push(blessingType);
  }

  return (
    <div className="blessings-summary">
      {[...blessings.entries()].map(([type, list]) => (
        <div key={`cat_${Blessing[type]}`} className={`cat_${Blessing[type]}`}>
          {list.map((blessing) => (
            <BlessingSummary
              key={getBlessingKey(blessing)}
              girls={girls}
              blessing={blessing}
              excludeCommonRare={excludeCommonRare}
              filters={filters}
              toggleFilter={toggleFilter}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

function getBlessingKey(blessing: BlessingType): string {
  const enumType = Blessings.getEnumType(blessing.blessing);
  const blessingName = Blessings.toString(blessing.blessing);
  const blessingValue = enumType[blessing.blessingValue];

  return `${blessingName}-${blessingValue}`;
}

export interface BlessingsListProps {
  currentBlessing: BlessingDefinition[];
  nextBlessing: BlessingDefinition[];
  toggleFilter(blessingType: BlessingType[]): void;
}

export const BlessingsList: React.FC<BlessingsListProps> = ({
  currentBlessing,
  nextBlessing,
  toggleFilter
}) => {
  return (
    <div className="blessings-list">
      <div className="blessing-item active-blessing">
        <h4 onClick={() => toggleFilter(currentBlessing)}>Active blessing</h4>
        <BlessingItem blessing={currentBlessing} toggleFilter={toggleFilter} />
      </div>
      <div className="blessing-item next-blessing">
        <h4 onClick={() => toggleFilter(nextBlessing)}>Next blessing</h4>
        <BlessingItem blessing={nextBlessing} toggleFilter={toggleFilter} />
      </div>
    </div>
  );
};

export interface BlessingItemProps {
  blessing: BlessingDefinition[];
  toggleFilter(blessingType: BlessingType | BlessingType[]): void;
}

export const BlessingItem: React.FC<BlessingItemProps> = ({
  blessing,
  toggleFilter
}) => {
  return (
    <>
      {blessing.map((definition, i) => {
        const bonus = definition.blessingBonus;
        return (
          <p key={i} onClick={() => toggleFilter(definition)}>
            <BlessingAttributeDescription
              blessing={definition.blessing}
              blessingValue={definition.blessingValue}
            />{' '}
            : {bonus}%
          </p>
        );
      })}
    </>
  );
};

export const BlessingAttributeDescription: React.FC<BlessingType> = ({
  blessing,
  blessingValue
}) => {
  const name = Blessings.toString(blessing);
  const value = Blessings.stringValue(blessing, blessingValue);
  return (
    <span>
      {name} {value}
    </span>
  );
};

export interface GemsSummaryProps {
  girls: CommonGirlData[];
}

export const GemsSummary: React.FC<GemsSummaryProps> = ({ girls }) => {
  return (
    <div className="gems-summary">
      {Elements.values().map((element) => {
        const missingGemsAll = format(
          girls
            .filter((girl) => girl.own && girl.element === element)
            .map((girl) => girl.missingGems)
            .reduce((a, b) => a + b, 0)
        );
        const missingGemsELM = format(
          girls
            .filter(
              (girl) =>
                girl.own &&
                girl.rarity > Rarity.rare &&
                girl.element === element
            )
            .map((girl) => girl.missingGems)
            .reduce((a, b) => a + b, 0)
        );
        return (
          <div key={element}>
            <GemIcon element={element} />{' '}
            {missingGemsAll > missingGemsELM ? (
              <>
                <span title="Epic, Legendary & Mythic">{missingGemsELM}</span>{' '}
                <span title="All rarities">({missingGemsAll})</span>
              </>
            ) : (
              <>{missingGemsAll}</>
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface BlessingSummaryProps {
  blessing: BlessingType;
  girls: CommonGirlData[];
  excludeCommonRare: boolean;
  filters: QuickFilter[];
  toggleFilter: (blessing: BlessingType | BlessingType[]) => void;
}

export const BlessingSummary: React.FC<BlessingSummaryProps> = ({
  girls,
  blessing,
  excludeCommonRare,
  filters,
  toggleFilter
}) => {
  const matchingGirls = getMatchingGirls(girls, blessing, excludeCommonRare);
  const total = matchingGirls.length;
  const owned = matchingGirls.filter((g) => g.own).length;
  const blessingEnum = Blessings.getEnumType(blessing.blessing);

  const colorName =
    blessing.blessing === Blessing.EyeColor ||
    blessing.blessing === Blessing.HairColor
      ? blessingEnum[blessing.blessingValue]
      : blessing.blessing === Blessing.Rarity
      ? `rarity ${blessingEnum[blessing.blessingValue]}`
      : '';

  const blessingDescription =
    blessing.blessing === Blessing.Element ? (
      <span className="element-blessing">
        <ElementIcon element={blessing.blessingValue as Element} />
      </span>
    ) : blessing.blessing === Blessing.Pose ? (
      <span className="pose-blessing">
        <Tooltip
          tooltip={
            <span>{Poses.toDisplayString(blessing.blessingValue as Pose)}</span>
          }
        >
          {blessing.blessingValue === Pose.unknown ? (
            <span className="unknown-pose">?</span>
          ) : (
            <PoseIcon pose={blessing.blessingValue as Pose} />
          )}
        </Tooltip>
      </span>
    ) : (
      <span className="color">
        {Blessings.toString(blessing.blessing)}{' '}
        <span className={colorName}>
          {Blessings.toDisplayString(blessing.blessing, blessing.blessingValue)}
        </span>
      </span>
    );
  const styles: string[] = [];
  styles.push('blessing-summary-entry');

  const rarity = blessing.blessing === Blessing.Rarity;
  const unknownPose =
    blessing.blessing === Blessing.Pose &&
    blessing.blessingValue === Pose.unknown;
  const unknownEye =
    blessing.blessing === Blessing.EyeColor &&
    blessing.blessingValue === EyeColor.unknown;
  const unknownHair =
    blessing.blessing === Blessing.HairColor &&
    blessing.blessingValue === HairColor.unknown;

  if (!(rarity || unknownPose || unknownEye || unknownHair)) {
    const rareBlessing = total < 5;
    const missingGirls = owned < total && owned < 3;
    if (rareBlessing) {
      styles.push('rare-blessing');
    }
    if (missingGirls) {
      styles.push('missing-girls-blessing');
    }
  }

  styles.push('toggle-filter');
  styles.push(Blessing[blessing.blessing]);
  if (filters.find((f) => equalBlessing(f.blessing, blessing)) !== undefined) {
    styles.push('filter-enabled');
  }

  const blessingCount = (
    <span>
      <span className="owned">{owned}</span>/
      <span className="total">{total}</span>
    </span>
  );
  return (
    <div className={styles.join(' ')} onClick={() => toggleFilter([blessing])}>
      {blessingDescription} : {blessingCount}
    </div>
  );
};
