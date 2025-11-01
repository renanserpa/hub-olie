import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { listenAuthChanges, getCurrentUser, type AuthUser } from '../services/authService';
import { isSandbox } from '../lib/runtime';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true, error: null });

export const useAuth = () => useContext(AuthContext);

// FIX: Refactored to use an explicit props interface with React.FC to resolve a subtle typing issue in index.tsx.
interface AuthProviderProps {
  children: ReactNode;
}

// FIX: Explicitly type the component with React.FC to ensure the 'children' prop is correctly handled by TypeScript's JSX parser.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkInitialAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error("Failed to get current user on load", e);
        if (isMounted) {
            setError(e instanceof Error ? e.message : "Authentication check failed.");
            setUser(null);
        }
      } finally {
        if (isMounted) {
            setIsLoading(false);
        }
      }
    };

    // For Supabase, we check the session. For Sandbox, we just set the user directly.
    checkInitialAuth();

    // The listener handles subsequent changes (login/logout).
    const unsubscribe = listenAuthChanges((authUser) => {
      if (isMounted) {
        setUser(authUser);
        // If a change comes from the listener, the initial load is definitely complete.
        if (isLoading) setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // Empty array ensures this runs only once.

  const value = { user, isLoading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};