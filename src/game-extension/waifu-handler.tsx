import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameExtension } from '../components/game-extension';
import { GameName } from '../data/data';
import { GirlsDataEntry } from '../data/game-data';
import {
  getDocumentHref,
  getGirlConstructor,
  getGirlSalaryManager
} from '../migration';

export async function handleWaifu(): Promise<void> {
  const searchParams = new URLSearchParams(window.location.search);

  const ownedGirls: any = {};
  const girlsDataList = window.girls_data_list as unknown as GirlsDataEntry[];
  girlsDataList.forEach((e) => (e.is_owned = true));
  const Girl = getGirlConstructor();
  girlsDataList.forEach((girl) => {
    const girlId = girl.id_girl;
    ownedGirls[girlId] = new Girl(girl);
    ownedGirls[girlId]['gId'] = Number(girlId);
  });
  getGirlSalaryManager().init(ownedGirls, false);

  const gameName = getGameName();
  const root = createRoot(gameName);
  let visible = searchParams.has('characters');
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
  }
}

/**
 * Create the root element in which the harem will be rendered.
 * Must be called only once.
 * @returns The root element for the harem
 */
function createRoot(gameName: GameName): ReactDOM.Root {
  const targetBody = document.getElementById(gameName.valueOf());
  if (targetBody === null) {
    return ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  }

  const quickHaremWrapper = document.createElement('div');
  quickHaremWrapper.id = 'quick-harem-wrapper';
  targetBody.appendChild(quickHaremWrapper);
  const root = ReactDOM.createRoot(quickHaremWrapper);
  return root;
}

function getGameName(): GameName {
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
