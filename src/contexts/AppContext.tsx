import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getCurrentUser, listenAuthChanges } from '../services/authService';
import { UserProfile } from '../types';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import WelcomeModal from '../components/WelcomeModal';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const DEFAULT_PAGE_BY_ROLE: Record<string, string> = {
    AdminGeral: 'dashboard',
    Producao: 'production',
    Vendas: 'orders',
    Financeiro: 'analytics',
    Administrativo: 'logistics',
    Conteudo: 'marketing',
};

interface MfaChallenge {
    amr: {
        method: string;
        timestamp: number;
    }[];
}

interface AppContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  activeModule: string;
  setActiveModule: (module: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAIEnabled: boolean;
  mfaChallenge: MfaChallenge | null;
  setMfaChallenge: (challenge: MfaChallenge | null) => void;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isAIEnabled] = useState(false); 
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);
  const hasRedirected = useRef(false);
  const { theme, toggleTheme } = useTheme();

  const performRedirection = useCallback((userRole: string) => {
      const defaultPage = DEFAULT_PAGE_BY_ROLE[userRole];
      if (defaultPage) {
          setActiveModule(defaultPage);
      }
      hasRedirected.current = true;
  }, []);

  const handleWelcomeComplete = useCallback(async () => {
    if (user) {
        setIsWelcomeModalOpen(false);
        try {
            await dataService.updateDocument<UserProfile>('profiles', user.id, { last_login: new Date().toISOString() });
            setUser(prev => prev ? { ...prev, last_login: new Date().toISOString() } : null);
        } catch (error) {
            console.error("Failed to update last_login", error);
        }
        performRedirection(user.role);
    }
  }, [user, performRedirection]);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
        console.warn("[AppContext] Supabase não configurado (isSupabaseConfigured = false). App em modo offline/configuração.");
        if (isMounted) {
            setIsLoading(false);
            setUser(null);
        }
        return;
    }

    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (isMounted) {
             setUser(currentUser);
        }
      } catch (e) {
        console.error("[AppContext] Erro auth:", e);
        if (isMounted) setError(e instanceof Error ? e.message : "Authentication failed.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const unsubscribe = listenAuthChanges((authUser) => {
      if (isMounted) {
        setUser(authUser);
        setIsLoading(false);
      }
    });

    return () => { 
        isMounted = false; 
        unsubscribe(); 
    };
  }, []);

  useEffect(() => {
    if (user && !isLoading && !hasRedirected.current) {
        if (user.last_login === null || user.last_login === undefined) {
            setIsWelcomeModalOpen(true);
        } else {
            performRedirection(user.role);
        }
    }
  }, [user, isLoading, performRedirection]);

  const value = { user, isLoading, error, activeModule, setActiveModule, theme, toggleTheme, isAIEnabled, mfaChallenge, setMfaChallenge };

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

export const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    return (
        <ThemeProvider>
            <AppStateProvider>
                {children}
            </AppStateProvider>
        </ThemeProvider>
    )
}
