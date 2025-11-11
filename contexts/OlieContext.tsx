import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { DefaultRBAC, RBACMatrix } from '../lib/rbac';
import { UserRole } from '../types';
import { dataService } from '../services/dataService';

type Permission = 'read' | 'write' | 'update' | 'delete';

interface OlieContextType {
  can: (scope: string, permission: Permission) => boolean;
  goto: (module: string) => void;
}

const OlieContext = createContext<OlieContextType | undefined>(undefined);

export const useOlie = () => {
  const context = useContext(OlieContext);
  if (!context) {
    throw new Error("useOlie must be used within an OlieContextProvider");
  }
  return context;
};

export const OlieContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, setActiveModule } = useApp();
  const [permissions, setPermissions] = useState<RBACMatrix>(DefaultRBAC);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      if (user) {
        setIsLoadingPermissions(true);
        try {
          // Idea #002: Fetch permissions from the database
          const remotePermissions = await dataService.getPermissions();
          if (remotePermissions && remotePermissions.length > 0) {
            // Here you would transform the flat list from DB into the RBACMatrix structure
            // For now, we'll assume it's correctly formatted or just keep the default
            console.log("Permissions loaded from database (simulation).");
            // setPermissions(formattedPermissions);
          } else {
             console.log("No dynamic permissions found, using default RBAC.");
             setPermissions(DefaultRBAC);
          }
        } catch (error) {
            console.error("Failed to load permissions, falling back to default RBAC.", error);
            setPermissions(DefaultRBAC);
        } finally {
            setIsLoadingPermissions(false);
        }
      }
    }
    loadPermissions();
  }, [user]);

  const can = useCallback((scope: string, permission: Permission): boolean => {
    if (!user || isLoadingPermissions) return false;
    
    const rolePermissions = permissions[user.role];
    if (!rolePermissions) return false;

    // AdminGeral has access to everything
    if (rolePermissions['*']) {
      return rolePermissions['*'][permission] || false;
    }
    
    const scopePermissions = rolePermissions[scope];
    if (!scopePermissions) return false;

    return scopePermissions[permission] || false;
  }, [user, permissions, isLoadingPermissions]);

  const goto = (module: string) => {
    if (can(module, 'read')) {
        setActiveModule(module);
    } else {
        console.warn(`[RBAC] Navigation to "${module}" denied for role: ${user?.role}`);
    }
  };

  const value = { can, goto };

  return <OlieContext.Provider value={value}>{children}</OlieContext.Provider>;
};