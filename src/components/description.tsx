import { ReactNode, useCallback, useMemo } from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  BlessingDefinition,
  CommonGirlData,
  EyeColor,
  getBlessedStats,
  HairColor,
  Pose,
  Quest,
  Stats,
  Zodiac
} from '../data/data';
import { RarityText } from './colors';
import {
  ElementIcon,
  format,
  formatTime,
  GemIcon,
  PoseIcon,
  StatsDescriptionTooltip,
  Tooltip
} from './common';

export interface GirlDescriptionProps {
  girl?: CommonGirlData;
  activeBlessing: BlessingDefinition[];
  nextBlessing: BlessingDefinition[];
  show0Pose: boolean;
  gameAPI: GameAPI;
}

export const GirlDescription: React.FC<GirlDescriptionProps> = ({
  girl,
  activeBlessing,
  nextBlessing,
  show0Pose,
  gameAPI
}) => {
  const poseImage = show0Pose ? girl?.poseImage0 : girl?.poseImage;

  const host = window.location.host;
  const domain = host.includes('localhost')
    ? 'https://www.hentaiheroes.com'
    : '.';

  const selectPose = useCallback(
    (pose: number) => {
      if (girl === undefined) {
        return;
      }
      gameAPI.changePose(girl, pose);
    },
    [gameAPI, girl]
  );

  return (
    <div className="qh_description">
      {girl === undefined ? (
        <p>Select a girl to see description</p>
      ) : (
        <>
          <div className="pose">
            <img src={poseImage} alt={girl.name} />
            <PoseSwitcher girl={girl} selectPose={selectPose} />
          </div>
          <div className="details">
            <p>
              <Tooltip delay={1500} tooltip={<span>ID: {girl.id}</span>}>
                Name: {girl.name}
              </Tooltip>
            </p>
            <p>Full Name: {girl.fullName}</p>
            <p className="general-attributes color">
              <RarityText rarity={girl.rarity} />
              <ElementIcon element={girl.element} />
              <ScenesBrowser
                girlId={girl.id}
                quests={girl.quests}
                domain={domain}
              />
            </p>
            {girl.stats || girl.pose !== Pose.unknown ? (
              <p className="pose-and-stats">
                <PoseIcon pose={girl.pose} />
                {girl.stats ? (
                  <StatsDetails
                    girl={girl}
                    baseStats={girl.stats}
                    currentBlessing={activeBlessing}
                    upcomingBlessing={nextBlessing}
                  />
                ) : null}
              </p>
            ) : null}
            {girl.recruited ? (
              <p>Recruited: {new Date(girl.recruited).toLocaleDateString()}</p>
            ) : null}
            <p>Zodiac: {Zodiac[girl.zodiac]}</p>
            <p className="color">
              Hair Color:{' '}
              {girl.hairColor
                .map((c) => HairColor[c])
                .map<ReactNode>((color) => (
                  <span key={color} className={color}>
                    {color}
                  </span>
                ))
                .reduce((a, b) => [a, ' & ', b])}
            </p>
            <p className="color">
              Eye Color:{' '}
              {girl.eyeColor
                .map((c) => EyeColor[c])
                .map<ReactNode>((color) => (
                  <span key={color} className={color}>
                    {color}
                  </span>
                ))
                .reduce((a, b) => [a, ' & ', b])}
            </p>
            {girl.missingAff > 0 ? (
              <p>
                Missing Affection: {format(girl.missingAff)}{' '}
                {/* <img
                  src="https://hh2.hh-content.com/pictures/items/K1.png"
                  style={{ height: '4ex' }}
                /> */}
              </p>
            ) : null}
            {girl.missingGXP > 0 ? (
              <p>
                Missing XP: {format(girl.missingGXP)}{' '}
                {/* <img
                  src="https://hh2.hh-content.com/pictures/items/XP1.png"
                  style={{ height: '4ex' }}
                /> */}
              </p>
            ) : null}
            {girl.missingGems > 0 ? (
              <p>
                Missing Gems: {format(girl.missingGems)}{' '}
                <GemIcon element={girl.element} />
              </p>
            ) : null}
            {girl.own ? (
              <>
                {/* 
                  https://www.hentaiheroes.com/girl/${girl.id}?resource=experience 
                  https://www.hentaiheroes.com/shop.html?type=potion&girl=${girl.id}
                */}
                <p>
                  <a
                    href={`${domain}/girl/${girl.id}?resource=experience`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Go to Girl's page
                  </a>{' '}
                  (GXP)
                </p>
                {/* 
                  https://www.hentaiheroes.com/girl/${girl.id}?resource=affection
                  https://www.hentaiheroes.com/shop.html?type=gift&girl=${girl.id}
                */}
                <p>
                  <a
                    href={`${domain}/girl/${girl.id}?resource=affection`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Go to Girl's page
                  </a>{' '}
                  (Aff)
                </p>
              </>
            ) : null}
            <p>
              Sources:{' '}
              {girl.sources.length === 0 ? 'unknown' : girl.sources.join(', ')}
            </p>
            {girl.own ? <LoreSection girl={girl} /> : null}
            <p>
              <a
                href={`${domain}/harem/${girl.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Go to original Harem
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export interface LoreSectionProps {
  girl: CommonGirlData;
}

export const LoreSection: React.FC<LoreSectionProps> = ({ girl }) => {
  const stars = girl.stars;
  return (
    <div className="lore">
      <>
        <p>
          Salary: {format(girl.salary!)} ({formatTime(girl.salaryTime!)})
        </p>
      </>
      {stars >= 1 ? (
        <>
          <p className="bio">{girl.bio}</p>
          <p>Location: {girl.location}</p>
          <p>Career: {girl.career}</p>
        </>
      ) : null}
      {stars >= 2 ? (
        <>
          <p>Favorite food: {girl.favoriteFood}</p>
        </>
      ) : null}
      {stars >= 3 ? (
        <>
          <p>Birthday: {girl.birthday}</p>
          <p>Hobby: {girl.hobby}</p>
          <p>Fetish: {girl.fetish}</p>
        </>
      ) : null}
    </div>
  );
};

export interface StatsProps {
  girl: CommonGirlData;
  baseStats: Stats;
  currentBlessing: BlessingDefinition[];
  upcomingBlessing: BlessingDefinition[];
}

export const StatsDetails: React.FC<StatsProps> = ({
  girl,
  baseStats,
  currentBlessing,
  upcomingBlessing
}) => {
  const currentStats = useMemo(
    () => getBlessedStats(girl, baseStats, currentBlessing),
    [girl, baseStats, currentBlessing]
  );
  const upcomingStats = useMemo(
    () => getBlessedStats(girl, baseStats, upcomingBlessing),
    [girl, baseStats, upcomingBlessing]
  );

  const potentialLevelMultiplier = 1 / (girl.level ?? 1);
  const potentialGradeMultiplier =
    (1 + 0.3 * girl.maxStars) / (1 + 0.3 * girl.stars);
  const potentialMultiplier =
    potentialLevelMultiplier * potentialGradeMultiplier;

  return (
    <>
      <StatsDescriptionTooltip
        baseStats={baseStats}
        currentStats={currentStats}
        upcomingStats={upcomingStats}
        potentialMultiplier={potentialMultiplier}
        statIcon={girl.class}
      />
    </>
  );
};

export interface PoseSwitcherProps {
  girl: CommonGirlData;
  selectPose(pose: number): void;
}

export const PoseSwitcher: React.FC<PoseSwitcherProps> = ({
  girl,
  selectPose
}) => {
  const stars = girl.stars;
  const maxStars = girl.maxStars;
  const currentStar = girl.currentIcon;

  return (
    <div className="pose-switcher">
      {[...Array(stars + 1)].map((_v, i) => (
        <PoseSelector
          key={`full_${i}`}
          kind="solid"
          current={i === currentStar}
          select={() => selectPose(i)}
        />
      ))}

      {[...Array(maxStars - stars)].map((_v, i) => (
        <PoseSelector key={`empty_${i}`} kind="empty" />
      ))}
    </div>
  );
};

interface PoseSelectorProps {
  kind: 'solid' | 'empty';
  current?: boolean;
  select?(): void;
}
const PoseSelector: React.FC<PoseSelectorProps> = ({
  kind,
  current,
  select
}) => {
  const className = `pose-selector ${kind}${current ? ' current' : ''}`;
  const onClick = current ? undefined : select;
  return <div className={className} onClick={onClick} />;
};

interface ScenesBrowserProps {
  girlId: string;
  quests: Quest[];
  domain: string;
}

const ScenesBrowser: React.FC<ScenesBrowserProps> = ({
  quests,
  domain,
  girlId
}) => {
  return quests ? (
    <span className="scenes-browser">
      {quests.map((quest) => (
        <QuestStep
          quest={quest}
          domain={domain}
          girlId={girlId}
          key={quest.idQuest}
        />
      ))}
    </span>
  ) : null;
};

interface QuestStepProps {
  girlId: string;
  quest: Quest;
  domain: string;
}

const QuestStep: React.FC<QuestStepProps> = ({ quest, domain, girlId }) => {
  const imgSrc = quest.ready
    ? 'https://hh2.hh-content.com/design_v2/affstar_upgrade.png'
    : quest.done
    ? 'https://hh2.hh-content.com/design_v2/affstar.png'
    : 'https://hh2.hh-content.com/design_v2/affstar_empty.png';
  const img = <img src={imgSrc} />;
  const link =
    quest.done || quest.ready
      ? `quest/${quest.idQuest}`
      : `girl/${girlId}?resource=affection`;
  return (
    <a href={`${domain}/${link}`} target="_blank" rel="noreferrer">
      {img}
    </a>
  );
};
