import { useCallback, useContext, useEffect, useState } from 'react';
import { CommonGirlData, Equipment, Rarity } from '../data/data';
import { GameAPIContext } from '../data/game-api-context';
import { EquipmentTooltip } from './girls-equipment';
import { importEquipment } from '../data/import/harem-import';
import { Tooltip } from './common';
import '../style/quick-girl-equipment.css';
import { GameAPI } from '../api/GameAPI';
import { getDocumentHref } from '../migration';

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
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  useEffect(() => {
    if (!gameAPI) return;
    gameAPI
      .getGirlsInventory(girl, slot)
      .then((inventory) => importEquipment(inventory))
      .then((inventory) => setEquipment(inventory.items))
      .then(() => setLoading(false));
  }, [gameAPI, girl, slot]);
  if (!gameAPI) return null;
  const currentEquipment = girl.equipment
    ? girl.equipment.items.find((item) => item.slot === slot)
    : undefined;

  return (
    <div className="qh-quick-equipment">
      <div className="qh-quick-equipment-actions">
        {/* <button>a1</button>
        <button>a2</button>
        <button>a3</button>
        <button>a4</button> */}
        <a
          href={getDocumentHref(
            `/girl/${girl.id}?resource=equipment&equipment-slot=${slot}`
          )}
          rel="noreferrer"
        >
          Go to equipment page
        </a>
      </div>
      <div className="qh-quick-inventory">
        {loading
          ? 'Loading inventory...'
          : equipment.length === 0
            ? 'No equipment found for the selected slot.'
            : equipment.map((item) => (
                <EquipmentTile
                  girl={girl}
                  equipment={item}
                  currentEquipment={currentEquipment}
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
  currentEquipment: Equipment | undefined;
  close?: (() => void) | undefined;
}

const EquipmentTile: React.FC<EquipmentTileProps> = ({
  girl,
  equipment,
  currentEquipment,
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
    <img alt="" src={img} className={imgClassNames.join(' ')} onClick={equip} />
  );

  return (
    <div className="item-tile girl-item-tile">
      <>
        <Tooltip
          place="left"
          tooltip={
            <EquipmentTooltip
              equipment={equipment}
              currentEquipment={currentEquipment}
              girl={girl}
            />
          }
        >
          <div className="girl-item-icon-wrapper">{icon}</div>
        </Tooltip>
      </>
    </div>
  );
};
