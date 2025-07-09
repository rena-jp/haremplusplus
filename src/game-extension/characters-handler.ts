import { updateGirlsList, updateGirl } from '../data/indexed-db';

export async function handleCharacters(): Promise<void> {
  window.$(document).ajaxComplete((event: any, request: any, settings: any) => {
    if (settings.type !== 'POST') return;
    if (!(settings.url as Object).toString().startsWith('/ajax.php')) return;

    const params = settings.data;
    if (params == null) return;

    const response = request.responseJSON;
    if (response == null) return;

    if (params.includes('action=get_girls_list')) {
      if (!Array.isArray(response.girls_list)) return;
      updateGirlsList(response.girls_list as any[]);
    }

    if (params.includes('action=get_girl')) {
      if (response.girl == null) return;
      updateGirl(response.girl);
    }
  });
}
