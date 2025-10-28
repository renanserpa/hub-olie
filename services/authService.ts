import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

export type UserRole =
  | 'AdminGeral'
  | 'Administrativo'
  | 'Producao'
  | 'Vendas'
  | 'Financeiro'
  | 'Conteudo';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
}

// SupaDataMaster will implement this
export const login = async (email: string, password: string): Promise<AuthUser> => {
  console.warn("authService.login is not implemented for Supabase yet.");
  // Placeholder logic
  if (email && password) {
      // This is a temporary mock to allow UI to proceed.
      // The real implementation will be done by the SupaDataMaster agent.
      if (email === "demo@olie.com.br" && password === "demo") {
         return { uid: 'mock-uid', email, role: 'AdminGeral' };
      }
  }
  throw new Error('Login not implemented or invalid credentials.');
};

// SupaDataMaster will implement this
export const logout = async (): Promise<void> => {
  console.warn("authService.logout is not implemented for Supabase yet.");
};

// SupaDataMaster will implement this
export const getUserProfile = async (supabaseUser: any): Promise<AuthUser> => {
  console.warn("authService.getUserProfile is not implemented for Supabase yet.");
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || '',
    role: 'Vendas', // Default role
  };
};

// SupaDataMaster will implement this
export const listenAuthChanges = (callback: (user: AuthUser | null) => void) => {
  console.warn("authService.listenAuthChanges is not implemented for Supabase yet.");
  // Immediately call with null to prevent app from hanging in loading state,
  // then mock a login for development purposes.
  // The real implementation will use supabase.auth.onAuthStateChange
  setTimeout(() => {
    callback({ uid: 'mock-uid', email: 'demo@olie.com.br', role: 'AdminGeral' });
  }, 500);
  
  // Return a dummy unsubscribe function
  return () => {};
};
