import { updateGirlsSource } from '../data/indexed-db';

export async function handleProfile(): Promise<void> {
  window.$(document).ajaxComplete((event: any, request: any, settings: any) => {
    if (settings.type !== 'POST') return;
    if (!(settings.url as Object).toString().startsWith('/ajax.php')) return;

    const params = settings.data;
    if (params == null) return;

    const response = request.responseJSON;
    if (response == null) return;

    if (
      response.success &&
      params.includes('action=fetch_hero') &&
      params.includes('id=characters')
    ) {
      const html = response.html as string;
      if (html == null) return;
      const start = html.indexOf('var all_possible_girls = ');
      if (start < 0) return;
      const end = html.indexOf('var selected_girls = ');
      if (end < 0) return;
      const code = html.substring(start, end);
      // eslint-disable-next-line no-new-func
      const all_possible_girls = Function(
        `${code}; return all_possible_girls;`
      )();
      updateGirlsSource(all_possible_girls);
    }
  });

  if (
    window.location.pathname.startsWith('/hero/') &&
    window.location.pathname.endsWith('/characters.html')
  ) {
    const { all_possible_girls } = window as any;
    if (all_possible_girls == null) return;
    await updateGirlsSource(all_possible_girls);
  }
}
