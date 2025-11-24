declare module 'react-router-dom' {
  import * as React from 'react';
  export const BrowserRouter: React.FC<{ children?: React.ReactNode }>;
  export const Routes: React.FC<{ children?: React.ReactNode }>;
  export const Route: React.FC<{ path?: string; element: React.ReactNode; children?: React.ReactNode; index?: boolean }>;
  export const Navigate: React.FC<{ to: string; replace?: boolean }>;
  export const NavLink: React.FC<{ to: string; className?: any; children?: React.ReactNode }>;
  export const Outlet: React.FC;
  export const Link: React.FC<{ to: string; className?: string; children?: React.ReactNode }>;
  export function useNavigate(): (path: string, options?: { replace?: boolean }) => void;
  export function useParams<T extends Record<string, string | undefined>>(): T;
}
