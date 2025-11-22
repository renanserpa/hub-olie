
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    const role = profileData?.role || user.user_metadata?.role || user.app_metadata?.role || 'Vendas';
    return {
        id: user.id,
        email: user.email!,
        role: role,
        created_at: user.created_at,
        last_login: new Date().toISOString()
    };
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  console.log("[Auth] Tentando login...");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Erro desconhecido no login.');

  // Tenta buscar perfil, mas não falha se a tabela não existir (permite bootstrap)
  let profile = null;
  try {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      profile = p;
  } catch (e) {
      console.warn("Perfil não carregado (possível falta de tabela):", e);
  }
  
  return mapUserToProfile(data.user, profile) as UserProfile;
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    try {
        // Timeout de segurança para não travar a tela de loading
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
        const sessionPromise = supabase.auth.getSession();

        const result: any = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!result || !result.data.session?.user) return null;

        const user = result.data.session.user;
        
        // Busca perfil de forma otimista
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        return mapUserToProfile(user, profile);
    } catch (e) {
        console.warn("[Auth] Sessão inválida ou expirada.");
        return null;
    }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? mapUserToProfile(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
};

// Stubs
export const register = async () => {};
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("Indisponível"); };
export const verifyTotpChallenge = async () => { throw new Error("Indisponível"); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
