import type { RayoStore, Student } from '../types';
import { uid, today } from '../utils';
import { validateStudentFields, validateWeight, validateWeightDate } from '../validators';
import { MSG } from '../messages';
import { err, ok, type ActionResult } from './common';

export function toggleStudentActive(d: RayoStore, studentId: string): ActionResult {
  const student = d.students.find((a) => a.id === studentId);
  if (!student) return err(d, MSG.studentNotFound);
  const next = d.students.map((a) => (a.id === studentId ? { ...a, active: !a.active } : a));
  const wasActive = student.active;
  return ok(
    { ...d, students: next },
    wasActive ? 'Alumno desactivado. Su historial se conserva.' : 'Alumno reactivado.'
  );
}

export function registerCurrentWeight(d: RayoStore, studentId: string, weight: number | string): ActionResult {
  const weightNum = Number(weight);
  const wErr = validateWeight(weight);
  if (wErr) return err(d, wErr);
  const next = d.students.map((al) => {
    if (al.id !== studentId) return al;
    const weightHistory = al.weightHistory ? [...al.weightHistory] : [];
    const last = weightHistory[weightHistory.length - 1];
    if (last && last.date === today()) last.weight = weightNum;
    else weightHistory.push({ date: today(), weight: weightNum });
    return { ...al, currentWeight: weightNum, weightHistory };
  });
  return ok({ ...d, students: next });
}

export function registerHistoricalWeight(
  d: RayoStore,
  studentId: string,
  input: { date: string; weight: string | number }
): ActionResult {
  const weightNum = Number(input.weight);
  const dateErr = validateWeightDate(input.date);
  if (dateErr) return err(d, dateErr);
  const wErr = validateWeight(input.weight);
  if (wErr) return err(d, wErr);
  const next = d.students.map((al) => {
    if (al.id !== studentId) return al;
    const weightHistory = al.weightHistory ? [...al.weightHistory] : [];
    const existIdx = weightHistory.findIndex((x) => x.date === input.date);
    const updated = existIdx > -1 ? weightHistory.map((x, i) => (i === existIdx ? { ...x, weight: weightNum } : x)) : [...weightHistory, { date: input.date, weight: weightNum }];
    return { ...al, currentWeight: weightNum, weightHistory: updated };
  });
  return ok({ ...d, students: next });
}

export function deleteWeightEntry(d: RayoStore, studentId: string, date: string): ActionResult {
  const next = d.students.map((al) => {
    if (al.id !== studentId) return al;
    const weightHistory = (al.weightHistory || []).filter((x) => x.date !== date);
    return { ...al, weightHistory, currentWeight: weightHistory.length ? weightHistory[weightHistory.length - 1].weight : al.currentWeight };
  });
  return ok({ ...d, students: next });
}

export function saveStudent(
  d: RayoStore,
  input: {
    id?: string;
    firstName: string;
    lastName: string;
    idNumber: string;
    birthDate: string;
    phone: string;
    enrollmentDate: string;
    planId: string | null;
    currentWeight: number | null;
    competitionPhoto: string | null;
  }
): ActionResult {
  const errors = validateStudentFields(d, {
    firstName: input.firstName,
    lastName: input.lastName,
    idNumber: input.idNumber,
    birthDate: input.birthDate,
    enrollmentDate: input.enrollmentDate,
    currentWeight: input.currentWeight,
    id: input.id,
  });
  const dniClean = input.idNumber.replace(/\D/g, '');

  if (Object.keys(errors).length > 0) {
    return err(d, MSG.genericInvalid, errors);
  }

  const data = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    idNumber: dniClean,
    birthDate: input.birthDate,
    phone: input.phone.trim(),
    enrollmentDate: input.enrollmentDate,
    currentWeight: input.currentWeight,
    competitionPhoto: input.competitionPhoto,
    planId: input.planId || null,
  };

  if (input.id && d.students.some((a) => a.id === input.id)) {
    const updated = d.students.map((a) => (a.id === input.id ? { ...a, ...data } : a));
    return ok({ ...d, students: updated }, 'Datos actualizados.');
  }
  const nuevo: Student = {
    id: uid('a'),
    ...data,
    active: true,
    weightHistory: data.currentWeight != null ? [{ date: data.enrollmentDate, weight: data.currentWeight }] : [],
  };
  return ok({ ...d, students: [...d.students, nuevo] }, 'Alumno registrado.');
}