import { atomWithStorage } from 'jotai/utils';
import { type SyncStorage } from 'jotai/vanilla/utils/atomWithStorage';
import { CONFIG_CACHE } from './cache';

const SETTINGS_REQUEST = '/settings.json';

let settings: Record<string, any> = {};
const subscriber = new Map<string, [(newValue: any) => void, any]>();
let hasChanged = false;
let isUpdating = false;

async function updateSettings() {
  if (window.caches == null) return;
  hasChanged = true;
  if (isUpdating) return;
  isUpdating = true;
  const cache = await caches.open(CONFIG_CACHE);
  while (hasChanged) {
    hasChanged = false;
    const json = JSON.stringify(settings);
    await cache.put(
      new Request(SETTINGS_REQUEST),
      new Response(json, { headers: { 'Content-Type': 'application/json' } })
    );
  }
  isUpdating = false;
}

export async function loadSettings() {
  if (window.caches == null) return;
  if (!(await caches.has(CONFIG_CACHE))) return;
  const cache = await caches.open(CONFIG_CACHE);
  const storedSettings = await cache.match(new Request(SETTINGS_REQUEST));
  if (!storedSettings) return;
  const newSettings = await storedSettings.json();
  const oldSettings = settings;
  settings = newSettings;
  [...subscriber.entries()].forEach(([key, [callback, initialValue]]) => {
    if (oldSettings[key] !== newSettings[key]) {
      callback(settings[key] ?? initialValue);
    }
  });
}

const memoryStorage: SyncStorage<any> = {
  getItem(key, initialValue) {
    return settings[key] ?? initialValue;
  },
  setItem(key, newValue) {
    settings[key] = newValue;
    updateSettings();
  },
  removeItem(key) {
    delete settings[key];
    updateSettings();
  },
  subscribe(key, callback, initialValue) {
    subscriber.set(key, [callback, initialValue]);
    return () => {
      subscriber.delete(key);
    };
  }
};

export const showPose0Atom = atomWithStorage<boolean>(
  'showPose0',
  false,
  memoryStorage
);

export const filterBySkill3Atom = atomWithStorage<boolean>(
  'filterBySkill3',
  false,
  memoryStorage
);
