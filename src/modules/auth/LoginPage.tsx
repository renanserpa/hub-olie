import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('demo@oliehub.com');
  const navigate = useNavigate();

  console.log('[OlieHub] LoginPage render');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = login(email);
    navigate(result.requiresOrganizationSelection ? '/select-org' : '/', { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6" aria-labelledby="login-heading">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Acesso</p>
        <h1 id="login-heading" className="mt-1 text-2xl font-semibold">
          Entrar no OlieHub
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Organize pedidos, produção e estoque do ateliê em um só lugar. Esta é uma conta de demonstração para testar o painel.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-label="Formulário de login">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="login-email">
              Email corporativo
            </label>
            <input
              id="login-email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoFocus
              aria-required
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar no painel
          </Button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
