import { formatDate, formatMoney, ageFrom, type Student, type Plan } from '../../../store';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion';
import { triggerCls } from '../accordionCls';

interface Props {
  a: Student;
  p: Plan | null;
}

export function PersonalDataSection({ a, p }: Props) {
  return (
    <AccordionItem value="datos" className="border-pulso-line">
      <AccordionTrigger className={triggerCls}>Datos personales</AccordionTrigger>
      <AccordionContent className="px-6">
        <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm min-w-0">
          <dt className="text-muted-foreground">DNI</dt>
          <dd className="text-foreground break-words min-w-0">{a.idNumber}</dd>
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd className="text-foreground break-words min-w-0">{a.phone || '—'}</dd>
          <dt className="text-muted-foreground">Nacimiento</dt>
          <dd className="text-foreground break-words min-w-0">
            {formatDate(a.birthDate)}
            {ageFrom(a.birthDate) != null ? ` · ${ageFrom(a.birthDate)} años` : ''}
          </dd>
          <dt className="text-muted-foreground">Ingreso</dt>
          <dd className="text-foreground break-words min-w-0">{formatDate(a.enrollmentDate)}</dd>
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="text-foreground break-words min-w-0">
            {p ? `${p.name} · ${formatMoney(p.price)}/mes` : 'Sin plan asignado'}
          </dd>
        </dl>
      </AccordionContent>
    </AccordionItem>
  );
}
