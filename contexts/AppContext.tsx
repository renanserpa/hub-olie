import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getCurrentUser, listenAuthChanges } from '../services/authService';
import { UserProfile } from '../types';
import WelcomeModal from '../components/WelcomeModal';
import { supabaseService } from '../lib/supabase';

const DEFAULT_PAGE_BY_ROLE: Record<string, string> = {
    AdminGeral: 'dashboard',
    Producao: 'production',
    Vendas: 'orders',
    Financeiro: 'analytics',
    Administrativo: 'logistics',
    Conteudo: 'marketing',
};

interface AppContextType {
  user: UserProfile | null;
  isLoading: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppContextProvider");
  return context;
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const hasRedirected = useRef(false);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const performRedirection = useCallback((userRole: string) => {
      const defaultPage = DEFAULT_PAGE_BY_ROLE[userRole];
      if (defaultPage) setActiveModule(defaultPage);
      hasRedirected.current = true;
  }, []);

  const handleWelcomeComplete = useCallback(async () => {
    if (user) {
        setIsWelcomeModalOpen(false);
        try {
            // Tenta atualizar, mas não trava se a tabela profiles não existir (ainda em bootstrap)
            await supabaseService.updateDocument<UserProfile>('profiles', user.id, { last_login: new Date().toISOString() });
            setUser(prev => prev ? { ...prev, last_login: new Date().toISOString() } : null);
        } catch (error) {
            console.warn("Could not update profile (DB might need bootstrap):", error);
        }
        performRedirection(user.role);
    }
  }, [user, performRedirection]);

  useEffect(() => {
    let isMounted = true;
    const checkInitialAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch (e) {
        console.error("[Auth] Session check failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    checkInitialAuth();
    
    const unsubscribe = listenAuthChanges((authUser) => {
      if (isMounted) {
        setUser(authUser);
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (user && !isLoading && !hasRedirected.current) {
        if (!user.last_login) {
            setIsWelcomeModalOpen(true);
        } else {
            performRedirection(user.role);
        }
    }
  }, [user, isLoading, performRedirection]);

  const value = { user, isLoading, activeModule, setActiveModule, theme, toggleTheme };

  return (
    <AppContext.Provider value={value}>
        {children}
        {user && (
             <WelcomeModal 
                isOpen={isWelcomeModalOpen}
                user={user}
                onComplete={handleWelcomeComplete}
            />
        )}
    </AppContext.Provider>
  );
};
