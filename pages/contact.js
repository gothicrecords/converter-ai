import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { useState } from 'react';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus(''), 3000);
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Contatti - Parla con Noi"
                description="Hai domande o suggerimenti? Contatta il team di MegaPixelAI via email, telefono o modulo di contatto. Siamo qui per aiutarti."
                canonical="/contact"
                keywords={['contatti', 'contact', 'supporto', 'assistenza', 'email']}
            />
            <Navbar />

            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>
                    Siamo qui per <span style={styles.gradient}>aiutarti</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    Hai domande, suggerimenti o hai bisogno di supporto? Scrivici e ti risponderemo entro 24 ore.
                </p>
            </section>

            <section style={styles.content}>
                <div style={styles.grid}>
                    <div style={styles.formSection}>
                        <h2 style={styles.formTitle}>Inviaci un messaggio</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nome Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="Mario Rossi"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="mario@example.com"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Oggetto</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    style={styles.select}
                                >
                                    <option value="">Seleziona un oggetto</option>
                                    <option value="support">Supporto Tecnico</option>
                                    <option value="billing">Fatturazione e Pagamenti</option>
                                    <option value="feature">Richiesta Funzionalità</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="other">Altro</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Messaggio</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    style={styles.textarea}
                                    placeholder="Scrivi il tuo messaggio qui..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                style={{...styles.submitButton, ...(status === 'sending' ? styles.buttonDisabled : {})}}
                            >
                                {status === 'sending' ? 'Invio in corso...' : 'Invia Messaggio'}
                            </button>
                            {status === 'success' && (
                                <div style={styles.successMessage}>
                                    ✓ Messaggio inviato con successo! Ti risponderemo presto.
                                </div>
                            )}
                        </form>
                    </div>

                    <div style={styles.infoSection}>
                        <div style={styles.infoCard}>
                            <div style={styles.infoIcon}><HiMail style={{ width: 24, height: 24 }} /></div>
                            <h3 style={styles.infoTitle}>Email</h3>
                            <p style={styles.infoText}>support@megapixelai.com</p>
                            <p style={styles.infoSubtext}>Per supporto generale</p>
                        </div>

                        <div style={styles.infoCard}>
                            <div style={styles.infoIcon}><HiMail style={{ width: 24, height: 24 }} /></div>
                            <h3 style={styles.infoTitle}>Partnership</h3>
                            <p style={styles.infoText}>partner@megapixelai.com</p>
                            <p style={styles.infoSubtext}>Per collaborazioni</p>
                        </div>

                        <div style={styles.infoCard}>
                            <div style={styles.infoIcon}><HiClock style={{ width: 24, height: 24 }} /></div>
                            <h3 style={styles.infoTitle}>Orario Supporto</h3>
                            <p style={styles.infoText}>Lun - Ven: 9:00 - 18:00</p>
                            <p style={styles.infoSubtext}>Risposta entro 24h</p>
                        </div>

                        <div style={styles.infoCard}>
                            <div style={styles.infoIcon}><HiLocationMarker style={{ width: 24, height: 24 }} /></div>
                            <h3 style={styles.infoTitle}>Sede</h3>
                            <p style={styles.infoText}>Italia</p>
                            <p style={styles.infoSubtext}>Team completamente remoto</p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={styles.faq}>
                <h2 style={styles.faqTitle}>Domande Frequenti</h2>
                <div style={styles.faqGrid}>
                    <div style={styles.faqItem}>
                        <h3 style={styles.faqQuestion}>Quanto tempo impiegate a rispondere?</h3>
                        <p style={styles.faqAnswer}>
                            Rispondiamo entro 24 ore lavorative. Per urgenze tecniche, il piano Pro include supporto prioritario.
                        </p>
                    </div>
                    <div style={styles.faqItem}>
                        <h3 style={styles.faqQuestion}>Offrite supporto telefonico?</h3>
                        <p style={styles.faqAnswer}>
                            Attualmente offriamo supporto via email. Per clienti Enterprise, è disponibile supporto dedicato con account manager.
                        </p>
                    </div>
                    <div style={styles.faqItem}>
                        <h3 style={styles.faqQuestion}>Come posso segnalare un bug?</h3>
                        <p style={styles.faqAnswer}>
                            Usa il modulo sopra selezionando "Supporto Tecnico" e descrivi il problema in dettaglio. Alleghiamo grande importanza ai report degli utenti.
                        </p>
                    </div>
                    <div style={styles.faqItem}>
                        <h3 style={styles.faqQuestion}>Posso richiedere nuove funzionalità?</h3>
                        <p style={styles.faqAnswer}>
                            Assolutamente! Seleziona "Richiesta Funzionalità" nel modulo. Ascoltiamo attivamente i feedback e integriamo le feature più richieste.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { maxWidth: '800px', margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' },
    heroTitle: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: '0 0 20px', letterSpacing: '-0.02em' },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSubtitle: { fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' },
    formSection: { padding: '40px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '20px' },
    formTitle: { fontSize: '28px', fontWeight: '800', margin: '0 0 32px', color: '#e2e8f0' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
    input: { padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px', outline: 'none' },
    select: { padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px', outline: 'none' },
    textarea: { padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '8px', color: '#e2e8f0', fontSize: '15px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
    submitButton: { padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    successMessage: { padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', fontSize: '14px', textAlign: 'center' },
    infoSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
    infoCard: { padding: '24px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    infoIcon: { width: '48px', height: '48px', background: 'rgba(102, 126, 234, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', marginBottom: '16px' },
    infoTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 8px', color: '#e2e8f0' },
    infoText: { fontSize: '16px', color: '#cbd5e1', margin: '0 0 4px' },
    infoSubtext: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    faq: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    faqTitle: { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '48px', color: '#e2e8f0' },
    faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
    faqItem: { padding: '24px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    faqQuestion: { fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#e2e8f0' },
    faqAnswer: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }
};
