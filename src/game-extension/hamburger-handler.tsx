/**
 * Update the link to the harem from the Hamburger menu in all pages
 */
export async function handleHamburgerMenu(): Promise<void> {
  const haremLink = window.$("nav a[href^='/harem.html']");
  haremLink.attr('href', window.getDocumentHref('/waifu.html?harem'));
}
