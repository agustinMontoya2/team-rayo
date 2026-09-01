import { formatDate } from '../../../store';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion';
import { triggerCls } from '../accordionCls';
import type { StudentProfileData } from './profileData';

export function AttendanceSection({ perfil }: { perfil: StudentProfileData }) {
  const { pctAsis, jPres, jTodas, asisRows } = perfil;
  return (
    <AccordionItem value="asistencia" className="border-pulso-line">
      <AccordionTrigger className={triggerCls}>Asistencia</AccordionTrigger>
      <AccordionContent className="px-6">
        {pctAsis != null ? (
          <>
            <div className="flex items-baseline gap-2 mb-2 mt-2">
              <span className="text-2xl font-extrabold">{pctAsis}%</span>
              <span className="text-xs text-muted-foreground">Presente en {jPres} de {jTodas.length} jornadas</span>
            </div>
            <ul className="max-h-[280px] overflow-y-auto overflow-x-hidden space-y-2">
              {asisRows.map((row) => (
                <li key={row.id} className="flex items-center gap-3 py-2 border border-pulso-line-strong rounded-xl px-3 flex-wrap">
                  <span className="text-sm text-foreground font-semibold flex-1 min-w-[130px]">
                    {formatDate(row.date)}
                    <div className="text-xs text-muted-foreground font-normal">{row.hr}</div>
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.pres ? 'bg-green-500/17 text-green-400' : 'bg-pulso-red/16 text-pulso-red'}`}>
                    {row.pres ? 'Presente' : 'Ausente'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Sin jornadas registradas todavía.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}