
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

// Helper seguro para mapear usuário
const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    // Fallback seguro para role se o perfil não carregar
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
  console.log("[Auth] Iniciando login...");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Sem dados de usuário.');

  // Tenta buscar o perfil, mas não bloqueia se falhar (permite bootstrap)
  let profile = null;
  try {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      profile = p;
  } catch (e) {
      console.warn("[Auth] Aviso: Não foi possível carregar perfil extendido.");
  }
  
  return mapUserToProfile(data.user, profile) as UserProfile;
};

export const logout = async (): Promise<void> => {
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.error("Erro ao sair:", e);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    try {
        // Timeout agressivo de 2s para não travar a tela branca
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Auth")), 2000));
        const sessionPromise = supabase.auth.getSession();

        const result: any = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!result || !result.data.session?.user) return null;

        const user = result.data.session.user;
        
        // Tenta buscar perfil rapidamente
        let profile = null;
        try {
             const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
             profile = data;
        } catch(e) {
            console.warn("Erro ao buscar perfil inicial.");
        }
        
        return mapUserToProfile(user, profile);
    } catch (e) {
        console.warn("[Auth] Sessão não encontrada ou timeout.", e);
        return null;
    }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? mapUserToProfile(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
};

// Stubs vazios para evitar erros de importação
export const register = async () => {};
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("N/A"); };
export const verifyTotpChallenge = async () => { throw new Error("N/A"); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
