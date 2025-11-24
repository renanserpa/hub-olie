import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { useApp } from '../contexts/AppContext';
import { Button } from './shared/Button';

export const Layout: React.FC = () => {
  const { user, organization, logout } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">OlieHub v1.1</p>
            <h1 className="text-lg font-semibold">{organization?.name || 'Selecionar organização'}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <p className="font-semibold">{user?.name || 'Convidado'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button variant="secondary" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-6 py-6">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
          <nav className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
