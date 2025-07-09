import { IDBPDatabase, openDB } from 'idb';

const MY_DATABASE_NAME = 'harem-plus-plus-db';

// Version 1
const GIRLS_LIST_STORE = {
  name: 'GirlsListStore',
  key: 'id_girl'
};

// Version 1
const GIRL_STORE = {
  name: 'GirlStore',
  key: 'id_girl'
};

// Version 1
const GIRL_SOURCE_STORE = {
  name: 'GirlSourceStore',
  key: 'id_girl'
};

async function openMyDB(): Promise<IDBPDatabase> {
  return await openDB(MY_DATABASE_NAME, 1, {
    upgrade(db) {
      const names = [...db.objectStoreNames];
      [GIRLS_LIST_STORE, GIRL_STORE, GIRL_SOURCE_STORE].forEach((e) => {
        if (!names.includes(e.name)) {
          db.createObjectStore(e.name, { keyPath: e.key });
        }
      });
    }
  });
}

export async function updateGirlsList(girlsList: any[]): Promise<void> {
  try {
    const db = await openMyDB();
    const store = db
      .transaction(GIRLS_LIST_STORE.name, 'readwrite')
      .objectStore(GIRLS_LIST_STORE.name);

    await Promise.all(
      girlsList.map(async (girl) => {
        if (GIRLS_LIST_STORE.key in girl) {
          store.put(girl);
        }
      })
    );
  } catch (error) {
    console.warn(
      'An error occurred while trying to update girlsList. Reason: ',
      error
    );
    return Promise.reject(['Failed to update girlsList', error]);
  }
}

export async function updateGirl(girl: any): Promise<void> {
  try {
    const db = await openMyDB();
    await db.put(GIRL_STORE.name, girl);
  } catch (error) {
    console.warn(
      'An error occurred while trying to update girl. Reason: ',
      error
    );
    return Promise.reject(['Failed to update girl', error]);
  }
}

export async function updateGirlsSource(girlsSource: any): Promise<void> {
  try {
    const db = await openMyDB();
    const store = db
      .transaction(GIRL_SOURCE_STORE.name, 'readwrite')
      .objectStore(GIRL_SOURCE_STORE.name);

    await Promise.all(
      Object.entries(girlsSource).map(async ([id_girl, source]) => {
        store.put({ id_girl: +id_girl, ...(source as any) });
      })
    );
  } catch (error) {
    console.warn(
      'An error occurred while trying to update girls source. Reason: ',
      error
    );
    return Promise.reject(['Failed to update girls source', error]);
  }
}
