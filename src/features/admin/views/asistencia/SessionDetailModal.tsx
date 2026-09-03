import { Check, X } from 'lucide-react';
import { useStore, fullName, formatDate, absencesFrom, type Session, type Student } from '../../store';
import { Modal } from '../../Modal';

export function SessionDetailModal({ session, onClose }: { session: Session | undefined; onClose: () => void }) {
  const { store } = useStore();
  if (!session) return null;
  const pres = session.present
    .map((id) => store.students.find((a) => a.id === id))
    .filter((a): a is Student => a !== undefined);
  const aus = absencesFrom(store, session);

  return (
    <Modal
      open={!!session}
      onClose={onClose}
      title="Detalle de jornada"
      sub={formatDate(session.date)}
      wide
      footer={
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
          Listo
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs font-bold text-green-400 uppercase tracking-[.08em] mb-3">Presentes ({pres.length})</h3>
          <ul className="space-y-2">
            {pres.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-pulso-line-strong">
                <span className="w-5 h-5 rounded-full bg-green-500/17 text-green-400 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-sm text-foreground">{fullName(a)}</span>
              </li>
            ))}
            {!pres.length && <p className="text-xs text-muted-foreground">Sin presentes.</p>}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold text-pulso-red uppercase tracking-[.08em] mb-3">Ausentes ({aus.length})</h3>
          <ul className="space-y-2">
            {aus.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-pulso-line-strong">
                <span className="w-5 h-5 rounded-full bg-pulso-red/16 text-pulso-red flex items-center justify-center">
                  <X className="w-3 h-3" />
                </span>
                <span className="text-sm text-foreground">{fullName(a)}</span>
              </li>
            ))}
            {!aus.length && <p className="text-xs text-muted-foreground">Sin ausencias.</p>}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
