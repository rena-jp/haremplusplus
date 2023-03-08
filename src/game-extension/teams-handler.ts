import { loadAndDispatch } from './frame-utils';
import { getAllTeams } from './teams';

export async function handleTeams(): Promise<void> {
  await loadAndDispatch('teams', async () => getAllTeams());
}
