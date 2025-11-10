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

  // Handle database errors (but not 'row not found')
  if (roleError && roleError.code !== 'PGRST116') {
    console.error("Database error fetching user role:", roleError.message, roleError);
    
    if (roleError.code === '42P01') { // table not found
        throw new Error('BOOTSTRAP_REQUIRED: A tabela `user_roles` não foi encontrada. Execute o script de configuração inicial.');
    }
    if (roleError.code === '42501') { // permission denied
        await supabase.auth.signOut();
        throw new Error(`Acesso negado às permissões (RLS): ${roleError.message}. Verifique as políticas de segurança da tabela 'user_roles'.`);
    }
    // Any other unexpected database error
    await supabase.auth.signOut();
    throw new Error(`Erro de banco de dados ao buscar permissões: ${roleError.message}`);
  }
  
  // Handle user authenticated but no role assigned (row not found)
  if (!roleData) {
    await supabase.auth.signOut();
    throw new Error("Acesso negado: Seu usuário foi autenticado, mas não possui uma função (role) definida na tabela `user_roles`. Contate o administrador para configurar sua permissão.");
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
      if (sessionError) console.error("Error getting session:", sessionError.message);
      return null;
    }
    
    const user = session.user;
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    // Fatal setup error: table doesn't exist. This must be thrown to trigger the bootstrap modal.
    if (roleError?.code === '42P01') {
        throw new Error('BOOTSTRAP_REQUIRED: Tabelas de usuário (`user_roles`) não encontradas.');
    }

    // Non-fatal error for an active session: RLS permission denied.
    if (roleError?.code === '42501') {
        console.error("RLS permission denied fetching role for current user, signing out:", roleError.message, roleError);
        await supabase.auth.signOut();
        return null; // Sign out and return null
    }

    // Handles both "row not found" (PGRST116) which is a valid sign-out case, and any other unexpected DB error.
    if (roleError || !roleData) {
       if (roleError && roleError.code !== 'PGRST116') { // Log only unexpected errors
          console.error("Error fetching role for current user, signing out:", roleError.message, roleError);
       } else {
          console.warn("User has a valid session but no role in `user_roles` table. Signing out to clear invalid state.");
       }
       await supabase.auth.signOut(); // Clean up the invalid session state
       return null; // Return null to complete the sign-out process in the UI
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
