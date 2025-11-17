import Link from 'next/link';
import { useState } from 'react';
import { 
    HiSparkles, HiLightningBolt, HiShieldCheck, HiTrendingUp, 
    HiUsers, HiCheckCircle, HiArrowRight, HiStar 
} from 'react-icons/hi';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';

export default function LandingPage() {
    const [email, setEmail] = useState('');

    const features = [
        { icon: HiLightningBolt, title: 'Velocità AI', description: 'Elaborazione in tempo reale con algoritmi di ultima generazione' },
        { icon: HiShieldCheck, title: '100% Sicuro', description: 'I tuoi file sono protetti e cancellati dopo 24 ore' },
        { icon: HiTrendingUp, title: 'Qualità Premium', description: 'Output 4K con upscaling professionale' },
        { icon: HiUsers, title: '50K+ Utenti', description: 'Fidati da professionisti in tutto il mondo' }
    ];

    const tools = [
        { name: 'Rimozione Sfondo AI', description: 'Rimuovi sfondi in 1 click', href: '/tools/rimozione-sfondo-ai', badge: 'Popolare', icon: '✂️' },
        { name: 'Generazione Immagini 4K', description: 'Crea immagini da testo', href: '/tools/generazione-immagini-ai', badge: 'Nuovo', icon: '🎨' },
        { name: 'Upscaler Professionale', description: 'Aumenta risoluzione 4x', href: '/upscaler', badge: null, icon: '📈' },
        { name: 'OCR Avanzato', description: 'Estrai testo da immagini', href: '/tools/ocr-avanzato-ai', badge: null, icon: '📝' },
        { name: 'Clean Noise AI', description: 'Pulisci audio perfettamente', href: '/tools/clean-noise-ai', badge: 'Pro', icon: '🎵' },
        { name: 'PDF Converter', description: 'Converti qualsiasi formato', href: '/pdf', badge: null, icon: '📄' },
        { name: 'Video Compressor', description: 'Riduci dimensioni video', href: '/tools/compress-video-ai', badge: null, icon: '🎬' },
        { name: 'Thumbnail Generator', description: 'Crea miniature accattivanti', href: '/tools/thumbnail-generator-ai', badge: null, icon: '🖼️' },
        { name: 'Transcribe Audio', description: 'Converti audio in testo', href: '/tools/transcribe-audio-ai', badge: null, icon: '🎙️' }
    ];

    const testimonials = [
        { name: 'Marco Rossi', role: 'Graphic Designer', avatar: '👨‍🎨', text: 'Incredibile! Ho risparmiato ore di lavoro. La qualità è superiore a qualsiasi altro tool che ho usato.', rating: 5 },
        { name: 'Laura Bianchi', role: 'Fotografa', avatar: '👩‍💼', text: 'L\'upscaling 4K è perfetto per i miei clienti. Risultati professionali ogni volta.', rating: 5 },
        { name: 'Giuseppe Verde', role: 'Content Creator', avatar: '🎬', text: 'La rimozione sfondo AI è magica. Non torno più a Photoshop per questo.', rating: 5 }
    ];

    const stats = [
        { value: '50K+', label: 'Utenti Attivi' },
        { value: '2M+', label: 'Immagini Processate' },
        { value: '99.9%', label: 'Uptime' },
        { value: '4.9/5', label: 'Rating Medio' }
    ];

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Strumenti AI Professionali per Immagini, PDF e Audio"
                description="Piattaforma all-in-one con oltre 15 strumenti AI: rimozione sfondo, upscaling 4K, generazione immagini, OCR, conversione PDF e molto altro. Gratis e professionale."
                canonical="/"
                keywords={['AI tools', 'image upscaler', 'background remover', 'PDF converter', 'OCR', 'strumenti AI']}
            />
            <Navbar />

            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>
                        <HiSparkles style={{ width: 16, height: 16 }} />
                        <span>Powered by AI • 100% Gratis</span>
                    </div>
                    <h1 style={styles.heroTitle}>
                        Trasforma i tuoi contenuti con l'<span style={styles.gradient}>Intelligenza Artificiale</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        15+ strumenti professionali per immagini, PDF, audio e video. Nessuna registrazione. Nessun limite. Risultati istantanei.
                    </p>
                    <div style={styles.heroCta}>
                        <Link href="/#tools" style={styles.ctaPrimary}>
                            Inizia Gratis
                            <HiArrowRight style={{ width: 20, height: 20 }} />
                        </Link>
                        <Link href="/#features" style={styles.ctaSecondary}>Scopri di più</Link>
                    </div>
                    <div style={styles.heroStats}>
                        {stats.map((stat, i) => (
                            <div key={i} style={styles.statItem}>
                                <div style={styles.statValue}>{stat.value}</div>
                                <div style={styles.statLabel}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="features" style={styles.features}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Perché scegliere MegaPixelAI</h2>
                    <p style={styles.sectionSubtitle}>Tecnologia all'avanguardia per risultati professionali</p>
                </div>
                <div style={styles.featuresGrid}>
                    {features.map((feature, i) => (
                        <div key={i} style={styles.featureCard}>
                            <div style={styles.featureIcon}>
                                <feature.icon style={{ width: 28, height: 28 }} />
                            </div>
                            <h3 style={styles.featureTitle}>{feature.title}</h3>
                            <p style={styles.featureDesc}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="tools" style={styles.toolsSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Strumenti Disponibili</h2>
                    <p style={styles.sectionSubtitle}>Tutto ciò di cui hai bisogno in un unico posto</p>
                </div>
                <div style={styles.toolsGrid}>
                    {tools.map((tool, i) => (
                        <Link key={i} href={tool.href} style={styles.toolCard}>
                            {tool.badge && (
                                <span style={{...styles.toolBadge, background: tool.badge === 'Nuovo' ? '#10b981' : tool.badge === 'Pro' ? '#f59e0b' : '#667eea'}}>
                                    {tool.badge}
                                </span>
                            )}
                            <div style={styles.toolIconBox}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: '#667eea'}}>
                                    {i === 0 && <><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path></>}
                                    {i === 1 && <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></>}
                                    {i === 2 && <><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></>}
                                    {i === 3 && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></>}
                                    {i === 4 && <><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></>}
                                    {i === 5 && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></>}
                                    {i === 6 && <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></>}
                                    {i === 7 && <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></>}
                                    {i === 8 && <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>}
                                </svg>
                            </div>
                            <h3 style={styles.toolName}>{tool.name}</h3>
                            <p style={styles.toolDesc}>{tool.description}</p>
                            <div style={styles.toolArrow}><HiArrowRight style={{ width: 18, height: 18 }} /></div>
                        </Link>
                    ))}
                </div>
            </section>

            <section style={styles.testimonials}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Cosa dicono i nostri utenti</h2>
                    <p style={styles.sectionSubtitle}>Migliaia di professionisti si fidano di noi ogni giorno</p>
                </div>
                <div style={styles.testimonialsGrid}>
                    {testimonials.map((testimonial, i) => (
                        <div key={i} style={styles.testimonialCard}>
                            <div style={styles.testimonialRating}>
                                {[...Array(testimonial.rating)].map((_, j) => (
                                    <HiStar key={j} style={{ width: 16, height: 16, color: '#f59e0b' }} />
                                ))}
                            </div>
                            <p style={styles.testimonialText}>"{testimonial.text}"</p>
                            <div style={styles.testimonialAuthor}>
                                <span style={styles.testimonialAvatar}>{testimonial.avatar}</span>
                                <div>
                                    <div style={styles.testimonialName}>{testimonial.name}</div>
                                    <div style={styles.testimonialRole}>{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Pronto a iniziare?</h2>
                    <p style={styles.ctaText}>Unisciti a migliaia di professionisti che usano MegaPixelAI ogni giorno</p>
                    <Link href="/#tools" style={styles.ctaButton}>
                        Inizia Gratis Ora
                        <HiArrowRight style={{ width: 20, height: 20 }} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 80px', textAlign: 'center' },
    heroContent: { display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' },
    heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '24px', color: '#667eea', fontSize: '14px', fontWeight: '600' },
    heroTitle: { fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: '900', lineHeight: '1.1', margin: 0, letterSpacing: '-0.02em', maxWidth: '900px' },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSubtitle: { fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', margin: 0, maxWidth: '700px' },
    heroCta: { display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' },
    ctaPrimary: { padding: '14px 32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', transition: 'transform 0.2s' },
    ctaSecondary: { padding: '14px 32px', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', color: '#cbd5e1', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' },
    heroStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '24px', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(148, 163, 184, 0.2)', maxWidth: '800px', width: '100%' },
    statItem: { textAlign: 'center' },
    statValue: { fontSize: '28px', fontWeight: '800', color: '#667eea', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#94a3b8', fontWeight: '500' },
    features: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    sectionHeader: { textAlign: 'center', marginBottom: '60px' },
    sectionTitle: { fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '800', margin: '0 0 16px', letterSpacing: '-0.02em' },
    sectionSubtitle: { fontSize: '18px', color: '#94a3b8', margin: 0 },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' },
    featureCard: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px', transition: 'all 0.3s' },
    featureIcon: { width: '64px', height: '64px', background: 'rgba(102, 126, 234, 0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea', marginBottom: '20px' },
    featureTitle: { fontSize: '20px', fontWeight: '700', margin: '0 0 12px', color: '#e2e8f0' },
    featureDesc: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    toolsSection: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
    toolCard: { position: 'relative', padding: '24px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px', textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer' },
    toolBadge: { position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#ffffff' },
    toolIconBox: { width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', border: '1px solid rgba(102, 126, 234, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
    toolName: { fontSize: '18px', fontWeight: '700', margin: '0 0 8px', color: '#e2e8f0' },
    toolDesc: { fontSize: '14px', color: '#94a3b8', margin: '0 0 16px' },
    toolArrow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#667eea' },
    enterpriseFooter: { textAlign: 'center', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: '#cbd5e1' },
    testimonials: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' },
    testimonialCard: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    testimonialRating: { display: 'flex', gap: '4px', marginBottom: '16px' },
    testimonialText: { fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' },
    testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
    testimonialAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(102, 126, 234, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
    testimonialName: { fontSize: '16px', fontWeight: '700', color: '#e2e8f0' },
    testimonialRole: { fontSize: '14px', color: '#94a3b8' },
    ctaSection: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '80px 24px', margin: '80px 0' },
    ctaContent: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
    ctaTitle: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: '0 0 16px', color: '#ffffff' },
    ctaText: { fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' },
    ctaButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 40px', background: '#ffffff', color: '#667eea', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s' }
};
