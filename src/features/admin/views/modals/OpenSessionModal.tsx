import { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../Modal';
import { useStore, today, createSession, scheduleLabel, type Session } from '../../store';
import { validateSessionDate } from '../../domain/validators';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { useToast } from '../../ui-kit';
import { selectCls, btnSecondary, btnPrimaryModal } from '../../classes';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (s: Session) => void;
}

export function OpenSessionModal({ open, onClose, onCreated }: Props) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [schedule, setSchedule] = useState('');

  const initial = { date: today() };
  const validateField = (v: typeof initial, _field: string): string => validateSessionDate(store, v.date) || '';
  const { values, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  const abrir = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = createSession(store, values.date, schedule);
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    const session = res.store.sessions[res.store.sessions.length - 1];
    onClose();
    onCreated(session);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Abrir jornada de entrenamiento"
      sub="Elegí la fecha; después marcás la asistencia."
      sm
      footer={
        <>
          <button onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button onClick={abrir} className={btnPrimaryModal}>
            <Check className="w-4 h-4" /> Abrir y tomar asistencia
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha <span className="text-pulso-red">*</span>
          </label>
          <input type="date" className={selectCls} value={values.date} onChange={(e) => onChange('date', e.target.value)} onBlur={() => onBlur('date')} />
          {error('date') && <p className="text-xs text-pulso-red mt-1">{error('date')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Horario habitual</label>
          <select className={selectCls} value={schedule} onChange={(e) => setSchedule(e.target.value)}>
            <option value="">Entrenamiento libre</option>
            {store.schedules.map((h) => (
              <option key={h.id} value={h.id}>
                {scheduleLabel(h)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
