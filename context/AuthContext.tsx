import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { listenAuthChanges, getCurrentUser, type AuthUser } from '../services/authService';

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
    // 1. Check for current user on initial load
    const checkCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (e) {
            console.error("Failed to get current user on load", e);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };
    checkCurrentUser();

    // 2. Listen for subsequent auth changes (login/logout)
    const unsubscribe = listenAuthChanges((authUser) => {
      setUser(authUser);
      // Don't set loading here, as it might cause flicker on logout
      if (isLoading) setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isLoading]);

  const value = { user, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
