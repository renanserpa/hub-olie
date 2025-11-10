import { supabase } from '../lib/supabaseClient';
import { runtime } from '../lib/runtime';
// FIX: Import UserRole and AuthUser from the centralized types.ts file to remove duplication and fix type errors.
import { UserRole, AuthUser } from '../types';

const sandboxUser: AuthUser = {
  uid: 'sandbox-user-01',
  email: 'admin@sandbox.olie',
  role: 'AdminGeral',
};

export const login = async (email: string, password: string): Promise<AuthUser> => {
  if (runtime.mode === 'SANDBOX') {
    console.log('🧱 SANDBOX: Simulating login.');
    await new Promise(res => setTimeout(res, 500));
    return sandboxUser;
  }

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    if (loginError.message.includes('Invalid login credentials')) {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    throw new Error(loginError.message);
  }
  
  if (!loginData.user) {
    throw new Error('Falha no login, usuário não encontrado.');
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', loginData.user.id)
    .single();

  if (roleError) {
    if (roleError.code === '42P01') { // 42P01: undefined_table
        throw new Error('BOOTSTRAP_REQUIRED: Tabelas de usuário não encontradas.');
    }
    // Any other error, or if no row is found (PGRST116)
    await supabase.auth.signOut();
    console.error("Error fetching user role or role not found:", roleError);
    throw new Error("Sem permissão: seu usuário não tem um papel de acesso definido. Se este for o primeiro acesso, siga as instruções de inicialização.");
  }
  
  if (!roleData) { // Fallback in case role is null but no error
    await supabase.auth.signOut();
    throw new Error("Sem permissão: seu usuário não tem um papel de acesso definido. Se este for o primeiro acesso, siga as instruções de inicialização.");
  }

  return {
    uid: loginData.user.id,
    email: loginData.user.email || '',
    role: roleData.role as UserRole,
  };
};

export const logout = async (): Promise<void> => {
    if (runtime.mode === 'SANDBOX') {
        console.log('🧱 SANDBOX: Simulating logout.');
        return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        throw new Error(error.message);
    }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
    if (runtime.mode === 'SANDBOX') {
        return sandboxUser;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      if (sessionError) console.error("Error getting session:", sessionError);
      return null;
    }
    
    const user = session.user;
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (roleError || !roleData) {
       if (roleError.code === '42P01') { // Table does not exist
            throw new Error('BOOTSTRAP_REQUIRED: Tabelas de usuário não encontradas.');
       }
       if (roleError.code !== 'PGRST116') { // PGRST116 means no row was found
          console.error("Error fetching role for current user:", roleError);
       }
       return null;
    }

    return {
      uid: user.id,
      email: user.email || '',
      role: roleData.role as UserRole,
    };
};

export const listenAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
    if (runtime.mode === 'SANDBOX') {
        // In sandbox mode, auth state is static, so we just call back with the user once.
        callback(sandboxUser);
        return () => {}; // Return a no-op unsubscribe function
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getCurrentUser();
          callback(profile);
        } else if (event === 'SIGNED_OUT') {
          callback(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
};