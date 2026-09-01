import { Plus, Pencil, Users, Sparkles } from 'lucide-react';
import { useStore, formatMoney, PLAN_TYPES, type Plan } from '../../store';
import { btnPrimary, cardSurface, iconBtn } from '../../classes';

interface Props {
  onNew: () => void;
  onEdit: (p: Plan) => void;
}

export function PlansGrid({ onNew, onEdit }: Props) {
  const { store } = useStore();

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Tipos y beneficios se muestran como badges y listas.</p>
        <button
          onClick={onNew}
          className={btnPrimary}
        >
          <Plus className="w-4 h-4" />
          Nuevo plan
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {store.plans.map((p) => {
          const enrolled = store.students.filter((a) => a.planId === p.id).length;
          return (
            <div key={p.id} className={`${cardSurface} p-6 flex flex-col gap-3 ${p.featured ? 'border-pulso-indigo/50' : 'border-pulso-line'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {p.featured && <Sparkles className="w-4 h-4 text-pulso-indigo" />}
                  <h4 className="text-base font-extrabold text-foreground">{p.name}</h4>
                </div>
                <button
                  onClick={() => onEdit({ ...p, benefits: [...p.benefits] })}
                  className={iconBtn}
                  title="Editar plan"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.type === 'competitivo' ? 'bg-pulso-red/16 text-pulso-red' : 'bg-pulso-indigo/17 text-pulso-indigo-soft'}`}>
                  {PLAN_TYPES[p.type].label}
                </span>
                {p.featured && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/16 text-amber-400">Destacado</span>}
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="text-2xl font-extrabold text-foreground">{formatMoney(p.price)}</div>
              {p.benefits.length > 0 && (
                <ul className="space-y-1">
                  {p.benefits.map((b, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Users className="w-3.5 h-3.5 mt-0.5 shrink-0 text-pulso-indigo-soft" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-pulso-line">{enrolled} alumno{enrolled === 1 ? '' : 's'} inscripto{enrolled === 1 ? '' : 's'}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
