import { useCallback, useEffect, useState } from 'react';
import { Team } from '../data/data';
import { GameAPI } from '../api/GameAPI';

export function useTeams(gameAPI: GameAPI): TeamsData {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    if (gameAPI) {
      gameAPI
        .getTeams()
        .then(setTeams)
        .then(() => setLoading(false));
    }
  }, [gameAPI, setTeams, setLoading]);

  const updateTeam = useCallback(
    async (team: Team) => {
      await gameAPI.setTeam(team);
      const updatedTeams = await gameAPI.getTeams();
      setTeams([...updatedTeams]);
    },
    [gameAPI, setTeams]
  );

  return {
    teams,
    loading,
    updateTeam
  };
}

export interface TeamsData {
  teams: Team[];
  loading: boolean;
  updateTeam(team: Team): void;
}
