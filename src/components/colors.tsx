import { Rarity } from '../data/data';
import '../style/colors.css';
import { firstToUpper } from './common';

export interface RarityProps {
  rarity: Rarity;
}

export const RarityText: React.FC<RarityProps> = ({ rarity }) => {
  return (
    <span className={`rarity ${Rarity[rarity]}`}>
      {firstToUpper(Rarity[rarity])}
    </span>
  );
};
