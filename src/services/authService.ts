
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

// Helper para converter User do Supabase para o nosso UserProfile
const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    // Tenta pegar a role dos metadados do Auth ou do perfil público, ou usa fallback
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
  console.log("[AuthService] Iniciando login para:", email);
  
  // 1. Autenticação no Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[AuthService] Erro no signInWithPassword:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Usuário não retornado pelo Supabase.');
  }

  console.log("[AuthService] Auth sucesso. Buscando perfil...");

  // 2. Tentar buscar perfil público (Pode falhar se tabelas não existirem)
  try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileError) {
          console.warn("[AuthService] Erro ao ler tabela profiles (esperado se banco estiver vazio):", profileError.message);
      }

      // Retorna o usuário mesclado (Auth + DB ou Auth + Fallback)
      return mapUserToProfile(data.user, profile) as UserProfile;

  } catch (err) {
      console.warn("[AuthService] Exceção ao buscar perfil. Prosseguindo com login de emergência.", err);
      // Fallback de emergência: permite entrar só com o usuário do Auth para poder corrigir o banco
      return mapUserToProfile(data.user) as UserProfile;
  }
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.clear(); // Limpa tudo para garantir
    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return null;
    }

    // Tenta buscar dados extras, mas não bloqueia se falhar
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
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            // Mapeamento simples para evitar chamadas de rede excessivas no listener
            callback(mapUserToProfile(session.user));
        } else {
            callback(null);
        }
    });
    return () => data.subscription.unsubscribe();
};

// Stubs para manter compatibilidade de tipos
export const register = async () => {};
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("MFA indisponível."); };
export const verifyTotpChallenge = async () => { throw new Error("MFA indisponível."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
