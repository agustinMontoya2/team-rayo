import type { RayoStore } from '../domain/types';
import { seed } from '../domain/seed';
import { normalize } from '../domain/utils';

export const KEY = 'team_rayo_mvp_v1';

export function load(): RayoStore {
  try {
    const raw = localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return seed();
  }
}

export function save(store: RayoStore): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
