import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Clock, Eye, Trash2 } from 'lucide-react';
import { useStore, formatDate, absencesFrom, studentsInSession, saveAttendance, deleteSession, attendancePct, sortByDateDesc, scheduleLabel } from '../store';
import { useToast, Empty } from '../ui-kit';
import { ConfirmDialog } from '../ConfirmDialog';
import { OpenSessionModal } from './modals/OpenSessionModal';
import { AttendanceTakeModal } from './asistencia/AttendanceTakeModal';
import { iconBtn, iconBtnDanger, cardSurface } from '../classes';
import { SessionDetailModal } from './asistencia/SessionDetailModal';

export function Attendance() {
  const { store, setStore } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [showAbrir, setShowAbrir] = useState(false);
  const [tomarId, setTomarId] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const active = useMemo(() => store.students.filter((a) => a.active), [store]);
  const sessions = useMemo(() => sortByDateDesc(store.sessions, (s) => s.date), [store]);

  const handleSave = (sessionId: string, present: string[]) => {
    const res = saveAttendance(store, sessionId, present);
    setStore(res.store);
    setTomarId(null);
    toast('ok', res.info || 'Jornada guardada.');
  };

  const handleDelete = (sessionId: string) => {
    const s = store.sessions.find((x) => x.id === sessionId);
    if (!s) return;
    const res = deleteSession(store, sessionId);
    setStore(res.store);
    setConfirmId(null);
    toast('info', `Jornada del ${formatDate(s.date)} eliminada.`);
  };

  const sessionTake = tomarId ? store.sessions.find((j) => j.id === tomarId) : null;
  const sessionDetail = detalleId ? store.sessions.find((j) => j.id === detalleId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Abrí la jornada del día y marcá quiénes vinieron; el resto queda ausente automáticamente.
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
      {sessions.length ? (
        <div className={`${cardSurface} overflow-hidden`}>
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
                {sessions.map((j) => {
                  const h = j.scheduleId ? store.schedules.find((x) => x.id === j.scheduleId) : null;
                  const eligible = studentsInSession(store, j.date);
                  const aus = absencesFrom(store, j);
                  const pct = attendancePct(j.present.length, eligible.length) ?? 0;
                  return (
                    <tr key={j.id} className="border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
                      <td className="px-6 py-4 text-foreground font-semibold">{formatDate(j.date)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{h ? scheduleLabel(h) : 'Libre'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-bold">
                            {j.present.length}/{eligible.length}
                          </span>
                          <div className="w-24 h-2 rounded-full bg-pulso-line-strong overflow-hidden">
                            <div className={`h-full rounded-full ${pct < 50 ? 'bg-pulso-red' : 'bg-pulso-indigo'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {aus.length ? aus.map((a) => a.firstName).join(', ') : 'Sin ausencias'}
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
                            className={iconBtn}
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmId(j.id)}
                            className={iconBtnDanger}
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
        <Empty msg="Todavía no abriste ninguna jornada." />
      )}

      {/* Modal abrir jornada */}
      <OpenSessionModal
        key={showAbrir ? 'abrir' : 'cerrado'}
        open={showAbrir}
        onClose={() => setShowAbrir(false)}
        onCreated={(j) => setTomarId(j.id)}
      />

      {/* Modal tomar asistencia */}
      <AttendanceTakeModal
        key={tomarId ?? 'ninguno'}
        session={sessionTake ?? undefined}
        activeStudents={sessionTake ? studentsInSession(store, sessionTake.date) : active}
        onClose={() => setTomarId(null)}
        onSave={handleSave}
      />

      {/* Modal detalle */}
      <SessionDetailModal session={sessionDetail ?? undefined} onClose={() => setDetalleId(null)} />

      {/* Confirmar eliminar jornada */}
      <ConfirmDialog
        open={!!confirmId}
        title="Eliminar jornada"
        message="¿Seguro que querés eliminar esta jornada y su asistencia? Esta acción no se puede deshacer."
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
