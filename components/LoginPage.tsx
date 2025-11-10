import React, { useState } from 'react';
import { login } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import BootstrapModal from './BootstrapModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapModalOpen, setIsBootstrapModalOpen] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(email)) {
        toast({ title: "Erro de Validação", description: "Por favor, insira um formato de e-mail válido.", variant: 'destructive'});
        setIsLoading(false);
        return;
    }

    try {
      await login(email, password);
      // The App.tsx component will handle the redirection automatically
      toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo(a) ao Olie Hub.' });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('BOOTSTRAP_REQUIRED')) {
        setIsBootstrapModalOpen(true);
      } else if (errorMessage.includes('Supabase fetch failed catastrophically')) {
        toast({ 
            title: 'Erro de Conexão', 
            description: 'Não foi possível conectar ao servidor. Verifique a configuração de CORS e sua rede.', 
            variant: 'destructive'
        });
      } else {
        toast({ title: 'Falha no Login', description: errorMessage, variant: 'destructive'});
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
        <div className="w-full max-w-4xl mx-auto bg-card dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Panel: Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-background dark:bg-dark-background opacity-0 animate-fade-in-up">
              <div className="mb-8 text-center">
                  <img src="/Olie.png" alt="Olie Logo" className="w-32 h-auto inline-block" />
                  <p className="text-xl font-light text-textSecondary dark:text-dark-textSecondary tracking-widest -mt-2">Hub</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">Email</label>
                      <input 
                          type="email" 
                          id="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          placeholder="admin@admin"
                          className="w-full px-4 py-2 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-textPrimary dark:text-dark-textPrimary"
                      />
                  </div>
                  <div>
                      <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">Senha</label>
                      <input 
                          type="password" 
                          id="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          placeholder="••••••"
                          className="w-full px-4 py-2 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-textPrimary dark:text-dark-textPrimary"
                      />
                  </div>

                  <div className="pt-2">
                      <Button 
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-base font-semibold rounded-lg"
                      >
                          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                          Entrar
                      </Button>
                  </div>
              </form>
          </div>

          {/* Right Panel: Image */}
          <div 
              className="hidden md:flex items-center justify-center bg-secondary dark:bg-dark-secondary p-12 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
          >
              <img src="/elephant.png" alt="Mascote Elefante" className="w-48 h-auto" />
          </div>

        </div>
      </div>
      <BootstrapModal 
        isOpen={isBootstrapModalOpen}
        onClose={() => setIsBootstrapModalOpen(false)}
      />
    </>
  );
};

export default LoginPage;