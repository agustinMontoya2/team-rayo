import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore, fullName, formatDate, formatWeight, addParticipant, removeParticipant, type Event } from '../../store';
import { validateParticipantFields } from '../../domain/validators';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { useToast, Avatar } from '../../ui-kit';
import { ConfirmDialog } from '../../ConfirmDialog';
import { Modal } from '../../Modal';
import { selectCls } from './fields';
import { iconBtnDanger } from '../../classes';

export function ParticipantsModal({ event, onClose }: { event: Event | undefined; onClose: () => void }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [confirmStudent, setConfirmStudent] = useState<string | null>(null);

  const initial = { newStudent: '', peso: '' as string | number };
  const validateField = (v: typeof initial, field: string): string => {
    if (!event) return '';
    return validateParticipantFields(event, { studentId: v.newStudent, compWeight: v.peso })[field] || '';
  };
  const { values, setValues, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  if (!event) return null;

  const agregar = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = addParticipant(store, event.id, { studentId: values.newStudent, compWeight: values.peso });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setValues({ newStudent: '', peso: '' });
    toast('ok', res.info || 'Participante agregado.');
  };

  const quitar = (studentId: string) => {
    const res = removeParticipant(store, event.id, studentId);
    setStore(res.store);
    setConfirmStudent(null);
    toast('info', res.info || 'Participante quitado.');
  };

  const disponibles = store.students.filter((a) => a.active && !event.participants.some((p) => p.studentId === a.id));

  return (
    <>
      <Modal
        open={!!event}
        onClose={onClose}
        title={`Participantes · ${event.name}`}
        sub={formatDate(event.date)}
        wide
        footer={
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
            Listo
          </button>
        }
      >
      <div className="space-y-3 mb-4">
        {event.type === 'competencia' ? (
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{event.participants.length} participantes</span>. El peso de competencia se guarda por evento.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{event.participants.length} participantes</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <select className={selectCls + ' flex-1 min-w-0'} value={values.newStudent} onChange={(e) => onChange('newStudent', e.target.value)} onBlur={() => onBlur('newStudent')}>
            <option value="">Agregar alumno…</option>
            {disponibles.map((a) => (
              <option key={a.id} value={a.id}>
                {fullName(a)}
              </option>
            ))}
          </select>
          {event.type === 'competencia' && (
            <input
              className="w-[120px] shrink-0 px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm"
              placeholder="Peso en kg"
              value={values.peso}
              onChange={(e) => onChange('peso', e.target.value)}
              onBlur={() => onBlur('peso')}
            />
          )}
          <button onClick={agregar} disabled={!values.newStudent} className="px-4 py-3 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:hover:bg-pulso-red disabled:hover:text-primary-foreground">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {(error('newStudent') || error('peso')) && (
          <p className="text-xs text-pulso-red">{error('newStudent') || error('peso')}</p>
        )}
      </div>
      {event.participants.length ? (
        <ul className="space-y-2 max-h-[45vh] overflow-y-auto overflow-x-hidden">
          {event.participants.map((p) => {
            const a = store.students.find((x) => x.id === p.studentId);
            return (
              <li key={p.studentId} className="flex items-center gap-3 py-2 px-3 rounded-xl border border-pulso-line-strong">
                <Avatar student={a} />
                <div className="flex-1">
                  <div className="text-sm text-foreground font-medium">{a ? fullName(a) : 'Alumno eliminado'}</div>
                  {event.type === 'competencia' && (
                    <div className="text-xs text-muted-foreground">Peso de competencia: {p.compWeight != null ? formatWeight(p.compWeight) : 'sin definir'}</div>
                  )}
                </div>
                <button onClick={() => setConfirmStudent(p.studentId)} className={iconBtnDanger} title="Quitar">
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">Todavía no hay participantes.</p>
      )}
      </Modal>

      {/* Confirmar quitar participante */}
      <ConfirmDialog
        open={!!confirmStudent}
        title="Quitar participante"
        message="¿Seguro que querés quitar este participante? Se eliminarán también sus peleas. Esta acción no se puede deshacer."
        confirmLabel="Quitar"
        onConfirm={() => confirmStudent && quitar(confirmStudent)}
        onCancel={() => setConfirmStudent(null)}
      />
    </>
  );
}