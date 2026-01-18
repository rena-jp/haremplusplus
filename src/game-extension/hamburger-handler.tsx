import { getDocumentHref } from '../migration';

/**
 * Update the link to the harem from the Hamburger menu in all pages
 */
export async function handleHamburgerMenu(): Promise<void> {
  const haremLink = window.$("nav a[href^='/characters.html']");
  haremLink.attr('href', getDocumentHref('/waifu.html') + '#characters');
}
