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
  /**
   * Consume a single unit of this item, and return the new inventory
   * state (all items of the consumed type)
   * @param item the item to consume
   */
  consumeItem(item: ItemEntry<Item>): ItemEntry<Item>[];
  /**
   * Consume a list of items (1 or several units each), and return the new
   * inventory state (all items of the consumed type)
   * @param items the items to consume
   */
  consumeItems(items: ItemEntry<Item>[]): ItemEntry<Item>[];
}

export function useInventory(gameAPI: GameAPI): InventoryResult {
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

  const consumeItems = useCallback(
    (consumedItems: ItemEntry<Item>[]) => {
      let newInventory: Inventory | undefined;
      const type =
        consumedItems.length > 0 ? consumedItems[0].item.type : undefined;
      setInventory((currentInventory) => {
        newInventory = {
          books: [...currentInventory.books],
          gifts: [...currentInventory.gifts]
        };
        for (const consumedItemEntry of consumedItems) {
          if (consumedItemEntry.count > 0) {
            if (consumedItemEntry.item.type === 'book') {
              const bookIndex = newInventory.books.findIndex(
                (item) => item.item.itemId === consumedItemEntry.item.itemId
              );
              if (bookIndex >= 0) {
                const usedBook = newInventory.books[bookIndex];
                const newBookEntry = {
                  ...usedBook,
                  count: usedBook.count - consumedItemEntry.count
                };
                if (newBookEntry.count <= 0) {
                  newInventory.books.splice(bookIndex, 1);
                } else {
                  newInventory.books[bookIndex] = newBookEntry;
                }
              }
            } else if (consumedItemEntry.item.type === 'gift') {
              const giftIndex = newInventory.gifts.findIndex(
                (item) => item.item.itemId === consumedItemEntry.item.itemId
              );
              if (giftIndex >= 0) {
                const usedGift = newInventory.gifts[giftIndex];
                const newGiftEntry = {
                  ...usedGift,
                  count: usedGift.count - consumedItemEntry.count
                };
                if (newGiftEntry.count <= 0) {
                  newInventory.gifts.splice(giftIndex, 1);
                } else {
                  newInventory.gifts[giftIndex] = newGiftEntry;
                }
              }
            }
          }
        }
        return newInventory;
      });
      return newInventory === undefined || type === undefined
        ? []
        : type === 'book'
        ? newInventory.books
        : newInventory.gifts;
    },
    [setInventory]
  );

  const consumeItem = useCallback(
    (item: ItemEntry<Item>) => {
      const entry = { ...item, count: 1 };
      return consumeItems([entry]);
    },
    [consumeItems]
  );

  return {
    inventory,
    loading,
    consumeItem,
    consumeItems
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
