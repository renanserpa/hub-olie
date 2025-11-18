import { supabase } from '../lib/supabaseClient';
import { UserRole as _UserRole, UserProfile } from '../types';

const getProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error("Database error fetching profile:", error.message);
        throw new Error(`Erro de banco de dados ao buscar perfil: ${error.message}`);
    }

    return data;
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    if (loginError instanceof (supabase as any).auth.AuthMultiFactorAuthenticationError) {
        // This specific error is caught by the UI to trigger the 2FA flow
        throw loginError;
    }
    if (loginError.message.includes('Invalid login credentials')) {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    throw new Error(loginError.message);
  }
  
  if (!loginData.user) {
    throw new Error('Falha no login, usuário não encontrado.');
  }

  const profile = await getProfile(loginData.user.id);

  if (!profile) {
      // If authenticated but no profile, check if we need to create one (lazy creation) or throw error
      // For strict RBAC, we usually expect a profile to exist. 
      // However, for self-registration, the profile might be created via trigger or needs to be created here.
      // We will throw error here to enforce proper registration flow.
      await supabase.auth.signOut();
      throw new Error("Acesso negado: Seu usuário foi autenticado, mas não possui um perfil definido. Contate o administrador ou realize o cadastro.");
  }

  return profile;
};

export const register = async (email: string, password: string, role: string = 'Vendas'): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role
            }
        }
    });

    if (error) {
        throw new Error(error.message);
    }

    if (data.user) {
        // Manually insert profile if triggers aren't set up yet, ensuring redundancy
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                email: email,
                role: role
            })
            .select()
            .single();
            
        if (profileError && profileError.code !== '23505') { // Ignore unique violation if trigger already created it
             console.warn("Manual profile creation failed, relying on DB trigger:", profileError);
        }
    }
};

export const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        throw new Error(error.message);
    }
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin, // Redirect user back to the app after reset
  });

  if (error) {
    console.error("Error sending password reset email:", error);
    if (error.message.includes("For security purposes, you can only request this once every")) {
        throw new Error("Muitas tentativas de redefinição. Por favor, aguarde um momento antes de tentar novamente.");
    }
    throw new Error(error.message);
  }
};

export const signInWithMagicLink = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin,
        },
    });
    if (error) {
        console.error("Error sending magic link:", error);
        throw new Error(error.message);
    }
};

export const signInWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        }
    });
     if (error) {
        console.error("Error with Google OAuth:", error);
        throw new Error(error.message);
    }
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      if (sessionError) console.error("Error getting session:", sessionError.message);
      return null;
    }
    
    const user = session.user;
    const profile = await getProfile(user.id);
      
    if (!profile) {
       console.warn("User has a valid session but no profile. Signing out to clear invalid state.");
       await supabase.auth.signOut();
       return null;
    }

    return profile;
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          callback(null);
          return;
        }
        
        try {
            const profile = await getProfile(session.user.id);
            if (profile) {
                callback(profile);
            } else {
                // If profile is missing immediately after signup, it might be a timing issue with the trigger.
                // We won't force sign out here to allow the registration flow to handle it or the user to wait.
                console.warn("Auth session exists but profile is missing.");
                callback(null);
            }
        } catch (e) {
            console.error("Error fetching profile in auth listener:", e);
            callback(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
};

// --- 2FA (TOTP) Functions ---

export const enrollTotp = async (): Promise<{ qr_code: string; factorId: string }> => {
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
    });
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to enroll TOTP factor.");
    return { qr_code: data.totp.qr_code, factorId: data.id };
};

export const verifyTotpChallenge = async (factorId: string, code: string): Promise<void> => {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
    });
    if (error) throw new Error(error.message);
};

export const unenrollTotp = async (factorId: string): Promise<void> => {
    const { error } = await supabase.auth.mfa.unenroll({
        factorId,
    });
    if (error) throw new Error(error.message);
};

export const getFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw new Error(error.message);
    return data;
}