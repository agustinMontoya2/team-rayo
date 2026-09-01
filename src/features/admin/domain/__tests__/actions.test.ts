import { describe, expect, it } from 'vitest';
import {
  registerPayment,
  deletePayment,
  toggleStudentActive,
  createSession,
  deleteSession,
  saveAttendance,
  registerGraduation,
  saveStudent,
  createUpdatePlan,
  createUpdateSchedule,
  deleteSchedule,
} from '../actions';
import type { RayoStore, Student } from '../types';

import { base } from './fixtures';

describe('registerPayment', () => {
  it('registra la cuota del alumno', () => {
    const s = base();
    const a = s.students[0];
    const res = registerPayment(s, { studentId: a.id, period: '2026-08', amount: 25000, paymentDate: '2026-08-01' });
    expect(res.error).toBeUndefined();
    expect(res.store.fees.length).toBe(s.fees.length + 1);
    expect(res.store.fees[res.store.fees.length - 1].period).toBe('2026-08');
  });

  it('rechaza monto vacío', () => {
    const s = base();
    const a = s.students[0];
    const res = registerPayment(s, { studentId: a.id, period: '2026-08', amount: '', paymentDate: '2026-08-01' });
    expect(res.error).toContain('monto');
  });

  it('avisa si el período ya fue pagado por el alumno', () => {
    const s = base();
    const a = s.students[0];
    registerPayment(s, { studentId: a.id, period: '2026-08', amount: 100, paymentDate: '2026-08-05' });
    const s2 = { ...s, fees: [...s.fees, { id: 'c1', studentId: a.id, period: '2026-08', amount: 100, paymentDate: '2026-08-05' }] };
    const res = registerPayment(s2, { studentId: a.id, period: '2026-08', amount: 100, paymentDate: '2026-08-05' });
    expect(res.info).toContain('ya pagó ese período');
  });
});

describe('deletePayment', () => {
  it('elimina la cuota por id', () => {
    const s = base();
    s.fees = [{ id: 'c1', studentId: 'a1', period: '2026-08', amount: 100, paymentDate: '2026-08-01' }];
    const res = deletePayment(s, 'c1');
    expect(res.store.fees).toHaveLength(0);
  });
});

describe('toggleStudentActive', () => {
  it('invierte el estado activo y conserva el historial', () => {
    const s = base();
    const a = s.students[0];
    const res = toggleStudentActive(s, a.id);
    expect(res.store.students.find((x) => x.id === a.id)!.active).toBe(!a.active);
  });

  it('devuelve error si el alumno no existe', () => {
    const s = base();
    const res = toggleStudentActive(s, 'no-existe');
    expect(res.error).toBeTruthy();
  });
});

describe('createSession', () => {
  it('crea la jornada con horario opcional', () => {
    const s = base();
    const res = createSession(s, '2026-09-01', 'h1');
    expect(res.error).toBeUndefined();
    expect(res.store.sessions.length).toBe(s.sessions.length + 1);
    expect(res.store.sessions[res.store.sessions.length - 1].scheduleId).toBe('h1');
  });

  it('rechaza fecha repetida', () => {
    const s = base();
    s.sessions = [{ id: 'j1', date: '2026-09-01', scheduleId: null, present: [] }];
    const res = createSession(s, '2026-09-01', '');
    expect(res.error).toContain('Ya existe');
  });
});

describe('saveAttendance', () => {
  it('guarda los presentes y calcula ausentes', () => {
    const s = base();
    s.sessions = [{ id: 'j1', date: '2026-09-01', scheduleId: null, present: [] }];
    const activos = s.students.filter((a) => a.active);
    const res = saveAttendance(s, 'j1', [activos[0].id]);
    expect(res.error).toBeUndefined();
    expect(res.store.sessions[0].present).toEqual([activos[0].id]);
    expect(res.info).toContain('1 presentes');
  });

  it('devuelve error si la jornada no existe', () => {
    const s = base();
    const res = saveAttendance(s, 'no-existe', []);
    expect(res.error).toBeTruthy();
  });

  it('no cuenta a los alumnos que aún no habían ingresado como ausentes', () => {
    const s = base();
    const antiguo = s.students.find((a) => a.active)!;
    const nuevo: Student = { ...antiguo, id: 'nuevo', idNumber: '00000001', enrollmentDate: '2026-09-01' };
    s.students = [...s.students, nuevo];
    s.sessions = [{ id: 'j1', date: '2026-08-28', scheduleId: null, present: [] }];
    const res = saveAttendance(s, 'j1', []);
    expect(res.error).toBeUndefined();
    expect(res.info).not.toContain('nuevo');
  });
});

describe('deleteSession', () => {
  it('elimina la jornada por id', () => {
    const s = base();
    s.sessions = [{ id: 'j1', date: '2026-09-01', scheduleId: null, present: [] }];
    const res = deleteSession(s, 'j1');
    expect(res.store.sessions).toHaveLength(0);
  });
});

