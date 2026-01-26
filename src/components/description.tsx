import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import Popup from 'reactjs-popup';
import { GameAPI } from '../api/GameAPI';
import {
  BlessingDefinition,
  CommonGirlData,
  EyeColor,
  EyeColors,
  getBlessedStats,
  getBlessingMultiplier,
  getPentaDrillStats,
  getSourceLabel,
  HairColor,
  HairColors,
  matchesBlessings,
  Pose,
  Quest,
  Stats,
  Trait,
  Zodiacs
} from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import {
  getMissingAffection,
  useAffectionStats
} from '../hooks/girl-aff-hooks';
import { getGemsToAwaken, useGemsStats } from '../hooks/girl-gems-hooks';
import { getMissingGXPToCap, useXpStats } from '../hooks/girl-xp-hooks';
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
  ProgressBar,
  SalaryIcon,
  StatsDescriptionTooltip,
  Tooltip,
  getContentHost,
  RoleIcon,
  SkillIcon,
  LabyrinthSkillIcon
} from './common';
import { SimpleGirlTile } from './girl';
import { SceneViewer } from './scenes';
import { UpgradePage } from './upgrade';
import { EquipmentList } from './girls-equipment';
import { SkillTierList } from './girls-skills';
import { GirlTraits } from './girls-traits';
import { getDocumentHref } from '../migration';
import { GradeSkin } from '../data/game-data';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useAtomValue } from 'jotai';
import { showPose0Atom } from '../data/atoms';

export interface GirlDescriptionProps {
  /**
   * All girls.
   */
  allGirls: CommonGirlData[];
  /**
   * All girls visible with the current filter. Used
   * to populate the Equipment Inventory.
   */
  listGirls: CommonGirlData[];
  /**
   * The currently selected girl (optional)
   */
  girl?: CommonGirlData | undefined;
  activeBlessing: BlessingDefinition[];
  nextBlessing: BlessingDefinition[];
  selectGirl(girl: CommonGirlData): void;
  openUpgrade(page: UpgradePage): void;
  setSingleTrait(trait: Trait): void;
}

export const GirlDescription: React.FC<GirlDescriptionProps> = ({
  girl,
  activeBlessing,
  nextBlessing,
  allGirls,
  listGirls,
  selectGirl,
  openUpgrade,
  setSingleTrait
}) => {
  const showPose0 = useAtomValue<boolean>(showPose0Atom);
  const poseImage = (
    showPose0 ? girl?.poseImage0 : girl?.poseImage
  )?.toImageUrl('ava');
  const gameAPI = useContext(GameAPIContext).gameAPI!;

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

  const changeGradeSkin = useCallback(
    (skin: GradeSkin) => {
      if (girl === undefined) {
        return;
      }
      gameAPI.changeGradeSkin(girl, skin);
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
            <PoseSwitcher
              girl={girl}
              selectPose={selectPose}
              changeGradeSkin={changeGradeSkin}
            />
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
                />
              ) : (
                <BlessingSection
                  girl={girl}
                  listGirls={listGirls}
                  allGirls={allGirls}
                  currentBlessing={activeBlessing}
                  upcomingBlessing={nextBlessing}
                  domain={domain}
                  openUpgrade={openUpgrade}
                  setSingleTrait={setSingleTrait}
                />
              )}
              <p>
                <a
                  href={getDocumentHref(`${domain}/characters/${girl.id}`)}
                  rel="noreferrer"
                >
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
  listGirls: CommonGirlData[];
  allGirls: CommonGirlData[];
  currentBlessing: BlessingDefinition[];
  upcomingBlessing: BlessingDefinition[];
  openUpgrade(page: UpgradePage): void;
  setSingleTrait(trait: Trait): void;
}

