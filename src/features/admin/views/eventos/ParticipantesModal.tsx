import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore, fullName, fmtDate, fmtNum, agregarParticipante, quitarParticipante, type Evento } from '../../store';
import { useToast, Avatar } from '../../ui-kit';
import { Modal } from '../../Modal';
import { selectCls } from './fields';

export function ParticipantesModal({ evento, onClose }: { evento: Evento | undefined; onClose: () => void }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [nuevAlumno, setNuevAlumno] = useState('');
  const [peso, setPeso] = useState('');

  if (!evento) return null;

  const agregar = () => {
    const res = agregarParticipante(store, evento.id, { alumnoId: nuevAlumno, pesoCompetencia: peso });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setNuevAlumno('');
    setPeso('');
    toast('ok', res.info || 'Participante agregado.');
  };

  const quitar = (alumnoId: string) => {
    const res = quitarParticipante(store, evento.id, alumnoId);
    setStore(res.store);
    toast('info', res.info || 'Participante quitado.');
  };

  const disponibles = store.alumnos.filter((a) => a.activo && !evento.participantes.some((p) => p.alumnoId === a.id));

  return (
    <Modal
      open={!!evento}
      onClose={onClose}
      title={`Participantes · ${evento.nombre}`}
      sub={fmtDate(evento.fecha)}
      wide
      footer={
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
          Listo
        </button>
      }
    >
      <div className="space-y-3 mb-4">
        {evento.tipo === 'competencia' ? (
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{evento.participantes.length} participantes</span>. El peso de competencia se guarda por evento.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{evento.participantes.length} participantes</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <select className={selectCls + ' flex-1 min-w-0'} value={nuevAlumno} onChange={(e) => setNuevAlumno(e.target.value)}>
            <option value="">Agregar alumno…</option>
            {disponibles.map((a) => (
              <option key={a.id} value={a.id}>
                {fullName(a)}
              </option>
            ))}
          </select>
          {evento.tipo === 'competencia' && (
            <input
              className="w-[120px] shrink-0 px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm"
              placeholder="Peso en kg"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          )}
          <button onClick={agregar} disabled={!nuevAlumno} className="px-4 py-3 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:hover:bg-pulso-red disabled:hover:text-primary-foreground">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {evento.participantes.length ? (
        <ul className="space-y-2 max-h-[45vh] overflow-y-auto overflow-x-hidden">
          {evento.participantes.map((p) => {
            const a = store.alumnos.find((x) => x.id === p.alumnoId);
            return (
              <li key={p.alumnoId} className="flex items-center gap-3 py-2 px-3 rounded-xl border border-pulso-line-strong">
                <Avatar alumno={a} />
                <div className="flex-1">
                  <div className="text-sm text-foreground font-medium">{a ? fullName(a) : 'Alumno eliminado'}</div>
                  {evento.tipo === 'competencia' && (
                    <div className="text-xs text-muted-foreground">Peso de competencia: {p.pesoCompetencia != null ? fmtNum(p.pesoCompetencia) + ' kg' : 'sin definir'}</div>
                  )}
                </div>
                <button onClick={() => quitar(p.alumnoId)} className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card flex items-center justify-center transition-colors" title="Quitar">
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">Todavía no hay participantes.</p>
      )}
    </Modal>
  );
}