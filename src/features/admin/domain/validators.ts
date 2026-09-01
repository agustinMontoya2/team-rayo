import type { RayoStore, Event } from './types';
import { today } from './utils';

export const WEIGHT_MIN = 20;
export const WEIGHT_MAX = 250;
const WEIGHT_RANGE_MSG = `(${WEIGHT_MIN}-${WEIGHT_MAX} kg)`;

export interface StudentValidationInput {
  firstName: string;
  lastName: string;
  idNumber: string;
  birthDate: string;
  enrollmentDate: string;
  currentWeight: number | null;
  id?: string;
}

export function validateStudentFirstName(value: string): string {
  return value.trim().length < 2 ? 'Ingresá el nombre.' : '';
}

export function validateStudentLastName(value: string): string {
  return value.trim().length < 2 ? 'Ingresá el apellido.' : '';
}

export function validateStudentDni(d: RayoStore, value: string, id?: string): string {
  const dniClean = value.replace(/\D/g, '');
  if (dniClean.length < 7) return 'El DNI necesita al menos 7 números.';
  if (d.students.some((x) => x.idNumber === dniClean && x.id !== id)) return 'Ya existe un alumno con ese DNI.';
  return '';
}

export function validateStudentBirthDate(value: string): string {
  return !value ? 'Seleccioná la fecha de nacimiento.' : '';
}

export function validateStudentEnrollmentDate(birthDate: string, enrollmentDate: string): string {
  if (!enrollmentDate) return 'Indicá la fecha de ingreso.';
  if (birthDate && enrollmentDate <= birthDate) return 'El ingreso debe ser posterior al nacimiento.';
  return '';
}

export function validateStudentWeight(value: number | null): string {
  if (value != null && (value < WEIGHT_MIN || value > WEIGHT_MAX)) return 'Peso fuera de rango.';
  return '';
}

export function validateStudentFields(d: RayoStore, input: StudentValidationInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const firstName = validateStudentFirstName(input.firstName);
  if (firstName) errors.firstName = firstName;
  const lastName = validateStudentLastName(input.lastName);
  if (lastName) errors.lastName = lastName;
  const dni = validateStudentDni(d, input.idNumber, input.id);
  if (dni) errors.idNumber = dni;
  const birthDate = validateStudentBirthDate(input.birthDate);
  if (birthDate) errors.birthDate = birthDate;
  const enrollmentDate = validateStudentEnrollmentDate(input.birthDate, input.enrollmentDate);
  if (enrollmentDate) errors.enrollmentDate = enrollmentDate;
  const weight = validateStudentWeight(input.currentWeight);
  if (weight) errors.currentWeight = weight;
  return errors;
}

export function validateEventName(value: string): string {
  return !value.trim() ? 'Poné un nombre al evento.' : '';
}

export function validateEventDate(value: string): string {
  return !value ? 'Indicá una fecha.' : '';
}

export function validateEventFields(input: { name: string; date: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = validateEventName(input.name);
  if (name) errors.name = name;
  const date = validateEventDate(input.date);
  if (date) errors.date = date;
  return errors;
}

export function validatePaymentFields(input: {
  studentId: string;
  period: string;
  amount: string | number;
  paymentDate: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.studentId) errors.studentId = 'Elegí el alumno que paga.';
  if (!input.period) errors.period = 'Indicá el período (mes y año).';
  const amount = Number(input.amount);
  if (input.amount === '' || isNaN(amount) || amount <= 0) errors.amount = 'Indicá un monto válido.';
  if (!input.paymentDate) errors.paymentDate = 'Indicá la fecha de pago.';
  return errors;
}

export function validateSessionDate(d: RayoStore, value: string): string {
  if (!value) return 'Indicá la fecha de la jornada.';
  if (d.sessions.some((s) => s.date === value)) return 'Ya existe una jornada abierta para esa fecha.';
  return '';
}

export function validateGraduationExamDate(value: string): string {
  if (!value) return 'Indicá la fecha del examen.';
  if (value > today()) return 'La fecha no puede ser futura.';
  return '';
}

export function validateGraduationScore(value: string | number): string {
  if (value === '' || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10) return 'Puntuación entre 0 y 10.';
  return '';
}

export function validateGraduationFields(input: { examDate: string; score: string | number }): Record<string, string> {
  const errors: Record<string, string> = {};
  const date = validateGraduationExamDate(input.examDate);
  if (date) errors.examDate = date;
  const score = validateGraduationScore(input.score);
  if (score) errors.score = score;
  return errors;
}

export function validateWeight(value: string | number): string {
  const weightNum = Number(value);
  if (value === '' || isNaN(weightNum) || weightNum < WEIGHT_MIN || weightNum > WEIGHT_MAX) return `Ingresá un peso válido ${WEIGHT_RANGE_MSG}.`;
  return '';
}

export function validateWeightDate(value: string): string {
  return !value ? 'Seleccioná una fecha.' : '';
}

export function validatePlanName(value: string): string {
  return !value.trim() ? 'Poné un nombre al plan.' : '';
}

export function validatePlanPrice(value: number): string {
  return !(value > 0) ? 'Poné un precio mayor a 0.' : '';
}

export function validatePlanFields(input: { name: string; price: number }): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = validatePlanName(input.name);
  if (name) errors.name = name;
  const price = validatePlanPrice(input.price);
  if (price) errors.price = price;
  return errors;
}

export function validateScheduleDay(value: string): string {
  return !value ? 'Elegí un día.' : '';
}

export function validateScheduleTime(value: string): string {
  return !value ? 'Completá el horario.' : '';
}

export function validateScheduleOrder(start: string, end: string): string {
  if (start && end && start >= end) return 'La hora de fin debe ser después del inicio.';
  return '';
}

export function validateScheduleFields(input: { day: string; start: string; end: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const day = validateScheduleDay(input.day);
  if (day) errors.day = day;
  const start = validateScheduleTime(input.start);
  if (start) errors.start = start;
  const end = validateScheduleTime(input.end);
  if (end) errors.end = end;
  const order = validateScheduleOrder(input.start, input.end);
  if (order) errors.end = order;
  return errors;
}

export function validateParticipantFields(
  event: Event,
  input: { studentId: string; compWeight: string | number | null }
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.studentId) errors.studentId = 'Elegí un alumno.';
  if (event.participants.some((p) => p.studentId === input.studentId)) errors.studentId = 'Ese alumno ya está en el evento.';
  if (event.type === 'competencia') {
    const weight = validateWeight(input.compWeight ?? '');
    if (weight) errors.compWeight = `Indicá el peso de competencia ${WEIGHT_RANGE_MSG}.`;
  }
  return errors;
}

export function validateFightFields(input: {
  studentId: string;
  opponent: string;
  opponentWeight: string | number | null;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.studentId || !input.opponent.trim()) errors.opponent = 'Elegí un alumno del equipo y escribí el rival.';
  if (input.opponentWeight !== '' && input.opponentWeight != null) {
    const weight = validateWeight(input.opponentWeight);
    if (weight) errors.opponentWeight = `Peso del rival fuera de rango ${WEIGHT_RANGE_MSG}.`;
  }
  return errors;
}
