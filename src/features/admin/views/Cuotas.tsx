import { useMemo, useState } from 'react';
import { Plus, Pencil, Check, Euro, Users, Wallet, Sparkles } from 'lucide-react';
import { useStore, fullName, planDe, fmtFechaLarga, fmtMoney, periodoActual, periodoLabel, uid, eliminarPago, crearActualizarPlan, type Plan } from '../store';
import { useToast, Avatar, Empty } from '../ui-kit';
import { Modal } from '../Modal';
import { RegistrarPagoModal } from './modals/RegistrarPagoModal';

const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';

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

  const guardarPlan = () => {
    if (!editPlan) return;
    const res = crearActualizarPlan(store, editPlan);
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
            <h3 className="text-lg font-extrabold tracking-tight">PerÃ­odo</h3>
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
          <div className="text-xs text-muted-foreground mt-1">{pagados.length} pago{pagados.length === 1 ? '' : 's'} en el perÃ­odo</div>
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
          <Empty msg="TodavÃ­a no se registraron pagos en este perÃ­odo." />
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
                    <div className="text-sm font-bold text-foreground">{p ? fmtMoney(p.precio) : 'â€”'}</div>
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
          <Empty msg="Â¡Todo al dÃ­a! Nadie debe este perÃ­odo." />
        ))}

      {tab === 'planes' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">Tipos y beneficios se muestran como badges y listas.</p>
            <button
              onClick={() => setEditPlan({ id: uid('p'), nombre: '', tipo: 'recreativo', precio: 0, descripcion: '', destacado: false, beneficios: [] })}
              className="inline-flex items-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {store.planes.map((p) => {
              const inscriptos = store.alumnos.filter((a) => a.planId === p.id).length;
              return (
                <div key={p.id} className={`bg-card rounded-2xl p-6 border flex flex-col gap-3 ${p.destacado ? 'border-pulso-indigo/50' : 'border-pulso-line'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {p.destacado && <Sparkles className="w-4 h-4 text-pulso-indigo" />}
                      <h4 className="text-base font-extrabold text-foreground">{p.nombre}</h4>
                    </div>
                    <button
                      onClick={() => setEditPlan({ ...p, beneficios: [...p.beneficios] })}
                      className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                      title="Editar plan"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.tipo === 'competitivo' ? 'bg-pulso-red/16 text-pulso-red' : 'bg-pulso-indigo/17 text-pulso-indigo-soft'}`}>
                      {p.tipo === 'competitivo' ? 'Competitivo' : 'Recreativo'}
                    </span>
                    {p.destacado && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/16 text-amber-400">Destacado</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{p.descripcion}</p>
                  <div className="text-2xl font-extrabold text-foreground">{fmtMoney(p.precio)}</div>
                  {p.beneficios.length > 0 && (
                    <ul className="space-y-1">
                      {p.beneficios.map((b, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Users className="w-3.5 h-3.5 mt-0.5 shrink-0 text-pulso-indigo-soft" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-pulso-line">{inscriptos} alumno{inscriptos === 1 ? '' : 's'} inscripto{inscriptos === 1 ? '' : 's'}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

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
      <Modal
        open={!!editPlan}
        onClose={() => setEditPlan(null)}
        title={editPlan && store.planes.some((p) => p.id === editPlan.id) ? 'Editar plan' : 'Nuevo plan'}
        sub={editPlan ? editPlan.nombre : 'CreÃ¡ un plan para tus alumnos'}
        sm
        footer={
          <>
            <button onClick={() => setEditPlan(null)} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
              Cancelar
            </button>
            <button onClick={guardarPlan} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Guardar
            </button>
          </>
        }
      >
        {editPlan && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nombre <span className="text-pulso-red">*</span>
              </label>
              <input className={inputCls} value={editPlan.nombre} onChange={(e) => setEditPlan({ ...editPlan, nombre: e.target.value })} placeholder="Ej.: Muay Thai competitivo" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tipo <span className="text-pulso-red">*</span>
                </label>
                <select className={inputCls + ' appearance-none'} value={editPlan.tipo} onChange={(e) => setEditPlan({ ...editPlan, tipo: e.target.value as Plan['tipo'] })}>
                  <option value="recreativo">Recreativo</option>
                  <option value="competitivo">Competitivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Precio mensual <span className="text-pulso-red">*</span>
                </label>
                <input className={inputCls} type="number" value={editPlan.precio} onChange={(e) => setEditPlan({ ...editPlan, precio: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">DescripciÃ³n</label>
              <textarea rows={2} className={inputCls} value={editPlan.descripcion} onChange={(e) => setEditPlan({ ...editPlan, descripcion: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Beneficios <span className="text-pulso-red">*</span>
              </label>
              <textarea
                rows={3}
                className={inputCls}
                value={editPlan.beneficios.join('\n')}
                onChange={(e) => setEditPlan({ ...editPlan, beneficios: e.target.value.split('\n') })}
                placeholder={'Un beneficio por lÃ­nea:\n2 clases semanales\nSparring los sÃ¡bados'}
              />
              <p className="text-xs text-muted-foreground mt-1">EscribÃ­ un beneficio por lÃ­nea.</p>
            </div>
            <div>
              <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 rounded-xl border border-pulso-line">
                <span className="text-sm text-foreground font-medium">Plan destacado</span>
                <input type="checkbox" checked={editPlan.destacado} onChange={(e) => setEditPlan({ ...editPlan, destacado: e.target.checked })} className="accent-pulso-indigo w-4 h-4" />
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
