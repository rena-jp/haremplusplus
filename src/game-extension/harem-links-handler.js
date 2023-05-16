/**
 * Find all 'a' elements linking to '/harem.html' or '/harem/girlid',
 * and replace them with links to the harem script.
 *
 * Note: at the moment, this function doesn't work for dynamic links
 * (added by scripts), such as event page.
 */
export function handleHaremLinks() {
  window.$("a[href='/harem.html']").each(function () {
    window.$(this).attr('href', 'home.html?harem');
  });

  window.$("a[href^='/harem/']").each(function () {
    const regex = /harem\/([0-9]+)/;
    const match = window.$(this).attr('href').match(regex);
    if (match) {
      const girlId = match[1];
      const newLink = `/home.html?harem&girl=${girlId}`;
      window.$(this).attr('href', newLink);
    }
  });
}
