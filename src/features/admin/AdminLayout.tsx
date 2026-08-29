import { useEffect, useState, createContext } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { LoginScreen } from './LoginScreen';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider, useToast } from './ui-kit';
import { useStore } from './store';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export type AdminView =
  | 'resumen'
  | 'alumnos'
  | 'cinturones'
  | 'cuotas'
  | 'asistencia'
  | 'eventos'
  | 'competencias'
  | 'horarios';

export const VIEW_TITLES: Record<AdminView, { title: string; sub: string }> = {
  resumen: { title: 'Resumen', sub: 'Estado del gimnasio hoy' },
  alumnos: { title: 'Alumnos', sub: 'Registro, planes y perfiles' },
  cinturones: { title: 'Cinturones', sub: 'Graduaciones y progreso' },
  cuotas: { title: 'Planes y cuotas', sub: 'Pagos mensuales y planes disponibles' },
  asistencia: { title: 'Asistencia', sub: 'Jornadas de entrenamiento' },
  eventos: { title: 'Eventos', sub: 'Competencias, exhibiciones y talleres' },
  competencias: { title: 'Competencias', sub: 'Historial competitivo de los alumnos' },
  horarios: { title: 'Horarios', sub: 'Grilla que se publica en la landing' },
};

export function getCurrentView(pathname: string): AdminView | null {
  if (pathname === '/admin' || pathname === '/admin/') return 'resumen';
  const segment = pathname.split('/admin/')[1];
  if (segment && segment in VIEW_TITLES) return segment as AdminView;
  return null;
}

interface AdminContextType {
  currentView: AdminView;
  user: { nombre: string; apellido: string; rol: string } | null;
  logout: () => void;
}

export const AdminContext = createContext<AdminContextType>({
  currentView: 'resumen',
  user: null,
  logout: () => {},
});

function PersistErrorNotifier() {
  const { persistError, clearPersistError } = useStore();
  const toast = useToast();

  useEffect(() => {
    if (persistError) {
      toast('err', 'No se pudieron guardar los cambios en este dispositivo.');
      clearPersistError();
    }
  }, [persistError, toast, clearPersistError]);

  return null;
}

export function AdminLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentView = getCurrentView(location.pathname);

  const user = isLoggedIn
    ? { nombre: 'Daniel', apellido: 'Portillo', rol: 'Profesor' }
    : null;

  const logout = () => {
    setIsLoggedIn(false);
    navigate('/admin');
  };

  return (
    <ToastProvider>
      <PersistErrorNotifier />
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <AdminContext.Provider
          value={{
            currentView: currentView ?? 'resumen',
            user,
            logout,
          }}
        >
          <div className="min-h-screen bg-background flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
              <Topbar onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 p-6 overflow-auto">
                {currentView === null ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <ErrorBoundary>
                    <Outlet />
                  </ErrorBoundary>
                )}
              </main>
            </div>
          </div>
        </AdminContext.Provider>
      )}
    </ToastProvider>
  );
}