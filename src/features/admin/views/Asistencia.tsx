import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Clock, Eye, Trash2 } from 'lucide-react';
import { useStore, fmtDate, ausentesDe, guardarAsistencia, eliminarJornada } from '../store';
import { useToast, Empty } from '../ui-kit';
import { AbrirJornadaModal } from './modals/AbrirJornadaModal';
import { AsistenciaTomarModal } from './asistencia/AsistenciaTomarModal';
import { JornadaDetalleModal } from './asistencia/JornadaDetalleModal';

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

