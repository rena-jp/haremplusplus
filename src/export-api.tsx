import React from 'react';
import { GameExtension } from './components/game-extension';
import { createRoot, getGameName } from './game-extension/waifu-handler';
import { Root } from 'react-dom/client';
import { loadSettings } from './data/atoms';

export const SelectedGirlIdContext = React.createContext<
  [string | undefined, number]
>([undefined, 0]);

export function exportAPI() {
  const gameName = getGameName();
  let root: Root | undefined;
  let visible = false;
  let girlId: string | undefined;
  let count = 0;

  const updateApp = async (visible: boolean, girlId?: string) => {
    if (root == null) {
      await loadSettings();
      root = createRoot(gameName);
    }
    root.render(
      <React.StrictMode>
        <SelectedGirlIdContext value={[girlId, ++count]}>
          <GameExtension visible={visible} setVisible={setVisible} />
        </SelectedGirlIdContext>
      </React.StrictMode>
    );
  };

  const setVisible = async (newVisible: boolean, newGirlId?: string) => {
    if (!newVisible && !visible) return;
    if (newVisible && visible && newGirlId == null) {
      return;
    }
    visible = newVisible;
    girlId = newGirlId;
    await updateApp(newVisible, girlId);
    const qh = document.querySelector<HTMLElement>('.quick-harem-wrapper');
    if (qh == null) return;
    qh.style.display = newVisible ? '' : 'none';
  };

  const w = window as any;
  w.HaremPlusPlus = {
    open(id_girl?: string | number) {
      if (id_girl != null) {
        const url = new URL(window.location.toString());
        url.hash = `characters-${id_girl}`;
        window.history.replaceState('', '', url.toString());
      }
      return setVisible(true, String(id_girl));
    },
    close() {
      return setVisible(false);
    }
  };
}
