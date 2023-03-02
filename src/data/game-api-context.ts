import React from 'react';
import { GameAPI } from '../api/GameAPI';

export interface GameAPIContext {
  gameAPI?: GameAPI;
}

export const GameAPIContext = React.createContext<GameAPIContext>({});
