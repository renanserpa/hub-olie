import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { listenAuthChanges, getCurrentUser, type AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true, error: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once on mount to check for an existing session.
    let isMounted = true;

    const checkCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (isMounted) {
                setUser(currentUser);
            }
        } catch (e) {
            console.error("Failed to get current user on load", e);
            if (isMounted) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("An unknown error occurred during authentication check.");
                }
                setUser(null);
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    };

    checkCurrentUser();

    // Listen for subsequent auth changes (e.g., login/logout)
    const unsubscribe = listenAuthChanges((authUser) => {
      if (isMounted) {
        // When auth state changes via listener, reset any initial load error
        setError(null);
        setUser(authUser);
        // The initial loading is done, so we don't need to touch isLoading here.
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  const value = { user, isLoading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
