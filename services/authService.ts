
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

// Helper para converter User do Supabase para o nosso UserProfile
const mapUserToProfile = (user: any): UserProfile | null => {
    if (!user) return null;
    // Tenta pegar a role dos metadados, senão usa 'Vendas' como fallback seguro
    const role = user.user_metadata?.role || user.app_metadata?.role || 'Vendas';
    return {
        id: user.id,
        email: user.email!,
        role: role,
        created_at: user.created_at,
        last_login: user.last_sign_in_at
    };
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  // Chamada direta ao Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Usuário não retornado pelo Supabase.');
  }

  // Retorna o objeto de usuário mapeado imediatamente
  return mapUserToProfile(data.user) as UserProfile;
};

export const register = async (email: string, password: string, role: string = 'Vendas'): Promise<void> => {
    // Registro direto com metadados
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { role } // Salva a role nos metadados do usuário
        }
    });

    if (error) {
        throw new Error(error.message);
    }
    
    // Não fazemos mais insert manual na tabela profiles aqui para evitar bloqueios
};

export const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }
    return mapUserToProfile(session.user);
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ? mapUserToProfile(session.user) : null;
        callback(user);
      }
    );

    return () => subscription?.unsubscribe();
};

// Funções auxiliares mantidas (mas simplificadas onde possível)
export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
};

export const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
};

export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
     if (error) throw error;
};

// Stubs para MFA (mantidos para não quebrar a interface, mas simplificados)
export const enrollTotp = async () => { throw new Error("MFA temporariamente desabilitado nesta versão simplificada."); };
export const verifyTotpChallenge = async (factorId: string, challengeCode: string) => { throw new Error("MFA temporariamente desabilitado."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
