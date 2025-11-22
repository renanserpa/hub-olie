
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

// Função segura para transformar usuário do Auth em Perfil do Sistema
const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    
    // Se não tiver perfil no banco, usa metadados ou padrão 'Vendas' para não travar
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
  console.log("[AuthService] Tentando login direto...");
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[AuthService] Falha no Supabase:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Login realizado, mas nenhum usuário retornado.');
  }

  // Tenta buscar perfil, mas não trava se falhar (permite corrigir o banco depois)
  let profile = null;
  try {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      profile = p;
  } catch (e) {
      console.warn("Não foi possível carregar perfil, usando dados básicos.");
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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
        return mapUserToProfile(session.user, profile);
    } catch (e) {
        return null;
    }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            callback(mapUserToProfile(session.user));
        } else {
            callback(null);
        }
    });
    return () => data.subscription.unsubscribe();
};

// Stubs para evitar erros de importação em outros arquivos
export const register = async () => {};
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("Indisponível"); };
export const verifyTotpChallenge = async () => { throw new Error("Indisponível"); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
