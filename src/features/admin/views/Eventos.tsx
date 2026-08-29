import { useMemo, useState } from 'react';
import { Plus, Pencil, Users, Trash2, Globe, EyeOff, Swords } from 'lucide-react';
import { useStore, fmtDate, toggleEventoPublico, eliminarEvento, type Evento } from '../store';
import { useToast, tipoEventoLabel } from '../ui-kit';
import { EventoFormModal } from './eventos/EventoFormModal';
import { ParticipantesModal } from './eventos/ParticipantesModal';
import { PeleasModal } from './eventos/PeleasModal';
import { tipoBtn } from './eventos/fields';

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
                    <Globe className="w-3.5 h-3.5" /> Público
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" /> Oculto
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-foreground leading-tight">{e.nombre}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{e.descripcion || 'Sin descripción.'}</p>
              <div className="text-sm text-muted-foreground font-semibold">{fmtDate(e.fecha)}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {e.participantes.length} participante{e.participantes.length === 1 ? '' : 's'}
                {e.tipo === 'competencia' && e.peleas.length > 0 && ` · ${e.peleas.length} pelea${e.peleas.length === 1 ? '' : 's'}`}
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
                  title={e.publico ? 'Ocultar' : 'Hacer público'}
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
          No hay eventos de este tipo todavía.
        </div>
      )}

      <EventoFormModal key={showForm ? form?.id ?? 'nuevo' : 'cerrado'} open={showForm} onClose={() => setShowForm(false)} edit={form} />
      <ParticipantesModal key={partId ?? 'ninguno'} evento={evtPart ?? undefined} onClose={() => setPartId(null)} />
      <PeleasModal key={peleasId ?? 'ninguno'} evento={evtPeleas ?? undefined} onClose={() => setPeleasId(null)} />
    </div>
  );
}