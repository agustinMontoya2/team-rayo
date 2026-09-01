import type { RayoStore } from '../types';

export interface ActionResult {
  store: RayoStore;
  error?: string;
  info?: string;
  fieldErrors?: Record<string, string>;
}

export function ok(store: RayoStore, info?: string): ActionResult {
  return info ? { store, info } : { store };
}

export function err(store: RayoStore, error: string, fieldErrors?: Record<string, string>): ActionResult {
  return fieldErrors ? { store, error, fieldErrors } : { store, error };
}