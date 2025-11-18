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
      const error = err as any;
      if (error?.name === 'AuthMultiFactorAuthenticationError') {
          trackLoginEvent('2fa_challenge');
          // FIX: Pass the amr property from the error object to setMfaChallenge to match the expected MfaChallenge type.
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
              <div className="mb-8 text-center">
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAABACAMAAAB05/4xAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJzUExURQAAANfPt9PNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtN-iPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtN-iPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtNPNtN-iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAMAAAAJixmgAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURQAAAABNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU0T9HhQAAAAGdFJOU////////////////////wB3Q5J9AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAFsElEQVR4Xu2diW7DMAxFRwuJkLcNk+7/v5I24FhN8Fq1dGvXnLPwR2b/E0mSNAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABxVl8kG+JvE1uYy2d2g0SZZxK6fUv+vT+v/d2n9/85q/T+s1/9g/Zf0v6X9J/S/oP6L+r/r/99P+T8A/5D+C+k/pP+C+s/oX0n9K/pf1P6H9L/kv6D9C/qv6D+p/ov6X9L/mf5X9L/m/w3/L/mf5/8p/c/7f0v+3/N/hv+b/Tf5f0/+X/N/j/yH9v+b/N/j/zP5v83+b/L/ifwn+J/OfzP9+9i/zH+Q/zH/kP8h/nv89/jP8p/nv8J/gP8F/nP8V/vP8J/Ofxn/N/3/27/D/p/8B/S/o/0P+A/4/8B+Z/wP4n/A/kf/r+B/y/o/8v+Z/P/2/6f8H/v/o/0H/o/7/yH+p/m/g/gfqf6v+l/Q/1v+S/pf1PyP+P9j+q/6X+l/o/8P+g/of6H+h/pv6n+d/pf0/wD/Gfo/5n+N/F/0v9L/S/yP57+p/U/pv+N/N/o/6f+v+j/Wf1v+l/X/2L9T+p/t/7v9H/S/3r9j/Yv3r9D/ev0r9x/v/0v6v+v/of4P6f9x/jP8t/hP6b9y/ev2r9x/Z/3/9T/U/1P8L+U/p/1v6H+h/q/yn+j+v/k/7P+j/qf4P+f/hPwn5D+N/Bf+b9h/R/rP+H9D/mv6D+J+Q/wH+k/yn+U/wP9d/W/x/8N/S/If+D/Xf4T+h/Q/6D+R/iv5v+K/kv8F/dfyv+a/ivx3+2+T/Hfmv83+P/Dfk/w3+E/hPyP9F/R/rv6P+n/W/pv+N+n/pvxP9a/Nf0P+8/hf635D/pfyf6v+z/rf439b/d/y/5H+l/s/4X+L/o/yP9T/X/1v9T/O/y/xv8H/p/1n8J+U/If+X+S/kv8D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" alt="Olie Hub" className="h-12 w-auto mx-auto" />
                  <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary mt-4">{t('login.title')}</h1>
              </div>
              
              {view === 'magiclink_sent' ? (
                  <div className="text-center">
                      <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h2 className="text-xl font-semibold">{t('login.magicLink.sent.title')}</h2>
                      <p className="text-sm text-textSecondary mt-2">{t('login.magicLink.sent.info', { email: <strong>{email}</strong> })}</p>
                      <Button variant="link" onClick={() => setView('password')} className="mt-4">{t('login.magicLink.backButton')}</Button>
                  </div>
              ) : view === 'magiclink' ? (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                      <p className="text-sm text-textSecondary">{t('login.magicLink.info')}</p>
                      <div>
                          <label htmlFor="email-magic" className="block text-sm font-medium text-textSecondary">{t('login.emailLabel')}</label>
                          <div className="relative mt-1">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="email"
                                  id="email-magic"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  placeholder="seu@email.com"
                                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                          </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('login.magicLink.submitButton')}
                      </Button>
                      <Button variant="link" className="w-full" onClick={() => setView('password')}>{t('login.magicLink.backButton')}</Button>
                  </form>
              ) : (
                  <form onSubmit={handleLogin} className={cn("space-y-4", loginError && 'animate-shake')}>
                      <div>
                          <label htmlFor="email" className="block text-sm font-medium text-textSecondary">{t('login.emailLabel')}</label>
                           <div className="relative mt-1">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="email"
                                  id="email"
                                  autoComplete="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  placeholder="seu@email.com"
                                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                          </div>
                      </div>
                      <div>
                          <label htmlFor="password" className="block text-sm font-medium text-textSecondary">{t('login.passwordLabel')}</label>
                          <div className="relative mt-1">
                               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-textSecondary" /></div>
                              <input
                                  type="password"
                                  id="password"
                                  autoComplete="current-password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  placeholder="••••••••"
                                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                          </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                          <Button variant="link" type="button" onClick={() => setIsForgotPasswordOpen(true)} className="p-0 h-auto">{t('login.forgotPassword')}</Button>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('login.submitButton')}
                      </Button>

                      <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-textSecondary">{t('login.separator')}</span></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <Button type="button" variant="outline" onClick={() => setView('magiclink')}>
                              <Sparkles className="mr-2 h-4 w-4" /> {t('login.magicLinkButton')}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleGoogleLogin}>
                              <Globe className="mr-2 h-4 w-4" /> {t('login.googleButton')}
                          </Button>
                      </div>
                  </form>
              )}
          </div>
          <div className="hidden md:block relative overflow-hidden bg-black">
            <img 
                src="data:image/png;base64,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" 
                alt="Mascote da Olie" 
                className={cn("w-full h-full object-contain p-8 transition-opacity duration-500", imageLoaded ? 'opacity-100' : 'opacity-0')}
                onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>
      </div>
      <BootstrapModal isOpen={isBootstrapModalOpen} onClose={() => setIsBootstrapModalOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
    </>
  );
};

// FIX: Add default export to resolve module loading error in App.tsx.
export default LoginPage;
