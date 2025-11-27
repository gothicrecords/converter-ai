import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { login, isAuthenticated } from '../lib/auth';
import { trackLogin } from '../lib/analytics';
import { useTranslation } from '../lib/i18n';

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard');
        }
        
        // Check for OAuth errors in URL
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        if (error) {
            setError(decodeURIComponent(error));
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            trackLogin('email');
            router.push('/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title={t('seo.loginTitle')}
                description={t('seo.loginDesc')}
                canonical="/login"
                keywords={['login', 'accedi', 'accesso', 'account']}
            />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.formCard}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>{t('auth.welcomeBack')}</h1>
                        <p style={styles.subtitle}>{t('auth.loginSubtitle')}</p>
                    </div>

                    {/* OAuth Buttons */}
                    <div style={styles.oauthSection}>
                        <a 
                            href="/api/auth/oauth/google" 
                            onClick={async (e) => {
                                // Try to use Python backend if available
                                try {
                                    const { getApiUrl } = await import('../utils/getApiUrl');
                                    const apiUrl = await getApiUrl('/api/auth/oauth/google');
                                    // Only redirect if URL is different (Python backend)
                                    if (apiUrl && !apiUrl.startsWith('/') && apiUrl !== window.location.href) {
                                        e.preventDefault();
                                        window.location.href = apiUrl;
                                    }
                                    // Otherwise let the default link behavior work (Next.js API)
                                } catch (err) {
                                    // On error, let default link work
                                    console.warn('Failed to get API URL, using default:', err);
                                }
                            }}
                            style={styles.oauthButton}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" style={styles.oauthIcon}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continua con Google
                        </a>
                        <a href="/api/auth/oauth/facebook" style={{...styles.oauthButton, ...styles.oauthButtonFacebook}}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" style={styles.oauthIcon}>
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Continua con Facebook
                        </a>
                    </div>

                    <div style={styles.divider}>
                        <span style={styles.dividerText}>oppure</span>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <HiMail style={styles.inputIcon} />
                                {t('auth.email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder={t('auth.email')}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <HiLockClosed style={styles.inputIcon} />
                                {t('auth.password')}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder={t('auth.password')}
                                style={styles.input}
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{...styles.submitButton, ...(loading ? styles.buttonDisabled : {})}}
                        >
                            {loading ? t('common.processing') : t('auth.login')}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            {t('auth.noAccount')}{' '}
                            <Link href="/signup" style={styles.link}>{t('auth.signupFree')}</Link>
                        </p>
                        <p style={styles.footerText}>
                            <Link href="/contact" style={styles.link}>{t('auth.forgotPassword')}</Link>
                        </p>
                    </div>
                </div>

                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>{t('auth.whyAccount')}</h3>
                    <ul style={styles.infoList}>
                        <li style={styles.infoItem}>📊 {t('auth.benefit1Desc')}</li>
                        <li style={styles.infoItem}>💾 {t('auth.benefit2Desc')}</li>
                        <li style={styles.infoItem}>💰 {t('auth.benefit3Desc')}</li>
                        <li style={styles.infoItem}>⭐ {t('auth.benefit4Desc')}</li>
                        <li style={styles.infoItem}>🔔 {t('auth.benefit5Desc')}</li>
                        <li style={styles.infoItem}>🎯 {t('auth.benefit6Desc')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '100px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
    formCard: { padding: '48px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '24px' },
    header: { marginBottom: '40px', textAlign: 'center' },
    title: { fontSize: '32px', fontWeight: '900', margin: '0 0 12px', color: '#e2e8f0' },
    subtitle: { fontSize: '16px', color: '#94a3b8', margin: 0 },
    oauthSection: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    oauthButton: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '12px', 
        padding: '14px 20px', 
        background: '#ffffff', 
        border: '1px solid rgba(255, 255, 255, 0.2)', 
        borderRadius: '12px', 
        color: '#1a1a1a', 
        fontSize: '15px', 
        fontWeight: '600', 
        textDecoration: 'none', 
        cursor: 'pointer', 
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    oauthButtonFacebook: { background: '#1877F2', color: '#ffffff' },
    oauthIcon: { flexShrink: 0 },
    divider: { 
        display: 'flex', 
        alignItems: 'center', 
        margin: '24px 0', 
        position: 'relative' 
    },
    dividerText: { 
        padding: '0 16px', 
        background: 'rgba(102, 126, 234, 0.05)', 
        color: '#94a3b8', 
        fontSize: '14px', 
        position: 'relative', 
        zIndex: 1 
    },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
    inputIcon: { width: 16, height: 16 },
    input: { padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px', color: '#e2e8f0', fontSize: '15px', outline: 'none', transition: 'border 0.2s' },
    error: { padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', textAlign: 'center' },
    submitButton: { padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    footer: { marginTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' },
    footerText: { fontSize: '14px', color: '#94a3b8' },
    link: { color: '#667eea', textDecoration: 'none', fontWeight: '600' },
    infoCard: { padding: '40px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '24px' },
    infoTitle: { fontSize: '24px', fontWeight: '800', margin: '0 0 24px', color: '#e2e8f0' },
    infoList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
    infoItem: { fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6' }
};
