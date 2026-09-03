import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore, fullName, formatDate, formatWeight, fightResultBadge, fightResultShort, addFight, setFightResult, removeFight, FIGHT_RESULTS, type Event, type FightResult } from '../../store';
import { validateFightFields } from '../../domain/validators';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { useToast, Avatar } from '../../ui-kit';
import { ConfirmDialog } from '../../ConfirmDialog';
import { Modal } from '../../Modal';
import { inputCls, selectCls } from './fields';
import { iconBtnDanger } from '../../classes';

export function FightsModal({ event, onClose }: { event: Event | undefined; onClose: () => void }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [confirmFight, setConfirmFight] = useState<string | null>(null);

  const initial = {
    studentId: event && event.participants[0] ? event.participants[0].studentId : '',
    opponent: '',
    opponentWeight: '',
  };
  const validateField = (v: typeof initial, field: string): string => validateFightFields(v)[field] || '';
  const { values, setValues, onChange, onBlur, error, validateAll } = useRealtimeValidation({
    initialValues: initial,
    validate: validateField,
  });

  if (!event) return null;

  const agregar = () => {
    const { valid } = validateAll();
    if (!valid) {
      toast('err', 'Revisá los campos marcados.');
      return;
    }
    const res = addFight(store, event.id, { studentId: values.studentId, opponent: values.opponent, opponentWeight: values.opponentWeight });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setValues({ ...values, opponent: '', opponentWeight: '' });
    toast('ok', 'Pelea cargada.');
  };

  const setResultado = (fightId: string, result: FightResult) => {
    const res = setFightResult(store, event.id, fightId, result);
    setStore(res.store);
    toast('ok', res.info || 'Resultado actualizado.');
  };

  const borrarPelea = (fightId: string) => {
    const res = removeFight(store, event.id, fightId);
    setStore(res.store);
    setConfirmFight(null);
    toast('info', 'Pelea eliminada.');
  };

  return (
    <>
      <Modal
        open={!!event}
        onClose={onClose}
        title={`Peleas · ${event.name}`}
        sub={formatDate(event.date)}
        wide
        footer={
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
            Listo
          </button>
        }
      >
      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
        <select className={selectCls + ' flex-1 min-w-0'} aria-label="Participante" value={values.studentId} onChange={(e) => onChange('studentId', e.target.value)} onBlur={() => onBlur('studentId')}>
          {event.participants.length ? (
            event.participants.map((p) => {
              const a = store.students.find((x) => x.id === p.studentId);
              return (
                <option key={p.studentId} value={p.studentId}>
                  {a ? fullName(a) : 'Alumno eliminado'}
                </option>
              );
            })
          ) : (
            <option value="">Sin participantes</option>
          )}
        </select>
        <div className="flex gap-2 flex-1 min-w-0">
          <input className={inputCls + ' flex-1 min-w-0'} aria-label="Rival" placeholder="Rival" value={values.opponent} onChange={(e) => onChange('opponent', e.target.value)} onBlur={() => onBlur('opponent')} />
          <input
            className="w-[92px] shrink-0 px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm"
            placeholder="Kg (opc.)"
            aria-label="Peso del rival (kg)"
            type="number"
            value={values.opponentWeight}
            onChange={(e) => onChange('opponentWeight', e.target.value)}
            onBlur={() => onBlur('opponentWeight')}
          />
        </div>
        <button onClick={agregar} disabled={!event.participants.length} className="px-4 py-3 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:hover:bg-pulso-red disabled:hover:text-primary-foreground">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {(error('opponent') || error('opponentWeight')) && (
        <p className="text-xs text-pulso-red mb-3">{error('opponent') || error('opponentWeight')}</p>
      )}
      {event.fights.length ? (
        <ul className="space-y-2 max-h-[45vh] overflow-y-auto overflow-x-hidden">
          {event.fights.map((f) => {
            const a = store.students.find((x) => x.id === f.studentId);
            return (
              <li key={f.id} className="flex items-center gap-3 py-2 px-3 rounded-xl border border-pulso-line-strong flex-wrap">
                <Avatar student={a} />
                <div className="flex-1 min-w-[140px]">
                  <div className="text-sm text-foreground font-medium">{a ? fullName(a) : 'Alumno eliminado'}</div>
                  <div className="text-xs text-muted-foreground">vs {f.opponent}{f.opponentWeight != null ? ` · ${formatWeight(f.opponentWeight)}` : ''}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {(Object.keys(FIGHT_RESULTS) as FightResult[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResultado(f.id, r)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-[.06em] transition-colors ${f.result === r ? fightResultBadge(r) : 'border-pulso-line text-muted-foreground/60 hover:text-foreground'}`}
                    >
                      {fightResultShort(r)}
                    </button>
                  ))}
                  <button onClick={() => setConfirmFight(f.id)} className={iconBtnDanger} title="Eliminar pelea">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">Todavía no cargaste peleas.</p>
      )}
      </Modal>

      {/* Confirmar eliminar pelea */}
      <ConfirmDialog
        open={!!confirmFight}
        title="Eliminar pelea"
        message="¿Seguro que querés eliminar esta pelea? Esta acción no se puede deshacer."
        onConfirm={() => confirmFight && borrarPelea(confirmFight)}
        onCancel={() => setConfirmFight(null)}
      />
    </>
  );
}
