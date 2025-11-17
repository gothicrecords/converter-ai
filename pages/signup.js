import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { HiMail, HiLockClosed, HiUser, HiCheckCircle } from 'react-icons/hi';
import { signup, isAuthenticated } from '../lib/auth';
import { trackSignup } from '../lib/analytics';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Le password non corrispondono');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('La password deve essere almeno 6 caratteri');
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
                title="Registrati Gratis - Ottieni 5% di Sconto"
                description="Crea un account gratuito su MegaPixelAI e ricevi il 5% di sconto immediato. Accedi alla tua dashboard personale con statistiche e cronologia."
                canonical="/signup"
                keywords={['registrazione', 'signup', 'account', 'sconto', 'gratis']}
            />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.formCard}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Crea il tuo Account</h1>
                        <p style={styles.subtitle}>Registrati gratis e ottieni subito il 5% di sconto</p>
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

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <HiUser style={styles.inputIcon} />
                                Nome Completo
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
                                Email
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
                                Password
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
                                Conferma Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="8"
                                placeholder="Ripeti la password"
                                style={styles.input}
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{...styles.submitButton, ...(loading ? styles.buttonDisabled : {})}}
                        >
                            {loading ? 'Creazione account...' : 'Crea Account Gratis'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            Hai già un account?{' '}
                            <Link href="/login" style={styles.link}>Accedi</Link>
                        </p>
                        <p style={styles.terms}>
                            Registrandoti accetti i nostri{' '}
                            <Link href="/terms" style={styles.link}>Termini</Link>
                            {' '}e la{' '}
                            <Link href="/privacy" style={styles.link}>Privacy Policy</Link>
                        </p>
                    </div>
                </div>

                <div style={styles.sideCard}>
                    <h3 style={styles.sideTitle}>Cosa ottieni</h3>
                    <div style={styles.featureList}>
                        {[
                            { title: 'Dashboard Personale', desc: 'Monitora il tuo utilizzo e statistiche in tempo reale' },
                            { title: 'Cronologia Salvata', desc: 'Accedi ai tuoi ultimi 50 lavori quando vuoi' },
                            { title: 'Sconto 5%', desc: 'Su tutti i piani Pro ed Enterprise per sempre' },
                            { title: 'Preferiti', desc: 'Salva i tuoi strumenti preferiti per accesso rapido' },
                            { title: 'Notifiche', desc: 'Ricevi aggiornamenti su nuove funzionalità' },
                            { title: 'Supporto Prioritario', desc: 'Assistenza più veloce per utenti registrati' }
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
