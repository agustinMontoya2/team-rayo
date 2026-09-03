import type { RayoStore, Graduation, Session } from '../types';
import { uid } from '../utils';
import { studentsInSession } from '../helpers';
import type { BeltType } from '../catalog';
import { validateSessionDate, validateGraduationFields } from '../validators';
import { MSG } from '../messages';
import { err, ok, type ActionResult } from './common';

export function saveAttendance(d: RayoStore, sessionId: string, present: string[]): ActionResult {
  const s = d.sessions.find((x) => x.id === sessionId);
  if (!s) return err(d, MSG.sessionNotFound);
  const eligible = studentsInSession(d, s.date);
  const missing = eligible.length - present.length;
  const next = d.sessions.map((x) => (x.id === sessionId ? { ...x, present } : x));
  return ok({ ...d, sessions: next }, `Jornada guardada: ${present.length} presentes · ${missing} ausentes.`);
}

export function createSession(d: RayoStore, date: string, scheduleId: string): ActionResult {
  const dateErr = validateSessionDate(d, date);
  if (dateErr) return err(d, dateErr, { date: dateErr });
  const session: Session = { id: uid('j'), date, scheduleId: scheduleId || null, present: [] };
  return ok({ ...d, sessions: [...d.sessions, session] });
}

export function deleteSession(d: RayoStore, sessionId: string): ActionResult {
  return ok({ ...d, sessions: d.sessions.filter((x) => x.id !== sessionId) });
}

export function registerGraduation(
  d: RayoStore,
  input: { studentId: string; belt: BeltType; examDate: string; score: number | string }
): ActionResult {
  const pts = Number(input.score);
  const fieldErrors = validateGraduationFields({ examDate: input.examDate, score: input.score });
  if (Object.keys(fieldErrors).length > 0) return err(d, Object.values(fieldErrors)[0], fieldErrors);
  if (!d.students.some((a) => a.id === input.studentId)) return err(d, MSG.studentNotFound);
  const grad: Graduation = {
    id: uid('g'),
    studentId: input.studentId,
    belt: input.belt,
    examDate: input.examDate,
    score: pts,
  };
  return ok({ ...d, graduations: [...d.graduations, grad] });
}
