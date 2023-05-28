import { useCallback, useEffect, useState } from 'react';
import { Team } from '../data/data';
import { GameAPI } from '../api/GameAPI';
import { loadTeams, persistTeams } from '../data/cache';

export function useTeams(gameAPI: GameAPI): TeamsData {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshTeams() {
    if (gameAPI) {
      setLoading(true);
      const currentTeams = await gameAPI.getTeams(true);
      persistTeams(currentTeams);
      setTeams(currentTeams);
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initTeams(): Promise<void> {
      setLoading(true);
      try {
        const cachedTeams = await loadTeams();
        if (cachedTeams !== undefined) {
          setTeams(cachedTeams);
        }
      } catch (error) {
        // Ignore. Cache might not be available. Error will already be logged
        // by the cache itself.
      }
      await refreshTeams();
    }
    initTeams();
  }, [gameAPI, setTeams, setLoading]);

  const updateTeam = useCallback(
    async (team: Team) => {
      await gameAPI.setTeam(team);
      const updatedTeams = await gameAPI.getTeams(false);
      persistTeams(updatedTeams);
      setTeams([...updatedTeams]);
    },
    [gameAPI, setTeams]
  );

  return {
    teams,
    loading,
    updateTeam,
    refresh: refreshTeams
  };
}

export interface TeamsData {
  teams: Team[];
  loading: boolean;
  updateTeam(team: Team): void;
  refresh(): void;
}
