import { useEffect, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  Book,
  BookEntry,
  getRarity,
  Gift,
  GiftEntry,
  Inventory
} from '../data/data';
import { GameInventory, InventoryItem } from '../data/game-data';

export function useInventory(gameAPI: GameAPI): Inventory {
  const [inventory, setInventory] = useState<Inventory>({
    books: [],
    gifts: []
  });

  useEffect(() => {
    gameAPI.getMarketInventory(true).then((gameInv) => {
      const inv = importInventory(gameInv);
      setInventory(inv);
    });
  }, [gameAPI]);

  return inventory;
}

function importInventory(gameInventory: GameInventory): Inventory {
  const books = gameInventory.potion.map((potion) => importBook(potion));
  const gifts = gameInventory.gift.map((gift) => importGift(gift));
  return { books, gifts };
}

function importBook(potion: InventoryItem): BookEntry {
  const book: Book = {
    itemId: Number(potion.id_item),
    label: potion.item.name,
    rarity: getRarity(potion.item.rarity),
    xp: Number(potion.item.value)
  };

  return {
    item: book,
    book,
    count: Number(potion.quantity)
  };
}

function importGift(giftItem: InventoryItem): GiftEntry {
  const gift: Gift = {
    itemId: Number(giftItem.id_item),
    label: giftItem.item.name,
    rarity: getRarity(giftItem.item.rarity),
    aff: Number(giftItem.item.value)
  };

  return {
    item: gift,
    gift,
    count: Number(giftItem.quantity)
  };
}
