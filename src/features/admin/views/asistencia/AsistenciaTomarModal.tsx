import { useState } from 'react';
import { Check } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch';
import { useStore, fullName, fmtDate, planDe, type Jornada, type Alumno } from '../../store';
import { Avatar } from '../../ui-kit';
import { Modal } from '../../Modal';

export function AsistenciaTomarModal({
  jornada,
  activos,
  onClose,
  onSave,
}: {
  jornada: Jornada | undefined;
  activos: Alumno[];
  onClose: () => void;
  onSave: (id: string, presentes: string[]) => void;
}) {
  const { store } = useStore();
  const [marks, setMarks] = useState<Record<string, boolean>>(
    () =>
      jornada
        ? Object.fromEntries(activos.map((a) => [a.id, jornada.presentes.indexOf(a.id) > -1]))
        : {}
  );

  if (!jornada) return null;
  const h = jornada.horarioId ? store.horarios.find((x) => x.id === jornada.horarioId) : null;
  const count = Object.values(marks).filter(Boolean).length;

  return (
    <Modal
      open={!!jornada}
      onClose={onClose}
      title={`Asistencia · ${fmtDate(jornada.fecha)}`}
      sub={h ? `${h.dia} · ${h.inicio} a ${h.fin}` : 'Entrenamiento libre'}
      wide
      footer={
        <>
          <span className="flex-1 text-sm text-muted-foreground">
            {count} presentes de {activos.length}
          </span>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave(jornada.id, Object.keys(marks).filter((k) => marks[k]))}
            className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5"
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
        {activos.map((a) => {
          const p = planDe(store, a.id);
          return (
            <div key={a.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-pulso-surface2 transition-colors">
              <Avatar alumno={a} />
              <div className="flex-1">
                <div className="text-sm text-foreground font-medium">{fullName(a)}</div>
                <div className="text-xs text-muted-foreground">{p ? p.nombre : 'sin plan'}</div>
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