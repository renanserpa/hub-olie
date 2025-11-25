import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase, isMockMode } from "../lib/supabase/client";
import { Organization, User } from "../types";
import { MOCK_USER, MOCK_ORGANIZATIONS } from "../lib/supabase/mockData";

interface AppContextValue {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  role?: string;

  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  selectOrganization: (org: Organization) => void;

  refreshSession: () => Promise<void>;

  tourSeen: boolean;
  completeTour: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const [tourSeen, setTourSeen] = useState<boolean>(() => {
    return localStorage.getItem("oliehub_tour_seen") === "1";
  });

  const completeTour = () => {
    localStorage.setItem("oliehub_tour_seen", "1");
    setTourSeen(true);
  };

  /** ------------------------
   * MOCK MODE (no Supabase)
   * ------------------------
   */
  const loadMockSession = () => {
    console.log("[AppContext] Mock mode ativo — carregando sessão mock");
    setUser(MOCK_USER);
    setOrganizations(MOCK_ORGANIZATIONS);
    setOrganization(MOCK_ORGANIZATIONS[0]);
    setLoading(false);
  };

  /** ------------------------
   * LOGIN REAL SUPABASE
   * ------------------------
   */
  const login = useCallback(async (email: string, password?: string) => {
    if (isMockMode) {
      loadMockSession();
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password ?? "",
    });

    if (error) {
      console.error("[AppContext] Login error:", error);
      throw new Error(error.message);
    }

    setUser(data.user as User);
  }, []);

  /** ------------------------
   * LOGOUT
   * ------------------------
   */
  const logout = useCallback(async () => {
    if (!isMockMode) await supabase.auth.signOut();
    setUser(null);
    setOrganizations([]);
    setOrganization(null);
  }, []);

  /** ------------------------
   * SELECT ORG
   * ------------------------
   */
  const selectOrganization = (org: Organization) => {
    setOrganization(org);
    localStorage.setItem("oliehub_selected_org", org.id);
  };

  /** ------------------------
   * CARREGAR SESSÃO / ORGANIZAÇÕES
   * ------------------------
   */
  const refreshSession = useCallback(async () => {
    try {
      console.log("[AppContext] Refreshing session...");

      if (isMockMode) {
        loadMockSession();
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("[AppContext] Erro ao obter sessão:", error);
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user as User);

      // Buscar organizações
      const { data: orgs, error: orgErr } = await supabase
        .from("organizations")
        .select("*")
        .order("name", { ascending: true });

      if (orgErr) console.error("[AppContext] Erro ao buscar orgs:", orgErr);

      setOrganizations(orgs ?? []);

      // Restaurar org selecionada
      const savedOrgId = localStorage.getItem("oliehub_selected_org");
      const found = orgs?.find((o) => o.id === savedOrgId);
      setOrganization(found ?? null);
    } catch (err) {
      console.error("[AppContext] refreshSession error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** ------------------------
   * BOOTSTRAP
   * ------------------------
   */
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

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
    [
      user,
      organization,
      organizations,
      loading,
      login,
      logout,
      selectOrganization,
      refreshSession,
      tourSeen,
    ]
  );

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