describe('registerGraduation', () => {
  it('registra la graduación si es válida', () => {
    const s = base();
    const a = s.students[0];
    const res = registerGraduation(s, { studentId: a.id, belt: 'Azul', examDate: '2026-08-20', score: 8.5 });
    expect(res.error).toBeUndefined();
    expect(res.store.graduations.length).toBe(s.graduations.length + 1);
    expect(res.store.graduations[res.store.graduations.length - 1].belt).toBe('Azul');
  });

  it('rechaza fecha futura y puntuación fuera de rango', () => {
    const s = base();
    const a = s.students[0];
    const futura = registerGraduation(s, { studentId: a.id, belt: 'Azul', examDate: '2099-01-01', score: 8 });
    expect(futura.error).toContain('futura');
    const fuera = registerGraduation(s, { studentId: a.id, belt: 'Azul', examDate: '2026-08-20', score: 11 });
    expect(fuera.error).toContain('Puntuación');
  });
});

describe('saveStudent', () => {
  it('registra un alumno nuevo activo', () => {
    const s = base();
    const res = saveStudent(s, {
      firstName: 'Lucas',
      lastName: 'Méndez',
      idNumber: '12345678',
      birthDate: '2000-01-01',
      phone: '',
      enrollmentDate: '2026-08-20',
      planId: null,
      currentWeight: null,
      competitionPhoto: null,
    });
    expect(res.error).toBeUndefined();
    expect(res.store.students.length).toBe(s.students.length + 1);
    expect(res.store.students[res.store.students.length - 1].active).toBe(true);
  });

  it('rechaza DNI repetido para un alumno distinto', () => {
    const s = base();
    const a = s.students[0];
    const res = saveStudent(s, {
      firstName: 'Lucas',
      lastName: 'Méndez',
      idNumber: a.idNumber,
      birthDate: '2000-01-01',
      phone: '',
      enrollmentDate: '2026-08-20',
      planId: null,
      currentWeight: null,
      competitionPhoto: null,
    });
    expect(res.error).toBeTruthy();
    expect(res.fieldErrors).toHaveProperty('idNumber');
  });

  it('actualiza los datos de un alumno existente', () => {
    const s = base();
    const a = s.students[0];
    const res = saveStudent(s, {
      id: a.id,
      firstName: 'Cambiado',
      lastName: a.lastName,
      idNumber: a.idNumber,
      birthDate: a.birthDate,
      phone: a.phone,
      enrollmentDate: a.enrollmentDate,
      planId: a.planId,
      currentWeight: a.currentWeight,
      competitionPhoto: a.competitionPhoto || null,
    });
    expect(res.error).toBeUndefined();
    expect(res.store.students.find((x) => x.id === a.id)!.firstName).toBe('Cambiado');
  });

  it('actualiza el plan al editar un alumno existente', () => {
    const s = base();
    s.plans = [
      { id: 'p1', name: 'Plan Recreativo', type: 'recreativo', price: 18000, description: '', featured: false, benefits: [] },
      { id: 'p2', name: 'Plan Competitivo', type: 'competitivo', price: 25000, description: '', featured: false, benefits: [] },
    ];
    const a = s.students[0];
    const res = saveStudent(s, {
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      idNumber: a.idNumber,
      birthDate: a.birthDate,
      phone: a.phone,
      enrollmentDate: a.enrollmentDate,
      planId: 'p2',
      currentWeight: a.currentWeight,
      competitionPhoto: a.competitionPhoto,
    });
    expect(res.error).toBeUndefined();
    expect(res.store.students.find((x) => x.id === a.id)!.planId).toBe('p2');
  });
});

describe('plan / schedule actions', () => {
  it('crea y actualiza un plan', () => {
    const s = base();
    const creado = createUpdatePlan(s, {
      id: 'p-nuevo',
      name: 'Competitivo Pro',
      type: 'competitivo',
      price: 40000,
      description: 'Entrenamiento competitivo',
      featured: true,
      benefits: ['Dos competencias por año'],
    });
    expect(creado.error).toBeUndefined();
    expect(creado.store.plans.some((p) => p.id === 'p-nuevo')).toBe(true);
    const actualizado = createUpdatePlan(creado.store, {
      ...creado.store.plans.find((p) => p.id === 'p-nuevo')!,
      price: 45000,
    });
    expect(actualizado.store.plans.find((p) => p.id === 'p-nuevo')!.price).toBe(45000);
  });

  it('rechaza un plan sin nombre o con precio inválido', () => {
    const s = base();
    const sinNombre = createUpdatePlan(s, {
      id: 'p-x',
      name: ' ',
      type: 'competitivo',
      price: 40000,
      description: '',
      featured: false,
      benefits: [],
    });
    expect(sinNombre.error).toBeTruthy();
    const sinPrecio = createUpdatePlan(s, {
      id: 'p-x',
      name: 'Plan',
      type: 'competitivo',
      price: 0,
      description: '',
      featured: false,
      benefits: [],
    });
    expect(sinPrecio.error).toBeTruthy();
  });

  it('crea y elimina un horario, y desvincula jornadas al eliminarlo', () => {
    const s = base();
    const creado = createUpdateSchedule(s, { day: 'Domingo', start: '19:00', end: '21:00' });
    expect(creado.error).toBeUndefined();
    const h = creado.store.schedules.find((x) => x.day === 'Domingo')!;
    const conJornada: RayoStore = {
      ...creado.store,
      sessions: [...creado.store.sessions, { id: 'j-test', date: '2026-09-02', scheduleId: h.id, present: [] }],
    };
    const borrado = deleteSchedule(conJornada, h.id);
    expect(borrado.store.schedules.some((x) => x.id === h.id)).toBe(false);
    expect(borrado.store.sessions.find((j) => j.id === 'j-test')!.scheduleId).toBeNull();
  });
});
