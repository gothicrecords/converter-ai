import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const router = useRouter();
  const [locale, setLocale] = useState(router.locale || 'en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // Load translations for current locale
    loadTranslations(router.locale || 'en');
  }, [router.locale]);

  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/locales/${lang}/common.json`);
      const data = await response.json();
      setTranslations(data);
      setLocale(lang);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English
      if (lang !== 'en') {
        loadTranslations('en');
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
