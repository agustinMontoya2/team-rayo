import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '../../../components/ui/sheet';
import { Accordion } from '../../../components/ui/accordion';
import { useStore, fullName, currentBelt, studentPlan, attendancePct, fightRecord, competitionHistory, scheduleLabel, sortByDateDesc, type Student } from '../store';
import { Avatar, BeltBadge, PlanBadge, StatusPill } from '../ui-kit';
import { StudentFormModal } from './StudentFormModal';
import { WeightSection } from './alumno/WeightSection';
import { PersonalDataSection } from './alumno/drawer/PersonalDataSection';
import { BeltsSection } from './alumno/drawer/BeltsSection';
import { AttendanceSection } from './alumno/drawer/AttendanceSection';
import { FeesSection } from './alumno/drawer/FeesSection';
import { CompetitionsSection } from './alumno/drawer/CompetitionsSection';
import type { StudentProfileData } from './alumno/drawer/profileData';

interface Props {
  studentId: string | null;
  onClose: () => void;
  onToggle: (a: Student) => void;
}

export function StudentProfileDrawer({ studentId, onClose, onToggle }: Props) {
  const { store } = useStore();
  const [editOpen, setEditOpen] = useState(false);

  const a = studentId ? store.students.find((x) => x.id === studentId) : null;

  const perfil = useMemo<StudentProfileData | null>(() => {
    if (!a) return null;
    const p = studentPlan(store, a.id);
    const belt = currentBelt(store, a.id);
    const grados = sortByDateDesc(store.graduations.filter((g) => g.studentId === a.id), (g) => g.examDate);
    const jTodas = sortByDateDesc(store.sessions.filter((j) => j.date >= a.enrollmentDate), (j) => j.date);
    const jPres = jTodas.filter((j) => j.present.indexOf(a.id) > -1).length;
    const pctAsis = attendancePct(jPres, jTodas.length);
    const asisRows = jTodas.map((j) => {
      const pres = j.present.indexOf(a.id) > -1;
      const hr = store.schedules.find((h) => h.id === j.scheduleId);
      return { id: j.id, date: j.date, pres, hr: scheduleLabel(hr) };
    });
    const cuotasA = sortByDateDesc(store.fees.filter((c) => c.studentId === a.id), (c) => c.period);
    const comps = competitionHistory(store, a.id);
    const { wins: g, losses: dcount } = fightRecord(store, a.id);
    return { p, belt, grados, jTodas, jPres, pctAsis, asisRows, cuotasA, comps, g, dcount };
  }, [store, a]);

  if (!a || !perfil) return null;

  return (
    <>
      <Sheet open={!!a} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="bg-pulso-panel border-l border-pulso-line-bright w-full sm:max-w-lg p-0 gap-0 overflow-hidden flex flex-col">
          <SheetTitle className="sr-only">Perfil de {fullName(a)}</SheetTitle>

          {/* Header */}
          <div className="px-6 py-5 border-b border-pulso-line-strong flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar student={a} size="lg" />
              <div className="min-w-0">
                <div className="text-lg font-extrabold tracking-tight truncate">{fullName(a)}</div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <StatusPill active={a.active} />
                  {perfil.p ? <PlanBadge type={perfil.p.type} /> : <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">Sin plan</span>}
                  <BeltBadge belt={perfil.belt} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <Accordion type="multiple" defaultValue={['datos', 'peso']}>
              <PersonalDataSection a={a} p={perfil.p} />
              <WeightSection student={a} key={a.id} />
              <BeltsSection grados={perfil.grados} />
              <AttendanceSection perfil={perfil} />
              <FeesSection cuotasA={perfil.cuotasA} planName={perfil.p?.name || 'Sin plan'} />
              <CompetitionsSection comps={perfil.comps} p={perfil.p} g={perfil.g} dcount={perfil.dcount} />
            </Accordion>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-pulso-line-strong flex gap-2 flex-wrap">
              <button
                onClick={() => setEditOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors inline-flex items-center gap-1.5"
              >
                ✎ Editar datos
              </button>
              <button
                onClick={() => onToggle(a)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-1.5 ${a.active ? 'bg-pulso-red-deep text-white hover:bg-pulso-red' : 'bg-pulso-red text-primary-foreground hover:bg-foreground hover:text-background'}`}
              >
                <span className="text-base leading-none">{a.active ? '⏻' : '↺'}</span>
                {a.active ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {editOpen && (
        <StudentFormModal
          key={a.id}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          edit={a}
          onDone={() => undefined}
        />
      )}
    </>
  );
}