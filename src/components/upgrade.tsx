import { GameAPI } from '../api/GameAPI';
import { CommonGirlData } from '../data/data';
import { useInventory } from '../hooks/inventory-data-hook';

export interface UpgradePageProps {
  currentGirl: CommonGirlData;
  displayedGirls: CommonGirlData[];
  gameAPI: GameAPI;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({
  currentGirl,
  displayedGirls,
  gameAPI
}) => {
  const inventory = useInventory(gameAPI);
  return (
    <div className="harem-upgrade">
      Upgrade {currentGirl.name}. Books: {inventory.books.length} Gifts:{' '}
      {inventory.gifts.length}
      Girls in cycle: {displayedGirls.length}
    </div>
  );
};
