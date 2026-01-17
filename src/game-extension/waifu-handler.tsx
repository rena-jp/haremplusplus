import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameExtension } from '../components/game-extension';
import { GameName } from '../data/data';
import { getDocumentHref } from '../migration';
import { GameAPIImpl, REQUEST_GIRLS } from './GameAPIImpl';

export async function handleWaifu(): Promise<void> {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('characters')) {
    const url = new URL(window.location.href);
    if (searchParams.has('girl')) {
      const id = searchParams.get('girl');
      url.hash = `characters-${id}`;
    } else {
      url.hash = 'characters';
    }
    url.search = '';
    window.history.replaceState('', '', url.toString());
  }

  const gameName = getGameName();
  const root = createRoot(gameName);
  let visible = window.location.hash.startsWith('#characters');
  const updateApp = () => {
    root.render(
      <React.StrictMode>
        <GameExtension
          visible={visible}
          setVisible={setVisible}
          gameName={gameName}
        />
      </React.StrictMode>
    );
  };
  const setVisible = (newVisible: boolean) => {
    if (!newVisible) {
      const { referrer } = window.document;
      if (referrer !== '') {
        window.location.href = referrer;
      } else {
        window.location.href = getDocumentHref('./home.html');
      }
    } else {
      visible = newVisible;
      updateApp();
    }
  };
  if (visible) {
    window.$('#waifu-page').remove();
    updateApp();
  } else {
    await updateGirlsAndDispatch();
  }
}

async function updateGirlsAndDispatch(): Promise<void> {
  try {
    const gameAPI = new GameAPIImpl();
    const girls = await gameAPI.getWaifuGirls(false);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(girls, window.location.origin);

      const messageListener = (event: MessageEvent) => {
        if (event.origin === window.origin) {
          const message = event.data;
          if (
            message === REQUEST_GIRLS &&
            window.parent &&
            window.parent !== window
          ) {
            window.parent.postMessage(girls, window.location.origin);
          }
        }
      };
      window.addEventListener('message', messageListener);
    }
  } catch (error) {
    console.error('Failed to get girls data from harem. Reason: ', error);
  }
}

/**
 * Create the root element in which the harem will be rendered.
 * Must be called only once.
 * @returns The root element for the harem
 */
export function createRoot(gameName: GameName): ReactDOM.Root {
  let targetBody = document.getElementById(gameName.valueOf());
  if (targetBody === null) {
    targetBody = document.body;
    targetBody.id = gameName;
  }

  const quickHaremWrapper = document.createElement('div');
  quickHaremWrapper.id = 'quick-harem-wrapper';
  targetBody.appendChild(quickHaremWrapper);
  const root = ReactDOM.createRoot(quickHaremWrapper);
  return root;
}

export function getGameName(): GameName {
  if (document.getElementById('hh_hentai')) {
    return GameName.HentaiHeroes;
  }
  if (document.getElementById('hh_comix')) {
    return GameName.ComixHarem;
  }
  if (document.getElementById('hh_star')) {
    return GameName.PornstarHarem;
  }
  return GameName.HentaiHeroes; // default
}
