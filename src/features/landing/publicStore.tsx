import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Plan, Schedule } from '../admin/domain/types';
import { load } from '../admin/domain/persistence';

interface PublicData {
  plans: Plan[];
  schedules: Schedule[];
}

const Ctx = createContext<PublicData | null>(null);

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [data] = useState<PublicData>(() => {
    const store = load();
    return { plans: store.plans, schedules: store.schedules };
  });

  const value = useMemo(() => data, [data]);
  return createElement(Ctx.Provider, { value }, children);
}

export function usePublicStore(): PublicData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePublicStore debe usarse dentro de PublicDataProvider');
  return ctx;
}
