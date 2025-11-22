
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
  console.log("[AuthService] Tentando login...", email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Erro desconhecido: Usuário não retornado.');

  // Tenta buscar o perfil, mas permite login mesmo se falhar (modo recuperação)
  try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      return mapUserToProfile(data.user, profile) as UserProfile;
  } catch (err) {
      console.warn("[AuthService] Falha ao ler perfil, usando dados básicos.", err);
      return mapUserToProfile(data.user) as UserProfile;
  }
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    // Timeout agressivo de 1.5s para liberar a UI rapidamente se a rede estiver lenta
    const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
            console.warn("[AuthService] Timeout na verificação de sessão.");
            resolve(null);
        }, 1500);
    });

    const sessionPromise = (async () => {
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
            console.error("[AuthService] Erro ao recuperar sessão:", e);
            return null;
        }
    })();

    return Promise.race([sessionPromise, timeoutPromise]);
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
export const enrollTotp = async () => { throw new Error("MFA indisponível."); };
export const verifyTotpChallenge = async () => { throw new Error("MFA indisponível."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
