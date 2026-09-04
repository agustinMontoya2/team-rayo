import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { mapPlan, mapSchedule, EVENT_FROM_DB } from '../../lib/domain-mappers';
import { PLAN_TYPES, type EventType } from '../admin/domain/catalog';
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

function mapEvent(row: Record<string, unknown>): PublicEvent {
  return {
    id: String(row.id),
    name: String(row.name),
    type: EVENT_FROM_DB[String(row.type)] ?? 'competencia',
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
