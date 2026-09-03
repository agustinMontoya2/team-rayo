import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { Check, AlertTriangle, Info } from 'lucide-react';
import {
  BELT_COLORS,
  PLAN_TYPES,
  fullName,
  type Student,
  type BeltType,
  type PlanType,
} from './store';
import { cardSurface } from './classes';

export { eventTypeLabel } from './domain/catalog';

const AV_COLORS = ['#22288A', '#6d28d9', '#9a3412', '#155e75', '#166534'];

export function avColor(name: string) {
  let s = 0;
  for (let i = 0; i < name.length; i++) s += name.charCodeAt(i);
  return AV_COLORS[s % AV_COLORS.length];
}

export function avatarText(name: string) {
  const w = String(name || '').trim().split(/\s+/).filter((x) => x.length > 1);
  return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
}

export function Avatar({ student, size }: { student?: Student | null; size?: 'sm' | 'md' | 'lg' }) {
  const cls =
    size === 'lg' ? 'w-16 h-16 text-lg' : size === 'md' ? 'w-10 h-10 text-xs' : 'w-9 h-9 text-xs';
  if (student && student.competitionPhoto) {
    return (
      <span className={`${cls} rounded-[10px] overflow-hidden flex-shrink-0`}>
        <img src={student.competitionPhoto} alt={fullName(student)} className="w-full h-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className={`${cls} rounded-[10px] font-extrabold flex items-center justify-center text-white flex-shrink-0`}
      style={{ background: avColor(fullName(student)) }}
    >
      {avatarText(fullName(student))}
    </span>
  );
}

export function BeltBadge({ belt }: { belt: BeltType }) {
  const color = BELT_COLORS[belt] || '#e2e8f0';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {belt || 'Sin graduación'}
    </span>
  );
}

export function PlanBadge({ type }: { type?: PlanType }) {
  const isComp = type === PLAN_TYPES.competitivo.value;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
        isComp ? 'bg-pulso-red/16 text-pulso-red' : 'bg-pulso-indigo/17 text-pulso-indigo-soft'
      }`}
    >
      {type ? PLAN_TYPES[type].label : PLAN_TYPES.recreativo.label}
    </span>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        active ? 'bg-green-500/17 text-green-400' : 'bg-pulso-red/16 text-pulso-red'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-pulso-red'}`} />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export function Empty({ msg }: { msg: string }) {
  return (
    <div className={`${cardSurface} p-10 flex flex-col items-center justify-center text-center gap-2`}>
      <Info className="w-6 h-6 text-pulso-border" />
      <p className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}

/* ---------- Toasts ---------- */
type ToastType = 'ok' | 'err' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  msg: string;
}

const ToastCtx = createContext<(type: ToastType, msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((type: ToastType, msg: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(420px,calc(100vw-24px))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm text-foreground bg-[#171C29] shadow-[0_24px_55px_-22px_rgba(0,0,0,.6)] ${
              t.type === 'ok'
                ? 'border-green-500/45'
                : t.type === 'err'
                ? 'border-pulso-red/50'
                : 'border-pulso-indigo/40'
            }`}
          >
            {t.type === 'ok' && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
            {t.type === 'err' && <AlertTriangle className="w-4 h-4 text-pulso-red flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-pulso-indigo-soft flex-shrink-0" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
