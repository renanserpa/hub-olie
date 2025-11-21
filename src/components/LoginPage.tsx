
import React, { useState, useEffect } from 'react';
import { login, register, signInWithMagicLink, signInWithGoogle } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Sparkles, Send, Globe, Database, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import ForgotPasswordModal from './ForgotPasswordModal';
import BootstrapModal from './BootstrapModal';
import { cn } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';
import { useApp } from '../contexts/AppContext';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { supabase } from '../lib/supabaseClient';

type LoginView = 'password' | 'register' | 'magiclink' | 'magiclink_sent';

const LoginPage: React.FC = () => {
  const { isLoading: appLoading } = useApp();
  // Credenciais padrão para teste (Admin)
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [view, setView] = useState<LoginView>('password');
  const [loginError, setLoginError] = useState(false);
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
      // Check simples e silencioso ao carregar
      const checkConn = async () => {
          try {
              const { error } = await supabase.from('system_config').select('id').limit(1);
              if (error) {
                  setConnectionStatus(error.code === '42P01' ? 'error' : 'connected');
              } else {
                  setConnectionStatus('connected');
              }
          } catch (e) {
              setConnectionStatus('error');
          }
      };
      checkConn();
  }, []);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  const testSupabaseConnection = async () => {
      setIsLoading(true);
      try {
          // Verifica a tabela profiles que é crítica para login
          const { error } = await supabase.from('profiles').select('count').limit(1);

          if (error) {
              if (error.code === '42P01') {
                  toast({ title: 'Banco Incompleto', description: 'Tabelas não encontradas. Execute a configuração.', variant: 'warning' });
                  setIsBootstrapOpen(true);
              } else {
                  toast({ title: 'Erro de Conexão', description: `Falha: ${error.message}`, variant: 'destructive' });
              }
          } else {
              toast({ title: 'Conexão OK', description: `Banco de dados respondendo corretamente.`, variant: 'default' }); 
          }
      } catch (e: any) {
           toast({ title: 'Erro Fatal', description: `Cliente não inicializado.`, variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
        toast({ title: "Erro", description: "Formato de e-mail inválido.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      // Pequeno delay para feedback visual antes do redirecionamento do AppContext
    } catch (err) {
      const error = err as any;
      setLoginError(true);
      setTimeout(() => setLoginError(false), 820);
      
      if (error.message.includes("Invalid login credentials")) {
          toast({ title: 'Credenciais Inválidas', description: "Verifique seu e-mail e senha.", variant: 'destructive'});
      } else {
          toast({ title: 'Erro de Acesso', description: "Tente recarregar ou configurar o banco.", variant: 'destructive'});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
        toast({ title: "Erro", description: "Formato de e-mail inválido.", variant: 'destructive'});
        return;
    }
    if (password !== confirmPassword) {
        toast({ title: "Erro", description: "As senhas não coincidem.", variant: 'destructive'});
        return;
    }
    if (password.length < 6) {
        toast({ title: "Erro", description: "A senha deve ter no mínimo 6 caracteres.", variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    try {
        await register(email, password);
        toast({ title: 'Conta criada!', description: 'Verifique seu e-mail para confirmar.' });
        setView('password');
    } catch (err) {
        toast({ title: 'Erro no Cadastro', description: (err as Error).message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
        toast({ title: "Erro", description: "E-mail inválido.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
      setView('magiclink_sent');
    } catch (err) {
      toast({ title: 'Erro', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
        await signInWithGoogle();
    } catch (error) {
        toast({ title: 'Erro', description: (error as Error).message, variant: 'destructive' });
    }
  };

  if (appLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-textSecondary">Iniciando sistema...</p>
            </div>
        </div>
      );
  }
  
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
        <div className="w-full max-w-5xl mx-auto bg-card dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          
          <div className="p-8 md:p-12 flex flex-col justify-center bg-background dark:bg-dark-background z-10 relative order-2 md:order-1">
              <div className="mb-8 text-center">
                  <div className="h-12 w-12 mx-auto bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md mb-4">
                    OH
                  </div>
                  <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
                      {view === 'register' ? 'Criar Conta' : t('login.title')}
                  </h1>
                  <p className="text-sm text-textSecondary mt-1">
                      {view === 'register' ? 'Junte-se ao Olie Hub.' : 'Faça login para continuar.'}
                  </p>
              </div>
              
              {view === 'magiclink_sent' ? (
                  <div className="text-center">
                      <Send className="w-16 h-16 text-green-500 mx-auto mb-6 animate-pulse" />
                      <h2 className="text-xl font-semibold">{t('login.magicLink.sent.title')}</h2>
                      <p className="text-sm text-textSecondary mt-2">{t('login.magicLink.sent.info', { email: <strong>{email}</strong> })}</p>
                      <Button variant="link" onClick={() => setView('password')} className="mt-6">{t('login.magicLink.backButton')}</Button>
                  </div>
              ) : view === 'magiclink' ? (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                      <p className="text-sm text-textSecondary text-center">{t('login.magicLink.info')}</p>
                      <div>
                          <label className="block text-xs font-medium text-textSecondary mb-1">{t('login.emailLabel')}</label>
                          <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                          </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('login.magicLink.submitButton')}
                      </Button>
                      <Button variant="link" className="w-full text-xs" onClick={() => setView('password')}>{t('login.magicLink.backButton')}</Button>
                  </form>
              ) : (
                  <form onSubmit={view === 'register' ? handleRegister : handleLogin} className={cn("space-y-4", loginError && 'animate-shake')}>
                      <div>
                          <label className="block text-xs font-medium text-textSecondary mb-1">{t('login.emailLabel')}</label>
                           <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-textSecondary mb-1">{t('login.passwordLabel')}</label>
                          <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                          </div>
                          {view === 'register' && (
                              <div className="mt-2">
                                  <PasswordStrengthMeter password={password} />
                              </div>
                          )}
                      </div>

                      {view === 'register' && (
                          <div>
                              <label className="block text-xs font-medium text-textSecondary mb-1">Confirmar Senha</label>
                              <div className="relative">
                                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-textSecondary" /></div>
                                  <input
                                      type="password"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      required
                                      className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                              </div>
                          </div>
                      )}

                      {view === 'password' && (
                          <div className="flex items-center justify-end">
                              <Button variant="link" type="button" onClick={() => setIsForgotPasswordOpen(true)} className="p-0 h-auto text-xs text-primary hover:underline">{t('login.forgotPassword')}</Button>
                          </div>
                      )}

                      <Button type="submit" className="w-full font-semibold shadow-sm" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (view === 'register' ? 'Cadastrar' : t('login.submitButton'))}
                      </Button>
                      
                      {view === 'password' && (
                        <>
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-textSecondary">{t('login.separator')}</span></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Button type="button" variant="outline" onClick={() => setView('magiclink')} className="text-xs">
                                    <Sparkles className="mr-2 h-3 w-3" /> Link Mágico
                                </Button>
                                <Button type="button" variant="outline" onClick={handleGoogleLogin} className="text-xs">
                                    <Globe className="mr-2 h-3 w-3" /> Google
                                </Button>
                            </div>
                            
                             <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={testSupabaseConnection} 
                                    className="flex-1 text-[10px] h-8 flex items-center justify-center gap-2 text-textSecondary hover:text-textPrimary border border-border/50"
                                    disabled={isLoading}
                                >
                                    {connectionStatus === 'checking' ? <Loader2 className="w-3 h-3 animate-spin"/> : 
                                     connectionStatus === 'connected' ? <CheckCircle className="w-3 h-3 text-green-500"/> : <AlertTriangle className="w-3 h-3 text-red-500"/>}
                                    Diagnóstico
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setIsBootstrapOpen(true)}
                                    className="flex-1 text-[10px] h-8 flex items-center justify-center gap-2 text-textSecondary hover:text-textPrimary border border-border/50"
                                    disabled={isLoading}
                                >
                                    <Database className="w-3 h-3" />
                                    Configurar Banco
                                </Button>
                            </div>
                        </>
                      )}

                      <div className="mt-4 text-center text-xs">
                          {view === 'password' ? (
                              <p className="text-textSecondary">
                                  Não tem conta?{' '}
                                  <button type="button" onClick={() => setView('register')} className="font-semibold text-primary hover:underline">
                                      Cadastre-se
                                  </button>
                              </p>
                          ) : (
                              <p className="text-textSecondary">
                                  Já tem conta?{' '}
                                  <button type="button" onClick={() => setView('password')} className="font-semibold text-primary hover:underline">
                                      Faça Login
                                  </button>
                              </p>
                          )}
                      </div>
                  </form>
              )}
          </div>
          <div className="hidden md:block relative overflow-hidden bg-secondary order-1 md:order-2">
            <img 
                src="https://images.unsplash.com/photo-1605218427368-bc64b7b1104b?q=80&w=1600&auto=format&fit=crop" 
                alt="Olie Hub Atelier" 
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
            />
             <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </>
  );
};

export default LoginPage;
