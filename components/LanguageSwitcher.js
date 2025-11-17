import { useRouter } from 'next/router';
import { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find(lang => lang.code === router.locale) || languages[0];

  const changeLanguage = (locale) => {
    router.push(router.pathname, router.asPath, { locale });
    setIsOpen(false);
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.button}
        aria-label="Change language"
      >
        <span style={styles.flag}>{currentLang.flag}</span>
        <span style={styles.langCode}>{currentLang.code.toUpperCase()}</span>
        <svg style={styles.chevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsOpen(false)} />
          <div style={styles.dropdown}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  ...styles.option,
                  ...(lang.code === router.locale ? styles.optionActive : {})
                }}
              >
                <span style={styles.optionFlag}>{lang.flag}</span>
                <span style={styles.optionName}>{lang.name}</span>
                {lang.code === router.locale && (
                  <svg style={styles.check} width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  flag: {
    fontSize: '18px',
  },
  langCode: {
    fontSize: '13px',
    fontWeight: '700',
  },
  chevron: {
    color: '#94a3b8',
    transition: 'transform 0.2s',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '200px',
    maxHeight: '400px',
    overflowY: 'auto',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    padding: '8px',
    zIndex: 1000,
    animation: 'fadeInUp 0.2s ease-out',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  optionActive: {
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
  },
  optionFlag: {
    fontSize: '20px',
  },
  optionName: {
    flex: 1,
  },
  check: {
    flexShrink: 0,
  },
};
