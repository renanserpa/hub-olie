import { UserRole } from "../types";

type Permission = 'read' | 'write' | 'update' | 'delete';
type ScopePermissions = { [key in Permission]?: boolean };
type RolePermissions = { [scope: string]: ScopePermissions };
export type RBACMatrix = { [key in UserRole]?: RolePermissions };

const allScope: ScopePermissions = { read: true, write: true, update: true, delete: true };

export const DefaultRBAC: RBACMatrix = {
  AdminGeral: { '*': allScope },
  Administrativo: {
    'Dashboard': allScope,
    'Settings': allScope,
    'Initializer': { read: true, write: true, update: true },
    'ExecutiveDashboard': allScope,
    'Analytics': allScope,
    'Orders': allScope,
    'Products': allScope,
  },
  Producao: {
    'Dashboard': { read: true },
    'Production': { read: true, update: true },
    'Orders': { read: true },
    'Inventory': { read: true, update: true },
    'Logistics': { read: true, update: true },
  },
  Financeiro: {
    'Dashboard': { read: true },
    'Finance': { read: true, write: true },
    'Orders': { read: true },
    'Purchases': { read: true, write: true },
    'Analytics': { read: true },
  },
  Vendas: {
    'Dashboard': { read: true },
    'Orders': { read: true, write: true },
    'Omnichannel': { read: true, write: true },
    'Products': { read: true },
  },
  Conteudo: {
    'Dashboard': { read: true },
    'Marketing': { read: true, write: true },
    'Omnichannel': { read: true, write: true },
    'Products': { read: true },
  },
};
