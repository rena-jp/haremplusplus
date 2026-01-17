import React from 'react';
import { GameExtension } from './components/game-extension';
import { createRoot, getGameName } from './game-extension/waifu-handler';
import { Root } from 'react-dom/client';

export function exportAPI() {
  const gameName = getGameName();
  let root: Root | undefined;
  let visible = false;

  const updateApp = (visible: boolean) => {
    root ??= createRoot(gameName);
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
    if (newVisible === visible) return;
    visible = newVisible;
    updateApp(newVisible);
    const qh = document.querySelector<HTMLElement>('.quick-harem-wrapper');
    if (qh == null) return;
    qh.style.display = newVisible ? '' : 'none';
  };

  const w = window as any;
  w.HaremPlusPlus = {
    open() {
      setVisible(true);
    },
    close() {
      setVisible(false);
    }
  };
}
