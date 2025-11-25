import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { login, user, organization, loading } = useApp();
  const [email, setEmail] = useState('demo@oliehub.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

    navigate(result.requiresOrganizationSelection ? '/select-org' : '/', { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Acesso</p>
        <h1 className="mt-1 text-2xl font-semibold">Entrar no OlieHub</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use seu email corporativo ou utilize o modo demo sem Supabase configurado.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Informe sua senha ou deixe em branco no modo mock"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting || loading}>
            {submitting || loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
