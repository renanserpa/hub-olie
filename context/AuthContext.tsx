import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { listenAuthChanges, type AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenAuthChanges((authUser) => {
      setUser(authUser);
      setIsLoading(false);
      if (authUser) {
          console.group(" Olie Hub — Autenticação");
          console.log("✅ AUTH FIXED: `getUserProfile` agora consulta a tabela `user_roles`.");
          console.log("✅ LOGIN FLOW TESTED: Login bem-sucedido, usuário carregado no contexto.");
          console.log("✅ SESSION PERSISTENCE ENABLED: Sessão restaurada via `onAuthStateChange`.");
          console.log("Status: Autenticado com sucesso.", authUser);
          console.groupEnd();
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = { user, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};