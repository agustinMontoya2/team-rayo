import { useState } from 'react';
import { Check } from 'lucide-react';
import { useStore, uid, type Plan } from '../../store';
import { Modal } from '../../Modal';

const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';

const nuevoPlan = (): Plan => ({ id: uid('p'), nombre: '', tipo: 'recreativo', precio: 0, descripcion: '', destacado: false, beneficios: [] });

interface Props {
  plan: Plan | null;
  onClose: () => void;
  onSave: (p: Plan) => void;
}

export function PlanModal({ plan, onClose, onSave }: Props) {
  const { store } = useStore();
  const [local, setLocal] = useState<Plan>(() => plan ?? nuevoPlan());

  const esNuevo = !store.planes.some((p) => p.id === local.id);

  return (
    <Modal
      open={!!plan}
      onClose={onClose}
      title={esNuevo ? 'Nuevo plan' : 'Editar plan'}
      sub={plan ? local.nombre : 'Creá un plan para tus alumnos'}
      sm
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(local)} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Guardar
          </button>
        </>
      }
    >
      {plan && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-pulso-red">*</span>
            </label>
            <input className={inputCls} value={local.nombre} onChange={(e) => setLocal({ ...local, nombre: e.target.value })} placeholder="Ej.: Muay Thai competitivo" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tipo <span className="text-pulso-red">*</span>
              </label>
              <select className={inputCls + ' appearance-none'} value={local.tipo} onChange={(e) => setLocal({ ...local, tipo: e.target.value as Plan['tipo'] })}>
                <option value="recreativo">Recreativo</option>
                <option value="competitivo">Competitivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Precio mensual <span className="text-pulso-red">*</span>
              </label>
              <input className={inputCls} type="number" value={local.precio} onChange={(e) => setLocal({ ...local, precio: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <textarea rows={2} className={inputCls} value={local.descripcion} onChange={(e) => setLocal({ ...local, descripcion: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Beneficios <span className="text-pulso-red">*</span>
            </label>
            <textarea
              rows={3}
              className={inputCls}
              value={local.beneficios.join('\n')}
              onChange={(e) => setLocal({ ...local, beneficios: e.target.value.split('\n') })}
              placeholder={'Un beneficio por línea:\n2 clases semanales\nSparring los sábados'}
            />
            <p className="text-xs text-muted-foreground mt-1">Escribí un beneficio por línea.</p>
          </div>
          <div>
            <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 rounded-xl border border-pulso-line">
              <span className="text-sm text-foreground font-medium">Plan destacado</span>
              <input type="checkbox" checked={local.destacado} onChange={(e) => setLocal({ ...local, destacado: e.target.checked })} className="accent-pulso-indigo w-4 h-4" />
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}