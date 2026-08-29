import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Clock } from 'lucide-react';
import { useStore, crearActualizarHorario, eliminarHorario, type Horario } from '../store';
import { useToast, Empty } from '../ui-kit';
import { Modal } from '../Modal';

const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';

const DIAS = ['Lunes', 'Martes', 'MiÃ©rcoles', 'Jueves', 'Viernes', 'SÃ¡bado'];

export function Horarios() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Horario | null>(null);
  const [dia, setDia] = useState('Lunes');
  const [inicio, setInicio] = useState('19:00');
  const [fin, setFin] = useState('21:00');

  const guardar = () => {
    const res = crearActualizarHorario(store, { id: edit?.id, dia, inicio, fin });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', res.info || 'Horario guardado.');
    setOpen(false);
  };

  const eliminar = (h: Horario) => {
    const res = eliminarHorario(store, h.id);
    setStore(res.store);
    toast('info', res.info || `Horario eliminado.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Horarios habituales del gimnasio. Se usan al abrir una jornada de asistencia.
        </p>
        <button
          onClick={() => {
            setEdit(null);
            setDia('Lunes');
            setInicio('19:00');
            setFin('21:00');
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo horario
        </button>
      </div>

      {store.horarios.length ? (
        <div className="bg-card rounded-2xl border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] overflow-hidden">
          <ul>
            {store.horarios.map((h) => (
              <li key={h.id} className="flex items-center gap-4 px-6 py-4 border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-pulso-indigo/16 text-pulso-indigo-soft flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold">{h.dia}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {h.inicio} a {h.fin}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEdit(h);
                      setDia(h.dia);
                      setInicio(h.inicio);
                      setFin(h.fin);
                      setOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => eliminar(h)}
                    className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card flex items-center justify-center transition-colors"
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
        <Empty msg="No configuraste horarios todavÃ­a." />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? 'Editar horario' : 'Nuevo horario'}
        sub="DÃ­a y franja horaria del entrenamiento."
        sm
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
              Cancelar
            </button>
            <button onClick={guardar} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {edit ? 'Guardar cambios' : 'Agregar horario'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              DÃ­a <span className="text-pulso-red">*</span>
            </label>
            <select className={inputCls + ' appearance-none'} value={dia} onChange={(e) => setDia(e.target.value)}>
              {DIAS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Inicio <span className="text-pulso-red">*</span>
              </label>
              <input type="time" className={inputCls} value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fin <span className="text-pulso-red">*</span>
              </label>
              <input type="time" className={inputCls} value={fin} onChange={(e) => setFin(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}