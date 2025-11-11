import { useState, useCallback } from 'react';
import pt from '../locales/pt.json';
import en from '../locales/en.json';

const translations = { pt, en };
type Language = 'pt' | 'en';

// Simple translation hook for the PoC
export function useTranslation() {
  const [language, setLanguage] = useState<Language>('pt');

  const t = useCallback((key: string, replacements?: Record<string, string>): string => {
    let translation = (translations[language] as Record<string, string>)[key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, replacements[rKey]);
        });
    }
    return translation;
  }, [language]);

  return { t, setLanguage, language };
}
