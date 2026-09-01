import type { RayoStore } from '../types';
import { uid } from '../utils';
import { dayIndex } from '../helpers';
import { validateScheduleFields } from '../validators';
import { err, ok, type ActionResult } from './common';

export function sortSchedules(schedules: RayoStore['schedules']): RayoStore['schedules'] {
  return schedules.slice().sort((a, b) => {
    const ia = dayIndex(a.day);
    const ib = dayIndex(b.day);
    if (ia !== ib) return ia - ib;
    return a.start < b.start ? -1 : 1;
  });
}

export function createUpdateSchedule(
  d: RayoStore,
  input: { id?: string; day: string; start: string; end: string }
): ActionResult {
  const fieldErrors = validateScheduleFields(input);
  if (Object.keys(fieldErrors).length > 0) return err(d, Object.values(fieldErrors)[0], fieldErrors);
  if (input.id && d.schedules.some((h) => h.id === input.id)) {
    const next = sortSchedules(d.schedules.map((h) => (h.id === input.id ? { ...h, ...input } : h)));
    return ok({ ...d, schedules: next }, 'Horario actualizado.');
  }
  const next = sortSchedules([...d.schedules, { id: uid('h'), ...input }]);
  return ok({ ...d, schedules: next }, 'Horario agregado.');
}

export function deleteSchedule(d: RayoStore, scheduleId: string): ActionResult {
  const usos = d.sessions.filter((s) => s.scheduleId === scheduleId).length;
  const info = usos ? ` Se desvinculó de ${usos} jornada${usos === 1 ? '' : 's'}.` : '';
  return ok(
    { ...d, schedules: d.schedules.filter((x) => x.id !== scheduleId), sessions: d.sessions.map((s) => (s.scheduleId === scheduleId ? { ...s, scheduleId: null } : s)) },
    `Horario eliminado.${info}`
  );
}