export const BlessingSection: React.FC<BlessingSectionProps> = ({
  domain,
  girl,
  listGirls,
  allGirls,
  currentBlessing,
  upcomingBlessing,
  openUpgrade,
  setSingleTrait
}) => {
  return (
    <div className="details-section stats">
      <p>Full Name: {girl.fullName}</p>
      <div className="pose-and-stats">
        {girl.pose !== Pose.unknown && <PoseIcon pose={girl.pose} />}
        {girl.stats && (
          <StatsDetails
            girl={girl}
            baseStats={girl.stats}
            currentBlessing={currentBlessing}
            upcomingBlessing={upcomingBlessing}
          />
        )}
        {girl.id_role != null && (
          <PentaDrillStats girl={girl} currentBlessing={currentBlessing} />
        )}
        {girl.maxStars >= 5 && (
          <>
            <SkillIcon element={girl.element} />
            <LabyrinthSkillIcon element={girl.element} />
          </>
        )}
      </div>
      {girl.equipment !== undefined ? (
        <>
          <p>Equipment:</p>
          <EquipmentList
            equipment={girl.equipment}
            girl={girl}
            listGirls={listGirls}
            allGirls={allGirls}
          />
        </>
      ) : null}
      {girl.skillTiers !== undefined ? (
        <>
          <p>Skills:</p>
          <SkillTierList girl={girl} />
        </>
      ) : null}
      <p>Traits:</p>
      <GirlTraits girl={girl} setSingleTrait={setSingleTrait} />
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

      <MissingGemsEntry girl={girl} />
      {girl.own ? (
        <>
          <div className="upgrade-link">
            <a
              href={getDocumentHref(
                `${domain}/girl/${girl.id}?resource=experience`
              )}
              rel="noreferrer"
              className="icon-link"
              onClick={(ev) => {
                ev.preventDefault();
                openUpgrade('books');
              }}
            >
              <MissingGXPEntry girl={girl} />
              <Tooltip tooltip="Give Books">
                <BookIcon />
              </Tooltip>
            </a>
          </div>
          <div className="upgrade-link">
            <a
              href={getDocumentHref(
                `${domain}/girl/${girl.id}?resource=affection`
              )}
              rel="noreferrer"
              className="icon-link"
              onClick={(ev) => {
                ev.preventDefault();
                openUpgrade('gifts');
              }}
            >
              <MissingAffEntry girl={girl} />
              <Tooltip tooltip="Give Gifts">
                <GiftIcon />
              </Tooltip>
            </a>
          </div>
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

interface GirlStatsEntry {
  girl: CommonGirlData;
}

const MissingAffEntry: React.FC<GirlStatsEntry> = ({ girl }) => {
  const affStats = useAffectionStats(girl, undefined);

  const progressBar = (
    <ProgressBar
      curr={affStats.currentAff}
      min={0}
      max={affStats.affToMax}
      extra={affStats.affGain}
      label={
        girl.stars === girl.maxStars
          ? 'Max.'
          : affStats.currentAff === affStats.affToMax
            ? 'Ready'
            : format(affStats.affToMax - affStats.currentAff) + ' Aff'
      }
    />
  );

  return girl.missingAff > 0 ? (
    <div>
      <Tooltip tooltip={<MissingAffDetails girl={girl} />}>
        {progressBar}
      </Tooltip>
    </div>
  ) : (
    <div>{progressBar}</div>
  );
};

const MissingGXPEntry: React.FC<GirlStatsEntry> = ({ girl }) => {
  const xpStats = useXpStats(girl, undefined);

  const progressBar = (
    <ProgressBar
      curr={xpStats.currentXp}
      min={0}
      max={xpStats.currentXp + xpStats.xpToMax}
      extra={xpStats.xpGain}
      label={xpStats.xpToMax === 0 ? 'Max.' : format(xpStats.xpToMax) + ' XP'}
    />
  );

  return xpStats.xpToMax > 0 ? (
    <div>
      <Tooltip tooltip={<MissingGXPDetails girl={girl} />}>
        {progressBar}
      </Tooltip>
    </div>
  ) : (
    <div>{progressBar}</div>
  );
};

const MissingGemsEntry: React.FC<GirlStatsEntry> = ({ girl }) => {
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

const MissingAffDetails: React.FC<GirlStatsEntry> = ({ girl }) => {
  const grades: number[] = [];
  for (let i = girl.stars; i < girl.maxStars; i++) {
    grades.push(i + 1);
  }
  return (
    <div className="missing-aff-details">
      {grades.map((grade) => {
        const missingAff = getMissingAffection(girl, grade);
        return (
          <>
            <div>To Grade {grade}:</div>
            <div className="missing-affection">{format(missingAff)}</div>
          </>
        );
      })}
      <div className="row-separator" />
      <div>Total:</div>
      <div className="missing-affection">{format(girl.missingAff)}</div>
    </div>
  );
};

const MissingGXPDetails: React.FC<GirlStatsEntry> = ({ girl }) => {
  const levels = [];
  for (let i = girl.maxLevel ?? 250; i <= 750; i += 50) {
    levels.push(i);
  }
  const xpStats = useXpStats(girl, undefined);
  return (
    <div className="missing-gxp-details">
      {levels.map((levelCap) => {
        const targetCap = levelCap;
        const gxp = getMissingGXPToCap(girl, levelCap);
        return (
          <React.Fragment key={levelCap}>
            <div>To Lv. {targetCap}:</div>
            <div className="missing-gxp">{format(gxp)}</div>
          </React.Fragment>
        );
      })}
      <div className="row-separator" />
      <div>Total:</div>
      <div className="missing-gxp">{format(xpStats.xpToMax)}</div>
    </div>
  );
};

const MissingGemsDetails: React.FC<GirlStatsEntry> = ({ girl }) => {
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
          <React.Fragment key={targetCap}>
            <div>To Lv. {targetCap}:</div>
            <div className="gems-count">{format(gems)}</div>
            <div>
              <GemIcon element={girl.element} />
            </div>
          </React.Fragment>
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
  const currentBlessingMultiplier = getBlessingMultiplier(
    girl,
    currentBlessing
  );
  const upcomingBlessingMultiplier = getBlessingMultiplier(
    girl,
    upcomingBlessing
  );

  return (
    <>
      <StatsDescriptionTooltip
        baseStats={baseStats}
        blessed={blessed}
        currentStats={currentStats}
        upcomingStats={upcomingStats}
        potentialMultiplier={potentialMultiplier}
        statIcon={girl.class}
        currentBlessingMultiplier={currentBlessingMultiplier}
        upcomingBlessingMultiplier={upcomingBlessingMultiplier}
      />
    </>
  );
};

export interface PentaDrillStatsProps {
  girl: CommonGirlData;
  currentBlessing: BlessingDefinition[];
}

export const PentaDrillStats: React.FC<PentaDrillStatsProps> = ({
  girl,
  currentBlessing
}) => {
  const { id_role } = girl;
  if (id_role == null) return null;

  const stats = getPentaDrillStats(girl, currentBlessing);
  if (stats == null) return null;

  const name = window.GT.design[`girl_role_${id_role}_name`];
  // const description = window.GT.design[`girl_role_${id_role}_pvp4`];

  return (
    <Tooltip
      place="bottom"
      tooltip={
        <div>
          {name}
          <hr />
          <div style={{ display: 'inline-block' }}>
            <div {...{ carac: 'ego' }}>{format(stats.ego)}</div>
            <div {...{ carac: 'chance' }}>{format(stats.chance)}</div>
            <div {...{ carac: 'damage' }}>{format(stats.damage)}</div>
            <div {...{ carac: 'def0' }}>{format(stats.defense)}</div>
          </div>
          <div style={{ display: 'inline-block' }}>
            <div {...{ carac: 'mana' }}>{format(stats.mana_starting)}</div>
            <div {...{ carac: 'mana-generation' }}>
              {format(stats.mana_generation)}
            </div>
            <div {...{ carac: 'speed' }}>{format(stats.speed)}</div>
            <div>&nbsp;</div>
          </div>
        </div>
      }
    >
      <RoleIcon roleId={id_role} />
    </Tooltip>
  );
};

export interface PoseSwitcherProps {
  girl: CommonGirlData;
  selectPose(pose: number): void;
  changeGradeSkin(skin: GradeSkin): void;
}

export const PoseSwitcher: React.FC<PoseSwitcherProps> = ({
  girl,
  selectPose,
  changeGradeSkin
}) => {
  const stars = girl.stars;
  const maxStars = girl.maxStars;
  const currentStar = girl.currentIcon;
  const skinSelected =
    girl.gradeSkins?.some((e) => e.is_selected === 1) ?? false;

  return (
    <>
      <div className="pose-switcher">
        {[...Array(stars + 1)].map((_v, i) => (
          <PoseSelector
            key={`full_${i}`}
            kind="solid"
            current={!skinSelected && i === currentStar}
            select={() => selectPose(i)}
          />
        ))}

        {[...Array(maxStars - stars)].map((_v, i) => (
          <PoseSelector key={`empty_${i}`} kind="empty" />
        ))}
      </div>

      <div className="pose-switcher">
        {girl.gradeSkins
          ?.sort((x, y) => y.num_order - x.num_order)
          .filter((e) => e.is_released)
          .map((e, i) =>
            e.is_owned ? (
              <PoseSelector
                key={`skin_full_${i}`}
                kind="solid"
                current={e.is_selected === 1}
                select={() => changeGradeSkin(e)}
                tooltip={e.grade_skin_name}
              />
            ) : (
              <PoseSelector
                key={`skin_empty_${i}`}
                kind="empty"
                tooltip={`${e.grade_skin_name}<br/><span class="skin-shards skins_shard_icn"></span> ${e.shards_count ?? 0} / 33`}
              />
            )
          )}
      </div>

      <ReactTooltip
        id="skin-tooltip"
        className="qh-tooltip"
        classNameArrow="qh-tooltip-arrow"
      />
    </>
  );
};

interface PoseSelectorProps {
  kind: 'solid' | 'empty';
  current?: boolean;
  select?(): void;
  tooltip?: string;
}
const PoseSelector: React.FC<PoseSelectorProps> = ({
  kind,
  current,
  select,
  tooltip
}) => {
  const className = `pose-selector ${kind}${current ? ' current' : ''}`;
  const onClick = current ? undefined : select;
  return tooltip == null ? (
    <div className={className} onClick={onClick} />
  ) : (
    <div
      className={className}
      onClick={onClick}
      data-tooltip-id="skin-tooltip"
      data-tooltip-html={tooltip}
    />
  );
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
  quest?: Quest | undefined;
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
  const [openUpgradePopup, setOpenUpgradePopup] = useState(false);
  const contentHost = getContentHost();
  if (quest) {
    const imgSrc = quest.ready
      ? `${contentHost}/design_v2/affstar_upgrade.png`
      : quest.done
        ? `${contentHost}/design_v2/affstar.png`
        : `${contentHost}/design_v2/affstar_empty.png`;
    const img = <img alt="" src={imgSrc} />;
    const link =
      quest.done || quest.ready
        ? `quest/${quest.idQuest}`
        : `girl/${girl.id}?resource=affection`;

    return (
      <>
        <a
          href={getDocumentHref(`${domain}/${link}`)}
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
    const imgSrc = `${contentHost}/design_v2/affstar_empty.png`;
    return <img alt="" src={imgSrc} />;
  }
};

export interface VariationsListProps {
  allGirls: CommonGirlData[];
  variations: string[];
  selectGirl(girl: CommonGirlData): void;
  selectedGirl: CommonGirlData;
}

export const VariationsList: React.FC<VariationsListProps> = ({
  allGirls,
  variations,
  selectedGirl,
  selectGirl
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
}

export const VariationTile: React.FC<VariationTileProps> = ({
  girl,
  selectGirl,
  selected
}) => {
  const onClick = useCallback(() => selectGirl(girl), [girl]);
  return <SimpleGirlTile girl={girl} onClick={onClick} selected={selected} />;
};
