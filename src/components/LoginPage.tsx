
import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Database } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      // Não fazemos reload forçado aqui, deixamos o AppContext detectar a mudança de usuário
      toast({ title: 'Sucesso', description: 'Autenticado.' });
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message?.includes('profiles') || err.code === '42P01') {
          toast({ title: 'Banco de Dados', description: 'Necessário configurar tabelas.', variant: 'warning' });
          setIsBootstrapOpen(true);
      } else {
          toast({ title: 'Erro', description: 'Credenciais inválidas ou erro de conexão.', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
            <div className="h-12 w-12 mx-auto bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-600 font-bold text-xl mb-4">OH</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olie Hub Ops</h1>
            <p className="text-sm text-gray-500">Login Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500/50 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    type="password" value={password} onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500/50 outline-none"
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4 h-10 bg-yellow-600 hover:bg-yellow-700 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Button variant="ghost" onClick={() => setIsBootstrapOpen(true)} className="w-full text-xs gap-2 text-gray-500">
                <Database size={14}/> Configurar Banco de Dados (SQL)
            </Button>
        </div>
      </div>
      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
