import { NavLink } from 'react-router';
import { useContext } from 'react';
import { AdminContext } from './AdminLayout';
import { LayoutDashboard, Users, Award, CalendarCheck, Trophy, BadgeCheck, Clock, LogOut, ArrowLeft } from 'lucide-react';
import logoImg from '/assets/logo.webp';

const NAV_GROUPS = [
  {
    label: 'Operación',
    items: [
      { id: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
      { id: 'alumnos', label: 'Alumnos', icon: <Users className="w-5 h-5" />, path: '/admin/alumnos' },
      { id: 'asistencia', label: 'Asistencia', icon: <CalendarCheck className="w-5 h-5" />, path: '/admin/asistencia' },
    ],
  },
  {
    label: 'Deporte',
    items: [
      { id: 'cinturones', label: 'Cinturones', icon: <Award className="w-5 h-5" />, path: '/admin/cinturones' },
      { id: 'eventos', label: 'Eventos', icon: <Trophy className="w-5 h-5" />, path: '/admin/eventos' },
      { id: 'competencias', label: 'Competencias', icon: <BadgeCheck className="w-5 h-5" />, path: '/admin/competencias' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { id: 'cuotas', label: 'Planes y cuotas', icon: <Users className="w-5 h-5" />, path: '/admin/cuotas' },
      { id: 'horarios', label: 'Horarios', icon: <Clock className="w-5 h-5" />, path: '/admin/horarios' },
    ],
  },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useContext(AdminContext);

  return (
    <aside
      className={`
        fixed top-0 left-0 bottom-0 w-[260px] bg-sidebar border-r border-pulso-line z-50 flex flex-col
        transition-transform duration-200
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Brand */}
      <div className="p-5 border-b border-pulso-line">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Team Rayo" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <div className="text-foreground font-extrabold tracking-tight text-sm">Team Rayo</div>
            <div className="font-mono text-pulso-indigo uppercase text-[10px] tracking-[.16em]">PANEL DEL PROFESOR</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2 last:mb-0">
            <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.id === 'resumen'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[46px] no-underline
                    ${isActive
                      ? 'bg-pulso-indigo/16 text-white shadow-[inset_0_0_0_1px_rgba(139,147,255,.35)]'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? 'text-pulso-indigo-soft' : ''}>{item.icon}</span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-pulso-line space-y-1">
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la landing
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
