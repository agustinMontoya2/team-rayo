import { useState } from 'react';
import { Check } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch';
import { useStore, today, createUpdateEvent, EVENT_TYPES, type Event, type EventType } from '../../store';
import { validateEventFields } from '../../domain/validators';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { useToast } from '../../ui-kit';
import { Modal } from '../../Modal';
import { Field } from '../../Field';
import { inputCls, selectCls } from './fields';
import { btnSecondary, btnPrimaryModal } from '../../classes';

export function EventFormModal({ open, onClose, edit }: { open: boolean; onClose: () => void; edit: Event | null }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [type, setType] = useState<EventType>(edit ? edit.type : EVENT_TYPES.competencia.value);
  const [isPublic, setIsPublic] = useState(edit ? edit.public : true);
  const [description, setDescription] = useState(edit ? edit.description : '');

  const initial = { name: edit ? edit.name : '', date: edit ? edit.date : today() };
  const validateField = (v: typeof initial, field: string): string => validateEventFields(v)[field] || '';

  const { values, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  const guardar = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = createUpdateEvent(store, { id: edit?.id, name: values.name, type, date: values.date, description, public: isPublic });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', res.info || 'Evento guardado.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? 'Editar evento' : 'Nuevo evento'}
      sub="Nombre, tipo, fecha y visibilidad."
      footer={
        <>
          <button onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button onClick={guardar} className={btnPrimaryModal}>
            <Check className="w-4 h-4" /> {edit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nombre" required>
          <input className={inputCls} placeholder="Ej.: Copa Nacional" value={values.name} onChange={(e) => onChange('name', e.target.value)} onBlur={() => onBlur('name')} />
          {error('name') && <p className="text-xs text-pulso-red mt-1">{error('name')}</p>}
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo" required>
            <select className={selectCls} value={type} onChange={(e) => setType(e.target.value as EventType)}>
              {(Object.entries(EVENT_TYPES) as [EventType, { label: string }][]).map(([value, meta]) => (
                <option key={value} value={value}>
                  {value === EVENT_TYPES.taller.value ? 'Taller / Examen' : meta.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha" required>
            <input type="date" className={inputCls} value={values.date} onChange={(e) => onChange('date', e.target.value)} onBlur={() => onBlur('date')} />
            {error('date') && <p className="text-xs text-pulso-red mt-1">{error('date')}</p>}
          </Field>
        </div>
        <Field label="Descripción">
          <textarea rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 rounded-xl border border-pulso-line">
          <span className="text-sm text-foreground font-medium">Evento público</span>
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
            className="data-[state=checked]:bg-pulso-indigo data-[state=unchecked]:bg-pulso-switch-off data-[state=unchecked]:border-pulso-switch-off"
          />
        </label>
      </div>
    </Modal>
  );
}
