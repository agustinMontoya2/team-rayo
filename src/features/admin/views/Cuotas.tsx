import { useMemo, useState } from 'react';
import { Plus, Check, Euro, Wallet } from 'lucide-react';
import { useStore, fullName, planDe, fmtFechaLarga, fmtMoney, periodoActual, periodoLabel, uid, eliminarPago, crearActualizarPlan, type Plan } from '../store';
import { useToast, Avatar, Empty } from '../ui-kit';
import { RegistrarPagoModal } from './modals/RegistrarPagoModal';
import { PlanesGrid } from './cuotas/PlanesGrid';
import { PlanModal } from './cuotas/PlanModal';

export function Cuotas() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [tab, setTab] = useState<'pagados' | 'pendientes' | 'planes'>('pagados');
  const [periodo, setPeriodo] = useState<string>(periodoActual());
  const [pagoOpen, setPagoOpen] = useState(false);
  const [pagoAlumno, setPagoAlumno] = useState('');
  const [pagoMonto, setPagoMonto] = useState('');
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const pagados = useMemo(
    () => store.cuotas.filter((c) => c.periodo === periodo).sort((a, b) => (a.fechaPago < b.fechaPago ? 1 : -1)),
    [store, periodo]
  );
  const pendientes = useMemo(() => store.alumnos.filter((a) => a.activo && a.planId && !store.cuotas.some((c) => c.alumnoId === a.id && c.periodo === periodo)), [store, periodo]);

  const totalRecaudado = pagados.reduce((s, c) => s + c.monto, 0);

  const abrirPago = (alumnoId = '') => {
    setPagoAlumno(alumnoId);
    setPagoMonto(alumnoId ? String(planDe(store, alumnoId)?.precio ?? '') : '');
    setPagoOpen(true);
  };

  const eliminar = (cid: string) => {
    const res = eliminarPago(store, cid);
    setStore(res.store);
    toast('info', 'Pago eliminado.');
  };

  const abrirNuevoPlan = () =>
    setEditPlan({ id: uid('p'), nombre: '', tipo: 'recreativo', precio: 0, descripcion: '', destacado: false, beneficios: [] });

  const abrirEditarPlan = (p: Plan) => setEditPlan({ ...p, beneficios: [...p.beneficios] });

  const guardarPlan = (p: Plan) => {
    const res = crearActualizarPlan(store, p);
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', res.info || 'Plan guardado.');
    setEditPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header global */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">Período</h3>
            <input
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value || periodoActual())}
              className="px-4 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 text-sm"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{periodoLabel(periodo)}</p>
        </div>
        <button
          onClick={() => abrirPago()}
          className="inline-flex items-center justify-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar pago
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-pulso-line">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-[.12em] mb-2">
            <Euro className="w-4 h-4" /> Recaudado
          </div>
          <div className="text-2xl font-extrabold text-foreground">{fmtMoney(totalRecaudado)}</div>
          <div className="text-xs text-muted-foreground mt-1">{pagados.length} pago{pagados.length === 1 ? '' : 's'} en el período</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-pulso-line">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-[.12em] mb-2">
            <Wallet className="w-4 h-4" /> Sin pagar
          </div>
          <div className="text-2xl font-extrabold text-foreground">{pendientes.length}</div>
          <div className="text-xs text-muted-foreground mt-1">alumno{pendientes.length === 1 ? '' : 's'} activo{pendientes.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['pagados', 'pendientes', 'planes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              tab === t ? 'bg-pulso-indigo/20 border-pulso-indigo/50 text-white' : 'border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            {`${t.charAt(0).toUpperCase()}${t.slice(1)}`}
          </button>
        ))}
      </div>

      {tab === 'pagados' &&
        (pagados.length ? (
          <div className="bg-card rounded-2xl border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] overflow-hidden">
            <ul>
              {pagados.map((c) => {
                const a = store.alumnos.find((x) => x.id === c.alumnoId);
                return (
                  <li key={c.id} className="flex items-center gap-3 px-6 py-4 border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
                    <Avatar alumno={a} />
                    <div className="flex-1">
                      <div className="text-foreground font-semibold">{a ? fullName(a) : 'Alumno eliminado'}</div>
                      <div className="text-xs text-muted-foreground">{fmtFechaLarga(c.fechaPago)}</div>
                    </div>
                    <div className="text-sm font-bold text-foreground">{fmtMoney(c.monto)}</div>
                    <button
                      onClick={() => eliminar(c.id)}
                      className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card flex items-center justify-center transition-colors"
                      title="Eliminar pago"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <Empty msg="Todavía no se registraron pagos en este período." />
        ))}

      {tab === 'pendientes' &&
        (pendientes.length ? (
          <div className="bg-card rounded-2xl border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] overflow-hidden">
            <ul>
              {pendientes.map((a) => {
                const p = planDe(store, a.id);
                return (
                  <li key={a.id} className="flex items-center gap-3 px-6 py-4 border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
                    <Avatar alumno={a} />
                    <div className="flex-1">
                      <div className="text-foreground font-semibold">{fullName(a)}</div>
                      <div className="text-xs text-muted-foreground">{p ? p.nombre : 'Sin plan'}</div>
                    </div>
                    <div className="text-sm font-bold text-foreground">{p ? fmtMoney(p.precio) : '—'}</div>
                    <button
                      onClick={() => abrirPago(a.id)}
                      className="px-3 py-2 rounded-lg bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-xs font-bold hover:bg-pulso-indigo/26 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Cobrar
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <Empty msg="¡Todo al día! Nadie debe este período." />
        ))}

      {tab === 'planes' && <PlanesGrid onNuevo={abrirNuevoPlan} onEdit={abrirEditarPlan} />}

      {/* Registrar pago (shared modal) */}
      <RegistrarPagoModal
        key={pagoOpen ? `pago-${pagoAlumno}-${periodo}` : 'cerrado'}
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        defaultPeriodo={periodo}
        defaultAlumnoId={pagoAlumno}
        defaultMonto={pagoMonto}
      />

      {/* Editar / Nuevo plan */}
      <PlanModal
        key={editPlan ? editPlan.id : 'cerrado'}
        plan={editPlan}
        onClose={() => setEditPlan(null)}
        onSave={guardarPlan}
      />
    </div>
  );
}