import type { RayoStore, Event, Fight } from '../types';
import { EVENT_TYPES, FIGHT_RESULTS, type FightResult } from '../catalog';
import { uid } from '../utils';
import { validateEventFields, validateParticipantFields, validateFightFields } from '../validators';
import { MSG } from '../messages';
import { err, ok, type ActionResult } from './common';

export function createUpdateEvent(
  d: RayoStore,
  input: {
    id?: string;
    name: string;
    type: Event['type'];
    date: string;
    description: string;
    public: boolean;
  }
): ActionResult {
  const fieldErrors = validateEventFields({ name: input.name, date: input.date });
  if (Object.keys(fieldErrors).length > 0) return err(d, Object.values(fieldErrors)[0], fieldErrors);
  if (input.id && d.events.some((e) => e.id === input.id)) {
    const events = d.events.map((e) =>
      e.id === input.id
        ? { ...e, name: input.name.trim(), type: input.type, date: input.date, description: input.description.trim(), public: input.public }
        : e
    );
    return ok({ ...d, events }, 'Evento actualizado.');
  }
  const nuevo: Event = {
    id: uid('e'),
    name: input.name.trim(),
    type: input.type,
    date: input.date,
    description: input.description.trim(),
    public: input.public,
    participants: [],
    fights: [],
  };
  return ok({ ...d, events: [...d.events, nuevo] }, 'Evento creado.');
}

export function toggleEventPublic(d: RayoStore, eventId: string): ActionResult {
  const e = d.events.find((x) => x.id === eventId);
  if (!e) return err(d, MSG.eventNotFound);
  const events = d.events.map((x) => (x.id === eventId ? { ...x, public: !x.public } : x));
  return ok({ ...d, events }, e.public ? 'Evento quedó oculto.' : 'Evento ahora es público.');
}

export function deleteEvent(d: RayoStore, eventId: string): ActionResult {
  return ok({ ...d, events: d.events.filter((x) => x.id !== eventId) });
}

export function addParticipant(
  d: RayoStore,
  eventId: string,
  input: { studentId: string; compWeight: string | number | null }
): ActionResult {
  const event = d.events.find((e) => e.id === eventId);
  if (!event) return err(d, MSG.eventNotFound);
  const fieldErrors = validateParticipantFields(event, input);
  if (Object.keys(fieldErrors).length > 0) return err(d, Object.values(fieldErrors)[0], fieldErrors);
  const weightNum = event.type === EVENT_TYPES.competencia.value ? Number(input.compWeight) : null;
  const participants = [...event.participants, { studentId: input.studentId, compWeight: weightNum }];
  const events = d.events.map((e) => (e.id === eventId ? { ...e, participants } : e));
  return ok({ ...d, events }, 'Participante agregado.');
}

export function removeParticipant(d: RayoStore, eventId: string, studentId: string): ActionResult {
  const events = d.events.map((e) =>
    e.id === eventId
      ? {
          ...e,
          participants: e.participants.filter((p) => p.studentId !== studentId),
          fights: e.fights.filter((f) => f.studentId !== studentId),
        }
      : e
  );
  return ok({ ...d, events }, 'Participante quitado. Sus peleas también se eliminaron.');
}

export function addFight(
  d: RayoStore,
  eventId: string,
  input: { studentId: string; opponent: string; opponentWeight: string | number | null }
): ActionResult {
  const event = d.events.find((e) => e.id === eventId);
  if (!event) return err(d, MSG.eventNotFound);
  const fieldErrors = validateFightFields(input);
  if (Object.keys(fieldErrors).length > 0) return err(d, Object.values(fieldErrors)[0], fieldErrors);
  let weightNum: number | null = null;
  if (input.opponentWeight !== '' && input.opponentWeight != null) {
    weightNum = Number(input.opponentWeight);
  }
  const fight: Fight = {
    id: uid('f'),
    studentId: input.studentId,
    opponent: input.opponent.trim(),
    opponentWeight: weightNum,
    result: FIGHT_RESULTS.pendiente.value,
  };
  const events = d.events.map((e) => (e.id === eventId ? { ...e, fights: [...e.fights, fight] } : e));
  return ok({ ...d, events }, 'Pelea cargada.');
}

export function setFightResult(
  d: RayoStore,
  eventId: string,
  fightId: string,
  result: FightResult
): ActionResult {
  const events = d.events.map((e) =>
    e.id === eventId ? { ...e, fights: e.fights.map((f) => (f.id === fightId ? { ...f, result } : f)) } : e
  );
  const msg =
    result === FIGHT_RESULTS.pendiente.value
      ? 'Pelea marcada como pendiente.'
      : result === FIGHT_RESULTS.victoria.value
        ? 'Resultado: victoria.'
        : 'Resultado: derrota.';
  return ok({ ...d, events }, msg);
}

export function removeFight(d: RayoStore, eventId: string, fightId: string): ActionResult {
  const events = d.events.map((e) => (e.id === eventId ? { ...e, fights: e.fights.filter((f) => f.id !== fightId) } : e));
  return ok({ ...d, events }, 'Pelea eliminada.');
}
