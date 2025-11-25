import { LucideIcon, LayoutDashboard, ClipboardList, Factory, Boxes, Truck, WalletCards, Settings, Users } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Pedidos', path: '/orders', icon: ClipboardList },
  { label: 'Produção', path: '/production', icon: Factory },
  { label: 'Clientes', path: '/customers', icon: Users },
  { label: 'Estoque', path: '/inventory', icon: Boxes },
  { label: 'Logística', path: '/logistics', icon: Truck },
  { label: 'Finanças', path: '/finance', icon: WalletCards },
  { label: 'Configurações', path: '/settings', icon: Settings },
];
