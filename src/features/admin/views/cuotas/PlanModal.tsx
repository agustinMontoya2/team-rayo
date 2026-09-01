import { useState } from 'react';
import { Check } from 'lucide-react';
import { useStore, type Plan, PLAN_TYPES, newPlanFactory } from '../../store';
import { validatePlanName, validatePlanPrice } from '../../domain/validators';
import { Modal } from '../../Modal';
import { inputCls, selectCls, btnSecondary, btnPrimaryModal } from '../../classes';

interface Props {
  plan: Plan | null;
  onClose: () => void;
  onSave: (p: Plan) => void;
}

export function PlanModal({ plan, onClose, onSave }: Props) {
  const { store } = useStore();
  const [local, setLocal] = useState<Plan>(() => plan ?? newPlanFactory());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const esNuevo = !store.plans.some((p) => p.id === local.id);

  const setErr = (field: string, err: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });

  const onFieldError = (field: string, err: string) => {
    if (touched[field]) setErr(field, err);
  };

  const ensureTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = field === 'name' ? validatePlanName(local.name) : validatePlanPrice(local.price);
    setErr(field, err);
  };

  const guardar = () => {
    const errs: Record<string, string> = {};
    const nErr = validatePlanName(local.name);
    if (nErr) errs.name = nErr;
    const pErr = validatePlanPrice(local.price);
    if (pErr) errs.price = pErr;
    setErrors(errs);
    setTouched({ name: true, price: true });
    if (Object.keys(errs).length > 0) return;
    onSave(local);
  };

  return (
    <Modal
      open={!!plan}
      onClose={onClose}
      title={esNuevo ? 'Nuevo plan' : 'Editar plan'}
      sub={plan ? local.name : 'Creá un plan para tus alumnos'}
      sm
      footer={
        <>
          <button onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button onClick={guardar} className={btnPrimaryModal}>
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
            <input
              className={inputCls}
              value={local.name}
              onChange={(e) => {
                const name = e.target.value;
                setLocal({ ...local, name });
                onFieldError('name', validatePlanName(name));
              }}
              onBlur={() => ensureTouched('name')}
              placeholder="Ej.: Muay Thai competitivo"
            />
            {errors.name && <p className="text-xs text-pulso-red mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tipo <span className="text-pulso-red">*</span>
              </label>
              <select className={selectCls} value={local.type} onChange={(e) => setLocal({ ...local, type: e.target.value as Plan['type'] })}>
                {Object.values(PLAN_TYPES).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Precio mensual <span className="text-pulso-red">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                value={local.price}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  setLocal({ ...local, price });
                  onFieldError('price', validatePlanPrice(price));
                }}
                onBlur={() => ensureTouched('price')}
              />
              {errors.price && <p className="text-xs text-pulso-red mt-1">{errors.price}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <textarea rows={2} className={inputCls} value={local.description} onChange={(e) => setLocal({ ...local, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Beneficios <span className="text-pulso-red">*</span>
            </label>
            <textarea
              rows={3}
              className={inputCls}
              value={local.benefits.join('\n')}
              onChange={(e) => setLocal({ ...local, benefits: e.target.value.split('\n') })}
              placeholder={'Un beneficio por línea:\n2 clases semanales\nSparring los sábados'}
            />
            <p className="text-xs text-muted-foreground mt-1">Escribí un beneficio por línea.</p>
          </div>
          <div>
            <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 rounded-xl border border-pulso-line">
              <span className="text-sm text-foreground font-medium">Plan destacado</span>
              <input type="checkbox" checked={local.featured} onChange={(e) => setLocal({ ...local, featured: e.target.checked })} className="accent-pulso-indigo w-4 h-4" />
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
