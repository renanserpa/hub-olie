
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    // Prioriza o role do perfil, depois metadados, depois fallback
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
  console.log("[AuthService] Tentando login para:", email);
  
  // 1. Autenticação Base
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[AuthService] Erro Supabase Auth:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Erro desconhecido: Usuário não retornado pelo Supabase.');
  }

  // 2. Recuperação de Perfil (Resiliente)
  // Se a tabela profiles não existir (erro 42P01), permitimos o login mesmo assim
  // para que o usuário possa acessar o modal de configuração de banco.
  try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
          console.warn("[AuthService] Aviso ao buscar perfil:", profileError.message);
      }
      
      return mapUserToProfile(data.user, profile) as UserProfile;
  } catch (err) {
      console.warn("[AuthService] Falha crítica ao ler perfil, usando dados básicos.", err);
      return mapUserToProfile(data.user) as UserProfile;
  }
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.clear(); // Limpeza radical
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    // Timeout de segurança interno: Se o Supabase não responder em 2s,
    // assumimos que não há usuário logado para destravar a UI.
    const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
            console.warn("[AuthService] Timeout na verificação de sessão inicial.");
            resolve(null);
        }, 2000);
    });

    const sessionPromise = (async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("[AuthService] Erro getSession:", error);
                return null;
            }
            
            if (!session?.user) return null;

            // Tenta buscar perfil, falha silenciosamente se não conseguir
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
            return mapUserToProfile(session.user, profile);
        } catch (e) {
            console.error("[AuthService] Exceção na sessão:", e);
            return null;
        }
    })();

    return Promise.race([sessionPromise, timeoutPromise]);
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[AuthService] Evento: ${event}`);
        if (session?.user) {
            // Mapeamento simplificado para evitar chamadas de banco desnecessárias no evento
            callback(mapUserToProfile(session.user, { role: session.user.user_metadata?.role }));
        } else {
            callback(null);
        }
    });
    return () => data.subscription.unsubscribe();
};

// Stubs para manter compatibilidade de interface
export const register = async () => {};
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("MFA indisponível no modo recuperação."); };
export const verifyTotpChallenge = async () => { throw new Error("MFA indisponível no modo recuperação."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
