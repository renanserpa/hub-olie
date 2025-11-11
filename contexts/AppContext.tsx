import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getCurrentUser, listenAuthChanges } from '../services/authService';
import { UserProfile } from '../types';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import WelcomeModal from '../components/WelcomeModal';
import { dataService } from '../services/dataService';

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
  const [isAIEnabled, setIsAIEnabled] = useState(false); // AI Layer is disabled
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
    
    // The listener fires immediately with the session status, handling both initial load and changes.
    const unsubscribe = listenAuthChanges((authUser) => {
      if (isMounted) {
        setUser(authUser);
        if (isLoading) {
            setIsLoading(false);
        }
      }
    });

    // Safety net in case the listener doesn't fire
    const timer = setTimeout(() => {
        if (isMounted && isLoading) {
            console.warn("Auth listener timeout. Forcefully disabling loader.");
            setIsLoading(false);
        }
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (user && !isLoading && !hasRedirected.current) {
        if (user.last_login === null) {
            setIsWelcomeModalOpen(true);
        } else {
            performRedirection(user.role);
        }
    }
    if (!user && !isLoading) {
        hasRedirected.current = false;
        setActiveModule('dashboard'); 
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