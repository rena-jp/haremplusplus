import { loadAndDispatch } from './frame-utils';

export async function handleTeams(): Promise<void> {
  await loadAndDispatch('teams_data', async () => window.teams_data);
}
