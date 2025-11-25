import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { devLog } from '../../lib/utils/log';

const LoginPage: React.FC = () => {
  const { login, user, organization, loading } = useApp();
  const [email, setEmail] = useState('demo@oliehub.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (import.meta.env.DEV) {
        devLog('LoginPage', 'Tentando login', { email, mode: import.meta.env.MODE });
      }

      const result = await login(email, password);
      const target = result?.requiresOrganizationSelection || !organization ? '/select-org' : '/';
      showToast('Login realizado com sucesso', 'success');
      navigate(target, { replace: true });
      if (import.meta.env.DEV) {
        devLog('LoginPage', 'Login bem-sucedido', {
          redirectedTo: target,
          requiresOrganizationSelection: result?.requiresOrganizationSelection,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      showToast('Não foi possível entrar', 'error', message);
      if (import.meta.env.DEV) {
        devLog('LoginPage', 'Erro ao fazer login', { message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('LoginPage', 'Página montada');
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('LoginPage', 'Render inicial ou mudança de estado', {
        loading,
        hasUser: !!user,
        hasOrganization: !!organization,
      });
    }

    if (!loading && user) {
      const target = organization ? '/' : '/select-org';
      if (import.meta.env.DEV) {
        devLog('LoginPage', 'Usuário já autenticado, redirecionando', { target });
      }
      navigate(target, { replace: true });
    }
  }, [loading, user, organization, navigate]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6" aria-labelledby="login-heading">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Acesso</p>
        <h1 id="login-heading" className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Entrar
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use suas credenciais corporativas.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="login-password">
              Senha
            </label>
            <input
              id="login-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              aria-required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" loading={submitting}>
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
