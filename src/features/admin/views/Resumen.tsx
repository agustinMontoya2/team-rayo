import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, fmtDate, periodoLabel, periodoActual, hoy } from '../store';
import { tipoEventoLabel, useToast } from '../ui-kit';
import { Users, CreditCard, Trophy, CalendarCheck, Plus, ArrowRight } from 'lucide-react';
import { AlumnoFormModal } from './AlumnoFormModal';
import { AbrirJornadaModal } from './modals/AbrirJornadaModal';
import { RegistrarPagoModal } from './modals/RegistrarPagoModal';
import { EventoFormModal } from './eventos/EventoFormModal';

function diaLabel(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  const dias = Math.round((d.getTime() - new Date(hoy() + 'T12:00:00').getTime()) / 86400000);
  return dias === 0 ? 'Hoy' : dias === 1 ? 'MaÃ±ana' : `en ${dias} dÃ­as`;
}

function KpiCard({ label, icon, value, sub, alert }: { label: string; icon: React.ReactNode; value: React.ReactNode; sub: string; alert?: boolean }) {
  return (
    <div className={`bg-card rounded-2xl p-5 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] ${alert ? 'text-pulso-red' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-muted-foreground text-[11px] tracking-[.14em] uppercase">{label}</span>
        <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center ${alert ? 'bg-pulso-red/16 text-pulso-red' : 'bg-pulso-indigo/17 text-pulso-indigo-soft'}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

type QuickAction = 'alumno' | 'jornada' | 'pago' | 'evento';

export function Resumen() {
  const { store } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [modal, setModal] = useState<QuickAction | null>(null);

  const activos = store.alumnos.filter((a) => a.activo);
  const pend = store.alumnos.filter(
    (a) => a.activo && a.planId && !store.cuotas.some((c) => c.alumnoId === a.id && c.periodo === periodoActual())
  );
  const futuros = store.eventos.filter((e) => e.fecha >= hoy()).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const prox = futuros[0];
  const jor = store.jornadas.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  const pctJor = jor ? Math.round((jor.presentes.length / Math.max(activos.length, 1)) * 100) : null;

  const jornadasAsc = store.jornadas.slice().sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).slice(-6);
  const chart = jornadasAsc.map((j) => {
    const pct = Math.round((j.presentes.length / Math.max(activos.length, 1)) * 100);
    return { fecha: j.fecha, presentes: j.presentes.length, total: activos.length, pct: Math.max(pct, 4) };
  });

  const quick: { key: QuickAction; icon: React.ReactNode; label: string }[] = [
    { key: 'alumno', icon: <Plus className="w-4 h-4" />, label: 'Nuevo alumno' },
    { key: 'jornada', icon: <Plus className="w-4 h-4" />, label: 'Abrir jornada' },
    { key: 'pago', icon: <Plus className="w-4 h-4" />, label: 'Registrar pago' },
    { key: 'evento', icon: <Plus className="w-4 h-4" />, label: 'Nuevo evento' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Alumnos activos" icon={<Users className="w-5 h-5" />} value={activos.length} sub={`de ${store.alumnos.length} registrados`} />
        <KpiCard label="Cuotas pendientes" icon={<CreditCard className="w-5 h-5" />} value={pend.length} sub={periodoLabel(periodoActual())} alert={pend.length > 0} />
        <KpiCard
          label="PrÃ³ximo evento"
          icon={<Trophy className="w-5 h-5" />}
          value={prox ? diaLabel(prox.fecha) : 'â€”'}
          sub={prox ? prox.nombre : 'Sin eventos agendados'}
        />
        <KpiCard
          label="Ãšltima asistencia"
          icon={<CalendarCheck className="w-5 h-5" />}
          value={pctJor != null ? `${pctJor}%` : 'â€”'}
          sub={jor ? fmtDate(jor.fecha) : 'Sin jornadas'}
        />
      </div>

      {/* Chart + Acciones rÃ¡pidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-6 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
          <h3 className="text-lg font-extrabold tracking-tight">Asistencia por jornada</h3>
          <p className="text-sm text-muted-foreground mb-4">Presentes sobre alumnos activos</p>
          {chart.length ? (
            <div className="flex items-end justify-around gap-4 h-[200px]">
              {chart.map((c) => (
                <div key={c.fecha} className="flex flex-col items-center justify-end h-full gap-2 min-w-0">
                  <span className="font-mono text-[11px] text-pulso-indigo-soft">{c.presentes}/{c.total}</span>
                  <div
                    className="w-9 rounded-t-lg rounded-b-sm"
                    style={{ height: `${c.pct}%`, background: 'var(--pulso-red)' }}
                    title={`${fmtDate(c.fecha)} Â· ${c.presentes}/${c.total} presentes`}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">TodavÃ­a no hay jornadas registradas.</p>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
          <h3 className="text-lg font-extrabold tracking-tight">Acciones rÃ¡pidas</h3>
          <p className="text-sm text-muted-foreground mb-4">Las tareas mÃ¡s frecuentes del profesor</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quick.map((qa) => (
              <button
                key={qa.key}
                onClick={() => setModal(qa.key)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 font-bold text-sm hover:bg-pulso-indigo/26 transition-colors text-left"
              >
                {qa.icon}
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PrÃ³ximos eventos */}
      <div className="bg-card rounded-2xl p-6 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">PrÃ³ximos eventos</h3>
            <p className="text-sm text-muted-foreground">Los pÃºblicos aparecen en la landing</p>
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
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    e.tipo === 'competencia' ? 'bg-pulso-red/16 text-pulso-red' : e.tipo === 'exhibicion' ? 'bg-pulso-indigo/17 text-pulso-indigo-soft' : 'bg-amber-500/16 text-amber-400'
                  }`}
                >
                  {tipoEventoLabel(e.tipo)}
                </span>
                <span className="text-foreground font-semibold flex-1">{e.nombre}</span>
                <span className="font-mono text-xs text-muted-foreground">{fmtDate(e.fecha)}</span>
                {e.publico ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/17 text-green-400">PÃºblico</span>
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

      {/* Modales de acciones rÃ¡pidas (se abren sobre el Resumen) */}
      <AlumnoFormModal key={modal === 'alumno' ? 'alumno' : 'cerrado'} open={modal === 'alumno'} onClose={() => setModal(null)} />
      <AbrirJornadaModal
        key={modal === 'jornada' ? 'jornada' : 'cerrado'}
        open={modal === 'jornada'}
        onClose={() => setModal(null)}
        onCreated={() => toast('ok', 'Jornada abierta. Dale seguimiento desde Asistencia.')}
      />
      <RegistrarPagoModal key={modal === 'pago' ? 'pago' : 'cerrado'} open={modal === 'pago'} onClose={() => setModal(null)} />
      <EventoFormModal key={modal === 'evento' ? 'evento' : 'cerrado'} open={modal === 'evento'} onClose={() => setModal(null)} edit={null} />
    </div>
  );
}