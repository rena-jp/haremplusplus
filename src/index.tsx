import './style/index.css';
import { handleHome } from './game-extension/home-handler';
import { handleQuest } from './game-extension/quest-handler';
import { handleTeams } from './game-extension/teams-handler';
import { handleHaremLinks } from './game-extension/harem-links-handler';
import { handleWaifu } from './game-extension/waifu-handler';
import { handleCharacters } from './game-extension/characters-handler';
import { handleProfile } from './game-extension/profile-handler';
import { exportAPI } from './export-api';

if (window.$ != null) {
  handleHaremLinks();
  window.$(() => {
    handleHaremLinks();
  });

  // For Home, add a "Show Harem" button.
  if (window.location.pathname.startsWith('/home.html')) {
    handleHome();
  }
  // Quests data
  else if (window.location.pathname.startsWith('/quest/')) {
    handleQuest();
  }
  // Teams data
  else if (window.location.pathname.startsWith('/teams.html')) {
    handleTeams();
  }
  // For Waifu, to show the harem in a Dialog.
  else if (window.location.pathname.startsWith('/waifu.html')) {
    handleWaifu();
  }
  // Characters (Harem)
  else if (window.location.pathname.startsWith('/characters')) {
    handleCharacters();
  }

  // Other hero's characters (Profile)
  handleProfile();

  // Export API for other scripts
  exportAPI();
}
