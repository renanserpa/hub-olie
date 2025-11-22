
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

// Helper para converter User do Supabase para o nosso UserProfile
const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    
    // Prioridade: Perfil do DB > Metadados do Auth > Fallback
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

  if (error) {
    console.error("[AuthService] Erro Auth:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Erro desconhecido: Usuário não retornado.');
  }

  console.log("[AuthService] Auth OK. Buscando perfil...");

  try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileError) {
          console.warn("[AuthService] Erro não-bloqueante ao ler profiles:", profileError.message);
      }

      return mapUserToProfile(data.user, profile) as UserProfile;

  } catch (err) {
      console.warn("[AuthService] Exceção ao buscar perfil. Usando dados de sessão.", err);
      return mapUserToProfile(data.user) as UserProfile;
  }
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    // Adiciona um timeout de 2 segundos para evitar que a inicialização trave se o Supabase não responder
    const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
            console.warn("[AuthService] Timeout ao buscar sessão. Assumindo deslogado.");
            resolve(null);
        }, 2000);
    });

    const sessionPromise = (async () => {
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
            return mapUserToProfile(session.user);
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
