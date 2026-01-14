import { supabase } from '../lib/supabaseClient';
import { UserProfile, UserRole } from '../types';

const DEV_USER_KEY = 'olie_dev_user';

// Helper para converter User do Supabase para o nosso UserProfile
const mapUserToProfile = (user: any): UserProfile | null => {
    if (!user) return null;
    const role = user.user_metadata?.role || user.app_metadata?.role || 'Vendas';
    return {
        id: user.id,
        email: user.email!,
        role: role,
        created_at: user.created_at,
        last_login: user.last_sign_in_at
    };
};

// --- DEV MODE FUNCTIONS ---
export const loginAsDev = (role: UserRole): UserProfile => {
    const devUser: UserProfile = {
        id: 'dev-user-mock-id',
        email: `dev.${role.toLowerCase()}@olie.hub`,
        role: role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
    };
    localStorage.setItem(DEV_USER_KEY, JSON.stringify(devUser));
    return devUser;
};
// -------------------------

export const login = async (email: string, password: string): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não retornado pelo Supabase.');
  return mapUserToProfile(data.user) as UserProfile;
};

export const register = async (email: string, password: string, role: string = 'Vendas'): Promise<void> => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } }
    });
    if (error) throw new Error(error.message);
};

export const logout = async (): Promise<void> => {
    // Limpa o utilizador de dev se existir
    localStorage.removeItem(DEV_USER_KEY);
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    // 1. PRIORIDADE: Verifica se estamos em Dev Mode
    const devUserJson = localStorage.getItem(DEV_USER_KEY);
    if (devUserJson) {
        try {
            return JSON.parse(devUserJson) as UserProfile;
        } catch (e) {
            localStorage.removeItem(DEV_USER_KEY);
        }
    }

    // 2. Se não, verifica Supabase
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          return null;
        }
        return mapUserToProfile(session.user);
    } catch (e) {
        console.warn("Supabase auth check failed (possibly missing keys), ignoring...", e);
        return null;
    }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void): (() => void) => {
    // Se houver um utilizador de dev forçado, acionamos o callback imediatamente
    const devUserJson = localStorage.getItem(DEV_USER_KEY);
    if (devUserJson) {
        try {
            callback(JSON.parse(devUserJson));
            // Retorna uma função de limpeza vazia, pois não assinamos o Supabase neste caso
            return () => {};
        } catch (e) {
            localStorage.removeItem(DEV_USER_KEY);
        }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ? mapUserToProfile(session.user) : null;
        callback(user);
      }
    );

    return () => subscription?.unsubscribe();
};

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

// Placeholders para evitar quebra de contrato
export const enrollTotp = async () => { throw new Error("MFA temporariamente desabilitado."); };
export const verifyTotpChallenge = async (factorId: string, challengeCode: string) => { throw new Error("MFA temporariamente desabilitado."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };