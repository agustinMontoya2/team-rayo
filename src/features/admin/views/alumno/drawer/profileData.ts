import type { Plan, Graduation, Fee, Session, CompetitionHistoryEntry, BeltType } from '../../../store';

export interface StudentProfileData {
  p: Plan | null;
  belt: BeltType;
  grados: Graduation[];
  jTodas: Session[];
  jPres: number;
  pctAsis: number | null;
  asisRows: { id: string; date: string; pres: boolean; hr: string }[];
  cuotasA: Fee[];
  comps: CompetitionHistoryEntry[];
  g: number;
  dcount: number;
}
