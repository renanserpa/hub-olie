import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '@supabase/supabase-js';
import { isMockMode, mockOrganizationId, supabase } from '../lib/supabase/client';
import { Organization, User } from '../types';
import { devLog } from '../lib/utils/log';

type LoginResult = { requiresOrganizationSelection?: boolean };

interface AppContextValue {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  bootstrapDurationMs?: number;
  role?: string;
  tourSeen: boolean;
  bootstrapDurationMs?: number;
  completeTour: () => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  selectOrganization: (org: Organization) => void;
  refreshSession: () => Promise<void>;
}

const STORAGE_KEYS = {
  user: 'oh:user',
  org: 'oh:org',
  orgs: 'oh:orgs',
  tour: 'oh:tour',
};

const DEFAULT_ORGANIZATIONS: Organization[] = [{ id: mockOrganizationId, name: 'Organização Demo' }];

const MOCK_USER: User = { id: 'mock-user', email: 'demo@oliehub.com', name: 'Demo User' };

const mapSupabaseUser = (sessionUser: AuthUser | null): User | null => {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email || 'sem-email@oliehub.com',
    name: (sessionUser.user_metadata as { name?: string })?.name || sessionUser.email || 'Usuário',
  };
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [bootstrapDurationMs, setBootstrapDurationMs] = useState<number | undefined>();
  const [tourSeen, setTourSeen] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.tour) === '1');

  const selectOrganization = useCallback((org: Organization) => {
    setOrganization(org);
    localStorage.setItem(STORAGE_KEYS.org, JSON.stringify(org));
  }, []);
main
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const mappedUser = mapSupabaseUser(data.user);
      setUser(mappedUser);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(mappedUser));
      setOrganizations(DEFAULT_ORGANIZATIONS);
      localStorage.setItem(STORAGE_KEYS.orgs, JSON.stringify(DEFAULT_ORGANIZATIONS));
      if (!organization && DEFAULT_ORGANIZATIONS.length === 1) {
        selectOrganization(DEFAULT_ORGANIZATIONS[0]);
        return { requiresOrganizationSelection: false };
      }
      return { requiresOrganizationSelection: true };
    } finally {
      setLoading(false);
    }
  }, [organization, selectOrganization]);

  const logout = useCallback(async () => {
    if (!isMockMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setOrganizations([]);
    setOrganization(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.org);
    localStorage.removeItem(STORAGE_KEYS.orgs);
  }, []);

  const refreshSession = useCallback(async () => {
    if (isMockMode) {
      setUser(MOCK_USER);
      setOrganizations(DEFAULT_ORGANIZATIONS);
      setOrganization(DEFAULT_ORGANIZATIONS[0]);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const mapped = mapSupabaseUser(data.session?.user ?? null);
    setUser(mapped);
    setLoading(false);
  }, []);

  const completeTour = useCallback(() => {
    setTourSeen(true);
    localStorage.setItem(STORAGE_KEYS.tour, '1');
  }, []);

  useEffect(() => {
    const start = performance.now();
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const storedOrg = localStorage.getItem(STORAGE_KEYS.org);
    const storedOrgs = localStorage.getItem(STORAGE_KEYS.orgs);

    const initialize = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.user);
      const storedOrg = localStorage.getItem(STORAGE_KEYS.org);
      const storedOrgs = localStorage.getItem(STORAGE_KEYS.orgs);


    const finishBootstrap = () => {
      const durationMs = Math.round(performance.now() - start);
      setBootstrapDurationMs(durationMs);

      if (import.meta.env.DEV) {
        devLog('AppContext', 'Bootstrap concluído', {
          durationMs,
          isMockMode,
          hasStoredUser: !!storedUser,
          hasStoredOrganization: !!storedOrg,
        });
      }
    };

    refreshSession().finally(finishBootstrap);
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      user,
      organization,
      organizations,
      loading,
      bootstrapDurationMs,
      login,
      logout,
      selectOrganization,
      refreshSession,
      tourSeen,
      completeTour,
    }),
    [
      user,
      organization,
      organizations,
      loading,
      bootstrapDurationMs,
      login,
      logout,
      selectOrganization,
      refreshSession,
      tourSeen,
      completeTour,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
