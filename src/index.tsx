import './style/index.css';
import { handleHarem } from './game-extension/harem-handler';
import { handleHome } from './game-extension/home-handler';
import { handleLocal } from './game-extension/local-handler';

// For Home, add a "Show Harem" button, to show the harem in a Dialog.
if (window.location.pathname.startsWith('/home.html')) {
  handleHome();
}
// For Harem, location may be '/harem.html' or '/harem/1'
else if (window.location.pathname.startsWith('/harem')) {
  handleHarem();
}
// For localhost testing, host will be localhost:3000
else if (window.location.host === 'localhost:3000') {
  handleLocal();
}
