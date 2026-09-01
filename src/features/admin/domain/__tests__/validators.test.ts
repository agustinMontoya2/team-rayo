import { describe, expect, it } from 'vitest';
import {
  validateStudentFirstName,
  validateStudentLastName,
  validateStudentDni,
  validateStudentBirthDate,
  validateStudentEnrollmentDate,
  validateStudentWeight,
  validateStudentFields,
  validateEventFields,
  validatePaymentFields,
  validateSessionDate,
  validateGraduationFields,
  validateWeight,
  validateWeightDate,
  validatePlanFields,
  validateScheduleFields,
  validateParticipantFields,
  validateFightFields,
} from '../validators';
import { seed } from '../seed';
import type { RayoStore, Event } from '../types';

function base(): RayoStore {
  const s = seed();
  s.plans = [{ id: 'p1', name: 'Plan Recreativo', type: 'recreativo', price: 18000, description: '', featured: false, benefits: [] }];
  s.students = [
    { id: 'a1', firstName: 'Ana', lastName: 'Pérez', birthDate: '1995-03-14', phone: '', idNumber: '37123456', enrollmentDate: '2025-02-03', currentWeight: 61.5, competitionPhoto: null, planId: 'p1', active: true, weightHistory: [] },
  ];
  return s;
}

function compEvent(): Event {
  return { id: 'e1', name: 'Competencia', type: 'competencia', date: '2026-09-12', description: '', public: true, participants: [], fights: [] };
}

describe('validateStudentFirstName', () => {
  it('rechaza nombre corto y acepta válido', () => {
    expect(validateStudentFirstName('A')).toBeTruthy();
    expect(validateStudentFirstName('Ana')).toBe('');
    expect(validateStudentFirstName('   ')).toBeTruthy();
  });
});

describe('validateStudentLastName', () => {
  it('rechaza apellido corto y acepta válido', () => {
    expect(validateStudentLastName('')).toBeTruthy();
    expect(validateStudentLastName('Pérez')).toBe('');
  });
});

describe('validateStudentDni', () => {
  it('requiere al menos 7 números', () => {
    const s = base();
    expect(validateStudentDni(s, '1234')).toBeTruthy();
    expect(validateStudentDni(s, '12345678')).toBe('');
  });

  it('detecta DNI duplicado de otro alumno', () => {
    const s = base();
    expect(validateStudentDni(s, '37123456', undefined)).toBeTruthy();
    expect(validateStudentDni(s, '37123456', 'a1')).toBe('');
  });
});

describe('validateStudentBirthDate', () => {
  it('requiere fecha de nacimiento', () => {
    expect(validateStudentBirthDate('')).toBeTruthy();
    expect(validateStudentBirthDate('1995-03-14')).toBe('');
  });
});

describe('validateStudentEnrollmentDate', () => {
  it('requiere fecha de ingreso y posterior al nacimiento', () => {
    expect(validateStudentEnrollmentDate('', '')).toBeTruthy();
    expect(validateStudentEnrollmentDate('1995-03-14', '1995-01-01')).toBeTruthy();
    expect(validateStudentEnrollmentDate('1995-03-14', '2025-02-03')).toBe('');
  });
});

describe('validateStudentWeight', () => {
  it('rechaza peso fuera de rango', () => {
    expect(validateStudentWeight(null)).toBe('');
    expect(validateStudentWeight(10)).toBeTruthy();
    expect(validateStudentWeight(300)).toBeTruthy();
    expect(validateStudentWeight(70)).toBe('');
  });
});

describe('validateStudentFields', () => {
  it('agrupa errores por campo', () => {
    const s = base();
    const errs = validateStudentFields(s, {
      firstName: 'A',
      lastName: '',
      idNumber: '123',
      birthDate: '',
      enrollmentDate: '',
      currentWeight: 300,
    });
    expect(errs.firstName).toBeTruthy();
    expect(errs.lastName).toBeTruthy();
    expect(errs.idNumber).toBeTruthy();
    expect(errs.birthDate).toBeTruthy();
    expect(errs.enrollmentDate).toBeTruthy();
    expect(errs.currentWeight).toBeTruthy();
  });
});

describe('validateEventFields', () => {
  it('valida nombre y fecha', () => {
    expect(validateEventFields({ name: '', date: '' }).name).toBeTruthy();
    expect(validateEventFields({ name: '', date: '' }).date).toBeTruthy();
    expect(validateEventFields({ name: 'Copa', date: '2026-09-12' })).toEqual({});
  });
});

