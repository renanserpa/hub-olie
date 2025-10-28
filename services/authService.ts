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

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    if (loginError.message.includes('Invalid login credentials')) {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    throw new Error(loginError.message);
  }
  
  if (!loginData.user) {
    throw new Error('Falha no login, usuário não encontrado.');
  }

  // After successful login, fetch the user's role. RLS will enforce security.
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', loginData.user.id)
    .single();

  // If there's an error or no role is found, sign the user out immediately.
  if (roleError || !roleData) {
    await supabase.auth.signOut();
    console.error("Error fetching user role or role not found:", roleError);
    throw new Error("Sem permissão: seu usuário não tem um papel de acesso definido. Contate o administrador.");
  }

  return {
    uid: loginData.user.id,
    email: loginData.user.email || '',
    role: roleData.role as UserRole,
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    if (sessionError) console.error("Error getting session:", sessionError);
    return null;
  }
  
  const user = session.user;
  
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (roleError || !roleData) {
     if (roleError.code !== 'PGRST116') { // Ignore 'exact one row' error for not found
        console.error("Error fetching role for current user:", roleError);
     }
     // Don't sign out here, let the auth listener handle it to avoid loops
     return null;
  }

  return {
    uid: user.id,
    email: user.email || '',
    role: roleData.role as UserRole,
  };
};

export const listenAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getCurrentUser();
        callback(profile);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    }
  );

  return () => subscription?.unsubscribe();
};
