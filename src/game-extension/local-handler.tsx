import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameExtension } from '../components/game-extension';
import { GameName } from '../data/data';

export async function handleLocal(): Promise<void> {
  const showHarem = getOrCreateShowHarem();
  const searchParams = new URLSearchParams(window.location.search);

  if (showHarem !== undefined) {
    const root = createRoot();
    let visible = searchParams.has('characters');
    const updateApp = () => {
      root.render(
        <React.StrictMode>
          <GameExtension
            visible={visible}
            setVisible={setVisible}
            gameName={GameName.HentaiHeroes}
          />
        </React.StrictMode>
      );
    };
    const setVisible = (newVisible: boolean) => {
      visible = newVisible;
      updateApp();
    };
    showHarem.onclick = (event) => {
      setVisible(true);
      event.preventDefault();
    };
    if (visible) {
      updateApp();
    }
  } else {
    console.error(
      "Didn't find toggle-harem. Can't install quick-harem extension."
    );
  }
}

/**
 * Create the root element in which the harem will be rendered.
 * Must be called only once.
 * @returns The root element for the harem
 */
function createRoot(): ReactDOM.Root {
  const targetBody = document.getElementById('hh_hentai');
  if (targetBody === null) {
    return ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  }

  const quickHaremWrapper = document.createElement('div');
  quickHaremWrapper.id = 'quick-harem-wrapper';
  targetBody.appendChild(quickHaremWrapper);
  const root = ReactDOM.createRoot(quickHaremWrapper);
  return root;
}

function getOrCreateShowHarem(): HTMLElement | undefined {
  // Local case: the show harem button is already created
  const showHarem = document.getElementById('toggle-harem');
  if (showHarem) {
    return showHarem;
  }
  return undefined;
}
