import React, { useState, useEffect } from 'react';
import { login, register, signInWithMagicLink, signInWithGoogle } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Sparkles, Send, Globe, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import BootstrapModal from './BootstrapModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { cn } from '../lib/utils';
import { trackLoginEvent } from '../services/analyticsService';
import { useTranslation } from '../hooks/useTranslation';
import { useApp } from '../contexts/AppContext';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type LoginView = 'password' | 'register' | 'magiclink' | 'magiclink_sent';

const LoginPage: React.FC = () => {
  const { setMfaChallenge, isLoading: appLoading, user: appUser, error: appError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapModalOpen, setIsBootstrapModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [view, setView] = useState<LoginView>('password');
  const [loginError, setLoginError] = useState(false);
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
        toast({ title: "Erro de Validação", description: "Por favor, insira um formato de e-mail válido.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      trackLoginEvent('login_success', { method: 'password' });
      toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo(a) ao Olie Hub.' });
    } catch (err) {
      const error = err as any;
      if (error?.name === 'AuthMultiFactorAuthenticationError') {
          trackLoginEvent('2fa_challenge');
          setMfaChallenge({ amr: error.amr });
      } else {
          trackLoginEvent('login_failure', { method: 'password', metadata: { error: error.message } });
          handleAuthError(error as Error);
          setLoginError(true);
          setTimeout(() => setLoginError(false), 820);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
        toast({ title: "Erro de Validação", description: "Por favor, insira um formato de e-mail válido.", variant: 'destructive'});
        return;
    }
    if (password !== confirmPassword) {
        toast({ title: "Erro de Validação", description: "As senhas não coincidem.", variant: 'destructive'});
        return;
    }
    if (password.length < 6) {
        toast({ title: "Erro de Validação", description: "A senha deve ter no mínimo 6 caracteres.", variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    try {
        await register(email, password); // Default role 'Vendas' or handled by trigger
        toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar a conta.' });
        setView('password'); // Switch back to login
    } catch (err) {
        toast({ title: 'Erro no Cadastro', description: (err as Error).message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
        toast({ title: "Erro de Validação", description: "Por favor, insira um formato de e-mail válido.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
      trackLoginEvent('magic_link_request', { method: 'magic_link' });
      setView('magiclink_sent');
    } catch (err) {
      trackLoginEvent('login_failure', { method: 'magic_link', metadata: { error: (err as Error).message }});
      handleAuthError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
        trackLoginEvent('login_success', { method: 'google' });
        await signInWithGoogle();
    } catch (error) {
        trackLoginEvent('login_failure', { method: 'google', metadata: { error: (error as Error).message }});
        handleAuthError(error as Error);
        setIsLoading(false);
    }
  };

  const handleAuthError = (err: Error) => {
      const errorMessage = err.message;
      if (errorMessage.includes('BOOTSTRAP_REQUIRED') || errorMessage.includes('não possui um perfil definido')) {
        setIsBootstrapModalOpen(true);
      } else if (errorMessage.includes('Supabase fetch failed catastrophically')) {
        toast({ 
            title: 'Erro de Conexão', 
            description: 'Não foi possível conectar ao servidor. Verifique a configuração de CORS e sua rede.', 
            variant: 'destructive'
        });
      } else {
        toast({ title: 'Falha na Autenticação', description: errorMessage, variant: 'destructive'});
      }
  };
  
  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
  }, [view]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
        <div className="w-full max-w-5xl mx-auto bg-card dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[650px]">
          
          <div className="p-8 md:p-12 flex flex-col justify-center bg-background dark:bg-dark-background animate-fade-in-up z-10 relative order-2 md:order-1">
              <div className="mb-8 text-center">
                  <div className="h-14 w-14 mx-auto bg-gradient-to-br from-primary to-yellow-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4 transform rotate-3">
                    OH
                  </div>
                  <h1 className="text-3xl font-bold text-textPrimary dark:text-dark-textPrimary tracking-tight">
                      {view === 'register' ? 'Criar Conta' : t('login.title')}
                  </h1>
                  <p className="text-sm text-textSecondary mt-2">
                      {view === 'register' ? 'Junte-se ao Olie Hub e otimize sua produção.' : 'Plataforma de Operações Inteligentes'}
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
                  <form onSubmit={handleMagicLink} className="space-y-5">
                      <p className="text-sm text-textSecondary text-center">{t('login.magicLink.info')}</p>
                      <div>
                          <label htmlFor="email-magic" className="block text-sm font-medium text-textSecondary mb-1">{t('login.emailLabel')}</label>
                          <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="email"
                                  id="email-magic"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  placeholder="seu@email.com"
                                  className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              />
                          </div>
                      </div>
                      <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('login.magicLink.submitButton')}
                      </Button>
                      <Button variant="link" className="w-full" onClick={() => setView('password')}>{t('login.magicLink.backButton')}</Button>
                  </form>
              ) : (
                  <form onSubmit={view === 'register' ? handleRegister : handleLogin} className={cn("space-y-5", loginError && 'animate-shake')}>
                      <div>
                          <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">{t('login.emailLabel')}</label>
                           <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="email"
                                  id="email"
                                  autoComplete="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  placeholder="seu@email.com"
                                  className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              />
                          </div>
                      </div>
                      <div>
                          <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1">{t('login.passwordLabel')}</label>
                          <div className="relative">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="password"
                                  id="password"
                                  autoComplete={view === 'register' ? 'new-password' : 'current-password'}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  placeholder="••••••••"
                                  className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-textSecondary mb-1">Confirmar Senha</label>
                              <div className="relative">
                                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-textSecondary" /></div>
                                  <input
                                      type="password"
                                      id="confirmPassword"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      required
                                      placeholder="••••••••"
                                      className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                  />
                              </div>
                          </div>
                      )}

                      {view === 'password' && (
                          <div className="flex items-center justify-between text-sm">
                              <Button variant="link" type="button" onClick={() => setIsForgotPasswordOpen(true)} className="p-0 h-auto text-primary hover:text-primary/80">{t('login.forgotPassword')}</Button>
                          </div>
                      )}

                      <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (view === 'register' ? 'Cadastrar' : t('login.submitButton'))}
                      </Button>
                      
                      {view === 'password' && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-textSecondary">{t('login.separator')}</span></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Button type="button" variant="outline" onClick={() => setView('magiclink')} className="h-10">
                                    <Sparkles className="mr-2 h-4 w-4" /> {t('login.magicLinkButton')}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleGoogleLogin} className="h-10">
                                    <Globe className="mr-2 h-4 w-4" /> {t('login.googleButton')}
                                </Button>
                            </div>
                        </>
                      )}

                      <div className="mt-6 text-center text-sm">
                          {view === 'password' ? (
                              <p className="text-textSecondary">
                                  Não tem uma conta?{' '}
                                  <button type="button" onClick={() => setView('register')} className="font-semibold text-primary hover:underline focus:outline-none">
                                      Cadastre-se
                                  </button>
                              </p>
                          ) : (
                              <p className="text-textSecondary">
                                  Já tem uma conta?{' '}
                                  <button type="button" onClick={() => setView('password')} className="font-semibold text-primary hover:underline focus:outline-none">
                                      Faça Login
                                  </button>
                              </p>
                          )}
                      </div>
                  </form>
              )}
          </div>
          <div className="hidden md:block relative overflow-hidden bg-primary/5 order-1 md:order-2">
            <img 
                src="https://images.unsplash.com/photo-1605218427368-bc64b7b1104b?q=80&w=1600&auto=format&fit=crop" 
                alt="Olie Hub Atelier" 
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12 text-white">
                <h2 className="text-3xl font-bold mb-3 leading-tight">Gestão Inteligente para seu Ateliê</h2>
                <p className="text-white/90 text-lg mb-6 max-w-md">Controle total da produção, estoque e vendas em um único lugar, potencializado por IA.</p>
                <div className="flex gap-2">
                    <div className="h-1 w-8 bg-primary rounded-full"></div>
                    <div className="h-1 w-2 bg-white/50 rounded-full"></div>
                    <div className="h-1 w-2 bg-white/50 rounded-full"></div>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- PAINEL DE DEBUG PARA DIAGNÓSTICO (Remover em produção) --- */}
      <div className="fixed bottom-2 left-2 p-3 bg-black/80 text-green-400 font-mono text-xs rounded-lg z-50 pointer-events-none border border-green-800 opacity-80">
          <p><strong>Status do AppContext:</strong></p>
          <p>Loading: {appLoading.toString()}</p>
          <p>User: {appUser ? appUser.email : 'null'}</p>
          <p>Error: {appError || 'none'}</p>
      </div>

      <BootstrapModal isOpen={isBootstrapModalOpen} onClose={() => setIsBootstrapModalOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
    </>
  );
};

export default LoginPage;