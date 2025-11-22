
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase/client'; // Ajuste o caminho conforme sua estrutura

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      // O redirecionamento é geralmente tratado pelo AppContext ao detectar o usuário
      // Mas podemos forçar um reload se necessário para limpar estados antigos
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro no Login',
        description: 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setIsTestingConnection(true);
    try {
        console.log("Iniciando teste de conexão...");
        // Tenta buscar algo público ou verificar a sessão
        const { data, error } = await supabase.from('system_config').select('count', { count: 'exact', head: true });
        
        if (error) {
            // Se der erro 401 ou similar, a conexão existe mas sem permissão (o que é bom, significa que conecta)
            // Se der erro de rede, é falha de conexão
            console.error("Erro Supabase:", error);
            if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
                 toast({ 
                    title: 'Falha de Rede', 
                    description: 'Não foi possível alcançar o servidor Supabase.', 
                    variant: 'destructive' 
                });
            } else {
                 // Erro de permissão ou tabela não existente ainda conta como "Conectado"
                 toast({ 
                    title: 'Conectado (com restrição)', 
                    description: `Servidor respondeu: ${error.message}`, 
                    variant: 'warning' 
                });
            }
        } else {
            toast({ 
                title: 'Conexão Excelente', 
                description: 'Acesso ao banco de dados confirmado.', 
                variant: 'default' // ou success se tiver definido
            });
        }
    } catch (e: any) {
        console.error("Erro Geral:", e);
        toast({ 
            title: 'Erro Crítico', 
            description: e.message || 'Falha desconhecida no cliente.', 
            variant: 'destructive' 
        });
    } finally {
        setIsTestingConnection(false);
    }
  };

  const handleReload = () => {
      window.location.reload();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
      <div className="w-full max-w-md bg-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
            <div className="h-12 w-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-4">OH</div>
            <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Olie Hub</h1>
            <p className="text-sm text-textSecondary">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Email</label>
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
              <label className="block text-xs font-medium text-textSecondary mb-1">Senha</label>
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-3">
             <Button 
                type="button" 
                variant="outline" 
                onClick={testSupabaseConnection} 
                disabled={isTestingConnection}
                className="text-xs h-9"
            >
                {isTestingConnection ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <Wifi className="w-3 h-3 mr-2" />}
                Testar Conexão
            </Button>
             <Button 
                type="button" 
                variant="ghost" 
                onClick={handleReload} 
                className="text-xs h-9 text-textSecondary hover:text-primary"
            >
                <RefreshCw className="w-3 h-3 mr-2" />
                Recarregar App
            </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
