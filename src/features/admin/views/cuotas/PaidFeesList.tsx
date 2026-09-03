import { Plus } from 'lucide-react';
import { fullName, formatLongDate, formatMoney, periodLabel, type Fee, type Student } from '../../store';
import { Avatar, Empty } from '../../ui-kit';
import { cardSurface, iconBtnDanger } from '../../classes';

interface Props {
  fees: Fee[];
  students: Student[];
  emptyMsg: string;
  onDelete: (id: string) => void;
}

export function PaidFeesList({ fees, students, emptyMsg, onDelete }: Props) {
  if (!fees.length) return <Empty msg={emptyMsg} />;

  return (
    <div className={`${cardSurface} overflow-hidden`}>
      <ul>
        {fees.map((c) => {
          const a = students.find((x) => x.id === c.studentId);
          return (
            <li key={c.id} className="flex items-center gap-3 px-6 py-4 border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors">
              <Avatar student={a} />
              <div className="flex-1">
                <div className="text-foreground font-semibold">{a ? fullName(a) : 'Alumno eliminado'}</div>
                <div className="text-sm font-bold text-foreground">{periodLabel(c.period)}</div>
                <div className="text-xs text-muted-foreground">Pagado el {formatLongDate(c.paymentDate)}</div>
              </div>
              <div className="text-sm font-bold text-foreground">{formatMoney(c.amount)}</div>
              <button
                onClick={() => onDelete(c.id)}
                className={iconBtnDanger}
                title="Eliminar pago"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
