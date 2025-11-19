
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getCurrentUser, listenAuthChanges } from '../services/authService';
import { UserProfile } from '../types';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import WelcomeModal from '../components/WelcomeModal';

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
      const defaultPage = DEFAULT_PAGE_BY_ROLE[userRole] || 'dashboard';
      setActiveModule(defaultPage);
      hasRedirected.current = true;
  }, []);

  const handleWelcomeComplete = () => {
    setIsWelcomeModalOpen(false);
    if (user) performRedirection(user.role);
  };

  useEffect(() => {
    let isMounted = true;
    console.log("[AppContext] Inicializando autenticação simplificada...");

    const initAuth = async () => {
        try {
            // 1. Tenta obter sessão atual
            const currentUser = await getCurrentUser();
            if (isMounted) {
                setUser(currentUser);
                if (currentUser) console.log("[AppContext] Sessão recuperada:", currentUser.email);
            }
        } catch (e) {
            console.error("[AppContext] Erro na inicialização:", e);
            if (isMounted) setError("Falha ao iniciar autenticação.");
        } finally {
            // CRÍTICO: Sempre libera o loading, independente do resultado
            if (isMounted) setIsLoading(false);
        }
    };

    initAuth();

    // 2. Listener para mudanças futuras
    const unsubscribe = listenAuthChanges((authUser) => {
        if (isMounted) {
            console.log("[AppContext] Mudança de estado:", authUser ? "Logado" : "Deslogado");
            setUser(authUser);
            setIsLoading(false);
            
            if (authUser && !hasRedirected.current) {
                performRedirection(authUser.role);
            }
        }
    });

    return () => {
        isMounted = false;
        unsubscribe();
    };
  }, [performRedirection]);

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
