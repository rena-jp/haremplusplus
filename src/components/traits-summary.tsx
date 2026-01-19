import React, { useMemo } from 'react';
import {
  allTraits,
  Blessing,
  Blessings,
  CommonGirlData,
  EyeColor,
  EyeColors,
  EyeColorTrait,
  HairColor,
  HairColors,
  HairColorTrait,
  matchesTraits,
  Pose,
  Poses,
  PoseTrait,
  TraitEnum,
  Traits,
  Trait,
  Zodiacs,
  ZodiacTrait
} from '../data/data';
import '../style/harem.css';
import { TraitIcon } from './common';
import { PanelProps } from './panels';
import {
  TraitsFilterState,
  isTraitsFilterActive
} from '../hooks/traits-filter-hooks';

export interface TraitsSummaryProps extends PanelProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  traitsFilterState: TraitsFilterState;
}

export const TraitsSummary = React.memo<TraitsSummaryProps>(
  ({ allGirls, filteredGirls, traitsFilterState, visible }) => {
    const className = `panel ${visible ? 'visible' : 'hidden'}`;

    return (
      <div className={className}>
        <div className="manage-filters">
          <button
            className="hh-action-button"
            disabled={!isTraitsFilterActive(traitsFilterState.traitsFilter)}
            onClick={() => {
              traitsFilterState.clearTraits();
            }}
          >
            Clear filters
          </button>
        </div>
        <div>
          <p>
            <label htmlFor="traitSkillMatching">
              Include girls who don't have matching skills:{' '}
            </label>
            <input
              id="traitSkillMatching"
              type="checkbox"
              onChange={traitsFilterState.toggleFilterBySkill3}
              checked={!traitsFilterState.traitsFilter.filterBySkill3}
            />
          </p>
          <TraitSummaries
            allGirls={allGirls}
            filteredGirls={filteredGirls}
            traitsFilterState={traitsFilterState}
          />
        </div>
      </div>
    );
  }
);

const allTraitsMap: Map<TraitEnum, Trait[]> = (() => {
  const map = new Map();
  for (const trait of allTraits()) {
    let traits = map.get(trait.traitEnum);
    if (traits === undefined) {
      traits = [];
      map.set(trait.traitEnum, traits);
    }
    traits.push(trait);
  }
  return map;
})();

interface TraitSummariesProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  traitsFilterState: TraitsFilterState;
}

