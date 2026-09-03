import type { RayoStore } from "../domain/types";

export function seed(): RayoStore {
  return {
    meta: { customized: false },
    schedules: [],
    plans: [],
    students: [],
    graduations: [],
    fees: [],
    sessions: [],
    events: [],
  };
}
