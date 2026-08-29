import { useMemo, useState } from 'react';
import { Plus, Pencil, Users, Trash2, Globe, EyeOff, Swords, X, Check } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { useStore, fullName, fmtDate, hoy, fmtNum, toggleEventoPublico, eliminarEvento, crearActualizarEvento, agregarParticipante, quitarParticipante, agregarPelea, setPeleaResultado, quitarPelea, type Evento, type TipoEvento, type PeleaResultado } from '../store';
import { useToast, Avatar, tipoEventoLabel } from '../ui-kit';
import { Modal } from '../Modal';

const inputCls =
  'w-full px-4 py-3 bg-pulso-input border border-pulso-line rounded-xl text-foreground focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 transition-colors text-sm';
const selectCls = inputCls + ' appearance-none';

const tipoBtn: Record<string, string> = {
  competencia: 'bg-pulso-indigo/16 text-pulso-indigo-soft border-pulso-indigo/32',
  exhibicion: 'bg-pulso-red/16 text-pulso-red border-pulso-red/32',
  taller: 'bg-amber-500/14 text-amber-400 border-amber-500/30',
};

export function Eventos() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [filtro, setFiltro] = useState<string>('todos');
  const [form, setForm] = useState<Evento | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [partId, setPartId] = useState<string | null>(null);
  const [peleasId, setPeleasId] = useState<string | null>(null);

  const eventos = useMemo(
    () =>
      store.eventos
        .filter((e) => (filtro === 'todos' ? true : e.tipo === filtro))
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [store, filtro]
  );

  const togglePublic = (e: Evento) => {
    const res = toggleEventoPublico(store, e.id);
    setStore(res.store);
    toast(res.error ? 'err' : 'ok', res.error || res.info || 'Estado actualizado.');
  };

  const eliminar = (e: Evento) => {
    const res = eliminarEvento(store, e.id);
    setStore(res.store);
    toast('info', `${e.nombre} eliminado.`);
  };

  const evtPart = partId ? store.eventos.find((e) => e.id === partId) : null;
  const evtPeleas = peleasId ? store.eventos.find((e) => e.id === peleasId) : null;

  return (
    <div className="space-y-6">
      {/* Header + filtros */}
      <div className="flex flex-col gap-4 flex-wrap md:flex-row md:items-center justify-between">
        <div className="inline-flex items-center gap-2 flex-wrap">
          {['todos', 'competencia', 'exhibicion', 'taller'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                filtro === f
                  ? 'bg-pulso-indigo/20 border-pulso-indigo/50 text-white'
                  : 'border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'competencia' ? 'Competencias' : f === 'exhibicion' ? 'Exhibiciones' : 'Talleres'}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setForm(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo evento
        </button>
      </div>

      {/* Cards */}
      {eventos.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventos.map((e) => (
            <div key={e.id} className="bg-card rounded-2xl border border-pulso-line p-5 shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[.06em] border ${tipoBtn[e.tipo] || ''}`}>
                  {tipoEventoLabel(e.tipo)}
                </span>
                {e.publico ? (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> PÃºblico
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" /> Oculto
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-foreground leading-tight">{e.nombre}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{e.descripcion || 'Sin descripciÃ³n.'}</p>
              <div className="text-sm text-muted-foreground font-semibold">{fmtDate(e.fecha)}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {e.participantes.length} participante{e.participantes.length === 1 ? '' : 's'}
                {e.tipo === 'competencia' && e.peleas.length > 0 && ` Â· ${e.peleas.length} pelea${e.peleas.length === 1 ? '' : 's'}`}
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-pulso-line">
                {e.tipo === 'competencia' && (
                  <button
                    onClick={() => setPeleasId(e.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-pulso-indigo/32 text-pulso-indigo-soft text-xs font-bold hover:bg-pulso-indigo/16 transition-colors"
                  >
                    <Swords className="w-3.5 h-3.5" /> Peleas
                  </button>
                )}
                <button
                  onClick={() => setPartId(e.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-pulso-line text-foreground text-xs font-bold hover:bg-pulso-surface2 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" /> Participantes
                </button>
                <button
                  onClick={() => {
                    setForm(e);
                    setShowForm(true);
                  }}
                  className="w-9 h-9 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePublic(e)}
                  className="w-9 h-9 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-indigo hover:bg-card flex items-center justify-center transition-colors"
                  title={e.publico ? 'Ocultar' : 'Hacer pÃºblico'}
                >
                  {e.publico ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => eliminar(e)}
                  className="w-9 h-9 rounded-lg border border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card flex items-center justify-center transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-pulso-line p-10 text-center text-sm text-muted-foreground">
          No hay eventos de este tipo todavÃ­a.
        </div>
      )}

      <EventoFormModal key={showForm ? form?.id ?? 'nuevo' : 'cerrado'} open={showForm} onClose={() => setShowForm(false)} edit={form} />
      <ParticipantesModal key={partId ?? 'ninguno'} evento={evtPart ?? undefined} onClose={() => setPartId(null)} />
      <PeleasModal key={peleasId ?? 'ninguno'} evento={evtPeleas ?? undefined} onClose={() => setPeleasId(null)} />
    </div>
  );
}

export function EventoFormModal({ open, onClose, edit }: { open: boolean; onClose: () => void; edit: Evento | null }) {
  const { store, setStore } = useStore();
  const toast = useToast();
  const [nombre, setNombre] = useState(edit ? edit.nombre : '');
  const [tipo, setTipo] = useState<TipoEvento>(edit ? edit.tipo : 'competencia');
  const [fecha, setFecha] = useState(edit ? edit.fecha : hoy());
  const [descripcion, setDescripcion] = useState(edit ? edit.descripcion : '');
  const [publico, setPublico] = useState(edit ? edit.publico : true);

  const guardar = () => {
    const res = crearActualizarEvento(store, { id: edit?.id, nombre, tipo, fecha, descripcion, publico });
    if (res.error) {
      toast('err', res.error);
      return;
    }
    setStore(res.store);
    toast('ok', res.info || 'Evento guardado.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? 'Editar evento' : 'Nuevo evento'}
      sub="Nombre, tipo, fecha y visibilidad."
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-pulso-line text-sm font-semibold text-foreground hover:bg-card transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} className="px-4 py-2.5 rounded-xl bg-pulso-red text-primary-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> {edit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre <span className="text-pulso-red">*</span>
          </label>
          <input className={inputCls} placeholder="Ej.: Copa Nacional" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tipo <span className="text-pulso-red">*</span>
            </label>
            <select className={selectCls} value={tipo} onChange={(e) => setTipo(e.target.value as TipoEvento)}>
              <option value="competencia">Competencia</option>
              <option value="exhibicion">ExhibiciÃ³n</option>
              <option value="taller">Taller / Examen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha <span className="text-pulso-red">*</span>
            </label>
            <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">DescripciÃ³n</label>
          <textarea rows={3} className={inputCls} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 rounded-xl border border-pulso-line">
          <span className="text-sm text-foreground font-medium">Evento pÃºblico</span>
          <Switch
            checked={publico}
            onCheckedChange={setPublico}
            className="data-[state=checked]:bg-pulso-indigo data-[state=unchecked]:bg-pulso-switch-off data-[state=unchecked]:border-pulso-switch-off"
          />
        </label>
      </div>
    </Modal>
  );
}

function ParticipantesModal({ evento, onClose }: { evento: Evento | undefined; onClose: () => void }) {
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
      title={`Participantes Â· ${evento.nombre}`}
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
            <option value="">Agregar alumnoâ€¦</option>
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
        <p className="text-sm text-muted-foreground text-center py-6">TodavÃ­a no hay participantes.</p>
      )}
    </Modal>
  );
}

function PeleasModal({ evento, onClose }: { evento: Evento | undefined; onClose: () => void }) {
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
      title={`Peleas Â· ${evento.nombre}`}
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
                  <div className="text-xs text-muted-foreground">vs {f.rival}{f.pesoRival != null ? ` Â· ${fmtNum(f.pesoRival)} kg` : ''}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['pendiente', 'victoria', 'derrota'] as PeleaResultado[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResultado(f.id, r)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-[.06em] transition-colors ${f.resultado === r ? resultadoColor[r] : 'border-pulso-line text-muted-foreground/60 hover:text-foreground'}`}
                    >
                      {r === 'pendiente' ? 'Pend.' : r === 'victoria' ? 'GanÃ³' : 'PerdiÃ³'}
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
        <p className="text-sm text-muted-foreground text-center py-6">TodavÃ­a no cargaste peleas.</p>
      )}
    </Modal>
  );
}