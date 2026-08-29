import { createContext, createElement, useContext, useReducer, type ReactNode } from 'react';
import type { RayoStore } from './domain/types';
import { load, save } from './domain/persistence';
import { seed } from './domain/seed';

export type { RayoStore } from './domain/types';
export * from './domain/types';
export * from './domain/helpers';
export * from './domain/format';
export * from './domain/seed';
export * from './domain/actions';

export type Action =
  | { type: 'SET'; store: RayoStore }
  | { type: 'RESET'; store: RayoStore };

function reducer(state: RayoStore, action: Action): RayoStore {
  switch (action.type) {
    case 'SET':
      return action.store;
    case 'RESET':
      return action.store;
    default:
      return state;
  }
}

interface StoreCtx {
  store: RayoStore;
  setStore: (s: RayoStore) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(reducer, undefined, load);

  const setStore = (s: RayoStore) => {
    save(s);
    dispatch({ type: 'SET', store: s });
  };
  const reset = () => {
    const s = seed();
    setStore(s);
  };

  return createElement(Ctx.Provider, { value: { store, setStore, reset } }, children);
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}