
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

// Helper para converter User do Supabase para o nosso UserProfile
const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    
    // Prioriza a role do perfil do banco, senão usa metadata, senão fallback
    const role = profileData?.role || user.user_metadata?.role || user.app_metadata?.role || 'Vendas';
    
    return {
        id: user.id,
        email: user.email!,
        role: role,
        created_at: user.created_at,
        last_login: profileData?.last_login || user.last_sign_in_at
    };
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  // 1. Login no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('Usuário não retornado pelo Supabase.');

  // 2. Buscar Perfil no Banco (Tabela 'profiles')
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  // 3. Lógica de Self-Healing (Auto-Correção)
  // Se o usuário logou no Auth mas não tem perfil no DB, cria agora.
  if (!profileData || profileError) {
      console.warn("⚠️ Usuário sem perfil detectado. Criando perfil de recuperação...");
      
      const newProfile = {
          id: authData.user.id,
          email: authData.user.email,
          role: 'AdminGeral', // Fallback seguro
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
      };

      const { error: createError } = await supabase.from('profiles').insert(newProfile);
      
      if (createError) {
          // Mesmo falhando o perfil, retornamos o usuário básico para não bloquear o login totalmente
          return mapUserToProfile(authData.user, { role: 'AdminGeral' }) as UserProfile;
      }
      return mapUserToProfile(authData.user, newProfile) as UserProfile;
  }

  // 4. Atualizar last_login se o perfil existir
  if (profileData) {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id);
  }

  return mapUserToProfile(authData.user, profileData) as UserProfile;
};

export const register = async (email: string, password: string, role: string = 'Vendas'): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { role } 
        }
    });

    if (error) throw new Error(error.message);
    
    if (data.user) {
        // Tenta criar o perfil imediatamente
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            role: role,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        });
        if (profileError) {
            console.warn("Perfil público será criado no primeiro login (Self-Healing).");
        }
    }
};

export const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return mapUserToProfile(session.user, profile);
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            callback(mapUserToProfile(session.user, profile));
        } else {
            callback(null);
        }
      }
    );
    return () => subscription?.unsubscribe();
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) throw error;
};

export const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
};

export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
     if (error) throw error;
};

export const enrollTotp = async () => { throw new Error("MFA temporariamente desabilitado."); };
export const verifyTotpChallenge = async (factorId: string, challengeCode: string) => { throw new Error("MFA temporariamente desabilitado."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };
