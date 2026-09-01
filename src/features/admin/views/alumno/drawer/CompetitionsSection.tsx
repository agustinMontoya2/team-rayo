import { formatDate, formatWeight, fightResultPill, fightResultShort, PLAN_TYPES, type CompetitionHistoryEntry, type Plan } from '../../../store';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion';
import { triggerCls } from '../accordionCls';

interface Props {
  comps: CompetitionHistoryEntry[];
  p: Plan | null;
  g: number;
  dcount: number;
}

export function CompetitionsSection({ comps, p, g, dcount }: Props) {
  return (
    <AccordionItem value="competencias" className="border-pulso-line">
      <AccordionTrigger className={triggerCls}>Competencias · récord {g}G-{dcount}D</AccordionTrigger>
      <AccordionContent className="px-6">
        {comps.length ? (
          <ul className="space-y-2">
            {comps.map((c) => (
              <li key={c.e.id} className="flex flex-col gap-1 py-2 border border-pulso-line-strong rounded-xl px-3">
                <span className="text-sm text-foreground font-semibold">{c.e.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(c.e.date)}
                  {c.part && c.part.compWeight != null ? ` · compitió en ${formatWeight(c.part.compWeight)}` : ''}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {c.fights.length ? (
                    c.fights.map((f) => (
                      <span key={f.id} className={`px-2.5 py-1 rounded-full text-xs font-bold ${fightResultPill(f.result)}`}>
                        vs {f.opponent}{f.opponentWeight ? ` · ${formatWeight(f.opponentWeight)}` : ''} · {fightResultShort(f.result)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin peleas registradas</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            {p && p.type === 'competitivo' ? 'Todavía no participó de competencias.' : `Participa cuando pase a un plan ${PLAN_TYPES.competitivo.label.toLowerCase()}.`}
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}