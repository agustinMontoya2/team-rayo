import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore, studentPlan, currentPeriod, periodLabel, deletePayment, pendingPaymentsForPeriod, pendingFeesPerStudent, createUpdatePlan, newPlanFactory, sortByDateDesc, type Plan } from '../store';
import { useToast } from '../ui-kit';
import { ConfirmDialog } from '../ConfirmDialog';
import { RegisterPaymentModal } from './modals/RegisterPaymentModal';
import { PlansGrid } from './cuotas/PlansGrid';
import { PlanModal } from './cuotas/PlanModal';
import { FeesKpis } from './cuotas/FeesKpis';
import { PaidFeesList } from './cuotas/PaidFeesList';
import { PendingFeesList } from './cuotas/PendingFeesList';
import { btnPrimary } from '../classes';

export function Fees() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [tab, setTab] = useState<'pagados' | 'pendientes' | 'planes'>('pagados');
  const [period, setPeriod] = useState<string>(currentPeriod());
  const [verTodos, setVerTodos] = useState(true);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState('');
  const [payPeriod, setPayPeriod] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const pagados = useMemo(() => {
    const list = verTodos ? store.fees : store.fees.filter((c) => c.period === period);
    return sortByDateDesc(list, (c) => c.paymentDate);
  }, [store, period, verTodos]);
  const pendientes = useMemo(() => {
    if (verTodos) return pendingFeesPerStudent(store, currentPeriod());
    return pendingPaymentsForPeriod(store, period).map((a) => {
      const plan = studentPlan(store, a.id);
      return { student: a, periods: [period], amount: plan?.price ?? 0 };
    });
  }, [store, period, verTodos]);

  const totalRecaudado = pagados.reduce((s, c) => s + c.amount, 0);

  const abrirPago = (studentId = '', p = '') => {
    setPayStudentId(studentId);
    setPayPeriod(p);
    setPayAmount(studentId ? String(studentPlan(store, studentId)?.price ?? '') : '');
    setPagoOpen(true);
  };

  const eliminar = (cid: string) => {
    const res = deletePayment(store, cid);
    setStore(res.store);
    setConfirmId(null);
    toast('info', 'Pago eliminado.');
  };

  const abrirNuevoPlan = () => setEditPlan(newPlanFactory());

  const abrirEditarPlan = (p: Plan) => setEditPlan({ ...p, benefits: [...p.benefits] });

  const guardarPlan = (p: Plan) => {
    const res = createUpdatePlan(store, p);
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', res.info || 'Plan guardado.');
    setEditPlan(null);
  };

  const getPlanName = (studentId: string) => studentPlan(store, studentId)?.name ?? 'Sin plan';

  return (
    <div className="space-y-6">
      {/* Header global */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-extrabold tracking-tight">Cuotas</h3>
            <div className="flex items-center gap-1 bg-pulso-input border border-pulso-line rounded-xl p-1">
              <button
                onClick={() => setVerTodos(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  verTodos ? 'bg-pulso-indigo/20 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos los meses
              </button>
              <button
                onClick={() => setVerTodos(false)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  !verTodos ? 'bg-pulso-indigo/20 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Por mes
              </button>
            </div>
            {!verTodos && (
              <input
                type="month"
                aria-label="Período"
                value={period}
                onChange={(e) => setPeriod(e.target.value || currentPeriod())}
                className="px-4 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 text-sm"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {verTodos ? 'Mostrando todas las cuotas' : periodLabel(period)}
          </p>
        </div>
        <button
          onClick={() => abrirPago()}
          className={btnPrimary}
        >
          <Plus className="w-4 h-4" />
          Registrar pago
        </button>
      </div>

      {/* KPIs */}
      <FeesKpis totalRecaudado={totalRecaudado} paidCount={pagados.length} pendingCount={pendientes.length} verTodos={verTodos} />

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

      {tab === 'pagados' && (
        <PaidFeesList
          fees={pagados}
          students={store.students}
          emptyMsg={verTodos ? 'Todavía no se registraron pagos.' : 'Todavía no se registraron pagos en este período.'}
          onDelete={setConfirmId}
        />
      )}

      {tab === 'pendientes' && (
        <PendingFeesList
          rows={pendientes}
          emptyMsg={verTodos ? '¡Todo al día! No hay cuotas pendientes.' : '¡Todo al día! Nadie debe este mes.'}
          getPlanName={getPlanName}
          onCollect={(studentId, p) => abrirPago(studentId, p)}
        />
      )}

      {tab === 'planes' && <PlansGrid onNew={abrirNuevoPlan} onEdit={abrirEditarPlan} />}

      {/* Registrar pago (shared modal) */}
      <RegisterPaymentModal
        key={pagoOpen ? `pago-${payStudentId}-${payPeriod}` : 'register-payment-cerrado'}
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        defaultPeriod={payPeriod || period}
        defaultStudentId={payStudentId}
        defaultAmount={payAmount}
      />

      {/* Editar / Nuevo plan */}
      <PlanModal
        key={editPlan ? editPlan.id : 'plan-cerrado'}
        plan={editPlan}
        onClose={() => setEditPlan(null)}
        onSave={guardarPlan}
      />

      {/* Confirmar eliminar pago */}
      <ConfirmDialog
        open={!!confirmId}
        title="Eliminar pago"
        message="¿Seguro que querés eliminar este pago? Esta acción no se puede deshacer."
        onConfirm={() => confirmId && eliminar(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
