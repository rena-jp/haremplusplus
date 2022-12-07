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
