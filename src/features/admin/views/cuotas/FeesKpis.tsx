import { Euro, Wallet } from 'lucide-react';
import { formatMoney } from '../../store';
import { cardSurface } from '../../classes';

interface Props {
  totalRecaudado: number;
  paidCount: number;
  pendingCount: number;
  verTodos: boolean;
}

export function FeesKpis({ totalRecaudado, paidCount, pendingCount, verTodos }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className={`${cardSurface} p-5`}>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-[.12em] mb-2">
          <Euro className="w-4 h-4" /> Recaudado
        </div>
        <div className="text-2xl font-extrabold text-foreground">{formatMoney(totalRecaudado)}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {paidCount} pago{paidCount === 1 ? '' : 's'} {verTodos ? 'registrados' : 'en el período'}
        </div>
      </div>
      <div className={`${cardSurface} p-5`}>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-[.12em] mb-2">
          <Wallet className="w-4 h-4" /> Sin pagar
        </div>
        <div className="text-2xl font-extrabold text-foreground">{pendingCount}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {verTodos
            ? `alumno${pendingCount === 1 ? '' : 's'} con deudas`
            : `alumno${pendingCount === 1 ? '' : 's'} que deben este mes`}
        </div>
      </div>
    </div>
  );
}