import { useMemo, useState } from 'react';
import { Plus, Pencil, Users, Trash2, Globe, EyeOff, Swords } from 'lucide-react';
import { useStore, formatDate, toggleEventPublic, deleteEvent, eventTypeBadge, eventTypeLabel, EVENT_FILTERS, type Event } from '../store';
import { useToast } from '../ui-kit';
import { ConfirmDialog } from '../ConfirmDialog';
import { EventFormModal } from './eventos/EventFormModal';
import { ParticipantsModal } from './eventos/ParticipantsModal';
import { FightsModal } from './eventos/FightsModal';
import { btnPrimary, cardSurface, iconBtnDanger } from '../classes';

export function Events() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const [filtro, setFiltro] = useState<string>('todos');
  const [form, setForm] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [partId, setPartId] = useState<string | null>(null);
  const [peleasId, setPeleasId] = useState<string | null>(null);
  const [confirmEvent, setConfirmEvent] = useState<Event | null>(null);

  const events = useMemo(
    () =>
      store.events
        .filter((e) => (filtro === 'todos' ? true : e.type === filtro))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [store, filtro]
  );

  const togglePublic = (e: Event) => {
    const res = toggleEventPublic(store, e.id);
    setStore(res.store);
    toast(res.error ? 'err' : 'ok', res.error || res.info || 'Estado actualizado.');
  };

  const handleDelete = (e: Event) => {
    const res = deleteEvent(store, e.id);
    setStore(res.store);
    setConfirmEvent(null);
    toast('info', `${e.name} eliminado.`);
  };

  const evtParticipants = partId ? store.events.find((e) => e.id === partId) : null;
  const evtFights = peleasId ? store.events.find((e) => e.id === peleasId) : null;

  return (
    <div className="space-y-6">
      {/* Header + filtros */}
      <div className="flex flex-col gap-4 flex-wrap md:flex-row md:items-center justify-between">
        <div className="inline-flex items-center gap-2 flex-wrap">
          {EVENT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                filtro === f.value
                  ? 'bg-pulso-indigo/20 border-pulso-indigo/50 text-white'
                  : 'border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setForm(null);
            setShowForm(true);
          }}
          className={btnPrimary}
        >
          <Plus className="w-4 h-4" />
          Nuevo evento
        </button>
      </div>

      {/* Cards */}
      {events.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((e) => (
            <div key={e.id} className={`${cardSurface} p-5 flex flex-col gap-3`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[.06em] border ${eventTypeBadge(e.type)}`}>
                  {eventTypeLabel(e.type)}
                </span>
                {e.public ? (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Público
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" /> Oculto
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-foreground leading-tight">{e.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{e.description || 'Sin descripción.'}</p>
              <div className="text-sm text-muted-foreground font-semibold">{formatDate(e.date)}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {e.participants.length} participante{e.participants.length === 1 ? '' : 's'}
                {e.type === 'competencia' && e.fights.length > 0 && ` · ${e.fights.length} pelea${e.fights.length === 1 ? '' : 's'}`}
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-pulso-line">
                {e.type === 'competencia' && (
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
                  title={e.public ? 'Ocultar' : 'Hacer público'}
                >
                  {e.public ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setConfirmEvent(e)}
                  className={iconBtnDanger}
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${cardSurface} p-10 text-center text-sm text-muted-foreground`}>
          No hay eventos de este tipo todavía.
        </div>
      )}

      <EventFormModal key={showForm ? form?.id ?? 'nuevo' : 'cerrado'} open={showForm} onClose={() => setShowForm(false)} edit={form} />
      <ParticipantsModal key={partId ?? 'ninguno'} event={evtParticipants ?? undefined} onClose={() => setPartId(null)} />
      <FightsModal key={peleasId ?? 'ninguno'} event={evtFights ?? undefined} onClose={() => setPeleasId(null)} />

      {/* Confirmar eliminar evento */}
      <ConfirmDialog
        open={!!confirmEvent}
        title="Eliminar evento"
        message={`¿Seguro que querés eliminar "${confirmEvent?.name}" con sus participantes y peleas? Esta acción no se puede deshacer.`}
        onConfirm={() => confirmEvent && handleDelete(confirmEvent)}
        onCancel={() => setConfirmEvent(null)}
      />
    </div>
  );
}
