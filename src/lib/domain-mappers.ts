import { DAYS_OF_WEEK } from '../features/admin/domain/helpers';
import type { EventType } from '../features/admin/domain/catalog';
import type { Plan, Schedule } from '../features/admin/domain/types';

export type DbRow = Record<string, unknown>;

export const EVENT_FROM_DB: Record<string, EventType> = {
  competition: 'competencia',
  exhibition: 'exhibicion',
  workshop: 'taller',
};

export function mapSchedule(row: DbRow): Schedule {
  const idx = Number(row.day_of_week);
  const day = DAYS_OF_WEEK[Math.max(0, Math.min(DAYS_OF_WEEK.length - 1, idx - 1))] ?? '';
  return {
    id: String(row.id),
    day,
    start: String(row.start_time).slice(0, 5),
    end: String(row.end_time).slice(0, 5),
  };
}

export function mapPlan(row: DbRow): Plan {
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
