import { useContext, useEffect, useMemo, useState } from 'react';
import { CommonGirlData, Elements, Team, TeamElement } from '../data/data';
import { GameAPIContext } from '../data/game-api-context';

export function useTeamStats(
  team: Team,
  allGirls: CommonGirlData[]
): TeamStats {
  const gameAPI = useContext(GameAPIContext).gameAPI!;

  const girls = useMemo(() => {
    return team.girlIds
      .map((girlId) => allGirls.find((girl) => girl.id === girlId))
      .filter((girl) => girl !== undefined)
      .map((girl) => girl!);
  }, [team]);

  const [stats, setStats] = useState<TeamStats>(() => {
    return {
      attack: team.stats?.damage ?? 0,
      defense: team.stats?.defense ?? 0,
      ego: team.stats?.ego ?? 0,
      harmony: team.stats?.chance ?? 0,
      totalPower: team.stats?.totalPower ?? 0,
      elements: getTeamElements(girls),
      girls
    };
  });

  useEffect(() => {
    // Immediately update the team composition and elements
    // when girls change, then asynchronously refresh the stats
    setStats({
      ...stats,
      girls,
      elements: getTeamElements(girls)
    });
    if (
      team.stats === undefined &&
      team.girlIds.some((girl) => girl !== undefined) &&
      team.teamId !== ''
    ) {
      gameAPI.getTeamStats(team).then((teamStats) => {
        team.stats = teamStats;
        setStats({
          attack: teamStats.damage,
          ego: teamStats.ego,
          defense: teamStats.defense,
          harmony: teamStats.chance,
          totalPower: teamStats.totalPower,
          elements: getTeamElements(girls),
          girls
        });
      });
    }
  }, [team, girls]);

  return stats;
}

export function getTeamElements(
  girls: (CommonGirlData | undefined)[]
): TeamElement[] {
  const result: TeamElement[] = [];
  for (const element of Elements.values()) {
    if (girls.filter((girl) => girl?.element === element).length >= 3) {
      result.push(element);
    }
  }
  if (result.length === 0) {
    if (girls.some((girl) => girl !== undefined)) {
      return ['rainbow'];
    }
  }
  return result;
}

export interface TeamStats {
  attack: number;
  defense: number;
  ego: number;
  harmony: number;
  elements: TeamElement[];
  totalPower: number;
  girls: CommonGirlData[];
}
