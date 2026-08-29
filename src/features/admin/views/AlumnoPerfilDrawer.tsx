import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '../../../components/ui/sheet';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/ui/accordion';
import { useStore, fullName, currentBelt, planDe, fmtDate, fmtMoney, fmtNum, periodoLabel, BELT_COLORS, type Alumno } from '../store';
import { Avatar, BeltBadge, PlanBadge, EstadoPill } from '../ui-kit';
import { AlumnoFormModal } from './AlumnoFormModal';
import { PesoSection } from './alumno/PesoSection';
import { triggerCls } from './alumno/accordionCls';

interface Props {
  alumnoId: string | null;
  onClose: () => void;
  onToggle: (a: Alumno) => void;
}

export function AlumnoPerfilDrawer({ alumnoId, onClose, onToggle }: Props) {
  const { store } = useStore();
  const [editOpen, setEditOpen] = useState(false);

  const a = alumnoId ? store.alumnos.find((x) => x.id === alumnoId) : null;

  const perfil = useMemo(() => {
    if (!a) return null;
    const p = planDe(store, a.id);
    const belt = currentBelt(store, a.id);
    const grados = store.graduaciones.filter((g) => g.alumnoId === a.id).sort((x, y) => (x.fechaExamen < y.fechaExamen ? 1 : -1));
    const jTodas = store.jornadas.slice().sort((x, y) => (x.fecha < y.fecha ? 1 : -1));
    const jPres = jTodas.filter((j) => j.presentes.indexOf(a.id) > -1).length;
    const pctAsis = jTodas.length ? Math.round((jPres / jTodas.length) * 100) : null;
    const asisRows = jTodas.map((j) => {
      const pres = j.presentes.indexOf(a.id) > -1;
      const hr = store.horarios.find((h) => h.id === j.horarioId);
      return { id: j.id, fecha: j.fecha, pres, hr: hr ? `${hr.dia} · ${hr.inicio} a ${hr.fin}` : '' };
    });
    const cuotasA = store.cuotas.filter((c) => c.alumnoId === a.id).sort((x, y) => (x.periodo < y.periodo ? 1 : -1));
    const comps = store.eventos
      .filter((e) => e.tipo === 'competencia')
      .map((e) => ({ e, part: e.participantes.find((pp) => pp.alumnoId === a.id), peleas: e.peleas.filter((f) => f.alumnoId === a.id) }))
      .filter((c) => c.part)
      .sort((x, y) => (x.e.fecha < y.e.fecha ? 1 : -1));
    let g = 0;
    let dcount = 0;
    store.eventos.forEach((e) =>
      e.peleas.forEach((f) => {
        if (f.alumnoId !== a.id) return;
        if (f.resultado === 'victoria') g++;
        else if (f.resultado === 'derrota') dcount++;
      })
    );
    return { p, belt, grados, jTodas, jPres, pctAsis, asisRows, cuotasA, comps, g, dcount };
  }, [store, a]);

  if (!a || !perfil) return null;

  return (
    <>
      <Sheet open={!!a} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="bg-pulso-panel border-l border-pulso-line-bright w-full sm:max-w-lg p-0 gap-0 overflow-hidden flex flex-col">
          <SheetTitle className="sr-only">Perfil de {fullName(a)}</SheetTitle>

          {/* Header */}
          <div className="px-6 py-5 border-b border-pulso-line-strong flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar alumno={a} size="lg" />
              <div className="min-w-0">
                <div className="text-lg font-extrabold tracking-tight truncate">{fullName(a)}</div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <EstadoPill activo={a.activo} />
                  {perfil.p ? <PlanBadge tipo={perfil.p.tipo} /> : <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">Sin plan</span>}
                  <BeltBadge belt={perfil.belt} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <Accordion type="multiple" defaultValue={['datos', 'peso']}>
              {/* Datos personales */}
              <AccordionItem value="datos" className="border-pulso-line">
                <AccordionTrigger className={triggerCls}>Datos personales</AccordionTrigger>
                <AccordionContent className="px-6">
                  <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm min-w-0">
                    <dt className="text-muted-foreground">DNI</dt>
                    <dd className="text-foreground break-words min-w-0">{a.dni}</dd>
                    <dt className="text-muted-foreground">Teléfono</dt>
                    <dd className="text-foreground break-words min-w-0">{a.telefono || '—'}</dd>
                    <dt className="text-muted-foreground">Nacimiento</dt>
                    <dd className="text-foreground break-words min-w-0">
                      {fmtDate(a.fechaNacimiento)} ·{' '}
                      {a.fechaNacimiento
                        ? (() => {
                            const n = new Date(a.fechaNacimiento + 'T12:00:00');
                            const h = new Date();
                            let e = h.getFullYear() - n.getFullYear();
                            if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) e--;
                            return e;
                          })() + ' años'
                        : ''}
                    </dd>
                    <dt className="text-muted-foreground">Ingreso</dt>
                    <dd className="text-foreground break-words min-w-0">{fmtDate(a.fechaIngreso)}</dd>
                    <dt className="text-muted-foreground">Plan</dt>
                    <dd className="text-foreground break-words min-w-0">
                      {perfil.p ? `${perfil.p.nombre} · ${fmtMoney(perfil.p.precio)}/mes` : 'Sin plan asignado'}
                    </dd>
                  </dl>
                </AccordionContent>
              </AccordionItem>

              {/* Peso */}
              <PesoSection alumno={a} key={a.id} />

              {/* Cinturones */}
              <AccordionItem value="cinturones" className="border-pulso-line">
                <AccordionTrigger className={triggerCls}>Cinturones · progreso</AccordionTrigger>
                <AccordionContent className="px-6">
                  {perfil.grados.length ? (
                    <ul className="space-y-4 pl-1">
                      {perfil.grados.map((gr) => (
                        <li key={gr.id} className="flex gap-3">
                          <span
                            className="w-3 h-3 rounded-full mt-1 border-2 border-pulso-panel flex-shrink-0"
                            style={{ background: BELT_COLORS[gr.cinturon] || '#e2e8f0' }}
                          />
                          <div>
                            <div className="text-sm text-foreground font-bold">{gr.cinturon}</div>
                            <div className="text-xs text-muted-foreground">
                              Examen {fmtDate(gr.fechaExamen)} · {fmtNum(gr.puntuacion)}/10
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin graduaciones registradas. El cinturón inicial es blanco.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Asistencia */}
              <AccordionItem value="asistencia" className="border-pulso-line">
                <AccordionTrigger className={triggerCls}>Asistencia</AccordionTrigger>
                <AccordionContent className="px-6">
                  {perfil.pctAsis != null ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-2 mt-2">
                        <span className="text-2xl font-extrabold">{perfil.pctAsis}%</span>
                        <span className="text-xs text-muted-foreground">Presente en {perfil.jPres} de {perfil.jTodas.length} jornadas</span>
                      </div>
                      <ul className="max-h-[280px] overflow-y-auto overflow-x-hidden space-y-2">
                        {perfil.asisRows.map((row) => (
                          <li key={row.id} className="flex items-center gap-3 py-2 border border-pulso-line-strong rounded-xl px-3 flex-wrap">
                            <span className="text-sm text-foreground font-semibold flex-1 min-w-[130px]">
                              {fmtDate(row.fecha)}
                              <div className="text-xs text-muted-foreground font-normal">{row.hr}</div>
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.pres ? 'bg-green-500/17 text-green-400' : 'bg-pulso-red/16 text-pulso-red'}`}>
                              {row.pres ? 'Presente' : 'Ausente'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin jornadas registradas todavía.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Cuotas */}
              <AccordionItem value="cuotas" className="border-pulso-line">
                <AccordionTrigger className={triggerCls}>Cuotas</AccordionTrigger>
                <AccordionContent className="px-6">
                  {perfil.cuotasA.length ? (
                    <ul className="space-y-2">
                      {perfil.cuotasA.map((c) => (
                        <li key={c.id} className="flex items-center gap-3 py-2 border border-pulso-line-strong rounded-xl px-3 flex-wrap min-w-0">
                          <span className="text-sm text-foreground flex-1 min-w-[120px]">
                            {periodoLabel(c.periodo)}
                            <div className="text-xs text-muted-foreground">{perfil.p?.nombre || 'Sin plan'}</div>
                          </span>
                          <span className="text-sm text-foreground font-semibold">{fmtMoney(c.monto)}</span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/17 text-green-400">Pagada</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin pagos registrados.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Competencias */}
              <AccordionItem value="competencias" className="border-pulso-line">
                <AccordionTrigger className={triggerCls}>Competencias · récord {perfil.g}G-{perfil.dcount}D</AccordionTrigger>
                <AccordionContent className="px-6">
                  {perfil.comps.length ? (
                    <ul className="space-y-2">
                      {perfil.comps.map((c) => (
                        <li key={c.e.id} className="flex flex-col gap-1 py-2 border border-pulso-line-strong rounded-xl px-3">
                          <span className="text-sm text-foreground font-semibold">{c.e.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            {fmtDate(c.e.fecha)}
                            {c.part && c.part.pesoCompetencia != null ? ` · compitió en ${fmtNum(c.part.pesoCompetencia)} kg` : ''}
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {c.peleas.length ? (
                              c.peleas.map((f) => (
                                <span key={f.id} className={`px-2.5 py-1 rounded-full text-xs font-bold ${f.resultado === 'victoria' ? 'bg-green-500/17 text-green-400' : f.resultado === 'derrota' ? 'bg-pulso-red/16 text-pulso-red' : 'bg-amber-500/16 text-amber-400'}`}>
                                  vs {f.rival}{f.pesoRival ? ` · ${f.pesoRival} kg` : ''} · {f.resultado === 'victoria' ? 'Ganó' : f.resultado === 'derrota' ? 'Perdió' : 'Pendiente'}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin peleas registradas</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {perfil.p && perfil.p.tipo === 'competitivo' ? 'Todavía no participó de competencias.' : 'Participa cuando pase a un plan competitivo.'}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-pulso-line-strong flex gap-2 flex-wrap">
              <button
                onClick={() => setEditOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors inline-flex items-center gap-1.5"
              >
                ✎ Editar datos
              </button>
              <button
                onClick={() => onToggle(a)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-1.5 ${a.activo ? 'bg-pulso-red-deep text-white hover:bg-pulso-red' : 'bg-pulso-red text-primary-foreground hover:bg-foreground hover:text-background'}`}
              >
                <span className="text-base leading-none">{a.activo ? '⏻' : '↺'}</span>
                {a.activo ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {editOpen && (
        <AlumnoFormModal
          key={a.id}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          edit={a}
          onDone={() => undefined}
        />
      )}
    </>
  );
}