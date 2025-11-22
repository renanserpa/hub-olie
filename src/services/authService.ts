import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export type AuthResult = {
  ok: boolean;
  error?: string;
  user?: UserProfile;
};

// Helper para converter User do Supabase para o nosso UserProfile
const mapUserToProfile = (authData: any, profileData?: any): UserProfile => {
  // Prioriza o role do banco, depois metadados, depois fallback seguro
  const role = profileData?.role || authData.user_metadata?.role || authData.app_metadata?.role || 'Vendas';
  
  return {
      id: authData.id,
      email: authData.email!,
      role: role,
      created_at: authData.created_at,
      last_login: new Date().toISOString()
  };
};

// Função de Auto-Correção (Self-Healing)
// Garante que existe uma linha na tabela 'profiles' para o usuário autenticado
export const ensureProfile = async (userId: string, email: string): Promise<any> => {
  if (!supabase) return null;

  try {
    // 1. Tenta buscar o perfil existente
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!fetchError && existingProfile) {
      return existingProfile;
    }

    console.warn(`[Auth] Perfil não encontrado para ${email}. Criando perfil de recuperação...`);

    // 2. Se não existir, cria um perfil padrão
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: 'Vendas', // Role padrão segura
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Auth] Falha ao criar perfil de recuperação:", insertError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error("[Auth] Erro crítico no self-healing de perfil:", error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<AuthResult> => {
  if (!supabase) {
    return { 
      ok: false, 
      error: 'Configuração do banco de dados ausente. Verifique as variáveis de ambiente (VITE_SUPABASE_URL).' 
    };
  }

  try {
    // 1. Autenticação no Identity Provider (Supabase Auth)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!data.user) {
      return { ok: false, error: 'Nenhum usuário retornado pelo provedor.' };
    }

    // 2. Busca ou Criação de Perfil (Database)
    const profile = await ensureProfile(data.user.id, data.user.email!);
    
    // 3. Mapeamento final
    const userProfile = mapUserToProfile(data.user, profile);
    
    return { ok: true, user: userProfile };

  } catch (error: any) {
    console.error("[Auth] Erro inesperado no login:", error);
    return { ok: false, error: error.message || 'Erro desconhecido no login.' };
  }
};

export const logout = async (): Promise<void> => {
  if (!supabase) return;
  await supabase.auth.signOut();
  localStorage.clear(); // Limpeza de segurança
  window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  if (!supabase) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) return null;

    // Tenta buscar perfil atualizado, mas não bloqueia se falhar (usa dados da sessão)
    let profile = null;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      profile = data;
    } catch (e) { 
      // Ignora erros de conexão no check de sessão silencioso
    }
    
    return mapUserToProfile(session.user, profile);
  } catch (error) {
    return null;
  }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void) => {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
       let profile = null;
       try {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        profile = data;
       } catch {}
       callback(mapUserToProfile(session.user, profile));
    } else {
      callback(null);
    }
  });
  
  return () => data.subscription.unsubscribe();
};

// Stubs para compatibilidade
export const register = async () => { throw new Error("Registro público desabilitado."); };
export const sendPasswordResetEmail = async () => {};
export const signInWithMagicLink = async () => {};
export const signInWithGoogle = async () => {};
export const enrollTotp = async () => { throw new Error("MFA não configurado."); };
export const verifyTotpChallenge = async () => { throw new Error("MFA não configurado."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
