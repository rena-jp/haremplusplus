import { ReactNode, useCallback, useMemo, useState } from 'react';
import Popup from 'reactjs-popup';
import { GameAPI } from '../api/GameAPI';
import {
  BlessingDefinition,
  CommonGirlData,
  EyeColor,
  EyeColors,
  getBlessedStats,
  getSourceLabel,
  HairColor,
  HairColors,
  matchesBlessings,
  Pose,
  Quest,
  Stats,
  Zodiacs
} from '../data/data';
import { getGemsToAwaken, useGemsStats } from '../hooks/girl-gems-hooks';
import { useXpStats } from '../hooks/girl-xp-hooks';
import { RarityColorText } from './colors';
import {
  BookIcon,
  ElementIcon,
  format,
  formatTime,
  GemIcon,
  getDomain,
  GiftIcon,
  PoseIcon,
  SalaryIcon,
  StatsDescriptionTooltip,
  Tooltip
} from './common';
import { SimpleGirlTile } from './girl';
import { SceneViewer } from './scenes';
import { UpgradePage } from './upgrade';

export interface GirlDescriptionProps {
  allGirls: CommonGirlData[];
  girl?: CommonGirlData;
  activeBlessing: BlessingDefinition[];
  nextBlessing: BlessingDefinition[];
  show0Pose: boolean;
  gameAPI: GameAPI;
  selectGirl(girl: CommonGirlData): void;
  openUpgrade(page: UpgradePage): void;
}

