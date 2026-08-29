import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '../../../../components/ui/accordion';
import { useStore, fullName, fmtDate, fmtNum, fmtPeso, hoy, registrarPesoActual, registrarPesoHistorico, eliminarRegistroPeso, type Alumno } from '../../store';
import { useToast } from '../../ui-kit';
import { triggerCls } from './accordionCls';

interface Props {
  alumno: Alumno;
}

export function PesoSection({ alumno }: Props) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [pesoInput, setPesoInput] = useState('');
  const [showPesoForm, setShowPesoForm] = useState(false);
  const [pesoHistFecha, setPesoHistFecha] = useState(hoy());
  const [pesoHistVal, setPesoHistVal] = useState('');

  const guardarPeso = () => {
    const res = registrarPesoActual(store, alumno.id, pesoInput);
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setPesoInput('');
    toast('ok', `Peso de ${fullName(alumno)} actualizado.`);
  };

  const agregarRegistro = () => {
    const res = registrarPesoHistorico(store, alumno.id, { fecha: pesoHistFecha, peso: pesoHistVal });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setPesoHistFecha(hoy());
    setPesoHistVal('');
    setShowPesoForm(false);
    toast('ok', 'Registro histórico guardado.');
  };

  const delRegistro = (fecha: string) => {
    const res = eliminarRegistroPeso(store, alumno.id, fecha);
    setStore(res.store);
    toast('ok', 'Registro eliminado.');
  };

  const pesoEvol = (alumno.pesos || [])
    .slice()
    .sort((x, y) => (x.fecha < y.fecha ? -1 : 1))
    .map((r, i, arr) => {
      const prev = i > 0 ? arr[i - 1].peso : null;
      const delta = prev != null ? Math.round((r.peso - prev) * 10) / 10 : null;
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
            value={pesoInput}
            onChange={(e) => setPesoInput(e.target.value)}
            placeholder="Peso actual (kg)"
            className="w-32 px-3 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground text-sm focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20"
          />
          <button onClick={guardarPeso} className="px-3 py-2 rounded-xl bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-sm font-bold hover:bg-pulso-indigo/26 transition-colors inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Guardar peso
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Registrá el peso después de cada control.</p>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-pulso-muted-text font-bold">Historial</span>
          <button onClick={() => setShowPesoForm((s) => !s)} className="px-3 py-1.5 rounded-lg border border-pulso-line text-xs font-semibold text-foreground hover:bg-card inline-flex items-center gap-1">
            <span className="text-sm leading-none">+</span> Agregar
          </button>
        </div>
        {showPesoForm && (
          <div className="flex gap-2 flex-wrap items-end mt-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Fecha</label>
              <input type="date" value={pesoHistFecha} onChange={(e) => setPesoHistFecha(e.target.value)} className="px-3 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Peso (kg)</label>
              <input type="number" step="0.1" min="20" max="250" value={pesoHistVal} onChange={(e) => setPesoHistVal(e.target.value)} placeholder="Ej.: 63" className="px-3 py-2 bg-pulso-input border border-pulso-line rounded-xl text-foreground text-sm w-24" />
            </div>
            <button onClick={agregarRegistro} className="px-3 py-2 rounded-xl bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-sm font-bold hover:bg-pulso-indigo/26 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button onClick={() => setShowPesoForm(false)} className="px-3 py-2 rounded-xl border border-pulso-line text-sm text-foreground hover:bg-card">
              Cancelar
            </button>
          </div>
        )}
        {pesoEvol.length ? (
          <ul className="space-y-2 mt-3">
            {pesoEvol.map((r) => (
              <li key={r.fecha} className="flex items-center gap-3 py-2 border border-pulso-line-strong rounded-xl px-3">
                <span className="text-sm text-foreground font-semibold flex-1">
                  {fmtPeso(r.peso)}
                  <div className="text-xs text-muted-foreground font-normal">{fmtDate(r.fecha)}</div>
                </span>
                {r.delta == null ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">Inicio</span>
                ) : r.delta > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-red/16 text-pulso-red">▲ +{fmtNum(r.delta)} kg</span>
                ) : r.delta < 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/17 text-green-400">▼ {fmtNum(Math.abs(r.delta))} kg</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">=</span>
                )}
                <button onClick={() => delRegistro(r.fecha)} className="text-muted-foreground hover:text-pulso-red transition-colors" title="Eliminar registro">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">Sin registros. Agregá entradas históricas con el botón de arriba.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}