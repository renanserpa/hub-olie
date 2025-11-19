
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
    console.log("[AppContext] Inicializando autenticação...");

    // TIMEOUT DE SEGURANÇA: Se o Supabase não responder em 3 segundos, libera a UI
    const safetyTimeout = setTimeout(() => {
        if (isMounted && isLoading) {
            console.warn("[AppContext] Timeout de inicialização atingido. Forçando liberação da UI.");
            setIsLoading(false);
        }
    }, 3000);

    const checkInitialAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
             setUser(currentUser);
             console.log("[AppContext] Sessão:", currentUser ? "Ativa" : "Nenhuma");
        }
      } catch (e) {
        console.error("[AppContext] Erro auth:", e);
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

    return () => { 
        isMounted = false; 
        clearTimeout(safetyTimeout);
        unsubscribe(); 
    };
  }, []);

  useEffect(() => {
    if (user && !isLoading && !hasRedirected.current) {
        // Se last_login for nulo, mostra modal de boas-vindas, senão redireciona
        if (user.last_login === null || user.last_login === undefined) {
            setIsWelcomeModalOpen(true);
        } else {
            performRedirection(user.role);
        }
    }
    if (!user && !isLoading) {
        hasRedirected.current = false;
        // Não forçar redirecionamento aqui, deixe o ProtectedRoute lidar com isso
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
