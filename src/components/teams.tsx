import { CommonGirlData, Team, Rarity, BlessingDefinition } from '../data/data';
import '../style/teams.css';
import '../style/common.css';
import { CloseButton, ElementIcon, format, getDomain, Tooltip } from './common';
import { GirlTooltip } from './girl-tooltip';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState
} from 'react';
import { TeamStats, useTeamStats } from '../hooks/team-hooks';
import { BaseGirlTile } from './girl';
import { GameAPIContext } from '../data/game-api-context';

export interface TeamsProps {
  allGirls: CommonGirlData[];
  selectedGirl: CommonGirlData | undefined;
  close?: () => void;
  show0Pose: boolean;
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
}

export const Teams: React.FC<TeamsProps> = ({
  allGirls,
  selectedGirl,
  close,
  show0Pose,
  currentBlessings,
  upcomingBlessings
}) => {
  const gameAPI = useContext(GameAPIContext).gameAPI!;

  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    gameAPI.getTeams().then(setTeams);
  }, [gameAPI]);

  const [team, setTeam] = useState<Team | undefined>();
  const editTeam = useCallback(
    (team: Team) => {
      setTeam(team);
    },
    [setTeam]
  );

  const saveAndClose = useCallback(
    async (team: Team) => {
      await gameAPI.setTeam(team);
      const updatedTeams = await gameAPI.getTeams();
      setTeams(updatedTeams);
      setTeam(undefined);
    },
    [setTeam, gameAPI]
  );
  const cancel = useCallback(() => {
    setTeam(undefined);
  }, [setTeam]);

  return (
    <div className="teams-section">
      {team === undefined ? (
        <>
          <div className="team-header">
            <span>Select a team to view or edit</span>
            {close === undefined ? null : <CloseButton close={close} />}
          </div>
          <div className="teams-list">
            {teams.map((team) => (
              <TeamOverview
                team={team}
                allGirls={allGirls}
                key={team.teamId}
                edit={() => editTeam(team)}
                cancel={cancel}
                show0Pose={show0Pose}
                currentBlessings={currentBlessings}
                upcomingBlessings={upcomingBlessings}
              />
            ))}
          </div>
        </>
      ) : (
        <TeamEditor
          edit={() => editTeam(team)}
          saveAndClose={saveAndClose}
          cancel={cancel}
          team={team}
          allGirls={allGirls}
          selectedGirl={selectedGirl}
          show0Pose={show0Pose}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
        />
      )}
    </div>
  );
};

export interface TeamProps {
  team: Team;
  allGirls: CommonGirlData[];
  show0Pose: boolean;
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
}

export interface TeamOverviewProps extends TeamProps {
  edit(): void;
  cancel(): void;
}

/**
 * Team overview component. Shows a short summary of the team (First girl,
 * team element(s)), and can edit the team when clicked.
 *
 * This overview also shows the team details (list of girls, stats) as a Tooltip,
 * after a short delay.
 */
export const TeamOverview: React.FC<TeamOverviewProps> = ({
  team,
  allGirls,
  edit,
  show0Pose,
  currentBlessings,
  upcomingBlessings
}) => {
  const stats = useTeamStats(team, allGirls);
  const girls = stats.girls;
  const elements = stats.elements;
  const firstGirl = girls.find((girl) => girl !== undefined);

  const classNames = ['team-overview'];
  if (!team.active) {
    classNames.push('inactive');
  }

  const onClick = team.active
    ? edit
    : () => {
        /* No-op */
      };

  const elementNodes = (
    <div className="elements">
      {elements.map((element) => (
        <ElementIcon element={element} key={element} />
      ))}
    </div>
  );

  return (
    <Tooltip
      delay={500}
      tooltip={
        <TeamSection
          teamStats={stats}
          selectedTile={undefined}
          selectTile={() => {
            /* Do nothing */
          }}
          show0Pose={show0Pose}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
        />
      }
    >
      {team.active ? (
        <BaseGirlTile
          girl={firstGirl}
          onClick={onClick}
          show0Pose={show0Pose}
          selected={false}
          avatarOverlay={elementNodes}
          classNames={classNames}
        />
      ) : (
        <LockedTeamTile />
      )}
    </Tooltip>
  );
};

const LockedTeamTile: React.FC = () => {
  const icon = `${getDomain()}/images/design/ic_lock.png`;
  return (
    <div className="team-overview tile inactive">
      <div className="bg">
        <img src={icon} className="lock-icon" />
      </div>
    </div>
  );
};

