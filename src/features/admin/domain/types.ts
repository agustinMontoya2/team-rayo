import type { PlanType, EventType, FightResult, BeltType } from './catalog';

export interface Schedule {
  id: string;
  day: string;
  start: string;
  end: string;
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  description: string;
  featured: boolean;
  benefits: string[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  idNumber: string;
  enrollmentDate: string;
  currentWeight: number | null;
  competitionPhoto: string | null;
  planId: string | null;
  active: boolean;
  weightHistory: WeightEntry[];
}

export interface Graduation {
  id: string;
  studentId: string;
  belt: BeltType;
  examDate: string;
  score: number;
}

export interface Fee {
  id: string;
  studentId: string;
  period: string;
  amount: number;
  paymentDate: string;
}

export interface Session {
  id: string;
  date: string;
  scheduleId: string | null;
  present: string[];
}

export interface Participant {
  studentId: string;
  compWeight: number | null;
}

export interface Fight {
  id: string;
  studentId: string;
  opponent: string;
  opponentWeight: number | null;
  result: FightResult;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  date: string;
  description: string;
  public: boolean;
  participants: Participant[];
  fights: Fight[];
}

export interface RayoStore {
  meta: { customized: boolean };
  schedules: Schedule[];
  plans: Plan[];
  students: Student[];
  graduations: Graduation[];
  fees: Fee[];
  sessions: Session[];
  events: Event[];
}
