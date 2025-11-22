
import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import BootstrapModal from './BootstrapModal';
import { supabase } from '../lib/supabaseClient';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // Diagnóstico automático ao montar
  useEffect(() => {
      const checkDb = async () => {
          try {
              // Tenta um ping simples
              const { error } = await supabase.from('system_config').select('id').limit(1);
              if (error) {
                  // Se der erro de tabela não encontrada (42P01), precisa de bootstrap
                  if (error.code === '42P01') setIsBootstrapOpen(true);
                  setDbStatus('error');
              } else {
                  setDbStatus('ok');
              }
          } catch (e) {
              setDbStatus('error');
          }
      };
      checkDb();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Sucesso', description: 'Login realizado.' });
      // Força um pequeno delay para o estado propagar antes de recarregar ou redirecionar
      setTimeout(() => {
          window.location.reload(); 
      }, 500);
    } catch (err: any) {
      console.error("Login falhou:", err);
      if (err.message?.includes('perfil') || err.message?.includes('profiles')) {
          toast({ title: 'Atenção', description: 'Erro de perfil. Execute o Bootstrap.', variant: 'warning' });
          setIsBootstrapOpen(true);
      } else {
          toast({ title: 'Erro', description: 'Credenciais inválidas.', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        
        <div className="text-center mb-8">
            <div className="h-12 w-12 mx-auto bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-600 font-bold text-xl mb-4 border border-yellow-500/20">OH</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olie Hub Ops</h1>
            <p className="text-sm text-gray-500">Acesso Administrativo</p>
        </div>

        {dbStatus === 'error' && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-red-800">Banco de Dados Desconectado</p>
                    <p className="text-xs text-red-600 mt-1">As tabelas não foram encontradas. Clique em "Configurar Banco" abaixo.</p>
                </div>
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    type="password" value={password} onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all"
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4 h-10 bg-yellow-600 hover:bg-yellow-700 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar no Sistema'}
            </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Button variant="ghost" onClick={() => setIsBootstrapOpen(true)} className="w-full text-xs gap-2 border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
                <Database size={14}/> Configurar Banco de Dados (SQL)
            </Button>
            
            <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-gray-400">
                <span>Status Supabase:</span>
                {dbStatus === 'checking' && <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Verificando...</span>}
                {dbStatus === 'ok' && <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle className="w-3 h-3"/> Conectado</span>}
                {dbStatus === 'error' && <span className="flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-3 h-3"/> Erro</span>}
            </div>
        </div>
      </div>
      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
