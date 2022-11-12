import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameExtension } from '../components/game-extension';
import { getGameWindow } from '../data/game-data';

export async function handleHome(): Promise<void> {
  const showHaremRoot = createHaremContainerRoot();
  const searchParams = new URLSearchParams(window.location.search);

  if (showHaremRoot !== undefined) {
    const root = createRoot();
    let visible = searchParams.has('harem');
    const updateApp = () => {
      root.render(
        <React.StrictMode>
          <GameExtension visible={visible} setVisible={setVisible} />
        </React.StrictMode>
      );
    };
    const setVisible = (newVisible: boolean) => {
      visible = newVisible;
      updateApp();
    };
    const haremButton = (
      <a
        onClick={(event) => {
          setVisible(true);
          event?.preventDefault();
        }}
        href="?harem"
      >
        <div className="notif-position">
          <span>
            <p>Harem</p>
          </span>
        </div>
        {getGameWindow().notificationData.harem === 'upgrade' ? (
          <span className="button-notification-upgrade button-notification-icon" />
        ) : null}
      </a>
    );
    showHaremRoot.render(haremButton);
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

function createHaremContainerRoot(): ReactDOM.Root | undefined {
  // Extension case: we need to create the button next to the harem button
  const leftSideContainer = document.getElementsByClassName(
    'left-side-container'
  );
  if (leftSideContainer.length > 0) {
    const container = leftSideContainer.item(0)!;
    const div = document.createElement('div');
    div.setAttribute('class', 'quest-container');
    div.setAttribute('style', 'cursor: pointer;');
    const links = container.getElementsByTagName('a');
    let originalHarem = undefined;
    for (let i = 0; i < links.length; i++) {
      const link = links.item(i);
      if (link?.rel === 'harem') {
        originalHarem = link;
        break;
      }
    }
    if (originalHarem !== undefined) {
      container.replaceChild(div, originalHarem);
    } else {
      container.appendChild(div);
    }
    return ReactDOM.createRoot(div);
  }

  return undefined;
}
