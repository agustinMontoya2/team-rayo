import { periodLabel, formatMoney, type Fee } from '../../../store';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion';
import { triggerCls } from '../accordionCls';

interface Props {
  cuotasA: Fee[];
  planName: string;
}

export function FeesSection({ cuotasA, planName }: Props) {
  return (
    <AccordionItem value="cuotas" className="border-pulso-line">
      <AccordionTrigger className={triggerCls}>Cuotas</AccordionTrigger>
      <AccordionContent className="px-6">
        {cuotasA.length ? (
          <ul className="space-y-2">
            {cuotasA.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2 border border-pulso-line-strong rounded-xl px-3 flex-wrap min-w-0">
                <span className="text-sm text-foreground flex-1 min-w-[120px]">
                  {periodLabel(c.period)}
                  <div className="text-xs text-muted-foreground">{planName}</div>
                </span>
                <span className="text-sm text-foreground font-semibold">{formatMoney(c.amount)}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/17 text-green-400">Pagada</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Sin pagos registrados.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}