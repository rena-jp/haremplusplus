import { GameWindow } from '../data/game-data';
import { HaremDataResponse, HaremMessage } from './GameAPIImpl';

export async function loadAndDispatch<T>(
  attribute: keyof GameWindow,
  getter: () => Promise<T>
): Promise<T> {
  try {
    const gameData = await getter();
    if (window.parent && window.parent !== window) {
      const dataResponse: HaremDataResponse = {
        type: 'response_game_data',
        attribute: attribute,
        gameData: gameData
      };
      window.parent.postMessage(dataResponse, window.location.origin);

      const messageListener = (event: MessageEvent) => {
        if (event.origin === window.origin) {
          const message = event.data;
          if (
            HaremMessage.isRequest(message) &&
            message.attribute === attribute &&
            window.parent &&
            window.parent !== window
          ) {
            const response: HaremDataResponse = {
              type: 'response_game_data',
              attribute: attribute,
              gameData: gameData
            };
            window.parent.postMessage(response, window.location.origin);
          }
        }
      };
      window.addEventListener('message', messageListener);
    }
    return gameData;
  } catch (error) {
    const message =
      'Failed to get game data from harem. Attribute: ' +
      attribute +
      '. Reason: ';
    console.error(message, error);
    return Promise.reject([message, error]);
  }
}
