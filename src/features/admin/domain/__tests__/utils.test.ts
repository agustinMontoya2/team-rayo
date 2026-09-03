import { describe, expect, it } from 'vitest';
import { uid, today, currentPeriod, normalize } from '../utils';
import { seed } from '../seed';

describe('uid', () => {
  it('genera ids únicos con el prefijo pasado', () => {
    expect(uid('a')).toMatch(/^a_/);
    expect(uid('a')).not.toBe(uid('a'));
  });
});

describe('today / currentPeriod', () => {
  it('devuelve fechas en formato ISO', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(currentPeriod()).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('normalize', () => {
  it('devuelve el seed si no hay datos', () => {
    const ok = normalize(null);
    expect(ok).toEqual(seed());
  });

  it('completa las colecciones faltantes con el seed', () => {
    const ok = normalize({ meta: { customized: true } });
    expect(ok.meta.customized).toBe(true);
    expect(Array.isArray(ok.students)).toBe(true);
    expect(Array.isArray(ok.plans)).toBe(true);
    expect(Array.isArray(ok.schedules)).toBe(true);
    expect(Array.isArray(ok.events)).toBe(true);
  });

  it('separa nombre y apellido cuando lastName falta', () => {
    const ok = normalize({
      meta: { customized: false },
      schedules: [],
      plans: [],
      graduations: [],
      fees: [],
      sessions: [],
      events: [],
      students: [{ id: 'x1', firstName: 'Marcos Díaz', birthDate: '', phone: '', idNumber: '123', enrollmentDate: '', currentWeight: null, competitionPhoto: null, planId: null, active: true }],
    });
    const a = ok.students[0];
    expect(a.firstName).toBe('Marcos');
    expect(a.lastName).toBe('Díaz');
  });

  it('completa el historial de peso desde currentWeight', () => {
    const ok = normalize({
      meta: { customized: false },
      schedules: [],
      plans: [],
      graduations: [],
      fees: [],
      sessions: [],
      events: [],
      students: [{ id: 'x1', firstName: 'Ana', lastName: 'Pérez', birthDate: '', phone: '', idNumber: '123', enrollmentDate: '2026-01-10', currentWeight: 70, competitionPhoto: null, planId: null, active: true }],
    });
    expect(ok.students[0].weightHistory).toHaveLength(1);
    expect(ok.students[0].weightHistory[0].weight).toBe(70);
  });
});
