interface AppContextValue {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  role?: string;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

    setUser(null);
    setOrganizations([]);
    setOrganization(null);

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
