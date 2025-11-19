import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';

const LanguageContext = createContext();

// Cache per le traduzioni per evitare re-fetching
const translationsCache = {};

export function LanguageProvider({ children, initialTranslations = {} }) {
  const router = useRouter();
  const [locale, setLocale] = useState(router.locale || 'en');
  const [translations, setTranslations] = useState(initialTranslations);

  // Funzione di traduzione memoizzata
  const t = useCallback((key) => {
    if (!key || typeof key !== 'string') return key;
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  }, [translations]);

  // Caricamento traduzioni ottimizzato con cache
  const loadTranslations = useCallback(async (lang) => {
    // Controllo cache prima
    if (translationsCache[lang]) {
      setTranslations(translationsCache[lang]);
      setLocale(lang);
      return;
    }

    try {
      // Solo lato client
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(`/locales/${lang}/common.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
      }
      const data = await response.json();
      // Cache delle traduzioni
      translationsCache[lang] = data;
      setTranslations(data);
      setLocale(lang);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English solo se non siamo già su English
      if (lang !== 'en' && typeof window !== 'undefined') {
        loadTranslations('en');
      }
    }
  }, []);

  useEffect(() => {
    // Ricarica traduzioni quando cambia la locale del router
    if (router.locale && router.locale !== locale) {
      loadTranslations(router.locale);
    }
  }, [router.locale, locale, loadTranslations]);

  useEffect(() => {
    // Load translations for current locale se non già caricate
    const currentLocale = router.locale || 'en';
    if (!initialTranslations || Object.keys(initialTranslations).length === 0) {
      // Solo se non in cache
      if (!translationsCache[currentLocale]) {
        loadTranslations(currentLocale);
      }
    } else {
      // Popola la cache con le traduzioni iniziali
      if (!translationsCache[currentLocale]) {
        translationsCache[currentLocale] = initialTranslations;
      }
    }
  }, [router.locale, loadTranslations, initialTranslations]);

  // Memoizza il valore del context per evitare re-render
  const contextValue = useMemo(
    () => ({ locale, translations, t }),
    [locale, translations, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
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