describe('validatePaymentFields', () => {
  it('valida alumno, período, monto y fecha', () => {
    const errs = validatePaymentFields({ studentId: '', period: '', amount: '', paymentDate: '' });
    expect(errs.studentId).toBeTruthy();
    expect(errs.period).toBeTruthy();
    expect(errs.amount).toBeTruthy();
    expect(errs.paymentDate).toBeTruthy();
    expect(validatePaymentFields({ studentId: 'a1', period: '2026-08', amount: 18000, paymentDate: '2026-08-01' })).toEqual({});
  });
});

describe('validateSessionDate', () => {
  it('requiere fecha y detecta duplicado', () => {
    const s = base();
    expect(validateSessionDate(s, '')).toBeTruthy();
    const s2 = { ...s, sessions: [{ id: 'j1', date: '2026-09-01', scheduleId: null, present: [] }] };
    expect(validateSessionDate(s2, '2026-09-01')).toBeTruthy();
    expect(validateSessionDate(s, '2026-09-01')).toBe('');
  });
});

describe('validateGraduationFields', () => {
  it('valida fecha no futura y puntuación 0-10', () => {
    expect(validateGraduationFields({ examDate: '2099-01-01', score: 8 }).examDate).toBeTruthy();
    expect(validateGraduationFields({ examDate: '2026-08-20', score: 11 }).score).toBeTruthy();
    expect(validateGraduationFields({ examDate: '2026-08-20', score: '' }).score).toBeTruthy();
    expect(validateGraduationFields({ examDate: '2026-08-20', score: 8.5 })).toEqual({});
  });
});

describe('validateWeight', () => {
  it('valida rango 20-250', () => {
    expect(validateWeight('')).toBeTruthy();
    expect(validateWeight(10)).toBeTruthy();
    expect(validateWeight(300)).toBeTruthy();
    expect(validateWeight('abc')).toBeTruthy();
    expect(validateWeight(72.5)).toBe('');
  });
});

describe('validateWeightDate', () => {
  it('requiere fecha', () => {
    expect(validateWeightDate('')).toBeTruthy();
    expect(validateWeightDate('2026-08-20')).toBe('');
  });
});

describe('validatePlanFields', () => {
  it('valida nombre y precio', () => {
    expect(validatePlanFields({ name: ' ', price: 0 }).name).toBeTruthy();
    expect(validatePlanFields({ name: 'Plan', price: 0 }).price).toBeTruthy();
    expect(validatePlanFields({ name: 'Plan', price: 18000 })).toEqual({});
  });
});

describe('validateScheduleFields', () => {
  it('valida día, horarios y orden', () => {
    expect(validateScheduleFields({ day: '', start: '', end: '' }).day).toBeTruthy();
    expect(validateScheduleFields({ day: 'Lunes', start: '21:00', end: '19:00' }).end).toBeTruthy();
    expect(validateScheduleFields({ day: 'Lunes', start: '19:00', end: '21:00' })).toEqual({});
  });
});

describe('validateParticipantFields', () => {
  it('valida alumno y peso de competencia', () => {
    const event = compEvent();
    expect(validateParticipantFields(event, { studentId: '', compWeight: '' }).studentId).toBeTruthy();
    expect(validateParticipantFields(event, { studentId: 'a1', compWeight: '10' }).compWeight).toBeTruthy();
    expect(validateParticipantFields(event, { studentId: 'a1', compWeight: '70' })).toEqual({});
  });

  it('detecta participante duplicado', () => {
    const event = { ...compEvent(), participants: [{ studentId: 'a1', compWeight: null }] };
    expect(validateParticipantFields(event, { studentId: 'a1', compWeight: '' }).studentId).toBeTruthy();
  });
});

describe('validateFightFields', () => {
  it('valida rival requerido y peso opcional', () => {
    expect(validateFightFields({ studentId: '', opponent: '', opponentWeight: '' }).opponent).toBeTruthy();
    expect(validateFightFields({ studentId: 'a1', opponent: 'Pelea', opponentWeight: '300' }).opponentWeight).toBeTruthy();
    expect(validateFightFields({ studentId: 'a1', opponent: 'Pelea', opponentWeight: '' })).toEqual({});
  });
});
