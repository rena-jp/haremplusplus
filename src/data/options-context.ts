import React from 'react';

export interface OptionsContext {
  show0Pose: boolean;
}

export const OptionsContext = React.createContext({ show0Pose: false });
