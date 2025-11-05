import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useApp } from './AppContext';
import { DefaultRBAC } from '../lib/rbac';
import { UserRole } from '../types';

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

  const can = useCallback((scope: string, permission: Permission): boolean => {
    if (!user) return false;
    
    const rolePermissions = DefaultRBAC[user.role];
    if (!rolePermissions) return false;

    // AdminGeral has access to everything
    if (rolePermissions['*']) {
      return rolePermissions['*'][permission] || false;
    }
    
    const scopePermissions = rolePermissions[scope];
    if (!scopePermissions) return false;

    return scopePermissions[permission] || false;
  }, [user]);

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
