import React, { useState, useEffect } from 'react';
import { login, signInWithMagicLink, signInWithGoogle } from '../services/authService';
import { Button } from './ui/Button';
import { Loader2, Mail, Lock, Sparkles, Send, Globe } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import BootstrapModal from './BootstrapModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { cn } from '../lib/utils';
import { trackLoginEvent } from '../services/analyticsService';
import { useTranslation } from '../hooks/useTranslation';
import { useApp } from '../contexts/AppContext';

type LoginView = 'password' | 'magiclink' | 'magiclink_sent';

const LoginPage: React.FC = () => {
  const { setMfaChallenge } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapModalOpen, setIsBootstrapModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [view, setView] = useState<LoginView>('password');
  const [isMascotFocused, setIsMascotFocused] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const { t, setLanguage, language } = useTranslation();
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
      const error = err as Error;
      if ((error as any).name === 'AuthMultiFactorAuthenticationError') {
          trackLoginEvent('2fa_challenge');
          // FIX: Pass the amr property from the error object to setMfaChallenge to match the expected MfaChallenge type.
          setMfaChallenge({ amr: (error as any).amr });
      } else {
          trackLoginEvent('login_failure', { method: 'password', metadata: { error: error.message } });
          handleAuthError(error);
          setLoginError(true);
          setTimeout(() => setLoginError(false), 820);
      }
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
        // Redirection will be handled by Supabase
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
    // Reset form when view changes
    setPassword('');
  }, [view]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background p-4">
        <div className="w-full max-w-4xl mx-auto bg-card dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          <div className="p-8 md:p-12 flex flex-col justify-center bg-background dark:bg-dark-background opacity-0 animate-fade-in-up">
              <div className="mb-8 text-center relative">
                  <img src="/Olie.png" alt="Olie Logo" className="w-32 h-auto inline-block" />
                  <p className="text-xl font-light text-textSecondary dark:text-dark-textSecondary tracking-widest -mt-2">Hub</p>
                   <Button variant="ghost" size="sm" className="absolute top-0 right-0 text-xs" onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}>
                        <Globe size={14} className="mr-1" /> {language === 'pt' ? 'EN' : 'PT-BR'}
                   </Button>
              </div>

              <Button onClick={handleGoogleLogin} variant="outline" className="w-full mb-4 h-11 text-base" disabled={isLoading}>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3"/>
                  {t('login.googleButton')}
              </Button>
              
              <div className="flex items-center my-2">
                  <hr className="flex-grow border-border" />
                  <span className="px-3 text-xs text-textSecondary">{t('login.separator')}</span>
                  <hr className="flex-grow border-border" />
              </div>
              
              <div aria-live="polite">
              {view === 'password' && (
                <form onSubmit={handleLogin} className={cn("space-y-4 animate-fade-in-up", loginError && "animate-shake")} style={{animationDuration: '0.3s'}}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">{t('login.emailLabel')}</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-gray-400" /></div>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@admin.com" onFocus={() => setIsMascotFocused(true)} onBlur={() => setIsMascotFocused(false)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-textPrimary dark:text-dark-textPrimary"/>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-primary">{t('login.passwordLabel')}</label>
                            <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="text-xs text-primary hover:underline font-medium">{t('login.forgotPassword')}</button>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-gray-400" /></div>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" onFocus={() => setIsMascotFocused(true)} onBlur={() => setIsMascotFocused(false)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-textPrimary dark:text-dark-textPrimary"/>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 font-medium text-textSecondary cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                            {t('login.rememberMe')}
                        </label>
                        <button type="button" onClick={() => setView('magiclink')} className="text-primary hover:underline font-medium flex items-center gap-1.5">
                            <Sparkles size={14}/> {t('login.magicLinkButton')}
                        </button>
                    </div>
                    <div className="pt-1">
                        <Button type="submit" disabled={isLoading} className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base font-semibold rounded-lg">
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} {t('login.submitButton')}
                        </Button>
                    </div>
                </form>
              )}
              {view === 'magiclink' && (
                  <form onSubmit={handleMagicLink} className="space-y-4 animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                      <p className="text-sm text-center text-textSecondary">{t('login.magicLink.info')}</p>
                      <div>
                          <label htmlFor="magic-email" className="block text-sm font-medium text-primary mb-1">{t('login.emailLabel')}</label>
                          <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-gray-400" /></div>
                              <input type="email" id="magic-email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-textPrimary dark:text-dark-textPrimary"/>
                          </div>
                      </div>
                       <Button type="submit" disabled={isLoading} className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base font-semibold rounded-lg">
                           {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} {t('login.magicLink.submitButton')}
                       </Button>
                       <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setView('password')}>{t('login.magicLink.backButton')}</Button>
                  </form>
              )}
               {view === 'magiclink_sent' && (
                  <div className="text-center animate-fade-in-up p-4" style={{animationDuration: '0.3s'}}>
                      <Send className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">{t('login.magicLink.sent.title')}</h3>
                      <p className="text-sm text-textSecondary mt-2">
                          {t('login.magicLink.sent.info', { email: email })}
                      </p>
                      <Button onClick={() => { setView('password'); setEmail(''); }} className="mt-4" variant="outline">Voltar</Button>
                  </div>
              )}
              </div>
          </div>

          <div className="hidden md:flex items-center justify-center bg-secondary dark:bg-dark-secondary p-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <img 
                src="/elephant.png" 
                alt="Mascote Elefante"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={cn(
                    "w-48 h-auto transition-all duration-500", 
                    isMascotFocused && "scale-110 -rotate-3",
                    imageLoaded ? "opacity-100" : "opacity-0 blur-sm"
                )}
              />
          </div>

        </div>
      </div>
      <BootstrapModal isOpen={isBootstrapModalOpen} onClose={() => setIsBootstrapModalOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
    </>
  );
};

export default LoginPage;