import React from 'react';
import {
  CommonGirlData,
  Rarity,
  Element,
  HairColors,
  EyeColors,
  Poses,
  Zodiacs,
  EyeColor,
  HairColor
} from '../data/data';
import '../style/girls-skills.css';
import { Tooltip } from './common';
import { getDocumentHref } from '../migration';

export interface SkillTierListProps {
  girl: CommonGirlData;
}

export const SkillTierList = React.memo<SkillTierListProps>(({ girl }) => {
  return (
    <a
      className="skills-link"
      href={getDocumentHref(`/girl/${girl.id}?resource=skills`)}
    >
      <div className="skills_row">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <SkillWrapper girl={girl} tier={i + 1} key={i}></SkillWrapper>
          ))}
      </div>
    </a>
  );
});

const maxPointsPerTierMap = {
  [Rarity.starting]: [6, 6, 3, 3, 1],
  [Rarity.common]: [6, 6, 3, 3, 1],
  [Rarity.rare]: [6, 7, 3, 3, 2],
  [Rarity.epic]: [6, 8, 4, 4, 3],
  [Rarity.legendary]: [6, 9, 4, 4, 4],
  [Rarity.mythic]: [6, 10, 5, 5, 5]
};

export interface SkillWrapperProps {
  girl: CommonGirlData;
  tier: number;
}

const SkillWrapper: React.FC<SkillWrapperProps> = ({ girl, tier }) => {
  const skillTier = girl.skillTiers?.[tier];
  if (skillTier === undefined) return null;
  const { icon, icon_path, skill_points_used } = skillTier;
  const maxPoints = maxPointsPerTierMap[girl.rarity][tier - 1];
  const count = `${skill_points_used}${
    skill_points_used < maxPoints ? `/${maxPoints}` : ''
  }`;
  let tooltip = null;
  if (tier === 1) {
    if (girl.salary || girl.salaryPerHour) {
      const contents = [];
      if (girl.salary !== undefined) {
        contents.push(<br />, `${girl.salary}`);
      }
      if (girl.salaryPerHour !== undefined) {
        contents.push(<br />, `(${girl.salaryPerHour}/h)`);
      }
      if (contents.length > 0) tooltip = <span>Income:{contents}</span>;
    }
  }
  if (tier === 3) {
    switch (icon) {
      case 'hair_color': {
        const firstHairColor = girl.hairColor[0];
        const name = HairColors.toDisplayString(firstHairColor);
        const colorName = HairColor[firstHairColor];
        tooltip = (
          <span className="color">
            Hair Color:
            <br />
            <span className={colorName}>{name}</span>
          </span>
        );
        break;
      }
      case 'eye_color': {
        const firstEyeColor = girl.eyeColor[0];
        const name = EyeColors.toDisplayString(firstEyeColor);
        const colorName = EyeColor[firstEyeColor];
        tooltip = (
          <span className="color">
            Eye Color:
            <br />
            <span className={colorName}>{name}</span>
          </span>
        );
        break;
      }
      case 'figure': {
        const name = Poses.toDisplayString(girl.pose);
        tooltip = (
          <span>
            Favorite position
            <br />
            {name}
          </span>
        );
        break;
      }
      case 'zodiac': {
        const name = Zodiacs.toDisplayString(girl.zodiac);
        tooltip = (
          <span>
            Zodiac sign:
            <br />
            {name}
          </span>
        );
        break;
      }
    }
  }
  if (tier === 5) {
    switch (girl.element) {
      case Element.yellow:
      case Element.dark:
        tooltip = <span>Stun</span>;
        break;
      case Element.orange:
      case Element.white:
        tooltip = <span>Shield</span>;
        break;
      case Element.green:
      case Element.purple:
        tooltip = <span>Reflect</span>;
        break;
      case Element.red:
      case Element.blue:
        tooltip = <span>Execute</span>;
        break;
    }
  }
  const content = (
    <div className="skill-wrapper">
      <div className="skill-preview">
        <div className="main-skill-maxed"></div>
        <div
          className={`${icon}_icn`}
          style={{ backgroundImage: `url(${icon_path})` }}
        ></div>
      </div>
      <div className="count">{count}</div>
    </div>
  );
  return tooltip == null ? (
    content
  ) : (
    <Tooltip tooltip={tooltip}>{content}</Tooltip>
  );
};
