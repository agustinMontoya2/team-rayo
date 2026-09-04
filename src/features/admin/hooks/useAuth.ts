import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

export interface AuthProfessor {
  id: string;
  name: string;
  email: string;
  gymId: string;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function fetchProfessor(professorId: string): Promise<AuthProfessor | null> {
  const { data } = await supabase
    .from('professors')
    .select('id, name, email, gym_id')
    .eq('id', professorId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    gymId: data.gym_id,
  };
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => cb(session));
  return () => data.subscription.unsubscribe();
}
