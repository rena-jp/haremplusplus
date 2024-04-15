## 0.18.7 - 2024-04-15

- Change the order by power to the same as the game

## 0.18.6 - 2024-04-03

- Fix labyrinth power sort bug

## 0.18.5 - 2024-04-03

- Fix affection upgrade
- Fix gem count
- Add labyrinth power sort

## 0.18.4 - 2024-03-23

- Prepare for the next update

## 0.18.3 - 2024-02-22

- Change the URL according to the game

## 0.18.2 - 2024-01-29

- Fix team editing did not work

## 0.18.1 - 2024-01-28

- Fix missing full name bug

## 0.18.0 - 2024-01-26

- Stop accessing the new harem
- Update pose data
- Update dependent libraries

## 0.17.12 - 2024-01-10

- Change the URL according to the game
- Update pose data

## 0.17.11 - 2024-01-05

- Update pose data

## 0.17.10 - 2023-12-16

- Update according to the game
- Update pose data

## 0.17.9 - 2023-12-16

- Avoid errors on error pages
- Update pose data

## 0.17.8 - 2023-12-15

- Add Love Labyrinth to source data

## 0.17.7 - 2023-12-15

- Update according to the game
- Update girl source data
- Update pose data

## 0.17.6 - 2023-12-12

- Add bulb filter
- Update pose data

## 0.17.5 - 2023-12-10

- Fix a bug that caused skill filter to reset
- Update pose data

## 0.17.4 - 2023-12-06

- Add not 0 button to skill filter
- Update pose data

## 0.17.3 - 2023-12-05

- Hide filter for traits not used in current game
- Update pose data

## 0.17.2 - 2023-11-25

- Improve filter UI
- Update pose data
- Update dependent libraries

## 0.17.1 - 2023-11-21

- Add style for CxH/PsH hair colors
- Fix Hair Color blessing error

## 0.17.0 - 2023-11-21

- Add resonance filter to equipment inventory
- Fix tooltip arrow
- Update pose data
- Update dependent libraries

## 0.16.1 - 2023-11-16

- Fix PsH poses error

## 0.16.0 - 2023-11-16

- Add Pornstar Harem support

## 0.15.2 - 2023-10-30

- Fix broken girl equipment screen

## 0.15.1 - 2023-10-29

- Fix unknown pose icon error
- Remove unused css

## 0.15.0 - 2023-10-29

- Add Comix-Harem support (thanks to bohammettuz)

## 0.14.2 - 2023-10-08

- Fix money collection function to work
- Fix to check for skill updates

## 0.14.1 - 2023-10-07

- Change to display the second color as well
- Improve tooltip color

## 0.14.0 - 2023-10-06

- Add support for girl skills
- Add support for new colors
- Update unknown poses
- Fix an affection scene bug
- Move quick harem to waifu page

## 0.13.7 - 2023-06-19

- Fix a bug where the inventory would only display 50 items instead of (up to) 600

## 0.13.6 - 2023-06-12

- Update unknown poses and events
- Add "Unequip all girls" action to the inventory
- Inventory: add "total stats" entry to the equipment table
- Improve layout for smaller screens (mobile devices)
- Fix equipment tooltips: avoid stuck tooltips in the inventory

## 0.13.5 - 2023-05-28

- Add a new screen to manage girls equipment/inventory
- Use the new Ajax requests to load the Market inventory (Books/Gifts)
- Add filter by team, with an optional range parameter (e.g. 1;3-5 for teams 1, 3, 4 and 5)
- Improve sort by power/potential: group equivalent girls by element
- Fix a performance issue when editing teams in the harem
- Make the quick equipment screen larger on small devices
- Add level decorator on girls equipment
- Add class icon on class filter buttons

## 0.13.4 - 2023-05-24

- Update unknown poses
- Add a description tooltip on empty equipment slots
- Add stats tooltips on girls in harem, when editing teams
- Add stats comparison in equipment tooltip, when equipping a new item
- Add a quick-equip popup for girls equipment

## 0.13.3 - 2023-05-22

- Update recruits equipment requests to match the latest game update
- Fix: setting "Sort by ... Power" as the default Sort now works properly

## 0.13.2 - 2023-05-22

- Fix a bug in blessings data cache, preventing the harem from displaying up-to-date blessings/stats
- Add loading indicator on long-running equipment actions
- Add tooltips for Give books/Give gifts actions

## 0.13.1 - 2023-05-18

- Add unequip single item action
- Add equip/unequip all actions
- Fix a bug with blessings cache, causing blessings data to be refreshed too often
- Add filters by Class, by equipment
- Make the XP/Affection sections more compact
- Replace links to the original harem with links to the harem script

## 0.13.0 - 2023-05-16

- Update events and unknown poses
- Make the Summary panel more compact
- Display blessing multipliers on girl stats tooltip (Current/Upcoming)
- Add support for girls equipment

## 0.12.3 - 2023-04-21

- Update events and unknown poses
- Fix a style conflict between HH++ and Harem++, causing display issues in the HH++ Gems summary

## 0.12.2 - 2023-04-08

- Update events and unknown poses
- Fix mirrored text in Sort icon tooltip
- Fix missing background color for C/R/E girls in Teams Editor

## 0.12.1 - 2023-03-23

- Update the link to the harem in the Hamburger menu

## 0.12.0 - 2023-03-23

- Update events and unknown poses
- Add sort by power options (Base, current, upcoming)
- Update to React-Tooltip 5.x to fix some tooltip issues
- Add a team editor to the harem page

## 0.11.4 - 2023-03-02

- Tentative fix: avoid 403 error/popup while loading the harem data
- Improve detection of Seasonal Event girls
- Fix: Properly update sort (by current/upcoming potential) when blessings change
- Fix: Properly update girl stats after leveling up (books or awakening)

## 0.11.3 - 2023-02-15

- Fix a minor display bug when rendering the harem, where top girls in the list might not be immediately visible
- Improve market-upgrade display for a wider range of screen sizes
- Add a filter for shards in the 40-99 range (eligible for SM Shop)

## 0.11.2 - 2023-02-11

- Update events and unknown poses
- Fix a bug in Search field, when new girls are added to the game without being fully specified (empty name)
- Add support for the new DP Event

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
