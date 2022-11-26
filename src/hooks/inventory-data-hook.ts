import { useCallback, useEffect, useState } from 'react';
import { GameAPI } from '../api/GameAPI';
import {
  Book,
  BookEntry,
  getRarity,
  Gift,
  GiftEntry,
  Inventory,
  Item,
  ItemEntry
} from '../data/data';
import { GameInventory, InventoryItem } from '../data/game-data';

export interface InventoryResult {
  inventory: Inventory;
  loading: boolean;
  consumeItem(item: ItemEntry<Item>): ItemEntry<Item>[];
}

export function useInventory(gameAPI: GameAPI): InventoryResult {
  // TODO Update inventory count after using an item
  const [inventory, setInventory] = useState<Inventory>({
    books: [],
    gifts: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gameAPI.getMarketInventory(true).then((gameInv) => {
      const inv = importInventory(gameInv);
      setInventory(inv);
      setLoading(false);
    });
  }, [gameAPI]);

  const consumeItem = useCallback(
    (consumedItem: ItemEntry<Item>) => {
      let newInventory: Inventory | undefined;
      setInventory((currentInventory) => {
        newInventory = {
          books: [...currentInventory.books],
          gifts: [...currentInventory.gifts]
        };
        if (consumedItem.count > 0) {
          if (consumedItem.item.type === 'book') {
            const bookIndex = newInventory.books.findIndex(
              (item) => item.item.itemId === consumedItem.item.itemId
            );
            if (bookIndex >= 0) {
              const usedBook = newInventory.books[bookIndex];
              const newBookEntry = { ...usedBook, count: usedBook.count - 1 };
              if (newBookEntry.count <= 0) {
                newInventory.books.splice(bookIndex, 1);
              } else {
                newInventory.books[bookIndex] = newBookEntry;
              }
            }
          } else if (consumedItem.item.type === 'gift') {
            const giftIndex = newInventory.gifts.findIndex(
              (item) => item.item.itemId === consumedItem.item.itemId
            );
            if (giftIndex >= 0) {
              const usedGift = newInventory.gifts[giftIndex];
              const newGiftEntry = { ...usedGift, count: usedGift.count - 1 };
              if (newGiftEntry.count <= 0) {
                newInventory.gifts.splice(giftIndex, 1);
              } else {
                newInventory.gifts[giftIndex] = newGiftEntry;
              }
            }
          }
          return newInventory;
        }
        return inventory;
      });
      return newInventory === undefined
        ? []
        : consumedItem.item.type === 'book'
        ? newInventory.books
        : newInventory.gifts;
    },
    [setInventory]
  );

  return {
    inventory,
    loading,
    consumeItem
  };
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
    xp: Number(potion.item.value),
    icon: potion.item.ico,
    type: 'book'
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
    aff: Number(giftItem.item.value),
    icon: giftItem.item.ico,
    type: 'gift'
  };

  return {
    item: gift,
    gift,
    count: Number(giftItem.quantity)
  };
}
