import { useMemo, useState, type KeyboardEvent } from 'react';
import { Search, Plus, X, Eye, Pencil } from 'lucide-react';
import { useStore, fullName, planDe, currentBelt, fmtDate, fmtNum, toggleAlumnoActivo, type Alumno } from '../store';
import { useToast, Avatar, BeltBadge, EstadoPill } from '../ui-kit';
import { AlumnoFormModal } from './AlumnoFormModal';
import { AlumnoPerfilDrawer } from './AlumnoPerfilDrawer';

type Filtro = 'todos' | 'activos' | 'inactivos';

export function Alumnos() {
  const { store, setStore } = useStore();
  const toast = useToast();

  const onRowKey = (e: KeyboardEvent<HTMLTableRowElement>, a: Alumno) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setPerfilId(a.id);
    }
  };

  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Alumno | null>(null);
  const [perfilId, setPerfilId] = useState<string | null>(null);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return store.alumnos.filter((a) => {
      if (filtro === 'activos' && !a.activo) return false;
      if (filtro === 'inactivos' && a.activo) return false;
      if (!query) return true;
      const p = planDe(store, a.id);
      return (fullName(a) + ' ' + a.dni + ' ' + (p ? p.nombre : '')).toLowerCase().includes(query);
    });
  }, [store, q, filtro]);

  const toggleAlumno = (a: Alumno) => {
    const res = toggleAlumnoActivo(store, a.id);
    setStore(res.store);
    toast(res.store.alumnos.find((x) => x.id === a.id)?.activo ? 'ok' : 'info', res.info || 'Estado actualizado.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Alumnos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {list.length} de {store.alumnos.length} alumnos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o DNIâ€¦"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-pulso-line rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-pulso-indigo focus:ring-2 focus:ring-pulso-indigo/20 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['todos', 'activos', 'inactivos'] as Filtro[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  filtro === f
                    ? 'bg-pulso-indigo/20 border-pulso-indigo/50 text-white'
                    : 'border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                {f === 'todos' ? 'Todos' : f === 'activos' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-pulso-red text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo alumno
          </button>
        </div>
      </div>

      {/* Table */}
      {list.length ? (
        <div className="bg-card rounded-2xl border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pulso-line">
                  {['Alumno', 'DNI', 'CinturÃ³n', 'Ingreso', 'Peso', 'Estado', ''].map((h) => (
                    <th key={h} className={`font-mono text-muted-foreground text-[11px] tracking-[.14em] uppercase text-left px-6 py-4 ${h === '' ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const p = planDe(store, a.id);
                  const belt = currentBelt(store, a.id);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-pulso-line last:border-0 hover:bg-pulso-surface2 transition-colors cursor-pointer"
                      tabIndex={0}
                      role="link"
                      aria-label={`Ver perfil de ${fullName(a)}`}
                      onClick={() => setPerfilId(a.id)}
                      onKeyDown={(e) => onRowKey(e, a)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar alumno={a} />
                          <div>
                            <div className="text-foreground font-semibold">{fullName(a)}</div>
                            <div className="text-xs text-muted-foreground">{p ? p.nombre : 'Sin plan'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{a.dni}</td>
                      <td className="px-6 py-4">
                        <BeltBadge belt={belt} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{fmtDate(a.fechaIngreso)}</td>
                      <td className="px-6 py-4 text-foreground font-mono">
                        {a.pesoActual != null ? `${fmtNum(a.pesoActual)} kg` : 'â€”'}
                      </td>
                      <td className="px-6 py-4">
                        <EstadoPill activo={a.activo} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPerfilId(a.id);
                            }}
                            className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                            title="Ver perfil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditing(a);
                              setFormOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg border border-pulso-line text-muted-foreground hover:text-foreground hover:bg-card flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAlumno(a);
                            }}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${a.activo ? 'border-pulso-line text-muted-foreground hover:text-pulso-red hover:bg-card' : 'border-pulso-red/40 text-pulso-red hover:bg-card'}`}
                            title={a.activo ? 'Desactivar' : 'Reactivar'}
                          >
                            {a.activo ? <X className="w-4 h-4" /> : <span className="text-sm font-bold">â†º</span>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-pulso-line p-10 text-center text-sm text-muted-foreground">
          No encontramos alumnos con ese criterio.
        </div>
      )}

      <AlumnoFormModal key={formOpen ? editing?.id ?? 'nuevo' : 'cerrado'} open={formOpen} onClose={() => setFormOpen(false)} edit={editing} />
      <AlumnoPerfilDrawer alumnoId={perfilId} onClose={() => setPerfilId(null)} onToggle={toggleAlumno} />
    </div>
  );
}