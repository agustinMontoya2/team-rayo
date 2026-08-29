import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore, fullName, fmtDate, fmtNum, agregarPelea, setPeleaResultado, quitarPelea, type Evento, type PeleaResultado } from '../../store';
import { useToast, Avatar } from '../../ui-kit';
import { Modal } from '../../Modal';
import { inputCls, selectCls } from './fields';

export function PeleasModal({ evento, onClose }: { evento: Evento | undefined; onClose: () => void }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [rival, setRival] = useState('');
  const [pesoRival, setPesoRival] = useState('');
  const [alumnoId, setAlumnoId] = useState(() => (evento && evento.participantes[0] ? evento.participantes[0].alumnoId : ''));

  if (!evento) return null;

  const agregar = () => {
    const res = agregarPelea(store, evento.id, { alumnoId, rival, pesoRival });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    setRival('');
    setPesoRival('');
    toast('ok', 'Pelea cargada.');
  };

  const setResultado = (peleaId: string, resultado: PeleaResultado) => {
    const res = setPeleaResultado(store, evento.id, peleaId, resultado);
    setStore(res.store);
    toast('ok', res.info || 'Resultado actualizado.');
  };

  const borrarPelea = (peleaId: string) => {
    const res = quitarPelea(store, evento.id, peleaId);
    setStore(res.store);
    toast('info', 'Pelea eliminada.');
  };

  const resultadoColor: Record<string, string> = {
    pendiente: 'border-pulso-line text-muted-foreground',
    victoria: 'border-green-500/40 text-green-400',
    derrota: 'border-pulso-red/40 text-pulso-red',
  };

  return (
    <Modal
      open={!!evento}
      onClose={onClose}
      title={`Peleas · ${evento.nombre}`}
      sub={fmtDate(evento.fecha)}
      wide
      footer={
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors">
          Listo
        </button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
        <select className={selectCls + ' flex-1 min-w-0'} value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
          {evento.participantes.length ? (
            evento.participantes.map((p) => {
              const a = store.alumnos.find((x) => x.id === p.alumnoId);
              return (
                <option key={p.alumnoId} value={p.alumnoId}>
                  {a ? fullName(a) : 'Alumno eliminado'}
                </option>
              );
            })
          ) : (
            <option value="">Sin participantes</option>
          )}
        </select>
        <div className="flex gap-2 flex-1 min-w-0">
          <input className={inputCls + ' flex-1 min-w-0'} placeholder="Rival" value={rival} onChange={(e) => setRival(e.target.value)} />
          <input
            className="w-[92px] shrink-0 px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm"
            placeholder="Kg (opc.)"
            type="number"
            value={pesoRival}
            onChange={(e) => setPesoRival(e.target.value)}
          />
        </div>
        <button onClick={agregar} disabled={!evento.participantes.length} className="px-4 py-3 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:hover:bg-pulso-red disabled:hover:text-primary-foreground">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {evento.peleas.length ? (
        <ul className="space-y-2 max-h-[45vh] overflow-y-auto overflow-x-hidden">
          {evento.peleas.map((f) => {
            const a = store.alumnos.find((x) => x.id === f.alumnoId);
            return (
              <li key={f.id} className="flex items-center gap-3 py-2 px-3 rounded-xl border border-pulso-line-strong flex-wrap">
                <Avatar alumno={a} />
                <div className="flex-1 min-w-[140px]">
                  <div className="text-sm text-foreground font-medium">{a ? fullName(a) : 'Alumno eliminado'}</div>
                  <div className="text-xs text-muted-foreground">vs {f.rival}{f.pesoRival != null ? ` · ${fmtNum(f.pesoRival)} kg` : ''}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['pendiente', 'victoria', 'derrota'] as PeleaResultado[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResultado(f.id, r)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-[.06em] transition-colors ${f.resultado === r ? resultadoColor[r] : 'border-pulso-line text-muted-foreground/60 hover:text-foreground'}`}
                    >
                      {r === 'pendiente' ? 'Pend.' : r === 'victoria' ? 'Ganó' : 'Perdió'}
                    </button>
                  ))}
                  <button onClick={() => borrarPelea(f.id)} className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card flex items-center justify-center transition-colors" title="Eliminar pelea">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">Todavía no cargaste peleas.</p>
      )}
    </Modal>
  );
}