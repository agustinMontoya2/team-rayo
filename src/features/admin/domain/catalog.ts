import type { EventType, FightResult, PlanType } from './types';

export interface CatalogEntry<T extends string> {
  value: T;
  label: string;
}

export const PLAN_TYPES: Record<PlanType, CatalogEntry<PlanType>> = {
  recreativo: { value: 'recreativo', label: 'Recreativo' },
  competitivo: { value: 'competitivo', label: 'Competitivo' },
};

export const FIGHT_RESULTS: Record<FightResult, { value: FightResult; label: string; short: string; header: string }> = {
  pendiente: { value: 'pendiente', label: 'Pendiente', short: 'Pend.', header: 'Pendientes' },
  victoria: { value: 'victoria', label: 'Victoria', short: 'Ganó', header: 'Ganadas' },
  derrota: { value: 'derrota', label: 'Derrota', short: 'Perdió', header: 'Perdidas' },
};

export const EVENT_FILTERS: { value: EventType | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'competencia', label: 'Competencias' },
  { value: 'exhibicion', label: 'Exhibiciones' },
  { value: 'taller', label: 'Talleres' },
];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  competencia: 'Competencia',
  exhibicion: 'Exhibición',
  taller: 'Taller',
};

const EVENT_BADGE: Record<string, string> = {
  competencia: 'bg-pulso-indigo/16 text-pulso-indigo-soft border-pulso-indigo/32',
  exhibicion: 'bg-pulso-red/16 text-pulso-red border-pulso-red/32',
  taller: 'bg-amber-500/14 text-amber-400 border-amber-500/30',
};

const EVENT_PILL: Record<string, string> = {
  competencia: 'bg-pulso-red/16 text-pulso-red',
  exhibicion: 'bg-pulso-indigo/17 text-pulso-indigo-soft',
  taller: 'bg-amber-500/16 text-amber-400',
};

const FIGHT_BADGE: Record<FightResult, string> = {
  victoria: 'border-green-500/40 text-green-400',
  derrota: 'border-pulso-red/40 text-pulso-red',
  pendiente: 'border-pulso-line text-muted-foreground',
};

const FIGHT_PILL: Record<FightResult, string> = {
  victoria: 'bg-green-500/17 text-green-400',
  derrota: 'bg-pulso-red/16 text-pulso-red',
  pendiente: 'bg-amber-500/16 text-amber-400',
};

export function eventTypeLabel(t: EventType | string): string {
  return EVENT_TYPE_LABELS[t as EventType] || t;
}

export function eventTypeBadge(t: string): string {
  return EVENT_BADGE[t] || '';
}

export function eventTypePill(t: string): string {
  return EVENT_PILL[t] || 'bg-pulso-badge text-muted-foreground';
}

export function fightResultBadge(r: FightResult | string): string {
  return FIGHT_BADGE[r as FightResult] || 'border-pulso-line text-muted-foreground';
}

export function fightResultPill(r: FightResult | string): string {
  return FIGHT_PILL[r as FightResult] || 'bg-pulso-badge text-muted-foreground';
}

export function fightResultShort(r: FightResult | string): string {
  return FIGHT_RESULTS[r as FightResult]?.short ?? r;
}

export function fightResultLabel(r: FightResult | string): string {
  return FIGHT_RESULTS[r as FightResult]?.label ?? r;
}

export function fightResultHeader(r: FightResult | string): string {
  return FIGHT_RESULTS[r as FightResult]?.header ?? r;
}