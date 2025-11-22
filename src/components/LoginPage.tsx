
import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Database, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Verificando conexão...');

  // Teste de conexão automático ao montar
  useEffect(() => {
      const checkConnection = async () => {
          try {
              const { error } = await supabase.from('system_config').select('id').limit(1);
              if (error) {
                  if (error.code === '42P01' || error.message.includes('does not exist')) {
                      setConnectionStatus('error');
                      setStatusMessage('Banco de dados não configurado (Tabelas ausentes).');
                      setIsBootstrapOpen(true); // Abre modal automaticamente
                  } else {
                      setConnectionStatus('error');
                      setStatusMessage(`Erro de conexão: ${error.message}`);
                  }
              } else {
                  setConnectionStatus('ok');
                  setStatusMessage('Sistema conectado.');
              }
          } catch (e: any) {
              setConnectionStatus('error');
              setStatusMessage(`Falha crítica: ${e.message}`);
          }
      };
      checkConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Sucesso', description: 'Autenticado. Redirecionando...' });
      
      // Força redirecionamento via window para garantir limpeza de estado
      setTimeout(() => {
          window.location.href = '/';
      }, 500);
    } catch (error: any) {
      console.error("Login Falhou:", error);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      
      // Se o erro for de banco de dados, sugere o bootstrap
      if (error.message?.includes('profiles') || error.message?.includes('relation') || error.code === '42P01') {
          setIsBootstrapOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4 font-sans">
      <div className="w-full max-w-md bg-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-6">
            <div className="h-12 w-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-4">OH</div>
            <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Olie Hub Ops</h1>
            <p className="text-sm text-textSecondary">Acesso Administrativo</p>
        </div>

        {/* Status Bar */}
        <div className={`mb-6 p-3 rounded-lg text-xs flex items-center justify-between ${
            connectionStatus === 'ok' ? 'bg-green-100 text-green-800' : 
            connectionStatus === 'checking' ? 'bg-blue-50 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
            <span className="flex items-center gap-2">
                {connectionStatus === 'ok' && <CheckCircle size={14} />}
                {connectionStatus === 'error' && <XCircle size={14} />}
                {connectionStatus === 'checking' && <Loader2 size={14} className="animate-spin" />}
                {statusMessage}
            </span>
            {connectionStatus === 'error' && (
                <button onClick={() => setIsBootstrapOpen(true)} className="underline font-bold hover:text-red-900">Corrigir</button>
            )}
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar no Sistema'}
            </Button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border">
             <Button 
                type="button" variant="ghost" onClick={() => setIsBootstrapOpen(true)}
                className="w-full text-xs text-textSecondary hover:text-primary"
             >
                <Database className="w-3 h-3 mr-2" />
                Ferramentas de Banco de Dados (SQL)
             </Button>
        </div>
      </div>
    </div>
    <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </>
  );
};

export default LoginPage;
