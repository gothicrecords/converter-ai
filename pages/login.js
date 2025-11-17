import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { login, isAuthenticated } from '../lib/auth';
import { trackLogin } from '../lib/analytics';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
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
                title="Accedi al Tuo Account - MegaPixelAI"
                description="Accedi alla tua dashboard personale su MegaPixelAI. Visualizza statistiche, cronologia e gestisci il tuo account."
                canonical="/login"
                keywords={['login', 'accedi', 'accesso', 'account']}
            />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.formCard}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Bentornato!</h1>
                        <p style={styles.subtitle}>Accedi al tuo account per continuare</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
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
                                placeholder="La tua password"
                                style={styles.input}
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{...styles.submitButton, ...(loading ? styles.buttonDisabled : {})}}
                        >
                            {loading ? 'Accesso in corso...' : 'Accedi'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            Non hai un account?{' '}
                            <Link href="/signup" style={styles.link}>Registrati gratis</Link>
                        </p>
                        <p style={styles.footerText}>
                            <Link href="/contact" style={styles.link}>Password dimenticata?</Link>
                        </p>
                    </div>
                </div>

                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>Perché creare un account?</h3>
                    <ul style={styles.infoList}>
                        <li style={styles.infoItem}>📊 Dashboard personale con statistiche dettagliate</li>
                        <li style={styles.infoItem}>💾 Cronologia completa dei tuoi lavori</li>
                        <li style={styles.infoItem}>💰 5% di sconto permanente su tutti i piani</li>
                        <li style={styles.infoItem}>⭐ Salva i tuoi strumenti preferiti</li>
                        <li style={styles.infoItem}>🔔 Notifiche per nuove funzionalità</li>
                        <li style={styles.infoItem}>🎯 Supporto prioritario</li>
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
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
    inputIcon: { width: 16, height: 16 },
    input: { padding: '14px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px', color: '#e2e8f0', fontSize: '15px', outline: 'none' },
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
