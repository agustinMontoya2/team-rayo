import { describe, expect, it } from 'vitest';
import {
  createUpdateEvent,
  toggleEventPublic,
  deleteEvent,
  addParticipant,
  removeParticipant,
  addFight,
  setFightResult,
  removeFight,
} from '../actions';
import { base } from './fixtures';

function withCompetencia(): ReturnType<typeof base> {
  const s = base();
  s.events = [
    {
      id: 'e1',
      name: 'Torneo de la Costa',
      type: 'competencia',
      date: '2026-10-10',
      description: '',
      public: true,
      participants: [],
      fights: [],
    },
  ];
  return s;
}

describe('createUpdateEvent', () => {
  it('crea un evento', () => {
    const s = base();
    const res = createUpdateEvent(s, { name: 'Desafío urbano', type: 'exhibicion', date: '2026-10-05', description: 'Una descripción', public: false });
    expect(res.error).toBeUndefined();
    expect(res.store.events.length).toBe(s.events.length + 1);
    const creado = res.store.events[res.store.events.length - 1];
    expect(creado.name).toBe('Desafío urbano');
    expect(creado.public).toBe(false);
    expect(creado.participants).toEqual([]);
  });

  it('actualiza un evento existente por id', () => {
    const s = withCompetencia();
    const res = createUpdateEvent(s, { id: 'e1', name: 'Torneo Nacional', type: 'competencia', date: '2026-11-01', description: 'Más grande', public: true });
    expect(res.error).toBeUndefined();
    expect(res.info).toContain('actualizado');
    expect(res.store.events[0].name).toBe('Torneo Nacional');
  });

  it('rechaza nombre y fecha vacíos', () => {
    const s = base();
    const res = createUpdateEvent(s, { name: '  ', type: 'exhibicion', date: '', description: '', public: false });
    expect(res.error).toBeTruthy();
    expect(res.fieldErrors).toHaveProperty('name');
    expect(res.fieldErrors).toHaveProperty('date');
  });
});

describe('toggleEventPublic', () => {
  it('alterna la visibilidad pública', () => {
    const s = withCompetencia();
    const res = toggleEventPublic(s, 'e1');
    expect(res.store.events[0].public).toBe(false);
    expect(res.info).toContain('oculto');
  });

  it('devuelve error si el evento no existe', () => {
    const res = toggleEventPublic(base(), 'no-existe');
    expect(res.error).toBeTruthy();
  });
});

describe('deleteEvent', () => {
  it('elimina el evento', () => {
    const s = withCompetencia();
    const res = deleteEvent(s, 'e1');
    expect(res.store.events).toHaveLength(0);
  });
});

describe('addParticipant', () => {
  it('agrega participante con peso válido en competencia', () => {
    const s = withCompetencia();
    const res = addParticipant(s, 'e1', { studentId: 'a1', compWeight: '63.5' });
    expect(res.error).toBeUndefined();
    expect(res.info).toContain('Participante');
    expect(res.store.events[0].participants).toHaveLength(1);
    expect(res.store.events[0].participants[0].compWeight).toBe(63.5);
  });

  it('agrega participante sin peso en eventos que no son competencia', () => {
    const s = base();
    s.events = [{ id: 'e1', name: 'Show de cierre', type: 'exhibicion', date: '2026-12-01', description: '', public: false, participants: [], fights: [] }];
    const res = addParticipant(s, 'e1', { studentId: 'a1', compWeight: null });
    expect(res.error).toBeUndefined();
    expect(res.store.events[0].participants[0].compWeight).toBeNull();
  });

  it('rechaza peso faltante en competencia', () => {
    const s = withCompetencia();
    const res = addParticipant(s, 'e1', { studentId: 'a1', compWeight: '' });
    expect(res.error).toContain('peso');
  });

  it('rechaza participante duplicado', () => {
    const s = withCompetencia();
    s.events[0].participants = [{ studentId: 'a1', compWeight: 60 }];
    const res = addParticipant(s, 'e1', { studentId: 'a1', compWeight: '61' });
    expect(res.error).toContain('ya está');
  });
});

describe('removeParticipant', () => {
  it('quita al participante y sus peleas', () => {
    const s = withCompetencia();
    s.events[0].participants = [
      { studentId: 'a1', compWeight: 60 },
      { studentId: 'a2', compWeight: null },
    ];
    s.events[0].fights = [
      { id: 'f1', studentId: 'a1', opponent: 'Rival', opponentWeight: null, result: 'pendiente' },
      { id: 'f2', studentId: 'a2', opponent: 'Otro', opponentWeight: null, result: 'pendiente' },
    ];
    const res = removeParticipant(s, 'e1', 'a1');
    expect(res.store.events[0].participants.map((p) => p.studentId)).toEqual(['a2']);
    expect(res.store.events[0].fights.map((f) => f.studentId)).toEqual(['a2']);
  });
});

describe('addFight / setFightResult / removeFight', () => {
  it('agrega una pelea pendiente', () => {
    const s = withCompetencia();
    const res = addFight(s, 'e1', { studentId: 'a1', opponent: 'Rival X', opponentWeight: '70' });
    expect(res.error).toBeUndefined();
    const pelea = res.store.events[0].fights[0];
    expect(pelea.opponent).toBe('Rival X');
    expect(pelea.opponentWeight).toBe(70);
    expect(pelea.result).toBe('pendiente');
  });

  it('rechaza pelea sin rival', () => {
    const s = withCompetencia();
    const res = addFight(s, 'e1', { studentId: 'a1', opponent: '  ', opponentWeight: null });
    expect(res.error).toBeTruthy();
  });

  it('actualiza el resultado de la pelea', () => {
    const s = withCompetencia();
    s.events[0].fights = [{ id: 'f1', studentId: 'a1', opponent: 'Rival', opponentWeight: null, result: 'pendiente' }];
    const res = setFightResult(s, 'e1', 'f1', 'victoria');
    expect(res.store.events[0].fights[0].result).toBe('victoria');
    expect(res.info).toContain('victoria');
  });

  it('elimina la pelea', () => {
    const s = withCompetencia();
    s.events[0].fights = [{ id: 'f1', studentId: 'a1', opponent: 'Rival', opponentWeight: null, result: 'pendiente' }];
    const res = removeFight(s, 'e1', 'f1');
    expect(res.store.events[0].fights).toHaveLength(0);
  });

  it('no permite pelear sin evento', () => {
    const res = addFight(base(), 'no-existe', { studentId: 'a1', opponent: 'Rival', opponentWeight: null });
    expect(res.error).toBeTruthy();
  });
});