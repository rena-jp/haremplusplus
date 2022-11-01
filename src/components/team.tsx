import { CommonGirlData } from '../data/data';

export interface TeamProps {
  girls: CommonGirlData[];
  totalPower: number;
  attack: number;
  defense: number;
  harmony: number;
  ego: number;
}

export const Team: React.FC<TeamProps> = ({ girls }) => {
  return <></>;
};
