
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Wifi, Database, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('Autenticando...');
    try {
      await login(email, password);
      toast({ title: 'Login realizado', description: 'Entrando no sistema...' });
      // Forçar reload para garantir limpeza de estado
      window.location.href = '/';
    } catch (error: any) {
      console.error("Login Falhou:", error);
      setStatusMessage('Falha. Verifique console.');
      
      if (error.message?.includes('Invalid login credentials')) {
         toast({ title: 'Credenciais Inválidas', description: 'Verifique e-mail e senha.', variant: 'destructive' });
      } else {
         toast({ title: 'Erro no Login', description: error.message, variant: 'destructive' });
         // Se for erro de banco, sugerir bootstrap
         if (error.message?.includes('profiles') || error.code === '42P01') {
             setIsBootstrapOpen(true);
         }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
      setIsLoading(true);
      setStatusMessage('Testando conexão...');
      try {
          // Teste simples de conexão
          const { error } = await supabase.from('system_config').select('count').limit(1);
          
          if (error) {
              if (error.code === '42P01') { // Undefined table
                   setStatusMessage('Tabelas não encontradas.');
                   setIsBootstrapOpen(true);
              } else {
                   setStatusMessage(`Erro: ${error.message}`);
                   toast({ title: "Erro de Conexão", description: error.message, variant: "destructive" });
              }
          } else {
              setStatusMessage('Conexão OK!');
              toast({ title: "Conexão OK", description: "O banco de dados está acessível." });
          }
      } catch (e: any) {
          setStatusMessage(`Falha grave: ${e.message}`);
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
            <p className="text-sm text-textSecondary">Acesso Administrativo (Rescue Mode)</p>
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
                    type="button" variant="outline" onClick={testConnection} disabled={isLoading}
                    className="flex-1 text-xs"
                 >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wifi className="w-3 h-3 mr-2" />}
                    Testar Conexão
                 </Button>
                 <Button 
                    type="button" variant="ghost" onClick={() => setIsBootstrapOpen(true)} disabled={isLoading}
                    className="flex-1 text-xs text-amber-600 hover:text-amber-700"
                 >
                    <Database className="w-3 h-3 mr-2" />
                    Corrigir Banco
                 </Button>
             </div>
             
             {statusMessage && (
                 <div className="text-xs text-center p-2 rounded bg-secondary text-textSecondary font-mono">
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
