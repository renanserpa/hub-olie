import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '@supabase/supabase-js';
import { isMockMode, mockOrganizationId, supabase } from '../lib/supabase/client';
import { Organization, User } from '../types';

interface AppContextValue {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  role?: string;
  login: (email: string, password?: string) => Promise<{ requiresOrganizationSelection: boolean; error?: string }>;
  logout: () => Promise<void>;
  selectOrganization: (org: Organization | null) => void;
  refreshSession: () => Promise<void>;
  tourSeen: boolean;
  completeTour: () => void;
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
  const [tourSeen, setTourSeen] = useState<boolean>(false);

  const persistUser = useCallback((value: User | null) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, []);

  const persistOrganizations = useCallback((orgs: Organization[]) => {
    setOrganizations(orgs);
    localStorage.setItem(STORAGE_KEYS.orgs, JSON.stringify(orgs));
  }, []);

  const selectOrganization = useCallback((org: Organization | null) => {
    setOrganization(org);
    if (org) {
      localStorage.setItem(STORAGE_KEYS.org, JSON.stringify(org));
    } else {
      localStorage.removeItem(STORAGE_KEYS.org);
    }
  }, []);

  const hydrateFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const storedOrg = localStorage.getItem(STORAGE_KEYS.org);
    const storedOrgs = localStorage.getItem(STORAGE_KEYS.orgs);
    const storedTour = localStorage.getItem(STORAGE_KEYS.tour);

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedOrg) setOrganization(JSON.parse(storedOrg));
    if (storedOrgs) setOrganizations(JSON.parse(storedOrgs));
    if (storedTour) setTourSeen(storedTour === 'true');
  }, []);

  const loadOrganizations = useCallback(
    async (userId?: string): Promise<Organization[]> => {
      if (isMockMode) {
        persistOrganizations(DEFAULT_ORGANIZATIONS);
        return DEFAULT_ORGANIZATIONS;
      }

      if (!userId) {
        persistOrganizations([]);
        return [];
      }

      const { data, error } = await supabase
        .from('user_organization_role')
        .select('organization:organization_id ( id, name )')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao carregar organizações', error);
        persistOrganizations([]);
        return [];
      }

      const orgs = (data || [])
        .map((row: { organization?: Organization | Organization[] | null }) => {
          if (Array.isArray(row.organization)) return row.organization[0];
          return row.organization;
        })
        .filter((org): org is Organization => Boolean(org));

      persistOrganizations(orgs);
      return orgs;
    },
    [persistOrganizations]
  );

  const bootstrapSupabaseSession = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user ?? null;
    const mappedUser = mapSupabaseUser(sessionUser);
    setUser(mappedUser);
    persistUser(mappedUser);
    const orgs = await loadOrganizations(mappedUser?.id);

    if (orgs.length === 1) {
      selectOrganization(orgs[0]);
    } else if (orgs.length > 1) {
      const storedOrg = localStorage.getItem(STORAGE_KEYS.org);
      if (!storedOrg) {
        selectOrganization(null);
      } else {
        selectOrganization(JSON.parse(storedOrg));
      }
    }

    const storedTour = localStorage.getItem(STORAGE_KEYS.tour);
    if (storedTour) setTourSeen(storedTour === 'true');
    setLoading(false);
  }, [loadOrganizations, persistUser, selectOrganization]);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    if (isMockMode) {
      hydrateFromStorage();
      if (!user) {
        setUser(MOCK_USER);
        persistUser(MOCK_USER);
      }
      if (!organizations.length) {
        persistOrganizations(DEFAULT_ORGANIZATIONS);
      }
      if (!organization) {
        selectOrganization(DEFAULT_ORGANIZATIONS[0]);
      }
      setLoading(false);
      return;
    }

    await bootstrapSupabaseSession();
  }, [bootstrapSupabaseSession, hydrateFromStorage, organization, organizations.length, persistOrganizations, persistUser, selectOrganization, user]);

  useEffect(() => {
    if (isMockMode) {
      hydrateFromStorage();
      setLoading(false);
      return;
    }

    bootstrapSupabaseSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const mappedUser = mapSupabaseUser(session?.user ?? null);
      setUser(mappedUser);
      persistUser(mappedUser);
      const orgs = await loadOrganizations(mappedUser?.id);
      if (orgs.length === 1) {
        selectOrganization(orgs[0]);
      } else if (!orgs.length) {
        selectOrganization(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, [bootstrapSupabaseSession, hydrateFromStorage, loadOrganizations, persistUser, selectOrganization]);

  const login = useCallback(
    async (email: string, password?: string) => {
      setLoading(true);
      if (isMockMode) {
        const newUser: User = { ...MOCK_USER, email, name: email.split('@')[0] || MOCK_USER.name };
        setUser(newUser);
        persistUser(newUser);
        persistOrganizations(DEFAULT_ORGANIZATIONS);
        selectOrganization(DEFAULT_ORGANIZATIONS[0]);
        setLoading(false);
        return { requiresOrganizationSelection: DEFAULT_ORGANIZATIONS.length > 1 };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
        if (error) {
          console.error('Erro de login Supabase', error);
          return { requiresOrganizationSelection: false, error: error.message };
        }

        const sessionUser = mapSupabaseUser(data.user || data.session?.user || null);
        setUser(sessionUser);
        persistUser(sessionUser);
        const orgs = await loadOrganizations(sessionUser?.id);
        if (orgs.length === 1) {
          selectOrganization(orgs[0]);
        } else {
          selectOrganization(null);
        }
        return { requiresOrganizationSelection: orgs.length > 1 };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao autenticar';
        console.error(message);
        return { requiresOrganizationSelection: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [loadOrganizations, persistUser, selectOrganization]
  );

  const logout = useCallback(async () => {
    if (!isMockMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setOrganization(null);
    persistOrganizations([]);
    localStorage.removeItem(STORAGE_KEYS.org);
    localStorage.removeItem(STORAGE_KEYS.tour);
    persistUser(null);
  }, [persistOrganizations, persistUser]);

  const completeTour = useCallback(() => {
    setTourSeen(true);
    localStorage.setItem(STORAGE_KEYS.tour, 'true');
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
    [user, organization, organizations, loading, login, logout, selectOrganization, refreshSession, tourSeen, completeTour]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
