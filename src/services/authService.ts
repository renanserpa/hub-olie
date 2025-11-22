
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    const role = profileData?.role || user.user_metadata?.role || 'Vendas';
    return {
        id: user.id,
        email: user.email!,
        role: role,
        created_at: user.created_at,
        last_login: new Date().toISOString()
    };
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  console.log("[AuthService] Tentando login para:", email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
      console.error("[AuthService] Erro no signInWithPassword:", error);
      throw new Error(error.message);
  }
  
  if (!data.user) {
      throw new Error('Usuário não identificado após login.');
  }

  try {
      // Tenta buscar perfil.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
        
      // Se houver erro (ex: tabela não existe), loga mas NÃO falha o login.
      if (profileError) {
          console.warn("[AuthService] Aviso: Não foi possível carregar perfil (Tabela pode não existir).", profileError.message);
      }

      return mapUserToProfile(data.user, profile) as UserProfile;
  } catch (err) {
      console.warn("⚠️ [Auth] Falha crítica ao buscar perfil. Prosseguindo com dados básicos.", err);
      // Fallback: permite entrar apenas com os dados do Auth para rodar o Bootstrap
      return mapUserToProfile(data.user) as UserProfile;
  }
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) return null;

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
        return mapUserToProfile(session.user, profile);
    } catch {
        // Fallback silencioso para manter a sessão ativa
        return mapUserToProfile(session.user);
    }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            callback(mapUserToProfile(session.user));
        } else {
            callback(null);
        }
    });
    return () => data.subscription.unsubscribe();
};

// Stubs
export const register = async () => {};
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("MFA indisponível no modo de recuperação."); };
export const verifyTotpChallenge = async () => { throw new Error("MFA indisponível."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
