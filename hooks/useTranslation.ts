// FIX: Update the 't' function to handle JSX elements in replacements, allowing for rich text formatting in translations.
import React, { useState, useCallback } from 'react';

const pt = {
  "login.title": "Olie Hub",
  "login.googleButton": "Entrar com Google",
  "login.separator": "OU",
  "login.emailLabel": "Email",
  "login.passwordLabel": "Senha",
  "login.forgotPassword": "Esqueceu a senha?",
  "login.rememberMe": "Lembrar de mim",
  "login.magicLinkButton": "Entrar com link mágico",
  "login.submitButton": "Entrar",
  "login.magicLink.info": "Enviaremos um link de acesso para o seu e-mail. Não é necessário senha.",
  "login.magicLink.submitButton": "Enviar Link Mágico",
  "login.magicLink.backButton": "Voltar para login com senha",
  "login.magicLink.sent.title": "Verifique seu E-mail",
  "login.magicLink.sent.info": "Enviamos um link de login para {email}. Clique no link para acessar sua conta."
};

const en = {
  "login.title": "Olie Hub",
  "login.googleButton": "Sign in with Google",
  "login.separator": "OR",
  "login.emailLabel": "Email",
  "login.passwordLabel": "Password",
  "login.forgotPassword": "Forgot password?",
  "login.rememberMe": "Remember me",
  "login.magicLinkButton": "Sign in with a magic link",
  "login.submitButton": "Sign In",
  "login.magicLink.info": "We'll send a login link to your email. No password needed.",
  "login.magicLink.submitButton": "Send Magic Link",
  "login.magicLink.backButton": "Back to password login",
  "login.magicLink.sent.title": "Check Your Email",
  "login.magicLink.sent.info": "We sent a login link to {email}. Click the link to access your account."
};

const translations = { pt, en };
type Language = 'pt' | 'en';

// Simple translation hook for the PoC
export function useTranslation() {
  const [language, setLanguage] = useState<Language>('pt');

  const t = useCallback((key: string, replacements?: Record<string, React.ReactNode>): React.ReactNode => {
    const translation = (translations[language] as Record<string, string>)[key] || key;
    if (!replacements) {
        return translation;
    }
    
    // Split the string by placeholders like {key}
    const parts = translation.split(/({[^{}]+})/g);
    
    // FIX: Replaced JSX syntax with React.createElement to fix compilation errors in a .ts file
    // while preserving the ability to interpolate React components into translated strings.
    return parts.map((part, i) => {
        // Check if the part is a placeholder
        if (part.startsWith('{') && part.endsWith('}')) {
            const rKey = part.slice(1, -1);
            // Check if a replacement for this key exists
            if (Object.prototype.hasOwnProperty.call(replacements, rKey)) {
                // Using React.createElement to wrap the replacement and give it a key.
                // This is the equivalent of <React.Fragment key={...}>{...}</React.Fragment>
                return React.createElement(React.Fragment, { key: `${rKey}-${i}` }, replacements[rKey]);
            }
        }
        return part;
    });
  }, [language]);

  return { t, setLanguage, language };
}