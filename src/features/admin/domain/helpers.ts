import type { Student, Session, Plan, RayoStore, Schedule, Fight, Event, Participant } from './types';
import { BELTS, EVENT_TYPES, FIGHT_RESULTS, PLAN_TYPES, type BeltType } from './catalog';
import { currentPeriod, uid } from './utils';

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

export function dayIndex(day: string): number {
  return DAYS_OF_WEEK.indexOf(day as (typeof DAYS_OF_WEEK)[number]);
}

export function sortByDateAsc<T>(items: T[], getDate: (item: T) => string): T[] {
  return items.slice().sort((a, b) => (getDate(a) < getDate(b) ? -1 : 1));
}

export function sortByDateDesc<T>(items: T[], getDate: (item: T) => string): T[] {
  return items.slice().sort((a, b) => (getDate(a) < getDate(b) ? 1 : -1));
}

export function fullName(a?: Student | null): string {
  return (((a && a.firstName) || '') + ' ' + ((a && a.lastName) || '')).trim();
}

export function currentBelt(d: RayoStore, studentId: string): BeltType {
  const gs = (d.graduations || [])
    .filter((g) => g.studentId === studentId)
    .sort((a, b) => (a.examDate < b.examDate ? 1 : -1));
  return gs.length ? gs[0].belt : BELTS[0];
}

export function studentPlan(d: RayoStore, studentId: string | null): Plan | null {
  const a = (d.students || []).find((x) => x.id === studentId);
  return a && a.planId ? (d.plans || []).find((p) => p.id === a.planId) || null : null;
}

export function studentsInSession(d: RayoStore, date: string): Student[] {
  return (d.students || []).filter((a) => a.active && a.enrollmentDate <= date);
}

export function absencesFrom(d: RayoStore, session: Session): Student[] {
  const eligible = studentsInSession(d, session.date);
  return eligible.filter((a) => session.present.indexOf(a.id) === -1);
}

function lastDayOfPeriod(period: string): string {
  const [yy, mm] = period.split('-');
  return `${yy}-${mm}-${new Date(Number(yy), Number(mm), 0).getDate()}`;
}

export function enrolledInPeriod(a: Student, period: string): boolean {
  if (!a.enrollmentDate) return false;
  return a.enrollmentDate <= lastDayOfPeriod(period);
}

export function pendingPaymentsForPeriod(d: RayoStore, period: string): Student[] {
  return (d.students || []).filter(
    (a) => a.active && a.planId && enrolledInPeriod(a, period) &&
      !(d.fees || []).some((f) => f.studentId === a.id && f.period === period)
  );
}

export interface PendingFee {
  student: Student;
  periods: string[];
  amount: number;
}

export function pendingFeesPerStudent(d: RayoStore, upToPeriod: string = currentPeriod()): PendingFee[] {
  const rows: PendingFee[] = [];
  for (const a of d.students || []) {
    if (!a.active || !a.planId || !enrolledInPeriod(a, upToPeriod)) continue;
    const enrollY = Number((a.enrollmentDate || '').slice(0, 4));
    const enrollM = Number((a.enrollmentDate || '').slice(5, 7));
    if (!enrollY || !enrollM) continue;
    const [upY, upM] = upToPeriod.split('-').map(Number);
    const periods: string[] = [];
    let y = upY;
    let m = upM;
    while (y > enrollY || (y === enrollY && m >= enrollM)) {
      const period = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}`;
      const paid = (d.fees || []).some((f) => f.studentId === a.id && f.period === period);
      if (!paid) periods.push(period);
      m -= 1;
      if (m === 0) {
        m = 12;
        y -= 1;
      }
    }
    if (periods.length) {
      const plan = studentPlan(d, a.id);
      rows.push({ student: a, periods, amount: (plan?.price ?? 0) * periods.length });
    }
  }
  return rows;
}

export function attendancePct(present: number, total: number): number | null {
  if (!total) return null;
  return Math.round((present / total) * 100);
}

export interface FightRecord {
  wins: number;
  losses: number;
  pending: number;
}

export function fightRecord(d: RayoStore, studentId: string): FightRecord {
  const record: FightRecord = { wins: 0, losses: 0, pending: 0 };
  for (const e of d.events || []) {
    for (const f of e.fights) {
      if (f.studentId !== studentId) continue;
      if (f.result === FIGHT_RESULTS.victoria.value) record.wins++;
      else if (f.result === FIGHT_RESULTS.derrota.value) record.losses++;
      else record.pending++;
    }
  }
  return record;
}

export interface CompetitionHistoryEntry {
  e: Event;
  part?: Participant;
  fights: Fight[];
}

export function competitionHistory(d: RayoStore, studentId: string): CompetitionHistoryEntry[] {
  return (d.events || [])
    .filter((e) => e.type === EVENT_TYPES.competencia.value)
    .map((e) => ({
      e,
      part: e.participants.find((pp) => pp.studentId === studentId),
      fights: e.fights.filter((f) => f.studentId === studentId),
    }))
    .filter((c) => c.part)
    .sort((a, b) => (a.e.date < b.e.date ? 1 : -1));
}

export function scheduleLabel(h?: Schedule | null): string {
  if (!h) return '';
  return `${h.day} · ${h.start} a ${h.end}`;
}

export function newPlanFactory(): Plan {
  return { id: uid('p'), name: '', type: PLAN_TYPES.recreativo.value, price: 0, description: '', featured: false, benefits: [] };
}
