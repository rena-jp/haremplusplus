import React from 'react';
import { CommonGirlData, Traits, Blessings, Trait } from '../data/data';
import '../style/girls-skills.css';
import { Tooltip, TraitIcon } from './common';

export interface GirlTraitsProps {
  girl: CommonGirlData;
  setSingleTrait(trait: Trait): void;
}

export const GirlTraits = React.memo<GirlTraitsProps>(
  ({ girl, setSingleTrait }) => {
    const traitIcons = Traits.values().map((traitEnum) => {
      const blessing = Traits.toBlessing(traitEnum);
      const values = Blessings.getBlessingValue(girl, blessing);
      const value = Array.isArray(values) ? values[0] : values;
      const trait: Trait = { traitEnum, traitValue: value };

      return (
        <Tooltip
          tooltip={
            <span>
              {Blessings.toDisplayType(blessing)}:
              <br />
              {Blessings.toDisplayString(blessing, value)}
            </span>
          }
        >
          <span
            onClick={() => {
              setSingleTrait(trait);
            }}
          >
            <TraitIcon trait={trait} />
          </span>
        </Tooltip>
      );
    });
    return <div>{traitIcons}</div>;
  }
);
