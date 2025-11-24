import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockOrganizationId } from '../lib/supabase/client';
import { Organization, User } from '../types';

interface AppContextValue {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  selectOrganization: (org: Organization | null) => void;
  tourSeen: boolean;
  completeTour: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourSeen, setTourSeen] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('oh:user');
    const storedOrg = localStorage.getItem('oh:org');
    const storedTour = localStorage.getItem('oh:tour');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedOrg) setOrganization(JSON.parse(storedOrg));
    if (storedTour) setTourSeen(storedTour === 'true');
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser: User = { id: 'user-1', email, name: email.split('@')[0] };
    setUser(newUser);
    localStorage.setItem('oh:user', JSON.stringify(newUser));
    if (!organization) {
      const org: Organization = { id: mockOrganizationId, name: 'Organização Demo' };
      setOrganization(org);
      localStorage.setItem('oh:org', JSON.stringify(org));
    }
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('oh:user');
    localStorage.removeItem('oh:org');
  };

  const selectOrganization = (org: Organization | null) => {
    setOrganization(org);
    localStorage.setItem('oh:org', JSON.stringify(org));
  };

  const completeTour = () => {
    setTourSeen(true);
    localStorage.setItem('oh:tour', 'true');
  };

  const value = useMemo(
    () => ({ user, organization, loading, login, logout, selectOrganization, tourSeen, completeTour }),
    [user, organization, loading, tourSeen]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
