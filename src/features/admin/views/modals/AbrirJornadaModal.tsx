import { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../Modal';
import { useStore, hoy, crearJornada, type Jornada } from '../../store';
import { useToast } from '../../ui-kit';

const inputSelCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm appearance-none';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (j: Jornada) => void;
}

export function AbrirJornadaModal({ open, onClose, onCreated }: Props) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [fecha, setFecha] = useState(hoy());
  const [horario, setHorario] = useState('');

  const abrir = () => {
    const res = crearJornada(store, fecha, horario);
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    const j = res.store.jornadas[res.store.jornadas.length - 1];
    onClose();
    onCreated(j);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Abrir jornada de entrenamiento"
      sub="ElegÃ­ la fecha; despuÃ©s marcÃ¡s la asistencia."
      sm
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button onClick={abrir} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
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
          <input type="date" className={inputSelCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Horario habitual</label>
          <select className={inputSelCls} value={horario} onChange={(e) => setHorario(e.target.value)}>
            <option value="">Entrenamiento libre</option>
            {store.horarios.map((h) => (
              <option key={h.id} value={h.id}>
                {h.dia} Â· {h.inicio}-{h.fin}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}