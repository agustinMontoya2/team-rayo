import { cardSurface } from '../../classes';

interface Props {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  sub: string;
  alert?: boolean;
}

export function KpiCard({ label, icon, value, sub, alert }: Props) {
  return (
    <div className={`${cardSurface} p-5 shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] ${alert ? 'text-pulso-red' : ''}`}>
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
