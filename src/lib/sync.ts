import { supabase } from './supabase';
import { seed } from '../features/admin/domain/seed';
import { DAYS_OF_WEEK } from '../features/admin/domain/helpers';
import { mapPlan, mapSchedule, EVENT_FROM_DB, type DbRow } from './domain-mappers';
import type {
  RayoStore,
  Schedule,
  Plan,
  Student,
  Fee,
  Session,
  Graduation,
  Event,
} from '../features/admin/domain/types';
import type { FightResult, EventType } from '../features/admin/domain/catalog';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPersistedId(id: string | null | undefined): boolean {
  return !!id && UUID_RE.test(id);
}

type EventDb = 'competition' | 'exhibition' | 'workshop';
type FightDb = 'win' | 'loss' | 'draw' | 'pending';

const EVENT_TO_DB: Record<EventType, EventDb> = {
  competencia: 'competition',
  exhibicion: 'exhibition',
  taller: 'workshop',
};

const FIGHT_TO_DB: Record<FightResult, FightDb> = {
  victoria: 'win',
  derrota: 'loss',
  pendiente: 'pending',
};

const FIGHT_FROM_DB: Record<string, FightResult> = {
  win: 'victoria',
  loss: 'derrota',
  draw: 'pendiente',
  pending: 'pendiente',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function periodFromYearMonth(row: DbRow): string {
  return `${row.year}-${pad(Number(row.month))}`;
}

async function fetchAll(table: string, column: string, ids: string[]): Promise<DbRow[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase.from(table).select('*').in(column, ids);
  if (error) throw error;
  return (data ?? []) as DbRow[];
}

async function fetchRoot(table: string, gymId: string): Promise<DbRow[]> {
  const { data, error } = await supabase.from(table).select('*').eq('gym_id', gymId);
  if (error) throw error;
  return (data ?? []) as DbRow[];
}

// ---------------------------------------------------------------------------
// Mapeos DB -> dominio (camelCase)
// ---------------------------------------------------------------------------

function mapStudent(row: DbRow, weights: DbRow[]): Student {
  const weightHistory = weights
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((w) => ({ date: String(w.date), weight: Number(w.weight) }));
  const cur = weightHistory.length ? weightHistory[weightHistory.length - 1].weight : Number(row.current_weight);
  const currentWeight = Number.isFinite(cur) ? cur : null;
  return {
    id: String(row.id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    idNumber: String(row.dni),
    birthDate: String(row.birth_date),
    phone: String(row.phone ?? ''),
    enrollmentDate: String(row.admission_date),
    currentWeight,
    competitionPhoto: row.competition_photo ? String(row.competition_photo) : null,
    planId: row.plan_id ? String(row.plan_id) : null,
    active: Boolean(row.active),
    weightHistory,
  };
}

function mapFee(row: DbRow): Fee {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    period: periodFromYearMonth(row),
    amount: Number(row.amount),
    paymentDate: String(row.paid_at).slice(0, 10),
  };
}

function mapGraduation(row: DbRow): Graduation {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    belt: String(row.belt) as Graduation['belt'],
    examDate: String(row.date),
    score: Number(row.score),
  };
}

function buildSessions(sessionRows: DbRow[], attRows: DbRow[]): Session[] {
  const presentBySession = new Map<string, string[]>();
  for (const a of attRows) {
    const sid = String(a.session_id);
    const list = presentBySession.get(sid) ?? [];
    if (a.present) list.push(String(a.student_id));
    presentBySession.set(sid, list);
  }
  return sessionRows.map((row) => ({
    id: String(row.id),
    date: String(row.date),
    scheduleId: row.schedule_id ? String(row.schedule_id) : null,
    present: [...new Set(presentBySession.get(String(row.id)) ?? [])].sort(),
  }));
}

// ---------------------------------------------------------------------------
// syncLoad: hidratar todo el gym
// ---------------------------------------------------------------------------

