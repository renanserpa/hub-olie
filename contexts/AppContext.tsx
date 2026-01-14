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

interface MfaChallenge {
    amr: { method: string; timestamp: number }[];
}

interface AppContextType {
  user: UserProfile | null;
  isLoading: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mfaChallenge: MfaChallenge | null;
  setMfaChallenge: (challenge: MfaChallenge | null) => void;
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
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const hasRedirected = useRef(false);

  // Theme Logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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
            await supabaseService.updateDocument<UserProfile>('profiles', user.id, { last_login: new Date().toISOString() });
            setUser(prev => prev ? { ...prev, last_login: new Date().toISOString() } : null);
        } catch (error) {
            console.error("Failed to update last_login", error);
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
        console.error("[Auth] Initial check failed", e);
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
  }, []);

  useEffect(() => {
    if (user && !isLoading && !hasRedirected.current) {
        if (user.last_login === null) setIsWelcomeModalOpen(true);
        else performRedirection(user.role);
    }
    if (!user && !isLoading) {
        hasRedirected.current = false;
        setActiveModule('dashboard'); 
    }
  }, [user, isLoading, performRedirection]);

  const value = { user, isLoading, activeModule, setActiveModule, theme, toggleTheme, mfaChallenge, setMfaChallenge };

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
