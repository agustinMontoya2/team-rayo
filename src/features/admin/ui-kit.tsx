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
  fullName,
  type Alumno,
} from './store';

const AV_COLORS = ['#22288A', '#6d28d9', '#9a3412', '#155e75', '#166534'];

export function avColor(nombre: string) {
  let s = 0;
  for (let i = 0; i < nombre.length; i++) s += nombre.charCodeAt(i);
  return AV_COLORS[s % AV_COLORS.length];
}

export function avatarText(nombre: string) {
  const w = String(nombre || '').trim().split(/\s+/).filter((x) => x.length > 1);
  return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
}

export function Avatar({ alumno, size }: { alumno?: Alumno | null; size?: 'sm' | 'md' | 'lg' }) {
  const cls =
    size === 'lg' ? 'w-16 h-16 text-lg' : size === 'md' ? 'w-10 h-10 text-xs' : 'w-9 h-9 text-xs';
  if (alumno && alumno.fotoCompetencia) {
    return (
      <span className={`${cls} rounded-[10px] overflow-hidden flex-shrink-0`}>
        <img src={alumno.fotoCompetencia} alt={fullName(alumno)} className="w-full h-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className={`${cls} rounded-[10px] font-extrabold flex items-center justify-center text-white flex-shrink-0`}
      style={{ background: avColor(fullName(alumno)) }}
    >
      {avatarText(fullName(alumno))}
    </span>
  );
}

export function BeltBadge({ belt }: { belt: string }) {
  const color = BELT_COLORS[belt] || '#e2e8f0';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pulso-badge text-muted-foreground">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {belt || 'Sin graduaciÃ³n'}
    </span>
  );
}

export function PlanBadge({ tipo }: { tipo?: string }) {
  const comp = tipo === 'competitivo';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
        comp ? 'bg-pulso-red/16 text-pulso-red' : 'bg-pulso-indigo/17 text-pulso-indigo-soft'
      }`}
    >
      {comp ? 'Competitivo' : 'Recreativo'}
    </span>
  );
}

export function EstadoPill({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        activo ? 'bg-green-500/17 text-green-400' : 'bg-pulso-red/16 text-pulso-red'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-green-400' : 'bg-pulso-red'}`} />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export function Empty({ msg }: { msg: string }) {
  return (
    <div className="bg-card rounded-2xl border border-pulso-line p-10 flex flex-col items-center justify-center text-center gap-2">
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

export function tipoEventoLabel(t: string) {
  return { competencia: 'Competencia', exhibicion: 'ExhibiciÃ³n', taller: 'Taller' }[t] || t;
}
