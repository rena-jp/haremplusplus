import { getDocumentHref } from '../migration';

/**
 * Find all 'a' elements linking to '/harem.html' or '/harem/girlid',
 * and replace them with links to the harem script.
 *
 * Note: at the moment, this function doesn't work for dynamic links
 * (added by scripts), such as event page.
 */
export function handleHaremLinks() {
  window.$("a[href^='/characters.html']").each(function (
    i: number,
    e: HTMLElement
  ) {
    window.$(e).attr('href', getDocumentHref('/waifu.html?characters'));
  });

  window.$("a[href^='/characters/']").each(function (
    i: number,
    e: HTMLElement
  ) {
    const regex = /characters\/([0-9]+)/;
    const match = window.$(e).attr('href').match(regex);
    if (match) {
      const girlId = match[1];
      const newLink = getDocumentHref(`/waifu.html?characters&girl=${girlId}`);
      window.$(e).attr('href', newLink);
    }
  });
}
