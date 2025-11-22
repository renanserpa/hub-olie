
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Wifi, RefreshCw, Database } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';
import { useTranslation } from '../hooks/useTranslation';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111'); // Nova senha padrão
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      // Reload to ensure fresh state
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      // Check for specific database errors
      if (error.message?.includes('profiles') || error.code === '42P01') {
         toast({ title: 'Erro de Banco de Dados', description: 'Tabelas não encontradas.', variant: 'destructive' });
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
      try {
          console.log("Testando conexão Supabase...");
          // Tenta fazer uma query simples e anônima na tabela de configurações
          // A tabela system_config deve ser legível por anon se as RLS estiverem corretas
          const { data, error } = await supabase.from('system_config').select('olie_hub_name').limit(1);

          if (error) {
              console.error("Erro teste conexão:", error);
              if (error.code === '42P01') {
                   // 42P01 = undefined_table
                   toast({ title: 'Tabela não encontrada', description: 'O banco de dados precisa ser configurado.', variant: 'warning' });
                   setIsBootstrapOpen(true);
              } else {
                   toast({ title: 'Erro de Conexão', description: `Falha: ${error.message}`, variant: 'destructive' });
              }
          } else if (data) {
              const hubName = data[0]?.olie_hub_name || 'Olie Hub';
              toast({ title: 'Conexão Estabelecida', description: `Banco conectado: ${hubName}`, variant: 'default' });
          }
      } catch (e: any) {
           console.error("Exceção teste conexão:", e);
           toast({ title: 'ERRO FATAL', description: `Cliente Supabase falhou: ${e.message}`, variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  };

  const handleReload = () => {
      window.location.reload();
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
      <div className="w-full max-w-md bg-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
            <div className="h-12 w-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-4">OH</div>
            <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Olie Hub</h1>
            <p className="text-sm text-textSecondary">Acesso Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">{t('login.emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">{t('login.passwordLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                <input 
                    type="password" value={password} onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('login.submitButton')}
            </Button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
             <Button 
                type="button" 
                variant="outline" 
                onClick={testSupabaseConnection} 
                disabled={isLoading}
                className="w-full text-xs h-9"
            >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <Wifi className="w-3 h-3 mr-2" />}
                Diagnóstico: Testar Conexão
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsBootstrapOpen(true)}
                    className="text-xs h-9 text-textSecondary hover:text-primary"
                >
                    <Database className="w-3 h-3 mr-2" />
                    Configurar BD
                </Button>
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleReload} 
                    className="text-xs h-9 text-textSecondary hover:text-primary"
                >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Recarregar
                </Button>
            </div>
        </div>
      </div>
    </div>
    <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </>
  );
};

export default LoginPage;
