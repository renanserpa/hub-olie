import React, { useState } from 'react';
import { login } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';
import { Loader2, AlertTriangle, Database, Lock, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { toast } from '../hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
        toast({ title: "Erro de Configuração", description: "Cliente Supabase não inicializado.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.ok) {
          toast({ title: "Sucesso", description: "Autenticado com sucesso. Redirecionando..." });
          // O redirecionamento é tratado pelo AppContext ao detectar o usuário
      } else {
          toast({ title: "Falha no Login", description: result.error, variant: "destructive" });
          
          // Se o erro sugerir problemas de estrutura (ex: perfil não criado), sugerimos o bootstrap
          if (result.error?.includes('perfil') || result.error?.includes('relation')) {
              setIsBootstrapOpen(true);
          }
      }
    } catch (err) {
        toast({ title: "Erro Inesperado", description: "Consulte o console.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔴 ESTADO DE ERRO: Variáveis de Ambiente Ausentes
  if (!isSupabaseConfigured) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
              <Card className="w-full max-w-md border-red-200 bg-red-50 dark:bg-red-900/10">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400 text-xl">
                          <AlertTriangle className="h-6 w-6" />
                          Configuração Necessária
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-red-800 dark:text-red-200">
                      <p className="text-sm font-medium">
                          As variáveis de ambiente do Supabase não foram detectadas. O sistema não pode conectar ao banco de dados.
                      </p>
                      <div className="bg-white dark:bg-black/20 p-4 rounded border border-red-200 dark:border-red-800 text-xs font-mono break-all">
                          VITE_SUPABASE_URL<br/>
                          VITE_SUPABASE_ANON_KEY
                      </div>
                      <p className="text-xs">
                          Configure estas variáveis no seu arquivo <code>.env.local</code> (desenvolvimento) ou nas configurações do projeto na Vercel (produção).
                      </p>
                      <div className="pt-2">
                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full bg-white dark:bg-transparent border-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-900 dark:text-red-100">
                            Recarregar Página
                        </Button>
                      </div>
                  </CardContent>
              </Card>
          </div>
      )
  }

  // 🟢 ESTADO NORMAL: Formulário de Login
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4 font-sans">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center pb-6 pt-8">
            <div className="h-14 w-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-2xl mb-4 border border-primary/20">
                OH
            </div>
            <CardTitle className="text-2xl font-bold">Olie Hub Ops</CardTitle>
            <p className="text-sm text-textSecondary">Acesso Administrativo</p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-textSecondary uppercase tracking-wider">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-textSecondary uppercase tracking-wider">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-textSecondary" />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
                            placeholder="••••••"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full h-10 text-base font-medium shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Entrar no Sistema'}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border flex justify-center">
                 <Button 
                    variant="ghost" 
                    onClick={() => setIsBootstrapOpen(true)} 
                    className="text-xs gap-2 text-textSecondary hover:text-primary"
                    size="sm"
                >
                    <Database size={14}/> 
                    Ferramentas de Banco de Dados (SQL)
                </Button>
            </div>
        </CardContent>
      </Card>

      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
