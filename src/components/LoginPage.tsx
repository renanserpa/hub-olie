
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Wifi, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Login realizado', description: 'Entrando no sistema...' });
      // Timeout para garantir que o cookie seja setado antes do reload
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error("Login Failed:", error);
      
      // Se o erro for relacionado a tabelas inexistentes (comum após reset)
      if (error.message?.includes('profiles') || error.message?.includes('relation does not exist') || error.code === '42P01') {
         toast({ title: 'Banco de Dados Incompleto', description: 'Detectamos tabelas faltando. Abrindo assistente...', variant: 'warning' });
         setIsBootstrapOpen(true);
      } else if (error.message?.includes('Invalid login credentials')) {
         toast({ title: 'Credenciais Inválidas', description: 'Senha ou email incorretos.', variant: 'destructive' });
      } else {
         toast({ title: 'Erro no Login', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
      setIsLoading(true);
      setConnectionStatus('idle');
      setStatusMessage('Testando...');
      
      try {
          // 1. Teste de Conectividade Básica (Ping)
          const { error: pingError } = await supabase.from('system_config').select('count').limit(1);
          
          if (pingError) {
              // 42P01 = Table not found (Significa que conectou, mas o banco tá vazio)
              if (pingError.code === '42P01') {
                  setConnectionStatus('warning');
                  setStatusMessage('Conectado, mas tabelas ausentes.');
                  setIsBootstrapOpen(true);
                  return;
              }
              throw pingError;
          }

          // 2. Teste de Dados do Admin
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .limit(1);

          if (profileError) throw profileError;

          if (!profiles || profiles.length === 0) {
              setConnectionStatus('warning');
              setStatusMessage('Tabelas OK, mas Admin não encontrado.');
              // Abre modal para rodar o script de correção de usuário
              setIsBootstrapOpen(true);
              return;
          }

          setConnectionStatus('success');
          setStatusMessage('Conexão e Dados OK!');
          toast({ title: "Tudo Pronto", description: "O sistema está operacional." });

      } catch (e: any) {
          console.error(e);
          setConnectionStatus('error');
          setStatusMessage(`Erro: ${e.message}`);
          toast({ title: "Erro de Conexão", description: e.message, variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4 font-sans">
      <div className="w-full max-w-md bg-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
            <div className="h-12 w-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-4">OH</div>
            <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Olie Hub Ops</h1>
            <p className="text-sm text-textSecondary">Acesso Administrativo (Rescue)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                <input 
                    type="password" value={password} onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
             <div className="flex gap-2">
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={testConnection} 
                    disabled={isLoading}
                    className={`flex-1 text-xs ${connectionStatus === 'success' ? 'border-green-500 text-green-600' : connectionStatus === 'error' ? 'border-red-500 text-red-600' : ''}`}
                 >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wifi className="w-3 h-3 mr-2" />}
                    Testar Conexão
                 </Button>
                 <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsBootstrapOpen(true)} 
                    disabled={isLoading}
                    className="flex-1 text-xs"
                 >
                    <Database className="w-3 h-3 mr-2" />
                    Corrigir Banco
                 </Button>
             </div>
             
             {statusMessage && (
                 <div className={`text-xs text-center p-2 rounded ${connectionStatus === 'success' ? 'bg-green-100 text-green-800' : connectionStatus === 'error' ? 'bg-red-100 text-red-800' : connectionStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-secondary text-textSecondary'}`}>
                     {statusMessage}
                 </div>
             )}
        </div>
      </div>
    </div>
    <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </>
  );
};

export default LoginPage;
