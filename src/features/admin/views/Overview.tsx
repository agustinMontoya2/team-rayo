import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, formatDate, periodLabel, currentPeriod, today, studentsInSession, pendingPaymentsForPeriod, attendancePct, daysLabel, sortByDateAsc, sortByDateDesc, eventTypePill as eventPill, eventTypeLabel } from '../store';
import { useToast } from '../ui-kit';
import { Users, CreditCard, Trophy, CalendarCheck, ArrowRight } from 'lucide-react';
import { StudentFormModal } from './StudentFormModal';
import { OpenSessionModal } from './modals/OpenSessionModal';
import { RegisterPaymentModal } from './modals/RegisterPaymentModal';
import { EventFormModal } from './eventos/EventFormModal';
import { KpiCard } from './overview/KpiCard';
import { AttendanceChart } from './overview/AttendanceChart';
import { QuickActions, type QuickAction } from './overview/QuickActions';
import { cardSurface } from '../classes';

export function Overview() {
  const { store } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [modal, setModal] = useState<QuickAction | null>(null);

  const activos = store.students.filter((a) => a.active);
  const pend = pendingPaymentsForPeriod(store, currentPeriod());
  const futuros = sortByDateAsc(store.events.filter((e) => e.date >= today()), (e) => e.date);
  const prox = futuros[0];
  const jor = sortByDateDesc(store.sessions, (s) => s.date)[0];
  const pctJor = jor ? attendancePct(jor.present.length, studentsInSession(store, jor.date).length) : null;

  const points = sortByDateAsc(store.sessions, (s) => s.date)
    .slice(-6)
    .map((j) => {
      const total = studentsInSession(store, j.date).length;
      const pct = attendancePct(j.present.length, total) ?? 0;
      return { date: j.date, presentCount: j.present.length, total, pct: Math.max(pct, 4) };
    });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Alumnos activos" icon={<Users className="w-5 h-5" />} value={activos.length} sub={`de ${store.students.length} registrados`} />
        <KpiCard label="Cuotas pendientes" icon={<CreditCard className="w-5 h-5" />} value={pend.length} sub={periodLabel(currentPeriod())} alert={pend.length > 0} />
        <KpiCard
          label="Próximo evento"
          icon={<Trophy className="w-5 h-5" />}
          value={prox ? daysLabel(prox.date) : '—'}
          sub={prox ? prox.name : 'Sin eventos agendados'}
        />
        <KpiCard
          label="última asistencia"
          icon={<CalendarCheck className="w-5 h-5" />}
          value={pctJor != null ? `${pctJor}%` : '—'}
          sub={jor ? formatDate(jor.date) : 'Sin jornadas'}
        />
      </div>

      {/* Chart + Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AttendanceChart points={points} />
        <QuickActions
          onSelect={(action) => setModal(action)}
        />
      </div>

      {/* Próximos eventos */}
      <div className={`${cardSurface} p-6`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Próximos eventos</h3>
            <p className="text-sm text-muted-foreground">Los públicos aparecen en la landing</p>
          </div>
          <button
            onClick={() => navigate('/admin/eventos')}
            className="flex items-center gap-1.5 text-sm font-semibold text-pulso-indigo-soft hover:text-white transition-colors"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {futuros.slice(0, 4).length ? (
          <ul className="divide-y divide-pulso-line">
            {futuros.slice(0, 4).map((e) => (
              <li key={e.id} className="py-3 flex items-center gap-3 flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${eventPill(e.type)}`}
                >
                  {eventTypeLabel(e.type)}
                </span>
                <span className="text-foreground font-semibold flex-1">{e.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{formatDate(e.date)}</span>
                {e.public ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/17 text-green-400">Público</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">Oculto</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No hay eventos futuros.</p>
        )}
      </div>

      {/* Modales de acciones rápidas (se abren sobre el Resumen) */}
      <StudentFormModal key={modal === 'alumno' ? 'alumno' : 'cerrado'} open={modal === 'alumno'} onClose={() => setModal(null)} />
      <OpenSessionModal
        key={modal === 'jornada' ? 'jornada' : 'cerrado'}
        open={modal === 'jornada'}
        onClose={() => setModal(null)}
        onCreated={() => toast('ok', 'Jornada abierta. Dale seguimiento desde Asistencia.')}
      />
      <RegisterPaymentModal key={modal === 'pago' ? 'pago' : 'cerrado'} open={modal === 'pago'} onClose={() => setModal(null)} />
      <EventFormModal key={modal === 'evento' ? 'evento' : 'cerrado'} open={modal === 'evento'} onClose={() => setModal(null)} edit={null} />
    </div>
  );
}