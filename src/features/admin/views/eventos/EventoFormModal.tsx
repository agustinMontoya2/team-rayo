import { useState } from 'react';
import { Check } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch';
import { useStore, hoy, crearActualizarEvento, type Evento, type TipoEvento } from '../../store';
import { useToast } from '../../ui-kit';
import { Modal } from '../../Modal';
import { inputCls, selectCls } from './fields';

export function EventoFormModal({ open, onClose, edit }: { open: boolean; onClose: () => void; edit: Evento | null }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [nombre, setNombre] = useState(edit ? edit.nombre : '');
  const [tipo, setTipo] = useState<TipoEvento>(edit ? edit.tipo : 'competencia');
  const [fecha, setFecha] = useState(edit ? edit.fecha : hoy());
  const [descripcion, setDescripcion] = useState(edit ? edit.descripcion : '');
  const [publico, setPublico] = useState(edit ? edit.publico : true);

  const guardar = () => {
    const res = crearActualizarEvento(store, { id: edit?.id, nombre, tipo, fecha, descripcion, publico });
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
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> {edit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre <span className="text-pulso-red">*</span>
          </label>
          <input className={inputCls} placeholder="Ej.: Copa Nacional" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tipo <span className="text-pulso-red">*</span>
            </label>
            <select className={selectCls} value={tipo} onChange={(e) => setTipo(e.target.value as TipoEvento)}>
              <option value="competencia">Competencia</option>
              <option value="exhibicion">Exhibición</option>
              <option value="taller">Taller / Examen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha <span className="text-pulso-red">*</span>
            </label>
            <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
          <textarea rows={3} className={inputCls} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 rounded-xl border border-pulso-line">
          <span className="text-sm text-foreground font-medium">Evento público</span>
          <Switch
            checked={publico}
            onCheckedChange={setPublico}
            className="data-[state=checked]:bg-pulso-indigo data-[state=unchecked]:bg-pulso-switch-off data-[state=unchecked]:border-pulso-switch-off"
          />
        </label>
      </div>
    </Modal>
  );
}