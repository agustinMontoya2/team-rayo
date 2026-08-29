import { useMemo, useState } from 'react';
import { Swords, Trophy, ThumbsDown, MinusCircle } from 'lucide-react';
import { useStore, fullName, currentBelt, fmtDate, fmtNum } from '../store';
import { Avatar, BeltBadge, Empty } from '../ui-kit';

const inputSelCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm appearance-none';

export function Competencias() {
  const { store } = useStore();

  const baseId = useMemo(() => store.alumnos.find((a) => a.planId)?.id || store.alumnos[0]?.id || '', [store]);
  const [sel, setSel] = useState<string>(baseId);

  const alum = sel ? store.alumnos.find((x) => x.id === sel) : null;

  const record = useMemo(() => {
    let g = 0;
    let d = 0;
    let p = 0;
    store.eventos.forEach((e) =>
      e.peleas.forEach((f) => {
        if (f.alumnoId !== sel) return;
        if (f.resultado === 'victoria') g++;
        else if (f.resultado === 'derrota') d++;
        else p++;
      })
    );
    return { g, d, p };
  }, [store, sel]);

  const historial = useMemo(
    () =>
      store.eventos
        .filter((e) => e.tipo === 'competencia')
        .map((e) => ({ e, part: e.participantes.find((pp) => pp.alumnoId === sel), peleas: e.peleas.filter((f) => f.alumnoId === sel) }))
        .filter((c) => c.part)
        .sort((a, b) => (a.e.fecha < b.e.fecha ? 1 : -1)),
    [store, sel]
  );

  if (!alum) {
    return <Empty msg="TodavÃ­a no hay alumnos para el historial competitivo." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-foreground mb-1.5">Competidor</label>
            <select className={inputSelCls} value={sel} onChange={(e) => setSel(e.target.value)}>
              {store.alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {fullName(a)}
                  {a.activo ? '' : ' (inactivo)'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-9 h-9" />
              <div>
                <div className="text-2xl font-extrabold leading-none text-green-400">{String(record.g).padStart(2, '0')}</div>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[.12em]">Ganadas</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsDown className="w-9 h-9 text-pulso-red" />
              <div>
                <div className="text-2xl font-extrabold leading-none text-pulso-red">{String(record.d).padStart(2, '0')}</div>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[.12em]">Perdidas</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MinusCircle className="w-9 h-9 text-muted-foreground" />
              <div>
                <div className="text-2xl font-extrabold leading-none text-foreground">{String(record.p).padStart(2, '0')}</div>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[.12em]">Pendientes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar alumno={alum} size="lg" />
          <div>
            <div className="text-lg font-extrabold text-foreground">{fullName(alum)}</div>
            <div className="flex items-center gap-2 mt-1">
              <BeltBadge belt={currentBelt(store, alum.id)} />
              <span className="text-xs text-muted-foreground">
                {alum.pesoActual != null ? `${fmtNum(alum.pesoActual)} kg` : 'peso sin registrar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {historial.length ? (
        <div className="space-y-4">
          {historial.map(({ e, part, peleas }) => (
            <div key={e.id} className="bg-card rounded-2xl border border-pulso-line p-6 shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">{e.nombre}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{fmtDate(e.fecha)}</p>
                </div>
                {part && (
                  <div className="text-xs text-muted-foreground text-left sm:text-right">
                    Peso de competencia:{' '}
                    <span className="text-foreground font-semibold">{part.pesoCompetencia != null ? `${fmtNum(part.pesoCompetencia)} kg` : 'sin definir'}</span>
                  </div>
                )}
              </div>
              {peleas.length ? (
                <ul className="space-y-2">
                  {peleas.map((f) => {
                    const resColor =
                      f.resultado === 'victoria' ? 'border-green-500/40 text-green-400' : f.resultado === 'derrota' ? 'border-pulso-red/40 text-pulso-red' : 'border-pulso-line text-muted-foreground';
                    const label = f.resultado === 'victoria' ? 'Victoria' : f.resultado === 'derrota' ? 'Derrota' : 'Pendiente';
                    return (
                      <li key={f.id} className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-pulso-line-strong">
                        <span className="w-8 h-8 rounded-lg bg-pulso-indigo/16 text-pulso-indigo-soft flex items-center justify-center">
                          <Swords className="w-4 h-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-foreground font-medium">vs {f.rival}</div>
                          {f.pesoRival != null && <div className="text-xs text-muted-foreground">peso rival: {fmtNum(f.pesoRival)} kg</div>}
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-[.06em] ${resColor}`}>{label}</span>
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
        <Empty msg="Este competidor todavÃ­a no tiene eventos competitivos." />
      )}
    </div>
  );
}