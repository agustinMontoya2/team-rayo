import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PLAN_TYPES, EVENT_TYPES, type EventType } from '../admin/domain/catalog';
import { DAYS_OF_WEEK } from '../admin/domain/helpers';
import type { Plan, Schedule } from '../admin/domain/types';

export const PUBLIC_GYM_SLUG = 'team-rayo';

export interface PublicEvent {
  id: string;
  name: string;
  type: EventType;
  date: string;
  description: string;
}

interface PublicGymData {
  plans: Plan[];
  schedules: Schedule[];
  events: PublicEvent[];
}

const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const EVENT_FROM_DB: Record<string, EventType> = {
  competition: 'competencia',
  exhibition: 'exhibicion',
  workshop: 'taller',
};

type DbRow = Record<string, unknown>;

function mapSchedule(row: DbRow): Schedule {
  const idx = Number(row.day_of_week);
  const day = DAYS_OF_WEEK[Math.max(0, Math.min(DAYS_OF_WEEK.length - 1, idx - 1))] ?? '';
  return {
    id: String(row.id),
    day,
    start: String(row.start_time).slice(0, 5),
    end: String(row.end_time).slice(0, 5),
  };
}

function mapPlan(row: DbRow): Plan {
  const benefits = Array.isArray(row.benefits) ? (row.benefits as string[]) : [];
  return {
    id: String(row.id),
    name: String(row.name),
    type: row.type === 'competitivo' ? 'competitivo' : 'recreativo',
    price: Number(row.price),
    description: String(row.description ?? ''),
    featured: Boolean(row.featured),
    benefits,
  };
}

function mapEvent(row: DbRow): PublicEvent {
  return {
    id: String(row.id),
    name: String(row.name),
    type: EVENT_FROM_DB[String(row.type)] ?? EVENT_TYPES.competencia.value,
    date: String(row.date),
    description: String(row.description ?? ''),
  };
}

async function fetchPublicGymData(slug: string): Promise<PublicGymData> {
  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (gymError) throw gymError;
  if (!gym) throw new Error('Gimnasio no encontrado');

  const gymId = String(gym.id);

  const [{ data: scheduleRows }, { data: planRows }, { data: eventRows }] = await Promise.all([
    supabase
      .from('schedules')
      .select('*')
      .eq('gym_id', gymId)
      .eq('active', true)
      .order('day_of_week'),
    supabase
      .from('plans')
      .select('*')
      .eq('gym_id', gymId)
      .eq('active', true),
    supabase
      .from('events')
      .select('*')
      .eq('gym_id', gymId)
      .eq('active', true)
      .eq('is_public', true)
      .order('date'),
  ]);

  return {
    schedules: (scheduleRows ?? []).map(mapSchedule),
    plans: (planRows ?? []).map(mapPlan),
    events: (eventRows ?? []).map(mapEvent),
  };
}

function usePublicData() {
  return useQuery({
    queryKey: ['public-gym', PUBLIC_GYM_SLUG],
    queryFn: () => fetchPublicGymData(PUBLIC_GYM_SLUG),
    staleTime: 30_000,
    retry: 1,
  });
}

export function usePublicPlans() {
  const { data } = usePublicData();
  const plans = data?.plans ?? [];
  return [...plans].sort((a, b) => (a.type === b.type ? 0 : a.type === PLAN_TYPES.recreativo.value ? -1 : 1));
}

export function usePublicSchedule() {
  const { data } = usePublicData();
  const schedules = data?.schedules ?? [];
  return [...schedules].sort((a, b) => {
    const ia = DAY_ORDER.indexOf(a.day);
    const ib = DAY_ORDER.indexOf(b.day);
    if (ia !== ib) return ia - ib;
    return a.start.localeCompare(b.start);
  });
}

export function usePublicEvents() {
  const { data } = usePublicData();
  return data?.events ?? [];
}
