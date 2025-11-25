import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';

const LoginPage: React.FC = () => {
  const { login, user, organization, loading } = useApp();
  const [email, setEmail] = useState('demo@oliehub.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

    navigate(result.requiresOrganizationSelection ? '/select-org' : '/', { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6" aria-labelledby="login-heading">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500">Acesso</p>
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
          </Button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
