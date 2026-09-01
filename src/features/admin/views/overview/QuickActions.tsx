import { Plus } from 'lucide-react';
import { cardSurface } from '../../classes';

export type QuickAction = 'alumno' | 'jornada' | 'pago' | 'evento';

const QUICK_ACTIONS: { key: QuickAction; icon: React.ReactNode; label: string }[] = [
  { key: 'alumno', icon: <Plus className="w-4 h-4" />, label: 'Nuevo alumno' },
  { key: 'jornada', icon: <Plus className="w-4 h-4" />, label: 'Abrir jornada' },
  { key: 'pago', icon: <Plus className="w-4 h-4" />, label: 'Registrar pago' },
  { key: 'evento', icon: <Plus className="w-4 h-4" />, label: 'Nuevo evento' },
];

export function QuickActions({ onSelect }: { onSelect: (action: QuickAction) => void }) {
  return (
    <div className={`${cardSurface} p-6`}>
      <h3 className="text-lg font-extrabold tracking-tight">Acciones rápidas</h3>
      <p className="text-sm text-muted-foreground mb-4">Las tareas más frecuentes del profesor</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.key}
            onClick={() => onSelect(qa.key)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-pulso-indigo/15 text-pulso-indigo-soft border border-pulso-indigo/32 font-bold text-sm hover:bg-pulso-indigo/26 transition-colors text-left"
          >
            {qa.icon}
            {qa.label}
          </button>
        ))}
      </div>
    </div>
  );
}