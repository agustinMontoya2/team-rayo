import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Clock, Eye, Trash2, Check, X } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { useStore, fullName, fmtDate, ausentesDe, planDe, guardarAsistencia, eliminarJornada, type Jornada, type Alumno } from '../store';
import { useToast, Avatar, Empty } from '../ui-kit';
import { Modal } from '../Modal';
import { AbrirJornadaModal } from './modals/AbrirJornadaModal';

export function Asistencia() {
  const { store, setStore } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [showAbrir, setShowAbrir] = useState(false);
  const [tomarId, setTomarId] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const activos = useMemo(() => store.alumnos.filter((a) => a.activo), [store]);
  const jornadas = useMemo(() => store.jornadas.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1)), [store]);

  const guardar = (jid: string, presentes: string[]) => {
    const res = guardarAsistencia(store, jid, presentes);
    setStore(res.store);
    setTomarId(null);
    toast('ok', res.info || 'Jornada guardada.');
  };

  const eliminar = (jid: string) => {
    const j = store.jornadas.find((x) => x.id === jid);
    if (!j) return;
    const res = eliminarJornada(store, jid);
    setStore(res.store);
    toast('info', `Jornada del ${fmtDate(j.fecha)} eliminada.`);
  };

  const jornadaTomar = tomarId ? store.jornadas.find((j) => j.id === tomarId) : null;
  const jornadaDetalle = detalleId ? store.jornadas.find((j) => j.id === detalleId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          AbrÃ­ la jornada del dÃ­a y marcÃ¡ quiÃ©nes vinieron; el resto queda ausente automÃ¡ticamente.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/horarios')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors"
          >
            <Clock className="w-4 h-4" />
            Editar horarios
          </button>
          <button
            onClick={() => setShowAbrir(true)}
            className="flex items-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="w-4 h-4" />
            Abrir jornada
          </button>
        </div>
      </div>

      {/* Tabla de jornadas */}
      {jornadas.length ? (
        <div className="bg-card rounded-2xl border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pulso-line">
                  {['Fecha', 'Horario', 'Presentes', 'Ausentes', ''].map((h) => (
                    <th key={h} className={`font-mono text-muted-foreground text-[11px] tracking-[.14em] uppercase text-left px-6 py-4 ${h === '' ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jornadas.map((j) => {
                  const h = j.horarioId ? store.horarios.find((x) => x.id === j.horarioId) : null;
                  const aus = ausentesDe(store, j);
                  const pct = activos.length ? Math.round((j.presentes.length / activos.length) * 100) : 0;
                  return (
                    <tr key={j.id} className="border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
                      <td className="px-6 py-4 text-foreground font-semibold">{fmtDate(j.fecha)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{h ? `${h.dia} ${h.inicio}-${h.fin}` : 'Libre'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-bold">
                            {j.presentes.length}/{activos.length}
                          </span>
                          <div className="w-24 h-2 rounded-full bg-pulso-line-strong overflow-hidden">
                            <div className={`h-full rounded-full ${pct < 50 ? 'bg-pulso-red' : 'bg-pulso-indigo'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {aus.length ? aus.map((a) => a.nombre).join(', ') : 'Sin ausencias'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setTomarId(j.id)}
                            className="px-3 py-1.5 rounded-lg bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-xs font-bold hover:bg-pulso-indigo/26 transition-colors"
                          >
                            Tomar asistencia
                          </button>
                          <button
                            onClick={() => setDetalleId(j.id)}
                            className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminar(j.id)}
                            className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card flex items-center justify-center transition-colors"
                            title="Eliminar jornada"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Empty msg="TodavÃ­a no abriste ninguna jornada." />
      )}

      {/* Modal abrir jornada */}
      <AbrirJornadaModal
        key={showAbrir ? 'abrir' : 'cerrado'}
        open={showAbrir}
        onClose={() => setShowAbrir(false)}
        onCreated={(j) => setTomarId(j.id)}
      />

      {/* Modal tomar asistencia */}
      <AsistenciaTomarModal
        key={tomarId ?? 'ninguno'}
        jornada={jornadaTomar ?? undefined}
        activos={activos}
        onClose={() => setTomarId(null)}
        onSave={guardar}
      />

      {/* Modal detalle */}
      <JornadaDetalleModal jornada={jornadaDetalle ?? undefined} onClose={() => setDetalleId(null)} />
    </div>
  );
}

function AsistenciaTomarModal({
  jornada,
  activos,
  onClose,
  onSave,
}: {
  jornada: Jornada | undefined;
  activos: Alumno[];
  onClose: () => void;
  onSave: (id: string, presentes: string[]) => void;
}) {
  const { store } = useStore();
  const [marks, setMarks] = useState<Record<string, boolean>>(
    () =>
      jornada
        ? Object.fromEntries(activos.map((a) => [a.id, jornada.presentes.indexOf(a.id) > -1]))
        : {}
  );

  if (!jornada) return null;
  const h = jornada.horarioId ? store.horarios.find((x) => x.id === jornada.horarioId) : null;
  const count = Object.values(marks).filter(Boolean).length;

  return (
    <Modal
      open={!!jornada}
      onClose={onClose}
      title={`Asistencia Â· ${fmtDate(jornada.fecha)}`}
      sub={h ? `${h.dia} Â· ${h.inicio} a ${h.fin}` : 'Entrenamiento libre'}
      wide
      footer={
        <>
          <span className="flex-1 text-sm text-muted-foreground">
            {count} presentes de {activos.length}
          </span>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave(jornada.id, Object.keys(marks).filter((k) => marks[k]))}
            className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Guardar jornada
          </button>
        </>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        MarcÃ¡ a los presentes. Quienes queden sin marcar se registran como ausentes.
      </p>
      <div className="space-y-1.5 max-h-[50vh] overflow-y-auto overflow-x-hidden">
        {activos.map((a) => {
          const p = planDe(store, a.id);
          return (
            <div key={a.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-pulso-surface2 transition-colors">
              <Avatar alumno={a} />
              <div className="flex-1">
                <div className="text-sm text-foreground font-medium">{fullName(a)}</div>
                <div className="text-xs text-muted-foreground">{p ? p.nombre : 'sin plan'}</div>
              </div>
              <Switch
                aria-label={`Marcar ${fullName(a)} como presente`}
                checked={!!marks[a.id]}
                onCheckedChange={(v) => setMarks((m) => ({ ...m, [a.id]: v }))}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function JornadaDetalleModal({ jornada, onClose }: { jornada: Jornada | undefined; onClose: () => void }) {
  const { store } = useStore();
  if (!jornada) return null;
  const pres = jornada.presentes
    .map((id) => store.alumnos.find((a) => a.id === id))
    .filter((a): a is Alumno => a !== undefined);
  const aus = ausentesDe(store, jornada);

  return (
    <Modal
      open={!!jornada}
      onClose={onClose}
      title="Detalle de jornada"
      sub={fmtDate(jornada.fecha)}
      wide
      footer={
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
          Listo
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs font-bold text-green-400 uppercase tracking-[.08em] mb-3">Presentes ({pres.length})</h3>
          <ul className="space-y-2">
            {pres.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-pulso-line-strong">
                <span className="w-5 h-5 rounded-full bg-green-500/17 text-green-400 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-sm text-foreground">{fullName(a)}</span>
              </li>
            ))}
            {!pres.length && <p className="text-xs text-muted-foreground">Sin presentes.</p>}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold text-pulso-red uppercase tracking-[.08em] mb-3">Ausentes ({aus.length})</h3>
          <ul className="space-y-2">
            {aus.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-pulso-line-strong">
                <span className="w-5 h-5 rounded-full bg-pulso-red/16 text-pulso-red flex items-center justify-center">
                  <X className="w-3 h-3" />
                </span>
                <span className="text-sm text-foreground">{fullName(a)}</span>
              </li>
            ))}
            {!aus.length && <p className="text-xs text-muted-foreground">Sin ausencias.</p>}
          </ul>
        </div>
      </div>
    </Modal>
  );
}