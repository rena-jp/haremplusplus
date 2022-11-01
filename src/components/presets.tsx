import React from 'react';
import { Sorter } from '../data/sort';
import { PanelProps } from './panels';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface PresetsProps extends PanelProps {
  setSorter(sorter: Sorter): void;
}

export const PresetsPanel: React.FC<PresetsProps> = ({ visible }) => {
  const className = `qh-panel presets ${visible ? 'visible' : 'hidden'}`;
  return <div className={className}>Presets panel</div>;
};
