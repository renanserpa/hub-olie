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
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        throw new Error(`Falha ao buscar perfil: ${error.message}. Verifique as permissões (RLS) da tabela 'profiles'.`);
    }
    
    if (!data) {
        throw new Error("Perfil de usuário não encontrado no banco de dados. Acesso negado.");
    }

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || '',
      role: data.role as UserRole,
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