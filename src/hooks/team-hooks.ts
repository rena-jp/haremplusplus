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
      attack: 0,
      defense: 0,
      ego: 0,
      harmony: 0,
      totalPower: 0,
      elements: getTeamElements(girls),
      girls
    };
  });

  useEffect(() => {
    gameAPI.getTeamStats(team).then((teamStats) => {
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
