import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '../../../../components/ui/accordion';
import { useStore, fullName, formatDate, formatNumber, formatWeight, today, sortByDateAsc, registerCurrentWeight, registerHistoricalWeight, deleteWeightEntry, type Student } from '../../store';
import { validateWeight, validateWeightDate } from '../../domain/validators';
import { useToast } from '../../ui-kit';
import { Field } from '../../Field';
import { ConfirmDialog } from '../../ConfirmDialog';
import { triggerCls } from './accordionCls';

interface Props {
  student: Student;
}

export function WeightSection({ student }: Props) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [weightInput, setWeightInput] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [histDate, setHistDate] = useState(today());
  const [histValue, setHistValue] = useState('');
  const [confirmDate, setConfirmDate] = useState<string | null>(null);
  const [currentErr, setCurrentErr] = useState('');
  const [histErr, setHistErr] = useState<Record<string, string>>({});
  const [histTouched, setHistTouched] = useState<Record<string, boolean>>({});

  const guardarPeso = () => {
    const err = validateWeight(weightInput);
    if (err) {
      setCurrentErr(err);
      return;
    }
    const res = registerCurrentWeight(store, student.id, weightInput);
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setWeightInput('');
    setCurrentErr('');
    toast('ok', `Peso de ${fullName(student)} actualizado.`);
  };

  const histFieldError = (field: string, err: string) => {
    if (histTouched[field]) {
      setHistErr((prev) => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  const histBlur = (field: string) => {
    setHistTouched((prev) => ({ ...prev, [field]: true }));
    const err = field === 'histDate' ? validateWeightDate(histDate) : validateWeight(histValue);
    setHistErr((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const agregarRegistro = () => {
    const errs: Record<string, string> = {};
    const dErr = validateWeightDate(histDate);
    if (dErr) errs.histDate = dErr;
    const wErr = validateWeight(histValue);
    if (wErr) errs.histValue = wErr;
    setHistErr(errs);
    setHistTouched({ histDate: true, histValue: true });
    if (Object.keys(errs).length > 0) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = registerHistoricalWeight(store, student.id, { date: histDate, weight: histValue });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setHistDate(today());
    setHistValue('');
    setHistErr({});
    setHistTouched({});
    setShowWeightForm(false);
    toast('ok', 'Registro histórico guardado.');
  };

  const delRegistro = (date: string) => {
    const res = deleteWeightEntry(store, student.id, date);
    setStore(res.store);
    setConfirmDate(null);
    toast('ok', 'Registro eliminado.');
  };

  const weightEvol = sortByDateAsc(student.weightHistory || [], (r) => r.date).map((r, i, arr) => {
      const prev = i > 0 ? arr[i - 1].weight : null;
      const delta = prev != null ? Math.round((r.weight - prev) * 10) / 10 : null;
      return { ...r, delta };
    });

  return (
    <AccordionItem value="peso" className="border-pulso-line">
      <AccordionTrigger className={triggerCls}>Peso</AccordionTrigger>
      <AccordionContent className="px-6">
        <div className="flex items-center gap-2 mb-1">
          <input
            type="number"
            step="0.1"
            min="20"
            max="250"
            value={weightInput}
            aria-label="Peso actual (kg)"
            onChange={(e) => {
              setWeightInput(e.target.value);
              if (currentErr) setCurrentErr(validateWeight(e.target.value));
            }}
            onBlur={() => setCurrentErr(validateWeight(weightInput))}
            placeholder="Peso actual (kg)"
            className="w-32 px-3 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground text-sm focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20"
          />
          <button onClick={guardarPeso} className="px-3 py-2 rounded-xl bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-sm font-bold hover:bg-pulso-indigo/26 transition-colors inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Guardar peso
          </button>
        </div>
        {currentErr && <p className="text-xs text-pulso-red mb-3 -mt-1">{currentErr}</p>}
        <p className="text-xs text-muted-foreground mb-3">Registrá el peso después de cada control.</p>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-pulso-muted-text font-bold">Historial</span>
          <button onClick={() => setShowWeightForm((s) => !s)} className="px-3 py-1.5 rounded-lg border border-pulso-line text-xs font-semibold text-foreground hover:bg-card inline-flex items-center gap-1">
            <span className="text-sm leading-none">+</span> Agregar
          </button>
        </div>
        {showWeightForm && (
          <div className="flex gap-2 flex-wrap items-end mt-2">
            <Field label="Fecha" labelClassName="block text-xs text-muted-foreground mb-1">
              <input type="date" value={histDate} onChange={(e) => { setHistDate(e.target.value); histFieldError('histDate', validateWeightDate(e.target.value)); }} onBlur={() => histBlur('histDate')} className="px-3 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground text-sm" />
              {histErr.histDate && <p className="text-[11px] text-pulso-red mt-0.5">{histErr.histDate}</p>}
            </Field>
            <Field label="Peso (kg)" labelClassName="block text-xs text-muted-foreground mb-1">
              <input type="number" step="0.1" min="20" max="250" value={histValue} onChange={(e) => { setHistValue(e.target.value); histFieldError('histValue', validateWeight(e.target.value)); }} onBlur={() => histBlur('histValue')} placeholder="Ej.: 63" className="px-3 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground text-sm w-24" />
              {histErr.histValue && <p className="text-[11px] text-pulso-red mt-0.5">{histErr.histValue}</p>}
            </Field>
            <button onClick={agregarRegistro} className="px-3 py-2 rounded-xl bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-sm font-bold hover:bg-pulso-indigo/26 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button onClick={() => setShowWeightForm(false)} className="px-3 py-2 rounded-xl border border-pulso-line text-sm text-foreground hover:bg-card">
              Cancelar
            </button>
          </div>
        )}
        {weightEvol.length ? (
          <ul className="space-y-2 mt-3">
            {weightEvol.map((r) => (
              <li key={r.date} className="flex items-center gap-3 py-2 border border-pulso-line-strong rounded-xl px-3">
                <span className="text-sm text-foreground font-semibold flex-1">
                  {formatWeight(r.weight)}
                  <div className="text-xs text-muted-foreground font-normal">{formatDate(r.date)}</div>
                </span>
                {r.delta == null ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">Inicio</span>
                ) : r.delta > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-red/16 text-pulso-red">▲ +{formatNumber(r.delta)} kg</span>
                ) : r.delta < 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/17 text-green-400">▼ {formatNumber(Math.abs(r.delta))} kg</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">=</span>
                )}
                <button onClick={() => setConfirmDate(r.date)} className="text-muted-foreground hover:text-pulso-red transition-colors" title="Eliminar registro">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">Sin registros. Agregá entradas históricas con el botón de arriba.</p>
        )}
      </AccordionContent>

      {/* Confirmar eliminar registro de peso */}
      <ConfirmDialog
        open={!!confirmDate}
        title="Eliminar registro"
        message="¿Seguro que querés eliminar este registro de peso? Esta acción no se puede deshacer."
        onConfirm={() => confirmDate && delRegistro(confirmDate)}
        onCancel={() => setConfirmDate(null)}
      />
    </AccordionItem>
  );
}
