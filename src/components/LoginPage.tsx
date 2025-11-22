
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Login realizado', description: 'Carregando sistema...' });
      // Recarrega para limpar qualquer estado residual
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('profiles') || error.code === '42P01') {
         toast({ title: 'Banco de Dados Incompleto', description: 'Tabelas não encontradas. Execute a configuração.', variant: 'destructive' });
         setIsBootstrapOpen(true);
      } else {
         toast({
            title: 'Erro no Login',
            description: error.message || 'Verifique suas credenciais.',
            variant: 'destructive',
         });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
      setIsLoading(true);
      setConnectionStatus('idle');
      try {
          console.log("Testando conexão Supabase...");
          
          // 1. Teste básico de conexão (system_config)
          const { error: configError } = await supabase.from('system_config').select('count').limit(1);

          if (configError) {
              if (configError.code === '42P01') { // Table not found
                   toast({ title: 'Tabelas Ausentes', description: 'O banco precisa ser configurado. Abrindo script...', variant: 'warning' });
                   setIsBootstrapOpen(true);
                   return;
              }
              throw configError;
          }

          // 2. Teste de existência do usuário Admin (profiles)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'adm@adm.com')
            .limit(1);

          if (profileError) {
             throw new Error(`Erro ao ler profiles: ${profileError.message}`);
          }

          if (!profileData || profileData.length === 0) {
             toast({ title: 'Admin Não Encontrado', description: 'A tabela existe, mas o usuário adm@adm.com não está nela. Execute o script SQL.', variant: 'destructive' });
             setIsBootstrapOpen(true);
             return;
          }

          setConnectionStatus('success');
          toast({ title: 'Conexão Perfeita!', description: 'Banco conectado e Admin encontrado. Tente logar.', variant: 'default' });

      } catch (e: any) {
           setConnectionStatus('error');
           console.error("Exceção teste conexão:", e);
           toast({ title: 'Erro de Conexão', description: e.message || "Falha desconhecida", variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
      <div className="w-full max-w-md bg-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
            <div className="h-12 w-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-4">OH</div>
            <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Olie Hub Ops</h1>
            <p className="text-sm text-textSecondary">Acesso Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="seu@email.com"
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
                    placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
             <Button 
                type="button" 
                variant="outline" 
                onClick={testSupabaseConnection} 
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 ${connectionStatus === 'success' ? 'border-green-500 text-green-600' : ''} ${connectionStatus === 'error' ? 'border-red-500 text-red-600' : ''}`}
             >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 connectionStatus === 'success' ? <CheckCircle className="w-4 h-4" /> :
                 connectionStatus === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                 <Wifi className="w-4 h-4" />
                }
                {connectionStatus === 'success' ? 'Sistema Operacional' : 'Testar Conexão & Banco'}
             </Button>
             
             <div className="text-xs text-center text-textSecondary mt-2">
                <p>Ambiente: <span className="font-mono">Rescue v21</span></p>
             </div>
        </div>
      </div>
    </div>
    <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </>
  );
};

export default LoginPage;
