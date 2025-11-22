
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Database, CheckCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

  const handleTestConnection = async () => {
      setIsLoading(true);
      try {
          // Teste simples de ping
          const { error } = await supabase.from('system_config').select('count', { count: 'exact', head: true });
          
          if (error && error.code === '42P01') {
              // Tabela não existe -> Precisa de Bootstrap
              setConnectionStatus('error');
              toast({ title: 'Tabelas Ausentes', description: 'Banco de dados precisa ser configurado.', variant: 'destructive' });
              setIsBootstrapOpen(true);
          } else if (error) {
              setConnectionStatus('error');
              toast({ title: 'Erro de Conexão', description: error.message, variant: 'destructive' });
          } else {
              setConnectionStatus('success');
              toast({ title: 'Conectado!', description: 'Supabase acessível.', variant: 'default' });
          }
      } catch (e: any) {
          setConnectionStatus('error');
          toast({ title: 'Erro Crítico', description: e.message, variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Sucesso', description: 'Entrando...' });
      window.location.href = '/';
    } catch (err: any) {
      toast({ title: 'Erro no Login', description: err.message, variant: 'destructive' });
      // Se o erro sugerir falta de tabelas, oferece o bootstrap
      if (err.message?.includes('profiles') || err.message?.includes('relation')) {
          setIsBootstrapOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olie Hub Ops</h1>
            <p className="text-sm text-gray-500">Acesso de Recuperação</p>
        </div>

        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200">
            <p className="font-semibold">Credenciais Padrão:</p>
            <p>Email: adm@adm.com</p>
            <p>Senha: 111111</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null} Entrar
            </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-2">
             <Button type="button" variant="outline" onClick={handleTestConnection} disabled={isLoading} className="flex-1 text-xs">
                {connectionStatus === 'success' ? <CheckCircle className="w-3 h-3 mr-2 text-green-500"/> : <Database className="w-3 h-3 mr-2" />}
                Testar Conexão
             </Button>
             <Button type="button" variant="outline" onClick={() => setIsBootstrapOpen(true)} disabled={isLoading} className="flex-1 text-xs">
                Configurar Banco
             </Button>
        </div>
      </div>
      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
