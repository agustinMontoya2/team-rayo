import { describe, expect, it } from 'vitest';
import { fullName, currentBelt, studentPlan, pendingPaymentsForPeriod, pendingFeesPerStudent, absencesFrom, studentsInSession, enrolledInPeriod } from '../helpers';
import type { RayoStore, Student } from '../types';
import { base } from './fixtures';

describe('fullName', () => {
  it('combina nombre y apellido', () => {
    expect(fullName({ firstName: 'Ana', lastName: 'Pérez' } as any)).toBe('Ana Pérez');
  });

  it('maneja nulos', () => {
    expect(fullName(null)).toBe('');
  });
});

describe('currentBelt', () => {
  it('devuelve Blanco si no hay graduaciones', () => {
    const s = base();
    expect(currentBelt(s, 'alumno-x')).toBe('Blanco');
  });

  it('devuelve el cinturón de la graduación más reciente', () => {
    const s = base();
    s.graduations = [
      { id: 'g1', studentId: 'a1', belt: 'Blanco', examDate: '2025-01-10', score: 8 },
      { id: 'g2', studentId: 'a1', belt: 'Azul', examDate: '2026-06-01', score: 9 },
    ];
    expect(currentBelt(s, 'a1')).toBe('Azul');
  });
});

describe('studentPlan', () => {
  it('devuelve null si el alumno no tiene plan', () => {
    const s = base();
    const a = s.students.find((x) => !x.planId);
    expect(studentPlan(s, a ? a.id : 'nope')).toBeNull();
  });
});

describe('pendingPaymentsForPeriod', () => {
  it('listas alumnos activos con plan que no pagaron el periodo', () => {
    const s = base();
    const a = s.students.find((x) => x.active && x.planId) ?? s.students[0];
    s.fees = [];
    const result = pendingPaymentsForPeriod(s, '2026-08');
    expect(result.some((x) => x.id === a.id)).toBe(true);
  });

  it('excluye alumnos inactivos y sin plan', () => {
    const s = base();
    s.students = s.students.map((a, i) => (i === 0 ? { ...a, active: false, planId: null } : a));
    s.fees = [];
    const result = pendingPaymentsForPeriod(s, '2026-08');
    expect(result.every((x) => x.active && x.planId)).toBe(true);
  });

  it('excluye a alumnos que aún no estaban inscritos en el período', () => {
    const s = base();
    const activo: Student = { ...s.students[0], id: 'nuevo', enrollmentDate: '2026-09-10', active: true, planId: 'p1' };
    s.students = [activo];
    s.fees = [];
    expect(pendingPaymentsForPeriod(s, '2026-08').some((x) => x.id === 'nuevo')).toBe(false);
    expect(pendingPaymentsForPeriod(s, '2026-09').some((x) => x.id === 'nuevo')).toBe(true);
  });
});

describe('pendingFeesPerStudent', () => {
  function conIngreso(day = '2026-07-10'): RayoStore {
    const s = base();
    s.students = [{ ...s.students[0], enrollmentDate: day }];
    s.fees = [];
    return s;
  }

  it('acumula todos los meses sin pagar desde el ingreso', () => {
    const s = conIngreso('2026-07-10');
    const res = pendingFeesPerStudent(s, '2026-09');
    expect(res).toHaveLength(1);
    expect(res[0].periods).toEqual(expect.arrayContaining(['2026-09', '2026-08', '2026-07']));
    expect(res[0].periods).toHaveLength(3);
    expect(res[0].amount).toBe(18000 * 3);
  });

  it('excluye los meses ya pagados', () => {
    const s = conIngreso('2026-07-10');
    s.fees = [{ id: 'f1', studentId: 'a1', period: '2026-09', amount: 18000, paymentDate: '2026-09-01' }];
    const res = pendingFeesPerStudent(s, '2026-09');
    expect(res).toHaveLength(1);
    expect(res[0].periods).toEqual(expect.arrayContaining(['2026-08', '2026-07']));
    expect(res[0].periods).toHaveLength(2);
    expect(res[0].amount).toBe(18000 * 2);
  });

  it('no incluye a quien aún no estaba inscripto en el período tope', () => {
    const s = conIngreso('2026-10-01');
    expect(pendingFeesPerStudent(s, '2026-09')).toHaveLength(0);
  });

  it('excluye inactivos y sin plan', () => {
    const s = conIngreso('2026-07-10');
    s.students = s.students.map((a) => ({ ...a, active: false, planId: null }));
    expect(pendingFeesPerStudent(s, '2026-09')).toHaveLength(0);
  });
});

describe('enrolledInPeriod', () => {
  it('true si el ingreso es <= al último día del período', () => {
    const a: Student = { enrollmentDate: '2026-08-31' } as Student;
    expect(enrolledInPeriod(a, '2026-08')).toBe(true);
  });

  it('false si el ingreso es posterior al período', () => {
    const a: Student = { enrollmentDate: '2026-09-01' } as Student;
    expect(enrolledInPeriod(a, '2026-08')).toBe(false);
  });
});

describe('studentsInSession', () => {
  it('incluye solo activos con enrollmentDate <= fecha de la jornada', () => {
    const s = base();
    const activos = s.students.filter((a) => a.active);
    activos[0].enrollmentDate = '2026-09-01';
    s.students = activos;
    const result = studentsInSession(s, '2026-08-28');
    expect(result.some((x) => x.id === activos[0].id)).toBe(false);
  });
});

describe('absencesFrom', () => {
  it('los activos que no están en presentes son ausentes', () => {
    const s = base();
    const activos = s.students.filter((a) => a.active);
    const primera = activos[0];
    const aus = absencesFrom(s, { id: 'j1', date: '2026-08-28', scheduleId: null, present: [primera.id] });
    expect(aus.length).toBe(activos.length - 1);
    expect(aus.some((x) => x.id === primera.id)).toBe(false);
  });

  it('no marca ausente a quien aún no había ingresado', () => {
    const s = base();
    const nuevo: Student = { ...s.students[0], id: 'nuevo', idNumber: '00000001', enrollmentDate: '2026-09-01', active: true, planId: null };
    s.students = [...s.students, nuevo];
    const aus = absencesFrom(s, { id: 'j1', date: '2026-08-28', scheduleId: null, present: [] });
    expect(aus.some((x) => x.id === 'nuevo')).toBe(false);
  });
});
