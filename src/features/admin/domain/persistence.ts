import type { RayoStore } from '../domain/types';
import { normalize, seed } from '../domain/seed';

const KEY = 'team_rayo_mvp_v1';

export function load(): RayoStore {
  try {
    const raw = localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return seed();
  }
}

export function save(store: RayoStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* noop */
  }
}