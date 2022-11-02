import { ReactNode } from 'react';
import { Rarity } from '../data/data';
import '../style/colors.css';
import { firstToUpper } from './common';

export interface RarityProps {
  rarity: Rarity;
}

export const RarityText: React.FC<RarityProps> = ({ rarity }) => {
  return (
    <RarityColorText rarity={rarity}>
      <>{firstToUpper(Rarity[rarity])}</>
    </RarityColorText>
  );
};

export interface RarityColorTextProps {
  rarity: Rarity;
  children: ReactNode;
}

export const RarityColorText: React.FC<RarityColorTextProps> = ({
  children,
  rarity
}) => {
  return <span className={`rarity ${Rarity[rarity]}`}>{children}</span>;
};
