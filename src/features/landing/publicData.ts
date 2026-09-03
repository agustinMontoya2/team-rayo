import { usePublicStore } from './publicStore';
import { PLAN_TYPES } from '../admin/domain/catalog';

const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function usePublicPlans() {
  const { plans } = usePublicStore();
  return [...plans].sort((a, b) => (a.type === b.type ? 0 : a.type === PLAN_TYPES.recreativo.value ? -1 : 1));
}

export function usePublicSchedule() {
  const { schedules } = usePublicStore();
  return [...schedules].sort((a, b) => {
    const ia = DAY_ORDER.indexOf(a.day);
    const ib = DAY_ORDER.indexOf(b.day);
    if (ia !== ib) return ia - ib;
    return a.start.localeCompare(b.start);
  });
}
