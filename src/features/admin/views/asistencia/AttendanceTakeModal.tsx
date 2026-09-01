import { useState } from 'react';
import { Check } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch';
import { useStore, fullName, formatDate, studentPlan, scheduleLabel, type Session, type Student } from '../../store';
import { Avatar } from '../../ui-kit';
import { Modal } from '../../Modal';
import { btnSecondary, btnPrimaryModal } from '../../classes';

export function AttendanceTakeModal({
  session,
  activeStudents,
  onClose,
  onSave,
}: {
  session: Session | undefined;
  activeStudents: Student[];
  onClose: () => void;
  onSave: (id: string, present: string[]) => void;
}) {
  const { store } = useStore();
  const [marks, setMarks] = useState<Record<string, boolean>>(
    () =>
      session
        ? Object.fromEntries(activeStudents.map((a) => [a.id, session.present.indexOf(a.id) > -1]))
        : {}
  );

  if (!session) return null;
  const h = session.scheduleId ? store.schedules.find((x) => x.id === session.scheduleId) : null;
  const count = Object.values(marks).filter(Boolean).length;

  return (
    <Modal
      open={!!session}
      onClose={onClose}
      title={`Asistencia · ${formatDate(session.date)}`}
      sub={scheduleLabel(h) || 'Entrenamiento libre'}
      wide
      footer={
        <>
          <span className="flex-1 text-sm text-muted-foreground">
            {count} presentes de {activeStudents.length}
          </span>
          <button onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button
            onClick={() => onSave(session.id, Object.keys(marks).filter((k) => marks[k]))}
            className={btnPrimaryModal}
          >
            <Check className="w-4 h-4" /> Guardar jornada
          </button>
        </>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        Marcá a los presentes. Quienes queden sin marcar se registran como ausentes.
      </p>
      <div className="space-y-1.5 max-h-[50vh] overflow-y-auto overflow-x-hidden">
        {activeStudents.map((a) => {
          const p = studentPlan(store, a.id);
          return (
            <div key={a.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-pulso-surface2 transition-colors">
              <Avatar student={a} />
              <div className="flex-1">
                <div className="text-sm text-foreground font-medium">{fullName(a)}</div>
                <div className="text-xs text-muted-foreground">{p ? p.name : 'sin plan'}</div>
              </div>
              <Switch
                aria-label={`Marcar ${fullName(a)} como presente`}
                checked={!!marks[a.id]}
                onCheckedChange={(v) => setMarks((m) => ({ ...m, [a.id]: v }))}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
