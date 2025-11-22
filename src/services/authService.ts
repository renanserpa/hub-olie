import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

const mapUserToProfile = (user: any, profileData?: any): UserProfile | null => {
    if (!user) return null;
    // Prioritiza a role vinda do banco, fallback para metadata ou default
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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(`Erro no login: ${error.message}`);
  if (!data.user) throw new Error('Usuário não identificado após login.');

  try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      return mapUserToProfile(data.user, profile) as UserProfile;
  } catch (err) {
      console.warn("⚠️ [Auth] Falha ao buscar perfil do banco. Usando dados básicos do Auth.");
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
        // Tenta buscar dados atualizados do perfil
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
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            // Em mudanças de estado, podemos optar por não bater no banco toda vez para performance
            // ou fazer um fetch leve se necessário. Por enquanto, usamos o dado da sessão.
            callback(mapUserToProfile(session.user));
        } else {
            callback(null);
        }
    });
    return () => data.subscription.unsubscribe();
};

// Placeholder functions for future implementation (Phase IV)
export const register = async () => { console.info("Register not implemented yet"); };
export const sendPasswordResetEmail = async () => { console.info("Reset Password not implemented yet"); };
export const signInWithMagicLink = async () => { console.info("Magic Link not implemented yet"); };
export const signInWithGoogle = async () => { console.info("Google Auth not implemented yet"); };

// MFA Stubs (To be implemented with Supabase MFA)
export const enrollTotp = async () => { throw new Error("MFA não configurado."); };
export const verifyTotpChallenge = async () => { throw new Error("MFA não configurado."); };
export const unenrollTotp = async () => {};
export const getFactors = async () => { return { all: [], totp: [] }; };