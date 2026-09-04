import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchProfessor, getCurrentSession, onAuthChange, signIn, signOut, type AuthProfessor } from '../hooks/useAuth';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  professor: AuthProfessor | null;
  gymId: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [professor, setProfessor] = useState<AuthProfessor | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentSession().then((current) => {
      if (!active) return;
      setSession(current);
      if (current) {
        fetchProfessor(current.user.id).then((p) => {
          if (active) setProfessor(p);
        });
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((next) => {
      setSession(next);
      if (next) {
        fetchProfessor(next.user.id).then((p) => setProfessor(p));
      } else {
        setProfessor(null);
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return signIn(email.trim(), password);
  }, []);

  const logout = useCallback(async () => {
    await signOut();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      loading,
      professor,
      gymId: professor?.gymId ?? null,
      login,
      logout,
    }),
    [session, loading, professor, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return ctx;
}
