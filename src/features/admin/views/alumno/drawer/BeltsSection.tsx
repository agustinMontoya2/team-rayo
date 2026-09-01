import { formatDate, formatNumber, BELT_COLORS, type Graduation } from '../../../store';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion';
import { triggerCls } from '../accordionCls';

export function BeltsSection({ grados }: { grados: Graduation[] }) {
  return (
    <AccordionItem value="cinturones" className="border-pulso-line">
      <AccordionTrigger className={triggerCls}>Cinturones · progreso</AccordionTrigger>
      <AccordionContent className="px-6">
        {grados.length ? (
          <ul className="space-y-4 pl-1">
            {grados.map((gr) => (
              <li key={gr.id} className="flex gap-3">
                <span
                  className="w-3 h-3 rounded-full mt-1 border-2 border-pulso-panel flex-shrink-0"
                  style={{ background: BELT_COLORS[gr.belt] || '#e2e8f0' }}
                />
                <div>
                  <div className="text-sm text-foreground font-bold">{gr.belt}</div>
                  <div className="text-xs text-muted-foreground">
                    Examen {formatDate(gr.examDate)} · {formatNumber(gr.score)}/10
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Sin graduaciones registradas. El cinturón inicial es blanco.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}