const TraitSummaries: React.FC<TraitSummariesProps> = ({
  allGirls,
  filteredGirls,
  traitsFilterState
}) => {
  return (
    <div className="blessings-summary">
      {[...allTraitsMap.entries()].map(([traitEnum, traits]) => {
        const blessing = Traits.toBlessing(traitEnum);
        return (
          <div
            key={`cat_${Blessing[blessing]}`}
            className={`cat_${Blessing[blessing]}`}
          >
            <h2>{Blessings.toDisplayType(blessing)}</h2>
            {traits.map((trait) => (
              <TraitSummary
                key={getTraitKey(trait)}
                allGirls={allGirls}
                filteredGirls={filteredGirls}
                trait={trait}
                traitsFilterState={traitsFilterState}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

function getTraitKey(trait: Trait): string {
  const blessing = Traits.toBlessingType(trait);
  const enumType = Blessings.getEnumType(blessing.blessing);
  const blessingName = Blessings.toString(blessing.blessing);
  const blessingValue = enumType[blessing.blessingValue];

  return `${blessingName}-${blessingValue}`;
}

interface TraitSummaryProps {
  trait: Trait;
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  traitsFilterState: TraitsFilterState;
}

const TraitSummary: React.FC<TraitSummaryProps> = ({
  allGirls,
  filteredGirls,
  trait,
  traitsFilterState
}) => {
  const isValid = useMemo(() => {
    return allGirls.some((girl) => matchesTraits(girl, [trait], false));
  }, [allGirls, trait]);
  const filter = traitsFilterState.traitsFilter;
  const newTraits = { ...filter.traits, [trait.traitEnum]: trait };
  const traitsArray = Traits.values().map((key) => newTraits[key]);
  const matchingGirls = useMemo(() => {
    return filteredGirls.filter((girl) =>
      matchesTraits(
        girl,
        traitsArray.filter((e): e is Trait => e !== undefined),
        filter.filterBySkill3
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGirls, filter.filterBySkill3, ...traitsArray]);
  if (!isValid) return null;

  let traitDescription;
  switch (trait.traitEnum) {
    case TraitEnum.HairColor:
      traitDescription = <HairColorLabel trait={trait} />;
      break;
    case TraitEnum.EyeColor:
      traitDescription = <EyeColorLabel trait={trait} />;
      break;
    case TraitEnum.Zodiac:
      traitDescription = <ZodiacLabel trait={trait} />;
      break;
    case TraitEnum.Pose:
      traitDescription = <PoseLabel trait={trait} />;
      break;
  }

  const total = matchingGirls.length;
  const owned = matchingGirls.filter((g) => g.own).length;
  const blessing = Traits.toBlessingType(trait);

  const styles: string[] = [];
  styles.push('blessing-summary-entry');

  const unknownPose =
    blessing.blessing === Blessing.Pose &&
    blessing.blessingValue === Pose.unknown;
  const unknownEye =
    blessing.blessing === Blessing.EyeColor &&
    blessing.blessingValue === EyeColor.unknown;
  const unknownHair =
    blessing.blessing === Blessing.HairColor &&
    blessing.blessingValue === HairColor.unknown;

  if (!(unknownPose || unknownEye || unknownHair)) {
    const rareBlessing = total <= 0;
    const missingGirls = owned < total && owned <= 0;
    if (rareBlessing) {
      styles.push('rare-blessing');
    }
    if (missingGirls) {
      styles.push('missing-girls-blessing');
    }
  }

  styles.push('toggle-filter');
  styles.push(Blessing[blessing.blessing]);
  if (filter.traits[trait.traitEnum]?.traitValue === trait.traitValue) {
    styles.push('filter-enabled');
  }

  return (
    <div
      className={styles.join(' ')}
      onClick={() => {
        traitsFilterState.toggleMultipleTraits(trait);
      }}
    >
      {traitDescription} : <Counter owned={owned} total={total} />
    </div>
  );
};

const HairColorLabel = React.memo<{ trait: HairColorTrait }>(({ trait }) => (
  <>
    <TraitIcon trait={trait} />
    <ColorTextLabel
      text={HairColors.toDisplayString(trait.traitValue)}
      colorName={HairColor[trait.traitValue]}
    />
  </>
));

const EyeColorLabel = React.memo<{ trait: EyeColorTrait }>(({ trait }) => (
  <>
    <TraitIcon trait={trait} />
    <ColorTextLabel
      text={EyeColors.toDisplayString(trait.traitValue)}
      colorName={EyeColor[trait.traitValue]}
    />
  </>
));

const ZodiacLabel = React.memo<{ trait: ZodiacTrait }>(({ trait }) => (
  <>
    <TraitIcon trait={trait} />
    <ColorTextLabel
      text={Zodiacs.toDisplayString(trait.traitValue)}
      colorName=""
    />
  </>
));

const PoseLabel = React.memo<{ trait: PoseTrait }>(({ trait }) => (
  <span>
    {trait.traitValue === Pose.unknown ? (
      <span className="trait-icon" />
    ) : (
      <TraitIcon trait={trait} />
    )}
    <span>{Poses.toDisplayString(trait.traitValue)}</span>
  </span>
));

const ColorTextLabel = React.memo<{ text: string; colorName: string }>(
  ({ text, colorName }) => (
    <span className="color">
      <span className={colorName}>{text}</span>
    </span>
  )
);

const Counter = React.memo<{ owned: number; total: number }>(
  ({ owned, total }) => (
    <span>
      <span className="owned">{owned}</span>/
      <span className="total">{total}</span>
    </span>
  )
);
