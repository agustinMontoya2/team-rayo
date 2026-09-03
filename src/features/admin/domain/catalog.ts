export const PLAN_TYPES = {
  recreativo: { value: 'recreativo', label: 'Recreativo' },
  competitivo: { value: 'competitivo', label: 'Competitivo' },
} as const;

export type PlanType = keyof typeof PLAN_TYPES;

export const FIGHT_RESULTS = {
  pendiente: { value: 'pendiente', label: 'Pendiente', short: 'Pend.', header: 'Pendientes' },
  victoria: { value: 'victoria', label: 'Victoria', short: 'Ganó', header: 'Ganadas' },
  derrota: { value: 'derrota', label: 'Derrota', short: 'Perdió', header: 'Perdidas' },
} as const;

export type FightResult = keyof typeof FIGHT_RESULTS;

export const EVENT_TYPES = {
  competencia: { value: 'competencia', label: 'Competencia' },
  exhibicion: { value: 'exhibicion', label: 'Exhibición' },
  taller: { value: 'taller', label: 'Taller' },
} as const;

export type EventType = keyof typeof EVENT_TYPES;

export const BELTS = ['Blanco', 'Amarillo', 'Naranja', 'Verde', 'Azul', 'Marrón', 'Negro'] as const;

export type BeltType = (typeof BELTS)[number];

export const BELT_COLORS: Record<BeltType, string> = {
  Blanco: '#e2e8f0',
  Amarillo: '#facc15',
  Naranja: '#fb923c',
  Verde: '#34d399',
  Azul: '#60a5fa',
  Marrón: '#b45309',
  Negro: '#0f172a',
};

export const EVENT_FILTERS: { value: EventType | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: EVENT_TYPES.competencia.value, label: 'Competencias' },
  { value: EVENT_TYPES.exhibicion.value, label: 'Exhibiciones' },
  { value: EVENT_TYPES.taller.value, label: 'Talleres' },
];

const EVENT_BADGE: Record<EventType, string> = {
  competencia: 'bg-pulso-indigo/16 text-pulso-indigo-soft border-pulso-indigo/32',
  exhibicion: 'bg-pulso-red/16 text-pulso-red border-pulso-red/32',
  taller: 'bg-amber-500/14 text-amber-400 border-amber-500/30',
};

const EVENT_PILL: Record<EventType, string> = {
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
  return EVENT_TYPES[t as EventType]?.label ?? t;
}

export function eventTypeBadge(t: string): string {
  return EVENT_BADGE[t as EventType] || '';
}

export function eventTypePill(t: string): string {
  return EVENT_PILL[t as EventType] || 'bg-pulso-badge text-muted-foreground';
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
