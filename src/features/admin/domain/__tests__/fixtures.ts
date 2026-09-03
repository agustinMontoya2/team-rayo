import { seed } from '../seed';
import type { RayoStore } from '../types';

const PLAN_P1 = { id: 'p1', name: 'Plan Recreativo', type: 'recreativo' as const, price: 18000, description: '', featured: false, benefits: [] as string[] };

export function base(): RayoStore {
  const s = seed();
  s.plans = [PLAN_P1];
  s.students = [
    { id: 'a1', firstName: 'Ana', lastName: 'Pérez', birthDate: '1995-03-14', phone: '', idNumber: '37123456', enrollmentDate: '2025-02-03', currentWeight: 61.5, competitionPhoto: null, planId: 'p1', active: true, weightHistory: [] },
  ];
  return s;
}
