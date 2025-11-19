import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from '../lib/i18n';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { HiMail, HiLockClosed, HiUser, HiCheckCircle } from 'react-icons/hi';
import { signup, isAuthenticated } from '../lib/auth';
import { trackSignup } from '../lib/analytics';

export default function SignupPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
        
        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordMismatch'));
            return;
        }
        
        if (formData.password.length < 6) {
            setError(t('auth.passwordTooShort'));
            return;
        }
        
        setLoading(true);
        
        const result = await signup(formData.name, formData.email, formData.password);
        
        if (result.success) {
            trackSignup('email');
            router.push('/dashboard?welcome=true');
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
                title={t('seo.signupTitle')}
                description={t('seo.signupDesc')}
                canonical="/signup"
                keywords={['registrazione', 'signup', 'account', 'sconto', 'gratis']}
            />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.formCard}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>{t('auth.createAccount')}</h1>
                        <p style={styles.subtitle}>{t('hero.cta')}</p>
                    </div>

                    <div style={styles.benefits}>
                        {[
                            'Dashboard personale con statistiche',
                            'Cronologia dei lavori salvata',
                            '5% di sconto su tutti i piani',
                            'Accesso prioritario a nuove funzionalità'
                        ].map((benefit, i) => (
                            <div key={i} style={styles.benefitItem}>
                                <HiCheckCircle style={styles.checkIcon} />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* OAuth Buttons */}
                    <div style={styles.oauthSection}>
                        <a href="/api/auth/oauth/google" style={styles.oauthButton}>
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
                                <HiUser style={styles.inputIcon} />
                                {t('auth.name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Mario Rossi"
                                style={styles.input}
                            />
                        </div>

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
                                placeholder="mario@example.com"
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
                                minLength="8"
                                placeholder="Minimo 8 caratteri"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <HiLockClosed style={styles.inputIcon} />
                                {t('auth.confirmPassword')}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="8"
                                placeholder={t('auth.confirmPassword')}
                                style={styles.input}
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{...styles.submitButton, ...(loading ? styles.buttonDisabled : {})}}
                        >
                            {loading ? t('common.processing') : t('auth.signupFree')}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            {t('auth.hasAccount')}{' '}
                            <Link href="/login" style={styles.link}>{t('auth.login')}</Link>
                        </p>
                        <p style={styles.terms}>
                            {t('auth.termsAgreement')}{' '}
                            <Link href="/terms" style={styles.link}>{t('footer.terms')}</Link>
                            {' '}{t('common.and')}{' '}
                            <Link href="/privacy" style={styles.link}>{t('footer.privacy')}</Link>
                        </p>
                    </div>
                </div>

                <div style={styles.sideCard}>
                    <h3 style={styles.sideTitle}>{t('auth.benefits')}</h3>
                    <div style={styles.featureList}>
                        {[
                            { title: t('auth.benefit1Title'), desc: t('auth.benefit1Desc') },
                            { title: t('auth.benefit2Title'), desc: t('auth.benefit2Desc') },
                            { title: t('auth.benefit3Title'), desc: t('auth.benefit3Desc') },
                            { title: t('auth.benefit4Title'), desc: t('auth.benefit4Desc') },
                            { title: t('auth.benefit5Title'), desc: t('auth.benefit5Desc') },
                            { title: t('auth.benefit6Title'), desc: t('auth.benefit6Desc') }
                        ].map((feature, i) => (
                            <div key={i} style={styles.featureItem}>
                                <div style={styles.featureTitle}>{feature.title}</div>
                                <div style={styles.featureDesc}>{feature.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' },
    formCard: { padding: '48px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '24px' },
    header: { marginBottom: '32px', textAlign: 'center' },
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
    benefits: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', padding: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' },
    benefitItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#10b981' },
    checkIcon: { width: 20, height: 20, flexShrink: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
    inputIcon: { width: 16, height: 16 },
    input: { padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px', color: '#e2e8f0', fontSize: '15px', outline: 'none', transition: 'border 0.2s' },
    error: { padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', textAlign: 'center' },
    submitButton: { padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    footer: { marginTop: '32px', textAlign: 'center' },
    footerText: { fontSize: '14px', color: '#94a3b8', marginBottom: '12px' },
    terms: { fontSize: '12px', color: '#64748b' },
    link: { color: '#667eea', textDecoration: 'none', fontWeight: '600' },
    sideCard: { padding: '40px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '24px', position: 'sticky', top: '100px' },
    sideTitle: { fontSize: '24px', fontWeight: '800', margin: '0 0 24px', color: '#e2e8f0' },
    featureList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    featureItem: { paddingBottom: '20px', borderBottom: '1px solid rgba(102, 126, 234, 0.1)' },
    featureTitle: { fontSize: '16px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' },
    featureDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }
};