export const GirlDescription: React.FC<GirlDescriptionProps> = ({
  girl,
  activeBlessing,
  nextBlessing,
  show0Pose,
  gameAPI,
  allGirls,
  selectGirl,
  openUpgrade
}) => {
  const poseImage = show0Pose ? girl?.poseImage0 : girl?.poseImage;

  const domain = getDomain();

  const selectPose = useCallback(
    (pose: number) => {
      if (girl === undefined) {
        return;
      }
      gameAPI.changePose(girl, pose);
    },
    [gameAPI, girl]
  );

  const [activeTab, setActiveTab] = useState<'stats' | 'lore' | 'variations'>(
    'stats'
  );

  const visibleTab =
    girl === undefined
      ? 'none'
      : activeTab === 'lore' && girl.own
      ? 'lore'
      : activeTab === 'variations' &&
        girl.variations &&
        girl.variations.length > 1
      ? 'variations'
      : 'stats';

  return (
    <>
      {girl === undefined ? (
        <p>Select a girl to see description</p>
      ) : (
        <>
          <div className="pose">
            <img src={poseImage} alt={girl.name} />
            <PoseSwitcher girl={girl} selectPose={selectPose} />
          </div>
          <div className="details">
            <div className="details-header general-attributes color">
              <RarityColorText rarity={girl.rarity}>
                <Tooltip delay={1500} tooltip={<span>ID: {girl.id}</span>}>
                  {girl.name}
                </Tooltip>
              </RarityColorText>
              <ElementIcon element={girl.element} />
              <ScenesBrowser
                girl={girl}
                quests={girl.quests}
                gameAPI={gameAPI}
                domain={domain}
              />
            </div>
            <div className="section-switch">
              <span
                onClick={() => setActiveTab('stats')}
                className={visibleTab === 'stats' ? 'active' : 'inactive'}
              >
                Stats
              </span>
              {girl.own && (
                <span
                  onClick={() => setActiveTab('lore')}
                  className={visibleTab === 'lore' ? 'active' : 'inactive'}
                >
                  Description
                </span>
              )}
              {girl.variations && girl.variations.length > 1 && (
                <span
                  onClick={() => setActiveTab('variations')}
                  className={
                    visibleTab === 'variations' ? 'active' : 'inactive'
                  }
                >
                  Variations
                </span>
              )}
            </div>
            <div className="details-content">
              {visibleTab === 'lore' ? (
                <LoreSection girl={girl} />
              ) : visibleTab === 'variations' ? (
                <VariationsList
                  allGirls={allGirls}
                  variations={girl.variations!}
                  selectGirl={selectGirl}
                  selectedGirl={girl}
                  show0Pose={show0Pose}
                />
              ) : (
                <BlessingSection
                  girl={girl}
                  currentBlessing={activeBlessing}
                  upcomingBlessing={nextBlessing}
                  domain={domain}
                  openUpgrade={openUpgrade}
                />
              )}
              <p>
                <a href={`${domain}/harem/${girl.id}`} rel="noreferrer">
                  Go to original Harem
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export interface BlessingSectionProps {
  domain: string;
  girl: CommonGirlData;
  currentBlessing: BlessingDefinition[];
  upcomingBlessing: BlessingDefinition[];
  openUpgrade(page: UpgradePage): void;
}

export const BlessingSection: React.FC<BlessingSectionProps> = ({
  domain,
  girl,
  currentBlessing,
  upcomingBlessing,
  openUpgrade
}) => {
  const xpStats = useXpStats(girl, undefined);

  return (
    <div className="details-section stats">
      <p>Full Name: {girl.fullName}</p>
      {girl.stats || girl.pose !== Pose.unknown ? (
        <p className="pose-and-stats">
          <PoseIcon pose={girl.pose} />
          {girl.stats ? (
            <StatsDetails
              girl={girl}
              baseStats={girl.stats}
              currentBlessing={currentBlessing}
              upcomingBlessing={upcomingBlessing}
            />
          ) : null}
        </p>
      ) : null}
      {girl.recruited ? (
        <p>Recruited: {new Date(girl.recruited).toLocaleDateString()}</p>
      ) : null}
      <p>Zodiac: {Zodiacs.toDisplayString(girl.zodiac)}</p>
      <p className="color">
        Hair Color:{' '}
        {girl.hairColor
          .map<ReactNode>((color) => (
            <span key={color} className={HairColor[color]}>
              {HairColors.toDisplayString(color)}
            </span>
          ))
          .reduce((a, b) => [a, ' & ', b])}
      </p>
      <p className="color">
        Eye Color:{' '}
        {girl.eyeColor
          .map<ReactNode>((color) => (
            <span key={color} className={EyeColor[color]}>
              {EyeColors.toDisplayString(color)}
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
      {xpStats.xpToMax > 0 ? (
        <p>
          Missing XP: {format(xpStats.xpToMax)}{' '}
          {/* <img
                  src="https://hh2.hh-content.com/pictures/items/XP1.png"
                  style={{ height: '4ex' }}
                /> */}
        </p>
      ) : null}
      <MissingGemsEntry girl={girl} />
      {girl.own ? (
        <>
          {/* 
                  https://www.hentaiheroes.com/girl/${girl.id}?resource=experience 
                  https://www.hentaiheroes.com/shop.html?type=potion&girl=${girl.id}
                */}
          <p>
            <a
              href={`${domain}/girl/${girl.id}?resource=experience`}
              rel="noreferrer"
              className="icon-link"
              onClick={(ev) => {
                ev.preventDefault();
                openUpgrade('books');
              }}
            >
              Give books <BookIcon />
            </a>
          </p>
          {/* 
                  https://www.hentaiheroes.com/girl/${girl.id}?resource=affection
                  https://www.hentaiheroes.com/shop.html?type=gift&girl=${girl.id}
                */}
          <p>
            <a
              href={`${domain}/girl/${girl.id}?resource=affection`}
              rel="noreferrer"
              className="icon-link"
              onClick={(ev) => {
                ev.preventDefault();
                openUpgrade('gifts');
              }}
            >
              Give gifts <GiftIcon />
            </a>
          </p>
        </>
      ) : null}
      <p>
        Sources:{' '}
        {girl.sources.length === 0
          ? 'Unknown'
          : girl.sources.map((es) => getSourceLabel(es)).join(', ')}
      </p>
    </div>
  );
};

interface MissingGemsEntry {
  girl: CommonGirlData;
}

const MissingGemsEntry: React.FC<MissingGemsEntry> = ({ girl }) => {
  const gemsStats = useGemsStats(girl);
  return gemsStats.gemsToMax > 0 ? (
    gemsStats.gemsToMax > gemsStats.gemsToNextCap ? (
      <p className="missing-gems">
        <Tooltip tooltip={<MissingGemsDetails girl={girl} />}>
          Missing gems: {format(gemsStats.gemsToMax)}{' '}
          <GemIcon element={girl.element} />
        </Tooltip>
      </p>
    ) : (
      <p className="missing-gems">
        Missing gems: {format(gemsStats.gemsToMax)}{' '}
        <GemIcon element={girl.element} />
      </p>
    )
  ) : null;
};

const MissingGemsDetails: React.FC<MissingGemsEntry> = ({ girl }) => {
  const levels = [];
  for (let i = girl.maxLevel ?? 250; i < 750; i += 50) {
    levels.push(i);
  }
  return (
    <div className="missing-gems-details">
      {levels.map((levelCap) => {
        const targetCap = levelCap + 50;
        const gems = getGemsToAwaken(girl, levelCap);
        return (
          <>
            <div>To Lv. {targetCap}:</div>
            <div className="gems-count">{format(gems)}</div>
            <div>
              <GemIcon element={girl.element} />
            </div>
          </>
        );
      })}
      <div className="row-separator" />
      <div>Total:</div>
      <div className="gems-count">{format(girl.missingGems)}</div>
      <div>
        <GemIcon element={girl.element} />
      </div>
    </div>
  );
};

export interface LoreSectionProps {
  girl: CommonGirlData;
}

export const LoreSection: React.FC<LoreSectionProps> = ({ girl }) => {
  const stars = girl.stars;
  return (
    <div className="details-section lore">
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
      <>
        <p>
          Salary: {format(girl.salary!)} <SalaryIcon /> (
          {formatTime(girl.salaryTime!)})
        </p>
      </>
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

  const blessed =
    matchesBlessings(girl, currentBlessing) ||
    matchesBlessings(girl, upcomingBlessing);

  const potentialLevelMultiplier = 1 / (girl.level ?? 1);
  const potentialGradeMultiplier =
    (1 + 0.3 * girl.maxStars) / (1 + 0.3 * girl.stars);
  const potentialMultiplier =
    potentialLevelMultiplier * potentialGradeMultiplier;

  return (
    <>
      <StatsDescriptionTooltip
        baseStats={baseStats}
        blessed={blessed}
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
  girl: CommonGirlData;
  quests: Quest[];
  domain: string;
  gameAPI: GameAPI;
}

const ScenesBrowser: React.FC<ScenesBrowserProps> = ({
  quests,
  domain,
  girl,
  gameAPI
}) => {
  const displayQuests: (Quest | undefined)[] =
    quests.length < girl.maxStars
      ? Array(girl.maxStars).fill(undefined)
      : quests;

  return (
    <span className="scenes-browser">
      {displayQuests.map((quest, index) => (
        <QuestStep
          quest={quest}
          domain={domain}
          step={index}
          girl={girl}
          gameAPI={gameAPI}
          key={quest?.idQuest ?? index}
        />
      ))}
    </span>
  );
};

interface QuestStepProps {
  girl: CommonGirlData;
  gameAPI: GameAPI;
  quest?: Quest;
  step: number;
  domain: string;
}

const QuestStep: React.FC<QuestStepProps> = ({
  quest,
  domain,
  girl,
  step,
  gameAPI
}) => {
  if (quest) {
    const imgSrc = quest.ready
      ? 'https://hh2.hh-content.com/design_v2/affstar_upgrade.png'
      : quest.done
      ? 'https://hh2.hh-content.com/design_v2/affstar.png'
      : 'https://hh2.hh-content.com/design_v2/affstar_empty.png';
    const img = <img src={imgSrc} />;
    const link =
      quest.done || quest.ready
        ? `quest/${quest.idQuest}`
        : `girl/${girl.id}?resource=affection`;

    const [openUpgradePopup, setOpenUpgradePopup] = useState(false);

    return (
      <>
        <a
          href={`${domain}/${link}`}
          rel="noreferrer"
          onClick={(ev) => {
            if (quest.ready || quest.done) {
              // If the quest is ready or done, show the scene in a popup (Unless
              // the user explicitly opens link in a new tab).
              // Otherwise, simply link to the girl page to spend gifts.
              setOpenUpgradePopup(true);
              ev.preventDefault();
            }
          }}
        >
          {img}
        </a>
        {quest.ready || quest.done ? (
          <Popup
            modal
            open={openUpgradePopup}
            onClose={() => setOpenUpgradePopup(false)}
          >
            {
              <SceneViewer
                girl={girl}
                scene={step}
                gameAPI={gameAPI}
                close={() => {
                  setOpenUpgradePopup(false);
                }}
              />
            }
          </Popup>
        ) : null}
      </>
    );
  } else {
    return <img src="https://hh2.hh-content.com/design_v2/affstar_empty.png" />;
  }
};

export interface VariationsListProps {
  allGirls: CommonGirlData[];
  variations: string[];
  selectGirl(girl: CommonGirlData): void;
  selectedGirl: CommonGirlData;
  show0Pose: boolean;
}

export const VariationsList: React.FC<VariationsListProps> = ({
  allGirls,
  variations,
  selectedGirl,
  selectGirl,
  show0Pose
}) => {
  return (
    <div className="variations-list">
      {variations.map((variantId) => {
        const girl = allGirls.find((girl) => girl.id === variantId);
        if (!girl) {
          return null;
        }
        return (
          <VariationTile
            key={girl.id}
            girl={girl}
            selectGirl={selectGirl}
            selected={selectedGirl.id === girl.id}
            show0Pose={show0Pose}
          />
        );
      })}
    </div>
  );
};

export interface VariationTileProps {
  girl: CommonGirlData;
  selectGirl(girl: CommonGirlData): void;
  selected: boolean;
  show0Pose: boolean;
}

export const VariationTile: React.FC<VariationTileProps> = ({
  girl,
  selectGirl,
  selected,
  show0Pose
}) => {
  const onClick = useCallback(() => selectGirl(girl), [girl]);
  return (
    <SimpleGirlTile
      girl={girl}
      onClick={onClick}
      show0Pose={show0Pose}
      selected={selected}
    />
  );
};
