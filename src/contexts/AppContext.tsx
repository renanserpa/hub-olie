import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockOrganizationId } from '../lib/supabase/client';
import { Organization, User } from '../types';

interface AppContextValue {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  role?: string;
  login: (email: string) => { requiresOrganizationSelection: boolean };
  logout: () => void;
  selectOrganization: (org: Organization | null) => void;
  refreshSession: () => void;
  tourSeen: boolean;
  completeTour: () => void;
}

const DEFAULT_ORGANIZATIONS: Organization[] = [
  { id: mockOrganizationId, name: 'Organização Demo' },
  { id: 'org-002', name: 'Unidade SP' },
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>(DEFAULT_ORGANIZATIONS);
  const [loading, setLoading] = useState(true);
  const [tourSeen, setTourSeen] = useState<boolean>(false);

  const refreshSession = useCallback(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('oh:user');
    const storedOrg = localStorage.getItem('oh:org');
    const storedOrgs = localStorage.getItem('oh:orgs');
    const storedTour = localStorage.getItem('oh:tour');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedOrg) setOrganization(JSON.parse(storedOrg));
    if (storedOrgs) setOrganizations(JSON.parse(storedOrgs));
    if (storedTour) setTourSeen(storedTour === 'true');
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const selectOrganization = useCallback((org: Organization | null) => {
    setOrganization(org);
    if (org) {
      localStorage.setItem('oh:org', JSON.stringify(org));
    } else {
      localStorage.removeItem('oh:org');
    }
  }, []);

  const login = useCallback(
    (email: string) => {
      const newUser: User = { id: 'user-1', email, name: email.split('@')[0] };
      setUser(newUser);
      localStorage.setItem('oh:user', JSON.stringify(newUser));

      const orgsToUse = organizations.length ? organizations : DEFAULT_ORGANIZATIONS;
      setOrganizations(orgsToUse);
      localStorage.setItem('oh:orgs', JSON.stringify(orgsToUse));

      if (orgsToUse.length === 1) {
        selectOrganization(orgsToUse[0]);
      } else {
        selectOrganization(null);
      }

      return { requiresOrganizationSelection: orgsToUse.length > 1 };
    },
    [organizations, selectOrganization]
  );

  const logout = useCallback(() => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('oh:user');
    localStorage.removeItem('oh:org');
    localStorage.removeItem('oh:tour');
  }, []);

  const completeTour = useCallback(() => {
    setTourSeen(true);
    localStorage.setItem('oh:tour', 'true');
  }, []);

  const value = useMemo(
    () => ({
      user,
      organization,
      organizations,
      loading,
      login,
      logout,
      selectOrganization,
      refreshSession,
      tourSeen,
      completeTour,
    }),
    [user, organization, organizations, loading, tourSeen, login, logout, selectOrganization, refreshSession, completeTour]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
