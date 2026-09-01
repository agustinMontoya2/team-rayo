import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Clock } from 'lucide-react';
import { useStore, createUpdateSchedule, deleteSchedule, DAYS_OF_WEEK, type Schedule } from '../store';
import { validateScheduleFields } from '../domain/validators';
import { useRealtimeValidation } from '../hooks/useRealtimeValidation';
import { useToast, Empty } from '../ui-kit';
import { ConfirmDialog } from '../ConfirmDialog';
import { Modal } from '../Modal';
import { inputCls, selectCls, btnPrimary, btnPrimaryModal, btnSecondary, iconBtn, iconBtnDanger, cardSurface } from '../classes';

export function Schedules() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Schedule | null>(null);
  const [confirmSchedule, setConfirmSchedule] = useState<Schedule | null>(null);

  const initial = { dia: 'Lunes', inicio: '19:00', fin: '21:00' };
  const validateField = (v: typeof initial, field: string): string =>
    validateScheduleFields({ day: v.dia, start: v.inicio, end: v.fin })[field] || '';
  const { values, setValues, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  const abrirModal = (h: Schedule | null) => {
    setEdit(h);
    setValues({ dia: h?.day || 'Lunes', inicio: h?.start || '19:00', fin: h?.end || '21:00' });
    setOpen(true);
  };

  const guardar = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = createUpdateSchedule(store, { id: edit?.id, day: values.dia, start: values.inicio, end: values.fin });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', res.info || 'Horario guardado.');
    setOpen(false);
  };

  const eliminar = (h: Schedule) => {
    const res = deleteSchedule(store, h.id);
    setStore(res.store);
    setConfirmSchedule(null);
    toast('info', res.info || `Horario eliminado.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Horarios habituales del gimnasio. Se usan al abrir una jornada de asistencia.
        </p>
        <button
          onClick={() => abrirModal(null)}
          className={btnPrimary}
        >
          <Plus className="w-4 h-4" />
          Nuevo horario
        </button>
      </div>

      {store.schedules.length ? (
        <div className={`${cardSurface} overflow-hidden`}>
          <ul>
            {store.schedules.map((h) => (
              <li key={h.id} className="flex items-center gap-4 px-6 py-4 border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-pulso-indigo/16 text-pulso-indigo-soft flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold">{h.day}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {h.start} a {h.end}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => abrirModal(h)}
                    className={iconBtn}
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmSchedule(h)}
                    className={iconBtnDanger}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Empty msg="No configuraste horarios todavía." />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? 'Editar horario' : 'Nuevo horario'}
        sub="Día y franja horaria del entrenamiento."
        sm
        footer={
          <>
            <button onClick={() => setOpen(false)} className={btnSecondary}>
              Cancelar
            </button>
            <button onClick={guardar} className={btnPrimaryModal}>
              <Check className="w-4 h-4" /> {edit ? 'Guardar cambios' : 'Agregar horario'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Día <span className="text-pulso-red">*</span>
            </label>
            <select className={selectCls} value={values.dia} onChange={(e) => onChange('dia', e.target.value)} onBlur={() => onBlur('dia')}>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            {error('dia') && <p className="text-xs text-pulso-red mt-1">{error('dia')}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Inicio <span className="text-pulso-red">*</span>
              </label>
              <input type="time" className={inputCls} value={values.inicio} onChange={(e) => onChange('inicio', e.target.value)} onBlur={() => onBlur('inicio')} />
              {error('inicio') && <p className="text-xs text-pulso-red mt-1">{error('inicio')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fin <span className="text-pulso-red">*</span>
              </label>
              <input type="time" className={inputCls} value={values.fin} onChange={(e) => onChange('fin', e.target.value)} onBlur={() => onBlur('fin')} />
              {error('fin') && <p className="text-xs text-pulso-red mt-1">{error('fin')}</p>}
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminar horario */}
      <ConfirmDialog
        open={!!confirmSchedule}
        title="Eliminar horario"
        message={`¿Seguro que querés eliminar el horario de ${confirmSchedule?.day}? Se desvinculará de las jornadas que lo usan.`}
        onConfirm={() => confirmSchedule && eliminar(confirmSchedule)}
        onCancel={() => setConfirmSchedule(null)}
      />
    </div>
  );
}
