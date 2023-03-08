import { Team } from '../data/data';

//
//  There is no easy way to get the teams data as a javascript object,
//  because teams are only defined in pre-rendered HTML.
//  These functions extract the relevant data from HTML Elements on the
//  teams.html page, and build a Team object from it.
//

export function getAllTeams(): Team[] {
  const teams: Team[] = [];
  document
    .querySelectorAll('.team-info-girls-container')
    .forEach((container) => {
      const teamId = container.getAttribute('data-id-team');
      const girls = getTeamFromTeamInfoContainer(container);
      if (teamId) {
        teams.push({
          teamId: teamId,
          girlIds: girls,
          active: true
        });
      }
    });
  return teams;
}

function getTeamFromTeamInfoContainer(teamInfoContainer: any): string[] {
  const newTeamIds: string[] = [];
  const members: any[] = teamInfoContainer.querySelectorAll(
    '.team-hexagon .team-member-container'
  );

  members.forEach((element) => {
    if (element.getAttribute('data-girl-id') !== '') {
      const pos = Number(element.getAttribute('data-team-member-position'));
      newTeamIds[pos] = element.getAttribute('data-girl-id');
    }
  });
  return newTeamIds;
}
