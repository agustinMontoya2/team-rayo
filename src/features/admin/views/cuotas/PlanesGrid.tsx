import { Plus, Pencil, Users, Sparkles } from 'lucide-react';
import { useStore, fmtMoney, type Plan } from '../../store';

interface Props {
  onNuevo: () => void;
  onEdit: (p: Plan) => void;
}

export function PlanesGrid({ onNuevo, onEdit }: Props) {
  const { store } = useStore();

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Tipos y beneficios se muestran como badges y listas.</p>
        <button
          onClick={onNuevo}
          className="inline-flex items-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo plan
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {store.planes.map((p) => {
          const inscriptos = store.alumnos.filter((a) => a.planId === p.id).length;
          return (
            <div key={p.id} className={`bg-card rounded-2xl p-6 border flex flex-col gap-3 ${p.destacado ? 'border-pulso-indigo/50' : 'border-pulso-line'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {p.destacado && <Sparkles className="w-4 h-4 text-pulso-indigo" />}
                  <h4 className="text-base font-extrabold text-foreground">{p.nombre}</h4>
                </div>
                <button
                  onClick={() => onEdit({ ...p, beneficios: [...p.beneficios] })}
                  className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                  title="Editar plan"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.tipo === 'competitivo' ? 'bg-pulso-red/16 text-pulso-red' : 'bg-pulso-indigo/17 text-pulso-indigo-soft'}`}>
                  {p.tipo === 'competitivo' ? 'Competitivo' : 'Recreativo'}
                </span>
                {p.destacado && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/16 text-amber-400">Destacado</span>}
              </div>
              <p className="text-sm text-muted-foreground">{p.descripcion}</p>
              <div className="text-2xl font-extrabold text-foreground">{fmtMoney(p.precio)}</div>
              {p.beneficios.length > 0 && (
                <ul className="space-y-1">
                  {p.beneficios.map((b, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Users className="w-3.5 h-3.5 mt-0.5 shrink-0 text-pulso-indigo-soft" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-pulso-line">{inscriptos} alumno{inscriptos === 1 ? '' : 's'} inscripto{inscriptos === 1 ? '' : 's'}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}