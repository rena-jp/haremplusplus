import { useCallback, useEffect, useMemo, useState } from 'react';
import { Harem } from './harem';
import '../style/App.css';
import '../style/game-extension.css';
import '../style/game-ext-local.css';
import { GameAPIImpl } from '../game-extension/GameAPIImpl';
import { GameAPI } from '../api/GameAPI';
import { CloseButton } from './common';
import { HaremOptions, optionsManager } from '../data/options';
import { LoadHaremData } from '../hooks/load-harem-data';
import { GameAPIContext } from '../data/game-api-context';
import { getDocumentHref } from '../migration';
import { Provider } from 'jotai';

export interface GameExtensionProps {
  visible: boolean;
  setVisible(visible: boolean): void;
}

export const GameExtension: React.FC<GameExtensionProps> = ({
  visible,
  setVisible
}) => {
  const [options, setOptions] = useState<HaremOptions | undefined>(undefined);

  useEffect(() => {
    optionsManager.getOptions().then((options) => {
      setOptions(options);
    });
  }, []);

  const hide = useCallback(() => setVisible(false), [setVisible]);

  const gameAPI: GameAPI = useMemo(() => new GameAPIImpl(), []);

  return (
    <div className={`QuickHarem game-extension ${visible ? '' : 'hidden'}`}>
      <Provider>
        <GameAPIContext.Provider value={{ gameAPI }}>
          <LoadHaremData gameAPI={gameAPI}>
            {({
              loading,
              allGirls,
              currentBlessings,
              upcomingBlessings,
              refresh,
              gemsCount,
              consumeGems
            }) => {
              const haremReady =
                options &&
                allGirls &&
                allGirls.length > 0 &&
                currentBlessings &&
                upcomingBlessings;
              return (
                <>
                  {haremReady ? (
                    <Harem
                      allGirls={allGirls}
                      currentBlessings={currentBlessings}
                      upcomingBlessings={upcomingBlessings}
                      haremVisible={visible}
                      gameAPI={gameAPI}
                      refresh={refresh}
                      loading={loading}
                      options={options}
                      close={hide}
                      gemsCount={gemsCount}
                      consumeGems={consumeGems}
                    />
                  ) : (
                    <Loading loading={loading} close={hide} />
                  )}
                </>
              );
            }}
          </LoadHaremData>
        </GameAPIContext.Provider>
      </Provider>
    </div>
  );
};

const Loading: React.FC<{ loading: boolean; close(): void }> = ({
  loading,
  close
}) => {
  // If loading takes less than 150ms, do not display anything
  const [displayLoadingText, setDisplayLoadingText] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayLoadingText(true);
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      {loading ? (
        <>
          {displayLoadingText && (
            <>
              <p>Loading Data... First time may take a few seconds...</p>
              <p>
                Note: this extension might not work properly on some browsers in
                Private mode, because it relies on data stored locally on your
                device to increase performances. Dependending on the browser,
                private mode may or may not allow storing any local data.
              </p>
              <p>
                For Nutaku players on Firefox, this extension also won't be able
                to access the local data cache, and will thus not work properly.
              </p>
            </>
          )}
        </>
      ) : (
        <div className="harem-popup-error">
          <CloseButton close={close} />
          <p>Loading is complete, but no girls were found :(</p>
          <p>
            <a href={getDocumentHref('characters.html')} rel="noreferrer">
              Open original Harem
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