export async function syncLoad(gymId: string): Promise<RayoStore> {
  const store = seed();
  const [scheduleRows, planRows, studentRows, eventRows, sessionRows] = await Promise.all([
    fetchRoot('schedules', gymId),
    fetchRoot('plans', gymId),
    fetchRoot('students', gymId),
    fetchRoot('events', gymId),
    fetchRoot('sessions', gymId),
  ]);

  const studentIds = studentRows.map((s) => String(s.id));
  const eventIds = eventRows.map((e) => String(e.id));
  const sessionIds = sessionRows.map((s) => String(s.id));

  const [weightRows, paymentRows, attRows, beltRows, partRows] = await Promise.all([
    fetchAll('weight_records', 'student_id', studentIds),
    fetchAll('payments', 'student_id', studentIds),
    fetchAll('attendances', 'session_id', sessionIds),
    fetchAll('belt_exams', 'student_id', studentIds),
    fetchAll('event_participants', 'event_id', eventIds),
  ]);

  const partIds = partRows.map((p) => String(p.id));
  const fightRows = await fetchAll('fights', 'event_participant_id', partIds);

  store.schedules = scheduleRows.map(mapSchedule);
  store.plans = planRows.map(mapPlan);
  store.students = studentRows.map((s) => mapStudent(s, weightRows.filter((w) => String(w.student_id) === String(s.id))));
  store.fees = paymentRows.map(mapFee);
  store.graduations = beltRows.map(mapGraduation);
  store.sessions = buildSessions(sessionRows, attRows);

  store.events = eventRows.map((e) => {
    const evId = String(e.id);
    const parts = partRows.filter((p) => String(p.event_id) === evId);
    const fights = fightRows.filter((f) => parts.some((p) => String(p.id) === String(f.event_participant_id)));
    const participants: Event['participants'] = parts.map((p) => ({
      studentId: String(p.student_id),
      compWeight: p.weight != null ? Number(p.weight) : null,
    }));
    const fightsMapped: Event['fights'] = fights.map((f) => {
      const part = parts.find((p) => String(p.id) === String(f.event_participant_id));
      return {
        id: String(f.id),
        studentId: part ? String(part.student_id) : '',
        opponent: String(f.opponent_name),
        opponentWeight: f.opponent_weight != null ? Number(f.opponent_weight) : null,
        result: FIGHT_FROM_DB[String(f.result)] ?? 'pendiente',
      };
    });
    return {
      id: evId,
      name: String(e.name),
      type: EVENT_FROM_DB[String(e.type)] ?? 'competencia',
      date: String(e.date),
      description: String(e.description ?? ''),
      public: Boolean(e.is_public),
      participants,
      fights: fightsMapped,
    };
  });

  return store;
}

// ---------------------------------------------------------------------------
// Persistencia de raíces
// ---------------------------------------------------------------------------

async function insertRow(table: string, row: DbRow): Promise<string | null> {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) {
    throw error;
  }
  return data?.id ? String(data.id) : null;
}

async function updateRow(table: string, id: string, row: DbRow): Promise<void> {
  const { error } = await supabase.from(table).update(row).eq('id', id);
  if (error) throw error;
}

async function deleteRows(table: string, column: string, ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from(table).delete().in(column, ids);
  if (error) throw error;
}

export interface DiffResult<T> {
  inserts: T[];
  updates: T[];
  deletes: string[];
}

function diff<T extends { id: string }>(prev: T[], next: T[]): DiffResult<T> {
  const prevById = new Map(prev.map((x) => [x.id, x]));
  const nextById = new Map(next.map((x) => [x.id, x]));
  const inserts: T[] = next.filter((x) => !isPersistedId(x.id));
  const updates: T[] = [];
  for (const n of next) {
    if (!isPersistedId(n.id)) continue;
    const p = prevById.get(n.id);
    if (p && JSON.stringify(p) !== JSON.stringify(n)) updates.push(n);
  }
  const deletes = prev.filter((x) => isPersistedId(x.id) && !nextById.has(x.id)).map((x) => x.id);
  return { inserts, updates, deletes };
}

// ---------------------------------------------------------------------------
// syncSave: reconciliar raíces + volcar hijos
// ---------------------------------------------------------------------------

export async function syncSave(prev: RayoStore, next: RayoStore, gymId: string): Promise<RayoStore> {
  const schedules = diff(prev.schedules, next.schedules);
  await Promise.all(schedules.inserts.map((s) => insertRow('schedules', scheduleRow(s, gymId))));
  await Promise.all(schedules.updates.map((s) => updateRow('schedules', s.id, scheduleRow(s, gymId))));
  if (schedules.deletes.length) await deleteRows('schedules', 'id', schedules.deletes);

  const plans = diff(prev.plans, next.plans);
  await Promise.all(plans.inserts.map((p) => insertRow('plans', planRow(p, gymId))));
  await Promise.all(plans.updates.map((p) => updateRow('plans', p.id, planRow(p, gymId))));
  if (plans.deletes.length) await deleteRows('plans', 'id', plans.deletes);

  const students = diff(prev.students, next.students);
  await Promise.all(students.inserts.map((st) => insertRow('students', studentRow(st, gymId))));
  await Promise.all(students.updates.map((st) => updateRow('students', st.id, studentRow(st, gymId))));
  if (students.deletes.length) await deleteRows('students', 'id', students.deletes);

  const fees = diff(prev.fees, next.fees);
  await Promise.all(fees.inserts.map((f) => insertRow('payments', paymentRow(f))));
  await Promise.all(fees.updates.map((f) => updateRow('payments', f.id, paymentRow(f))));
  if (fees.deletes.length) await deleteRows('payments', 'id', fees.deletes);

  const grads = diff(prev.graduations, next.graduations);
  await Promise.all(grads.inserts.map((g) => insertRow('belt_exams', beltRow(g))));
  await Promise.all(grads.updates.map((g) => updateRow('belt_exams', g.id, beltRow(g))));
  if (grads.deletes.length) await deleteRows('belt_exams', 'id', grads.deletes);

  const events = diff(prev.events, next.events);
  await Promise.all(events.inserts.map((e) => insertRow('events', eventRow(e, gymId))));
  await Promise.all(events.updates.map((e) => updateRow('events', e.id, eventRow(e, gymId))));
  if (events.deletes.length) await deleteRows('events', 'id', events.deletes);

  // Hijos
  await reconcileSessions(prev, next, gymId);
  await syncChildren(next);

  return next;
}

