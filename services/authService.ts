import { supabase } from '../lib/supabaseClient';
import { UserProfile, UserRole } from '../types';

const getProfile = async (userId: string): Promise<UserProfile | null> => {
    // FIX: Use maybeSingle() instead of single() to return null instead of throwing error if row is missing
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    
    if (error) {
        console.error("Database error fetching profile:", error.message);
        return null;
    }

    return data;
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    if (loginError instanceof (supabase as any).auth.AuthMultiFactorAuthenticationError) {
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
      const fallbackRole = (loginData.user.user_metadata?.role as UserRole) || 'Vendas';
      const { data: createdProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
              id: loginData.user.id,
              email: loginData.user.email ?? email,
              role: fallbackRole,
          })
          .select()
          .maybeSingle();

      if (upsertError) {
          throw new Error(
              'Não foi possível criar seu perfil após o login. Entre em contato com o administrador.'
          );
      }

      if (!createdProfile) {
          throw new Error('Perfil não pôde ser recuperado após a criação.');
      }

      return createdProfile as UserProfile;
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
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                email: email,
                role: role
            })
            .select()
            .single();
            
        if (profileError && profileError.code !== '23505') {
             console.warn("Manual profile creation failed:", profileError);
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
    redirectTo: window.location.origin,
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
      return null;
    }
    
    const user = session.user;
    try {
        const profile = await getProfile(user.id);
        
        if (!profile) {
           console.warn("[AuthService] User has session but no profile. Returning partial session data.");
           // Return partial data to avoid infinite loading
           return { id: user.id, email: user.email!, role: 'Vendas' } as UserProfile;
        }
        return profile;
    } catch (e) {
        console.error("Error getting current user profile:", e);
        return null;
    }
};

export const listenAuthChanges = (callback: (user: UserProfile | null) => void): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthService] Auth event: ${event}`);
        
        if (!session?.user) {
          callback(null);
          return;
        }
        
        // Avoid triggering multiple times for the same session if possible, but ensure profile is fetched
        try {
            // Small delay to ensure triggers have run if it's a new signup
            if (event === 'SIGNED_IN') await new Promise(r => setTimeout(r, 500));
            
            const profile = await getProfile(session.user.id);
            
            if (profile) {
                callback(profile);
            } else {
                console.warn("[AuthService] Profile missing in listener.");
                 callback({ id: session.user.id, email: session.user.email!, role: 'Vendas' } as UserProfile);
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