# Harem++

## Userscript

This project provides a userscript (To be used with Tampermonkey, or similar browser extensions) to replace the original Harem with a quicker, more dynamic version.

## Installation

- Install Tampermonkey or another userscript extension for your web-browser
- Open https://raw.githubusercontent.com/rena-jp/haremplusplus/main/release/haremplusplus.user.js and click Install

## Features

- Speed: Keeps all data in cache on your device, so it can render immediately, even if the server lags
- Filter: Find by name, characteristics, power, blessings, ...
- Sort: Sort by Grade, level, blessings, ...
- Summary: View the repartition of girls in your harem, by stat, rarity, element, ...
- Upgrades: Use Books & Gifts, Awaken and Upgrade directly from the harem
- Teams: Edit your teams directly from the Harem page, using advanced filters and sort

## Known issues

- The current script only supports the main server and the test server, as well as Nutaku. Related games and other servers are **not** supported at the moment.
- The script was developped for usage with Desktop-based Browsers. Mobile platforms are **not** supported at the moment. Recommended resolution is 1280x720 or higher.
- The script reads data from the game with your current configured language. However, UI Elements are displayed in English. Other languages are **not** supported at the moment.
- The script relies on the browser cache feature to speed up rendering. As such, Cache must be enabled on your browser in order for the script to work properly. All popular browsers should support Cache. However, when using Private Navigation, Cache may be disabled. This is especially the case with Firefox. When using Firefox in Private Navigation mode, the Cache is disabled, and the script won't be able to save any data. As such, loading the harem won't be any faster than using the original game (It will probably be even slower).

## Contributors

- Liliat
- -MM-
- rena-jp
