import type { RayoStore, Student } from "../domain/types";
import { seed } from "./seed";

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export function normalize(raw: unknown): RayoStore {
  const base = seed();
  if (!raw) return base;
  const d = raw as Partial<RayoStore>;
  const out: RayoStore = {
    meta: { customized: (d.meta && d.meta.customized) || false },
    schedules: d.schedules || base.schedules,
    plans: d.plans || base.plans,
    students: d.students || base.students,
    graduations: d.graduations || base.graduations,
    fees: d.fees || base.fees,
    sessions: d.sessions || base.sessions,
    events: d.events || base.events,
  };
  (out.students || []).forEach((a: Student) => {
    if (typeof a.lastName === "undefined") {
      const n = String(a.firstName || "").trim();
      const i = n.indexOf(" ");
      if (i > 0) {
        a.lastName = n.slice(i + 1);
        a.firstName = n.slice(0, i);
      } else {
        a.lastName = "";
      }
    }
    if (!Array.isArray(a.weightHistory)) {
      a.weightHistory =
        a.currentWeight != null && !isNaN(Number(a.currentWeight))
          ? [{ date: a.enrollmentDate || today(), weight: Number(a.currentWeight) }]
          : [];
    }
  });
  return out;
}
