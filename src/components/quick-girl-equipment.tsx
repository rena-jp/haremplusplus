import { useCallback, useContext, useEffect, useState } from 'react';
import { CommonGirlData, Equipment, Rarity } from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import { EquipmentTooltip } from './girls-equipment';
import { importEquipment } from '../data/import/harem-import';
import { Tooltip } from './common';
import '../style/quick-girl-equipment.css';
import { GameAPI } from '../api/GameAPI';

export interface QuickEquipmentProps {
  girl: CommonGirlData;
  slot: number;
  close?: () => void;
}

export const QuickEquipment: React.FC<QuickEquipmentProps> = ({
  girl,
  slot,
  close
}) => {
  const gameAPI = useContext(GameAPIContext).gameAPI;
  if (!gameAPI) {
    return null;
  }
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  useEffect(() => {
    gameAPI
      .getGirlsInventory(girl, slot)
      .then((inventory) => importEquipment(inventory))
      .then((inventory) => setEquipment(inventory.items))
      .then(() => setLoading(false));
  }, [gameAPI, girl, slot]);

  console.log('Render QE with items: ', equipment.length);

  return (
    <div className="qh-quick-equipment">
      <div className="qh-quick-equipment-actions">
        {/* <button>a1</button>
        <button>a2</button>
        <button>a3</button>
        <button>a4</button> */}
      </div>
      <div className="qh-quick-inventory">
        {loading
          ? 'Loading inventory...'
          : equipment.map((item) => (
              <EquipmentTile
                girl={girl}
                equipment={item}
                gameAPI={gameAPI}
                key={item.uid}
                close={close}
              />
            ))}
      </div>
    </div>
  );
};

interface EquipmentTileProps {
  girl: CommonGirlData;
  equipment: Equipment;
  gameAPI: GameAPI;
  close?: () => void;
}

const EquipmentTile: React.FC<EquipmentTileProps> = ({
  girl,
  equipment,
  gameAPI,
  close
}) => {
  const imgClassNames = ['girls-equipment-icon', 'rarity-bg'];
  if (equipment !== undefined) {
    imgClassNames.push(Rarity[equipment.rarity]);
  } else {
    imgClassNames.push('none');
  }

  const equip = useCallback(() => {
    gameAPI.equipOne(girl, equipment).then(() => {
      if (close) close();
    });
  }, [gameAPI, girl, equipment]);

  const img = equipment?.icon;
  const icon = (
    <img src={img} className={imgClassNames.join(' ')} onClick={equip} />
  );

  return (
    <div className="item-tile girl-item-tile">
      <>
        <Tooltip
          place="left"
          tooltip={<EquipmentTooltip equipment={equipment} girl={girl} />}
        >
          <div className="girl-item-icon-wrapper">{icon}</div>
        </Tooltip>
      </>
    </div>
  );
};
