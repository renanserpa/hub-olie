import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AuthUser, getCurrentUser, listenAuthChanges } from '../services/authService';
import { ThemeProvider, useTheme } from './ThemeContext';

const DEFAULT_PAGE_BY_ROLE: Record<string, string> = {
    AdminGeral: 'dashboard',
    Producao: 'production',
    Vendas: 'orders',
    Financeiro: 'analytics',
    Administrativo: 'logistics',
    Conteudo: 'marketing',
};

interface AppContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  activeModule: string;
  setActiveModule: (module: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
};

const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const hasRedirected = useRef(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const checkInitialAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : "Authentication failed.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    checkInitialAuth();
    const unsubscribe = listenAuthChanges((authUser) => {
      if (isMounted) {
        setUser(authUser);
        if (isLoading) setIsLoading(false);
      }
    });
    return () => { isMounted = false; unsubscribe(); };
  }, [isLoading]);

  useEffect(() => {
    if (user && !isLoading && !hasRedirected.current) {
        const defaultPage = DEFAULT_PAGE_BY_ROLE[user.role];
        if (defaultPage) {
            setActiveModule(defaultPage);
        }
        hasRedirected.current = true;
    }
    if (!user && !isLoading) {
        hasRedirected.current = false;
        setActiveModule('dashboard'); 
    }
  }, [user, isLoading]);

  const value = { user, isLoading, error, activeModule, setActiveModule, theme, toggleTheme };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    return (
        <ThemeProvider>
            <AppStateProvider>
                {children}
            </AppStateProvider>
        </ThemeProvider>
    )
}
