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
    // TENTATIVA 4: As buscas por tabelas de perfil ('user_roles', 'profiles', 'users') falharam.
    // A hipótese final é que a permissão (role) do usuário está armazenada nos metadados do objeto de usuário (app_metadata),
    // uma prática comum e eficiente no Supabase que evita consultas extras ao banco.
    const role = supabaseUser.app_metadata?.role as UserRole;

    if (!role) {
        console.error("User role not found in app_metadata:", supabaseUser);
        throw new Error("Não foi possível encontrar a permissão (role) do usuário. Acesso negado.");
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