export interface TeamSectionProps {
  selectedTile: number | undefined;
  selectTile(tile: number): void;
  teamStats: TeamStats;
  show0Pose: boolean;
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  teamStats,
  selectedTile,
  selectTile,
  show0Pose,
  currentBlessings,
  upcomingBlessings
}) => {
  const girls: (CommonGirlData | undefined)[] = [...teamStats.girls];
  while (girls.length < 7) {
    girls.push(undefined);
  }

  let i = 0;
  return (
    <div className="team">
      <div className="team-stats">
        <span className="attack" title="attack">
          {format(teamStats.attack)}
        </span>
        <span className="defense" title="defense">
          {format(teamStats.defense)}
        </span>
        <span className="ego" title="Ego">
          {format(teamStats.ego)}
        </span>
        <span className="harmony" title="harmony">
          {format(teamStats.harmony)}
        </span>
      </div>
      <div className="team-girls-list">
        {girls.map((girl) => (
          <TeamGirl
            girl={girl}
            selected={selectedTile === i}
            select={selectTile}
            tileId={i}
            key={i++}
            classNames={[`item_${i + 1}`]}
            show0Pose={show0Pose}
            currentBlessings={currentBlessings}
            upcomingBlessings={upcomingBlessings}
          />
        ))}
      </div>
      <div className="team-elements">
        {teamStats.elements.map((element) => (
          <ElementIcon element={element} key={element} />
        ))}
      </div>
      <span>Total Power: {format(teamStats.totalPower)}</span>
    </div>
  );
};

export interface TeamEditorProps extends TeamProps {
  edit(): void;
  saveAndClose(team: Team): void;
  cancel(): void;
  selectedGirl: CommonGirlData | undefined;
}

export const TeamEditor: React.FC<TeamEditorProps> = ({
  team,
  selectedGirl,
  saveAndClose,
  cancel,
  allGirls,
  show0Pose,
  currentBlessings,
  upcomingBlessings
}) => {
  const [currentTeam, setCurrentTeam] = useState<Team>(() => {
    return { ...team, girlIds: [...team.girlIds] };
  });

  const [selectedTile, setSelectedTile] = useState<number | undefined>();
  const selectTile = useCallback(
    (tile: number) => {
      if (selectedTile === tile) {
        setSelectedTile(undefined);
      } else {
        let validTile = true;
        if (tile > 0) {
          // Check that all previous tiles have been set, before
          // allowing selecting (modifying) the next one.
          for (let i = 0; i < tile; i++) {
            if (currentTeam.girlIds[i] === undefined) {
              validTile = false;
            }
          }
        }
        if (validTile) {
          setSelectedTile(tile);
        }
      }
    },
    [selectedTile, setSelectedTile, currentTeam]
  );

  // FIXME Use a proper click listener instead of selection change
  useLayoutEffect(() => {
    if (selectedTile !== undefined && selectedGirl !== undefined) {
      const updatedGirlIds = [...currentTeam.girlIds];
      const swapGirlIndex = updatedGirlIds.indexOf(selectedGirl.id);
      if (swapGirlIndex >= 0) {
        const swapWith = updatedGirlIds[selectedTile];
        if (swapWith === undefined) {
          return;
        }
        updatedGirlIds[selectedTile] = selectedGirl.id;
        updatedGirlIds[swapGirlIndex] = swapWith;
      } else {
        updatedGirlIds[selectedTile] = selectedGirl.id;
      }
      setCurrentTeam({ ...team, girlIds: updatedGirlIds, stats: undefined });
    }
  }, [selectedGirl]);

  const teamStats = useTeamStats(currentTeam, allGirls);

  return (
    <div className="team-editor">
      <TeamSection
        teamStats={teamStats}
        selectTile={selectTile}
        selectedTile={selectedTile}
        show0Pose={show0Pose}
        currentBlessings={currentBlessings}
        upcomingBlessings={upcomingBlessings}
      />

      <div className="actions">
        <button
          className="hh-game-action"
          onClick={() => saveAndClose(currentTeam)}
        >
          Validate
        </button>
        <button className="hh-action-button" onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

interface TeamGirlProps {
  girl: CommonGirlData | undefined;
  selected: boolean;
  tileId: number;
  select(tile: number): void;
  classNames: string[];
  show0Pose: boolean;
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
}

const TeamGirl: React.FC<TeamGirlProps> = ({
  girl,
  tileId,
  select,
  selected,
  classNames,
  show0Pose,
  currentBlessings
}) => {
  const outerClasses = ['hex-tile', ...classNames];
  const innerClasses = ['team-participant', 'qh-hexagon'];
  if (girl !== undefined) {
    innerClasses.push('rarity-bg');
    innerClasses.push(Rarity[girl?.rarity]);
  }

  const icon = show0Pose ? girl?.icon0 : girl?.icon;

  return (
    <div className={outerClasses.join(' ')}>
      <div
        className={`qh-hexagon-outer${selected ? ' selected' : ''}`}
        onClick={() => select(tileId)}
      >
        <div className={innerClasses.join(' ')}>
          {girl === undefined ? (
            <img src={icon} />
          ) : (
            <Tooltip
              place="bottom"
              tooltip={
                <GirlTooltip girl={girl} currentBlessings={currentBlessings} />
              }
            >
              <img src={icon} />
            </Tooltip>
          )}
        </div>
      </div>
      {girl ? <ElementIcon element={girl.element} /> : null}
    </div>
  );
};
