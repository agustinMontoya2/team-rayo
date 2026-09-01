import { useStore } from '../admin/store';

const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function usePublicPlans() {
  const { store } = useStore();
  return [...store.plans].sort((a, b) => (a.type === b.type ? 0 : a.type === 'recreativo' ? -1 : 1));
}

export function usePublicSchedule() {
  const { store } = useStore();
  return [...store.schedules].sort((a, b) => {
    const ia = DAY_ORDER.indexOf(a.day);
    const ib = DAY_ORDER.indexOf(b.day);
    if (ia !== ib) return ia - ib;
    return a.start.localeCompare(b.start);
  });
}