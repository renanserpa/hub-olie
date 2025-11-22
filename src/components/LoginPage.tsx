import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';
import { Loader2, Database, Lock, Mail, Wifi, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { toast } from '../hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
      if (isSupabaseConfigured) {
        checkConnection();
      }
  }, []);

  const checkConnection = async () => {
      if (!supabase) return;
      try {
          const { error } = await supabase.from('system_config').select('count').limit(1).maybeSingle();
          if (!error || error.code === '42P01' || error.code === 'PGRST116') {
              setConnectionStatus('ok');
          } else {
              setConnectionStatus('error');
          }
      } catch (e) {
          setConnectionStatus('error');
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.ok) {
          toast({ title: "Sucesso", description: "Entrando..." });
          setTimeout(() => window.location.href = '/', 500);
      } else {
          toast({ title: "Erro", description: result.error, variant: "destructive" });
          if (result.error?.includes('fetch') || result.error?.includes('profile')) {
             setIsBootstrapOpen(true);
          }
      }
    } catch (err) {
        toast({ title: "Erro Inesperado", description: "Tente configurar o banco.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
            <Card className="w-full max-w-md shadow-xl border-red-200 bg-white">
                <CardHeader className="text-center pb-6 pt-8">
                    <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <CardTitle className="text-xl font-bold text-gray-800">Configuração Necessária</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 text-center space-y-4">
                    <p className="text-sm text-gray-600">
                        As variáveis de ambiente do Supabase não foram encontradas.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md text-xs text-left font-mono text-gray-700 border border-gray-200">
                        VITE_SUPABASE_URL<br/>
                        VITE_SUPABASE_ANON_KEY
                    </div>
                    <p className="text-xs text-gray-500">
                        Adicione estas chaves no arquivo <code>.env.local</code> ou nas configurações da Vercel.
                    </p>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-gray-200 bg-white">
        <CardHeader className="text-center pb-6 pt-8">
            <div className="h-12 w-12 mx-auto bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                OH
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Olie Hub Ops</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
                <div className={`h-2 w-2 rounded-full ${connectionStatus === 'ok' ? 'bg-green-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">
                    {connectionStatus === 'ok' ? 'Conectado' : connectionStatus === 'error' ? 'Erro de Conexão' : 'Verificando...'}
                </span>
            </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Entrar'}
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
                 <Button 
                    variant="ghost" 
                    onClick={() => setIsBootstrapOpen(true)} 
                    className="text-xs gap-2 text-gray-500 hover:text-blue-600"
                    size="sm"
                    type="button"
                >
                    <Database size={14}/> 
                    Configurar Banco (SQL)
                </Button>
            </div>
        </CardContent>
      </Card>

      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
