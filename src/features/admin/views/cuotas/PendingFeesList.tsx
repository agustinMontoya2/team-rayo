import { Check } from 'lucide-react';
import { fullName, formatMoney, periodLabel, monthShortLabel, type PendingFee } from '../../store';
import { Avatar, Empty } from '../../ui-kit';
import { cardSurface } from '../../classes';

interface Props {
  rows: PendingFee[];
  emptyMsg: string;
  getPlanName: (studentId: string) => string;
  onCollect: (studentId: string, period: string) => void;
}

export function PendingFeesList({ rows, emptyMsg, getPlanName, onCollect }: Props) {
  if (!rows.length) return <Empty msg={emptyMsg} />;

  return (
    <div className={`${cardSurface} overflow-hidden`}>
      <ul>
        {rows.map(({ student: a, periods: adeudados, amount }) => {
          const detalle =
            adeudados.length === 1
              ? `Debe ${periodLabel(adeudados[0])}.`
              : `Debe ${adeudados.length} cuotas: ${adeudados
                  .slice()
                  .reverse()
                  .map((x) => monthShortLabel(x))
                  .join(', ')}.`;
          return (
            <li key={a.id} className="flex items-center gap-3 px-6 py-4 border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
              <Avatar student={a} />
              <div className="flex-1">
                <div className="text-foreground font-semibold">{fullName(a)}</div>
                <div className="text-xs text-muted-foreground">
                  {getPlanName(a.id)} · {detalle}
                </div>
              </div>
              <div className="text-sm font-bold text-foreground">{formatMoney(amount)}</div>
              <button
                onClick={() => onCollect(a.id, adeudados[adeudados.length - 1])}
                className="px-3 py-2 rounded-lg bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 text-xs font-bold hover:bg-pulso-indigo/26 transition-colors inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Cobrar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}