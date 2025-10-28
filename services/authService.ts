import { supabase } from '../lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '../hooks/use-toast';

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
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    if (error.message.includes('Email not confirmed')) {
        throw new Error('E-mail não confirmado. Por favor, verifique sua caixa de entrada.');
    }
    throw new Error(error.message);
  }
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const getUserProfile = async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    // Query the public.user_roles table to get the user's role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id)
      .single();

    if (error || !data) {
      console.error("Error fetching user role or role not found:", error);
      // Log out the user if they have no role, as they can't use the app.
      await supabase.auth.signOut(); 
      throw new Error("Seu usuário não tem uma permissão de acesso definida. Contate o administrador.");
    }

    const role = data.role as UserRole;

    // Optional: Double check if the role is one of the accepted roles
    const validRoles: UserRole[] = ['AdminGeral', 'Administrativo', 'Producao', 'Vendas', 'Financeiro', 'Conteudo'];
    if (!validRoles.includes(role)) {
      await supabase.auth.signOut(); 
      throw new Error(`Permissão de acesso inválida ('${role}'). Acesso negado.`);
    }

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || '',
      role: role,
    };
};

export const listenAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        try {
            const profile = await getUserProfile(session.user);
            callback(profile);
        } catch(error) {
            console.error(error);
            toast({
                title: 'Erro de Acesso',
                description: (error as Error).message,
                variant: 'destructive'
            });
            await logout();
            callback(null);
        }
      } else {
        callback(null);
      }
    }
  );

  return () => subscription?.unsubscribe();
};