function scheduleRow(s: Schedule, gymId: string): Record<string, unknown> {
  return {
    gym_id: gymId,
    day_of_week: DAYS_OF_WEEK.indexOf(s.day as (typeof DAYS_OF_WEEK)[number]) + 1,
    start_time: s.start,
    end_time: s.end,
    name: `${s.day} · ${s.start} a ${s.end}`,
  };
}
function planRow(p: Plan, gymId: string): Record<string, unknown> {
  return {
    gym_id: gymId,
    name: p.name,
    type: p.type,
    price: p.price,
    description: p.description,
    featured: p.featured,
    benefits: p.benefits,
    active: true,
  };
}
function studentRow(st: Student, gymId: string): Record<string, unknown> {
  return {
    gym_id: gymId,
    plan_id: st.planId,
    first_name: st.firstName,
    last_name: st.lastName,
    dni: st.idNumber,
    birth_date: st.birthDate,
    phone: st.phone,
    admission_date: st.enrollmentDate,
    current_weight: st.currentWeight,
    competition_photo: st.competitionPhoto,
    active: st.active,
  };
}
function paymentRow(f: Fee): Record<string, unknown> {
  const [year, month] = f.period.split('-');
  return {
    student_id: f.studentId,
    year: Number(year),
    month: Number(month),
    amount: f.amount,
    paid_at: f.paymentDate,
  };
}
function beltRow(g: Graduation): Record<string, unknown> {
  return {
    student_id: g.studentId,
    belt: g.belt,
    score: g.score,
    date: g.examDate,
  };
}
function eventRow(e: Event, gymId: string): Record<string, unknown> {
  return {
    gym_id: gymId,
    name: e.name,
    type: EVENT_TO_DB[e.type],
    description: e.description,
    date: e.date,
    is_public: e.public,
    active: true,
  };
}

function sessionRow(s: Session, gymId: string): Record<string, unknown> {
  return { gym_id: gymId, date: s.date, schedule_id: s.scheduleId };
}

async function reconcileSessions(prev: RayoStore, next: RayoStore, gymId: string): Promise<void> {
  const sDiff = diff(prev.sessions, next.sessions);

  for (const s of sDiff.inserts) {
    const id = await insertRow('sessions', sessionRow(s, gymId));
    if (id) s.id = id; // revertir uuid de la DB al store en memoria
  }
  for (const s of sDiff.updates) {
    await updateRow('sessions', s.id, sessionRow(s, gymId));
  }
  if (sDiff.deletes.length) await deleteRows('sessions', 'id', sDiff.deletes);

  // Reescribir asistencias por jornada (una fila por alumno presente)
  for (const s of next.sessions) {
    if (!isPersistedId(s.id)) continue;
    await deleteRows('attendances', 'session_id', [s.id]);
    const rows = s.present.map((studentId) => ({
      session_id: s.id,
      student_id: studentId,
      schedule_id: s.scheduleId,
      date: s.date,
      present: true,
    }));
    if (rows.length) {
      const { error } = await supabase.from('attendances').insert(rows);
      if (error) throw error;
    }
  }
}

async function syncChildren(store: RayoStore): Promise<void> {
  for (const st of store.students) {
    if (!isPersistedId(st.id)) continue;
    await deleteRows('weight_records', 'student_id', [st.id]);
    const rows = st.weightHistory.map((w) => ({ student_id: st.id, weight: w.weight, date: w.date }));
    if (rows.length) {
      const { error } = await supabase.from('weight_records').insert(rows);
      if (error) throw error;
    }
  }

  for (const ev of store.events) {
    if (!isPersistedId(ev.id)) continue;
    await deleteRows('event_participants', 'event_id', [ev.id]);
    const insertedMap: { studentId: string; id: string }[] = [];
    for (const p of ev.participants) {
      const { data, error } = await supabase
        .from('event_participants')
        .insert({ event_id: ev.id, student_id: p.studentId, weight: p.compWeight })
        .select()
        .single();
      if (error) throw error;
      if (data?.id) insertedMap.push({ studentId: String(p.studentId), id: String(data.id) });
    }
    if (insertedMap.length) {
      const fightRows = ev.fights
        .map((f) => {
          const part = insertedMap.find((x) => x.studentId === f.studentId);
          return part
            ? {
                event_participant_id: part.id,
                opponent_name: f.opponent,
                opponent_weight: f.opponentWeight,
                result: FIGHT_TO_DB[f.result],
              }
            : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      if (fightRows.length) {
        const { error } = await supabase.from('fights').insert(fightRows);
        if (error) throw error;
      }
    }
  }
}

export { isPersistedId };
