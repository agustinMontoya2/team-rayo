import { useContext } from 'react';
import { useLocation } from 'react-router';
import { AdminContext, getCurrentView, VIEW_TITLES } from './AdminLayout';
import { Menu, LogOut } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useContext(AdminContext);
  const location = useLocation();

  const viewInfo = VIEW_TITLES[getCurrentView(location.pathname) ?? 'resumen'];

  return (
    <header className="h-[70px] bg-pulso-glass backdrop-blur-[14px] border-b border-pulso-line flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl border border-pulso-line bg-surface text-foreground flex items-center justify-center flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight truncate">{viewInfo.title}</h1>
          <p className="font-mono text-pulso-red uppercase text-[11px] tracking-[.16em] truncate">{viewInfo.sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2 bg-surface px-3 py-2 rounded-xl">
            <span className="w-8 h-8 rounded-[10px] bg-pulso-indigo/20 text-pulso-indigo-soft font-extrabold text-xs flex items-center justify-center">
              {user.firstName[0]}{user.lastName[0]}
            </span>
            <span className="text-sm text-foreground font-medium">{user.firstName} {user.lastName} · {user.role}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-pulso-line text-sm font-medium text-foreground hover:bg-card transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
