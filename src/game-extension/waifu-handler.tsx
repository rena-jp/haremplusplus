import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameExtension } from '../components/game-extension';
import { GirlsDataEntry } from '../data/game-data';

export async function handleWaifu(): Promise<void> {
  const searchParams = new URLSearchParams(window.location.search);

  const ownedGirls: any = {};
  const girlsDataList = window.girlsDataList as unknown as GirlsDataEntry[];
  girlsDataList.forEach((girl) => {
    const girlId = girl.id_girl;
    ownedGirls[girlId] = new window.Girl(girl);
    ownedGirls[girlId]['gId'] = Number(girlId);
  });
  window.GirlSalaryManager.init(ownedGirls, false);

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
    if (!newVisible) {
      const { referrer } = window.document;
      if (referrer !== '') {
        window.location.href = referrer;
      } else {
        window.location.href = './home.html';
      }
    } else {
      visible = newVisible;
      updateApp();
    }
  };
  if (visible) {
    window.$('#waifu-page').remove();
    updateApp();
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
