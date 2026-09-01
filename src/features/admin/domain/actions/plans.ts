import type { RayoStore, Plan } from '../types';
import { validatePlanFields } from '../validators';
import { err, ok, type ActionResult } from './common';

export function createUpdatePlan(
  d: RayoStore,
  input: Plan
): ActionResult {
  const fieldErrors = validatePlanFields(input);
  if (Object.keys(fieldErrors).length > 0) return err(d, Object.values(fieldErrors)[0], fieldErrors);
  const cleaned: Plan = {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    benefits: input.benefits.map((b) => b.trim()).filter(Boolean),
  };
  if (d.plans.some((p) => p.id === cleaned.id)) {
    return ok({ ...d, plans: d.plans.map((p) => (p.id === cleaned.id ? cleaned : p)) }, `${cleaned.name} actualizado.`);
  }
  return ok({ ...d, plans: [...d.plans, cleaned] }, `${cleaned.name} creado.`);
}