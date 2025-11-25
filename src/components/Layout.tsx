import React, { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { useApp } from '../contexts/AppContext';
import { Button } from './shared/Button';

export const Layout: React.FC = () => {
  const { user, organization, logout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarLinks = useMemo(
    () =>
      NAV_ITEMS.map((item) => (
        <div key={item.path} onClick={() => setIsSidebarOpen(false)}>
          <NavLink
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
        </div>
      )),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 md:hidden"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">OlieHub v1.1</p>
              <h1 className="text-lg font-semibold truncate max-w-[180px] sm:max-w-xs">
                {organization?.name || 'Selecionar organização'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right md:block">
              <p className="font-semibold truncate max-w-[200px]">{user?.name || 'Convidado'}</p>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{user?.email}</p>
            </div>
            <Button variant="secondary" onClick={logout} className="whitespace-nowrap">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/60 md:hidden"
            aria-hidden
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6 md:gap-6 md:px-6">
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[80%] transform border-r border-slate-200 bg-white p-4 shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 md:static md:w-64 md:translate-x-0 md:rounded-2xl md:border md:shadow-sm ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="flex items-center justify-between md:hidden">
              <h2 className="text-sm font-semibold">Menu</h2>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-2">{sidebarLinks}</nav>
          </aside>

          <main className="flex-1">
            <div className="min-h-[70vh] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
