import { supabase } from '../lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole =
  | 'AdminGeral'
  | 'Administrativo'
  | 'Producao'
  | 'Vendas'
  | 'Financeiro'
  | 'Conteudo';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
}

export const login = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const getUserProfile = async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || '',
      role: data?.role || 'Vendas', // Default to 'Vendas' if no profile found
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { // Return a default user object on error to avoid breaking the app
        uid: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'Vendas'
    };
  }
};

export const listenAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user);
        callback(profile);
      } else {
        callback(null);
      }
    }
  );

  // Return the unsubscribe function
  return () => subscription?.unsubscribe();
};
