import { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../Modal';
import { useStore, fullName, planDe, fmtMoney, hoy, periodoActual, periodoLabel, registrarPago } from '../../store';
import { useToast } from '../../ui-kit';

const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultPeriodo?: string;
  defaultAlumnoId?: string;
  defaultMonto?: string;
}

export function RegistrarPagoModal({ open, onClose, defaultPeriodo, defaultAlumnoId, defaultMonto }: Props) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [alumno, setAlumno] = useState(defaultAlumnoId || '');
  const [monto, setMonto] = useState(defaultMonto || '');
  const [fecha, setFecha] = useState(hoy());
  const [periodo, setPeriodo] = useState(defaultPeriodo || periodoActual());

  const plan = alumno ? planDe(store, alumno) : null;

  const registrar = () => {
    const res = registrarPago(store, { alumnoId: alumno, periodo, monto, fechaPago: fecha });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', `Pago de ${fmtMoney(Number(monto))} registrado para ${periodoLabel(periodo)}.`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar pago"
      sub={periodoLabel(periodo)}
      sm
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button onClick={registrar} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Registrar pago
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Alumno <span className="text-pulso-red">*</span>
          </label>
          <select
            className={inputCls + ' appearance-none'}
            value={alumno}
            onChange={(e) => {
              const id = e.target.value;
              setAlumno(id);
              const p = planDe(store, id);
              if (p) setMonto(String(p.precio));
            }}
          >
            <option value="">ElegÃ­ un alumnoâ€¦</option>
            {store.alumnos
              .filter((a) => a.activo && a.planId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {fullName(a)}
                </option>
              ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              PerÃ­odo (mes y aÃ±o) <span className="text-pulso-red">*</span>
            </label>
            <input type="month" className={inputCls} value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha <span className="text-pulso-red">*</span>
            </label>
            <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Monto <span className="text-pulso-red">*</span>
          </label>
          <input className={inputCls} type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej.: 18000" />
        </div>
        {alumno && (
          <div className="text-xs text-muted-foreground">
            Plan actual: {plan?.nombre || 'sin plan'} Â· cuota sugerida:{' '}
            {plan ? fmtMoney(plan.precio) : 'â€”'}
          </div>
        )}
      </div>
    </Modal>
  );
}
