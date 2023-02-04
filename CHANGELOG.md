## 0.11.1 - 2023-02-04

- Update events and unknown poses
- Add more details about missing XP and Affection on Girl's Description page
- Fix low-resolution images on girls upgrade scenes

## 0.11.0 - 2023-01-25

- Update hero currency attribute to match game API change (Fix an issue where upgrading a girl wasn't possible)
- Allow opening links in the current tab, as Nutaku doesn't support links to new tab

## 0.10.10 - 2023-01-20

- Update events and unknown poses
- Add more details about missing gems on Girl's Description page
- Fix a display issue in Affection cost when switching girls
- Fix a display issue in Awakening cost when switching girls
- Add currency icon to the salary in girl's description

## 0.10.9 - 2023-01-10

- Update events and unknown poses

## 0.10.8 - 2022-12-28

- Update unknown poses
- Add harem level/ego bonus to the Summary panel
- Fix a style issue for rare/missing blessings in Summary
- (Tentatively) fix a conflict with HH++ about harem link ordering

## 0.10.7 - 2022-12-22

- Update unknown poses
- Update events list
- Update restrictions for using Mythic Lingerie: prevent using on 1\* girls.

## 0.10.6 - 2022-12-19

- Update unknown poses
- Add icons to 'Give Books' and 'Give Gifts' actions
- Fix a bug where the level was incorrectly displayed after awakening
- Support Mythic Grimoire and Mythic Lingerie
- Prevent using Mythic Gifts/Books if they overflow

### 0.10.6 Known issues

- After leveling up or upgrading a girl, stats are not properly updated. Workaround: hit the refresh lemon!
- Usage of Mythic Grimoire and Mythic Lingerie are restricted to low-level and 0-grade girls (respectively). These restrictions are different
  from the actual game restrictions, because it is unclear in which conditions the game actually allows using these 2 items. Workaround: you may
  open the "Give Books" or "Give Gifts" links in a new tab and use the in-game page to use these items.

## 0.10.5 - 2022-12-13

- Fix a CSS conflict with in-game progress bars
- Update unknown poses

## 0.10.4 - 2022-12-09

- Minor style improvements
- Avoid rendering hidden frames (improve performances)
- Update texts in Summary and girl description

## 0.10.3 - 2022-12-07

- Update Game Data types to match the new girls data API (Fix variations)

## 0.10.2 - 2022-12-07

- Update Game Data types to match the new girls data API (Fix salaries)
- Avoid rendering invalid images for older scenes

## 0.10.1 - 2022-12-05

- Fix Element blessing import in ES/IT languages

## 0.10.0 - 2022-12-04

- Update unknown poses for new girls
- Blessings: Properly support element blessings in all languages
- Requests: Add a spinner while the requests queue is busy, and icon when an error occurs
- Fix pachinko pools: don't consider 1\* Girls as part of the "Mythic Pachinko" pool
- Add UI to upgrade girls directly from the Harem (GXP/Awakening, Affection/Upgrade)
- Data: improve source event support (Classic/Epic/Legendary/Orgy Days, Anniversary, Seasonal)
- Harem: Add proper link navigation. Supports direct link reference, such as: ./home.html?harem&girl=1
- Selection: Scroll girl into view when changing selection (if girl is not filtered out)

### 0.10.0 Known issues

- Special mythic items (Level 350 Book, 2\* Gift) are currently not supported. The "Use" button will be disabled.

## 0.9.6 - 2022-11-11

- Style: Reuse rarity-specific backgrounds from the game for girl tiles
- Filters & Sort: Regroup Filters/Sort/Summary in the same Tab folder panel; use a button in the toolbar to open it
- Style: Add more space between the "Refresh" and "Close" buttons in the Harem Toolbar
- Fix a bug where Starter Girls stats were not correctly computed during Common Rarity Blessings
- Fix a bug where Element blessing was not properly supported in all languages

## 0.9.5 - 2022-11-07

- Improve layout on smaller displays
