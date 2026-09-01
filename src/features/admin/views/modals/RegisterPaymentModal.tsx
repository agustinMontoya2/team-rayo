import { Check } from 'lucide-react';
import { Modal } from '../../Modal';
import { useStore, fullName, studentPlan, formatMoney, today, currentPeriod, periodLabel, registerPayment } from '../../store';
import { validatePaymentFields } from '../../domain/validators';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { useToast } from '../../ui-kit';
import { inputCls, selectCls, btnSecondary, btnPrimaryModal } from '../../classes';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultPeriod?: string;
  defaultStudentId?: string;
  defaultAmount?: string;
}

export function RegisterPaymentModal({ open, onClose, defaultPeriod, defaultStudentId, defaultAmount }: Props) {
  const { store, setStore } = useStore();
  const toast = useToast();

  const initial = {
    student: defaultStudentId || '',
    amount: defaultAmount || '',
    date: today(),
    period: defaultPeriod || currentPeriod(),
  };
  const validateField = (v: typeof initial, field: string): string =>
    validatePaymentFields({ studentId: v.student, amount: v.amount, paymentDate: v.date, period: v.period })[field] || '';

  const { values, setValues, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  const student = values.student;
  const plan = student ? studentPlan(store, student) : null;

  const registrar = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = registerPayment(store, { studentId: values.student, period: values.period, amount: values.amount, paymentDate: values.date });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', `Pago de ${formatMoney(Number(values.amount))} registrado para ${periodLabel(values.period)}.`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar pago"
      sub={periodLabel(values.period)}
      sm
      footer={
        <>
          <button onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button onClick={registrar} className={btnPrimaryModal}>
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
            className={selectCls}
            value={values.student}
            onChange={(e) => {
              const id = e.target.value;
              setValues({ ...values, student: id, amount: String(studentPlan(store, id)?.price ?? '') });
            }}
            onBlur={() => onBlur('student')}
          >
            <option value="">Elegí un alumno…</option>
            {store.students
              .filter((a) => a.active && a.planId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {fullName(a)}
                </option>
              ))}
          </select>
          {error('student') && <p className="text-xs text-pulso-red mt-1">{error('student')}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Período (mes y año) <span className="text-pulso-red">*</span>
            </label>
            <input type="month" className={inputCls} value={values.period} onChange={(e) => onChange('period', e.target.value)} onBlur={() => onBlur('period')} />
            {error('period') && <p className="text-xs text-pulso-red mt-1">{error('period')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha <span className="text-pulso-red">*</span>
            </label>
            <input type="date" className={inputCls} value={values.date} onChange={(e) => onChange('date', e.target.value)} onBlur={() => onBlur('date')} />
            {error('date') && <p className="text-xs text-pulso-red mt-1">{error('date')}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Monto <span className="text-pulso-red">*</span>
          </label>
          <input className={inputCls} type="number" value={values.amount} onChange={(e) => onChange('amount', e.target.value)} onBlur={() => onBlur('amount')} placeholder="Ej.: 18000" />
          {error('amount') && <p className="text-xs text-pulso-red mt-1">{error('amount')}</p>}
        </div>
        {student && (
          <div className="text-xs text-muted-foreground">
            Plan actual: {plan?.name || 'sin plan'} · cuota sugerida:{' '}
            {plan ? formatMoney(plan.price) : '—'}
          </div>
        )}
      </div>
    </Modal>
  );
}
