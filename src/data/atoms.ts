import { atom, SetStateAction, WritableAtom } from 'jotai';
import { atomWithLazy } from 'jotai/vanilla/utils';
import { CONFIG_CACHE } from './cache';

const SETTINGS_REQUEST = '/settings.json';

let settings: Record<string, any> = {};
let hasChanged = false;
let isUpdating = false;

function saveSettings() {
  if (window.caches == null) return;
  hasChanged = true;
  if (isUpdating) return;
  isUpdating = true;
  queueMicrotask(async () => {
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
  });
}

export async function loadSettings() {
  if (window.caches == null) return;
  if (!(await caches.has(CONFIG_CACHE))) return;
  const cache = await caches.open(CONFIG_CACHE);
  const storedSettings = await cache.match(new Request(SETTINGS_REQUEST));
  if (!storedSettings) return;
  settings = await storedSettings.json();
}

export function atomWithStorage<Value>(
  key: string,
  initialValue: Value,
  ..._args: unknown[]
): WritableAtom<Value, [SetStateAction<Value>], void> {
  const baseAtom = atomWithLazy(() => settings[key] ?? initialValue);
  const anAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: SetStateAction<Value>) => {
      const nextValue =
        typeof update === 'function'
          ? (update as (prev: Value) => Value)(get(baseAtom))
          : update;
      set(baseAtom, nextValue);
      settings[key] = nextValue;
      saveSettings();
    }
  );

  return anAtom;
}

export const showPose0Atom = atomWithStorage<boolean>('showPose0', false);

export const filterBySkill3Atom = atomWithStorage<boolean>(
  'filterBySkill3',
  false
);
