export async function handleHome(): Promise<void> {
  const haremLink = window.$("a[rel='harem']");
  haremLink.attr('href', 'waifu.html?characters');
}
