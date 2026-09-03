import { formatDate, formatShortDate } from '../../store';
import { cardSurface } from '../../classes';

export interface AttendanceChartPoint {
  date: string;
  presentCount: number;
  total: number;
  pct: number;
}

export function AttendanceChart({ points }: { points: AttendanceChartPoint[] }) {
  return (
    <div className={`${cardSurface} p-6`}>
      <h3 className="text-lg font-extrabold tracking-tight">Asistencia por jornada</h3>
      <p className="text-sm text-muted-foreground mb-4">Presentes sobre alumnos activos</p>
      {points.length ? (
        <div className="flex items-end justify-around gap-4 h-[200px]">
          {points.map((c) => (
            <div key={c.date} className="flex flex-col items-center justify-end h-full gap-2 min-w-0">
              <span className="font-mono text-[11px] text-pulso-indigo-soft">{c.presentCount}/{c.total}</span>
              <div
                className="w-9 rounded-t-lg rounded-b-sm bg-pulso-red"
                style={{ height: `${c.pct}%` }}
                title={`${formatDate(c.date)} · ${c.presentCount}/${c.total} presentes`}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {formatShortDate(c.date)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Todavía no hay jornadas registradas.</p>
      )}
    </div>
  );
}
