import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RayoStore } from './domain/types';
import { seed } from './domain/seed';
import { syncLoad, syncSave } from '../../lib/sync';
import { useAuthContext } from './providers/AuthProvider';

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
  persistError: boolean;
  clearPersistError: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { gymId } = useAuthContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['gym', gymId],
    queryFn: () => syncLoad(gymId!),
    enabled: !!gymId,
    staleTime: 30_000,
  });

  const [store, dispatch] = useReducer(reducer, undefined, seed);
  const [persistError, setPersistError] = useState(false);

  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    if (query.data) dispatch({ type: 'SET', store: query.data });
  }, [query.data]);

  const setStore = useCallback(
    (s: RayoStore) => {
      dispatch({ type: 'SET', store: s });
      if (!gymId) return;
      const prev = storeRef.current;
      syncSave(prev, s, gymId)
        .then(() => queryClient.invalidateQueries({ queryKey: ['gym', gymId] }))
        .catch(() => setPersistError(true));
    },
    [gymId, queryClient]
  );

  const clearPersistError = useCallback(() => setPersistError(false), []);

  const value = useMemo(
    () => ({ store, setStore, persistError, clearPersistError }),
    [store, setStore, persistError, clearPersistError]
  );

  return createElement(Ctx.Provider, { value }, children);
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}
