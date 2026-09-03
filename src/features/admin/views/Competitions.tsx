import { useMemo, useState } from 'react';
import { Swords, Trophy, ThumbsDown, MinusCircle } from 'lucide-react';
import { useStore, fullName, currentBelt, formatDate, formatWeight, fightResultBadge, fightResultLabel, fightResultHeader, fightRecord, competitionHistory, FIGHT_RESULTS } from '../store';
import { Avatar, BeltBadge, Empty } from '../ui-kit';
import { Field } from '../Field';
import { selectCls, cardSurface } from '../classes';

export function Competitions() {
  const { store } = useStore();

  const baseId = useMemo(() => store.students.find((a) => a.planId)?.id || store.students[0]?.id || '', [store]);
  const [sel, setSel] = useState<string>(baseId);

  const student = sel ? store.students.find((x) => x.id === sel) : null;

  const record = useMemo(() => (sel ? fightRecord(store, sel) : { wins: 0, losses: 0, pending: 0 }), [store, sel]);

  const history = useMemo(() => (sel ? competitionHistory(store, sel) : []), [store, sel]);

  if (!student) {
    return <Empty msg="Todavía no hay alumnos para el historial competitivo." />;
  }

  return (
    <div className="space-y-6">
      <div className={`${cardSurface} p-6`}>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <Field label="Competidor">
              <select className={selectCls} value={sel} onChange={(e) => setSel(e.target.value)}>
                {store.students.map((a) => (
                  <option key={a.id} value={a.id}>
                    {fullName(a)}
                    {a.active ? '' : ' (inactivo)'}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-9 h-9" />
              <div>
                <div className="text-2xl font-extrabold leading-none text-green-400">{String(record.wins).padStart(2, '0')}</div>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[.12em]">{fightResultHeader(FIGHT_RESULTS.victoria.value)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsDown className="w-9 h-9 text-pulso-red" />
              <div>
                <div className="text-2xl font-extrabold leading-none text-pulso-red">{String(record.losses).padStart(2, '0')}</div>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[.12em]">{fightResultHeader(FIGHT_RESULTS.derrota.value)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MinusCircle className="w-9 h-9 text-muted-foreground" />
              <div>
                <div className="text-2xl font-extrabold leading-none text-foreground">{String(record.pending).padStart(2, '0')}</div>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[.12em]">{fightResultHeader(FIGHT_RESULTS.pendiente.value)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar student={student} size="lg" />
          <div>
            <div className="text-lg font-extrabold text-foreground">{fullName(student)}</div>
            <div className="flex items-center gap-2 mt-1">
              <BeltBadge belt={currentBelt(store, student.id)} />
              <span className="text-xs text-muted-foreground">
                {formatWeight(student.currentWeight) || 'peso sin registrar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {history.length ? (
        <div className="space-y-4">
          {history.map(({ e, part, fights }) => (
            <div key={e.id} className="bg-card rounded-2xl border border-pulso-line p-6 shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">{e.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{formatDate(e.date)}</p>
                </div>
                {part && (
                  <div className="text-xs text-muted-foreground text-left sm:text-right">
                    Peso de competencia:{' '}
                    <span className="text-foreground font-semibold">{part.compWeight != null ? formatWeight(part.compWeight) : 'sin definir'}</span>
                  </div>
                )}
              </div>
              {fights.length ? (
                <ul className="space-y-2">
                  {fights.map((f) => {
                    return (
                      <li key={f.id} className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-pulso-line-strong">
                        <span className="w-8 h-8 rounded-lg bg-pulso-indigo/16 text-pulso-indigo-soft flex items-center justify-center">
                          <Swords className="w-4 h-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-foreground font-medium">vs {f.opponent}</div>
                          {f.opponentWeight != null && <div className="text-xs text-muted-foreground">peso rival: {formatWeight(f.opponentWeight)}</div>}
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-[.06em] ${fightResultBadge(f.result)}`}>{fightResultLabel(f.result)}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Inscripto, sin peleas registradas.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty msg="Este competidor todavía no tiene eventos competitivos." />
      )}
    </div>
  );
}
