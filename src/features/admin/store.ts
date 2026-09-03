import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { RayoStore } from './domain/types';
import { load, save } from './domain/persistence';
import { seed } from './domain/seed';

export type { RayoStore } from './domain/types';
export * from './domain/types';
export * from './domain/helpers';
export * from './domain/format';
export * from './domain/seed';
export * from './domain/utils';
export * from './domain/actions';
export * from './domain/catalog';

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
  persistError: boolean;
  clearPersistError: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(reducer, undefined, load);
  const [persistError, setPersistError] = useState(false);

  const setStore = useCallback((s: RayoStore) => {
    if (!save(s)) setPersistError(true);
    dispatch({ type: 'SET', store: s });
  }, []);

  const clearPersistError = useCallback(() => setPersistError(false), []);

  const value = useMemo(
    () => ({ store, setStore, reset: () => setStore(seed()), persistError, clearPersistError }),
    [store, setStore, persistError, clearPersistError]
  );

  return createElement(Ctx.Provider, { value }, children);
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}
