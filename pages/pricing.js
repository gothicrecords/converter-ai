import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Link from 'next/link';
import { HiCheckCircle } from 'react-icons/hi';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '€0',
            period: '/mese',
            description: 'Perfetto per iniziare e testare i nostri strumenti',
            features: [
                'Tutti gli strumenti AI disponibili',
                '10 elaborazioni al giorno',
                'File fino a 10 MB',
                'Qualità standard',
                'Nessuna registrazione richiesta',
                'Watermark sui risultati'
            ],
            cta: 'Inizia Gratis',
            href: '/#tools',
            popular: false
        },
        {
            name: 'Pro',
            price: '€19',
            period: '/mese',
            description: 'Per professionisti che richiedono qualità e volume',
            features: [
                'Tutti gli strumenti AI disponibili',
                'Elaborazioni illimitate',
                'File fino a 100 MB',
                'Qualità premium 4K',
                'Nessun watermark',
                'Priorità nella coda',
                'Supporto prioritario',
                'API Access',
                'Batch processing',
                'Download multipli'
            ],
            cta: 'Inizia Prova Gratuita',
            href: '/contact',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'Soluzioni personalizzate per team e aziende',
            features: [
                'Tutto di Pro +',
                'Infrastruttura dedicata',
                'SLA garantito 99.99%',
                'White label disponibile',
                'Account manager dedicato',
                'Training personalizzato',
                'Integrazione custom',
                'Fatturazione su misura'
            ],
            cta: 'Contattaci',
            href: '/contact',
            popular: false
        }
    ];

    const faqs = [
        {
            question: 'Posso cancellare in qualsiasi momento?',
            answer: 'Sì, puoi cancellare il tuo piano Pro in qualsiasi momento dalla dashboard. Non ci sono penali o costi aggiuntivi.'
        },
        {
            question: 'Come funziona la prova gratuita?',
            answer: 'La prova gratuita di 7 giorni ti dà accesso completo a tutte le funzionalità Pro senza alcun costo. Non è richiesta carta di credito.'
        },
        {
            question: 'Quali metodi di pagamento accettate?',
            answer: 'Accettiamo tutte le principali carte di credito (Visa, Mastercard, American Express), PayPal e bonifico bancario per piani Enterprise.'
        },
        {
            question: 'I miei dati sono al sicuro?',
            answer: 'Assolutamente. Tutti i file vengono cancellati dai nostri server dopo 24 ore. Usiamo crittografia SSL e non condividiamo mai i tuoi dati.'
        },
        {
            question: 'Posso fare l\'upgrade o downgrade?',
            answer: 'Sì, puoi cambiare piano in qualsiasi momento. L\'upgrade è immediato, il downgrade avrà effetto dal prossimo ciclo di fatturazione.'
        },
        {
            question: 'Offrite sconti per studenti o no-profit?',
            answer: 'Sì! Offriamo sconti del 50% per studenti con email universitaria valida e per organizzazioni no-profit certificate. Contattaci per maggiori dettagli.'
        }
    ];

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Pricing - Piani e Prezzi per Ogni Esigenza"
                description="Scegli il piano perfetto per te: Free con 10 elaborazioni al giorno, Pro con elaborazioni illimitate e qualità 4K, o Enterprise con soluzioni personalizzate."
                canonical="/pricing"
                keywords={['pricing', 'prezzi', 'piani', 'abbonamento', 'pro', 'enterprise']}
            />
            <Navbar />

            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>Piani semplici e <span style={styles.gradient}>trasparenti</span></h1>
                <p style={styles.heroSubtitle}>Scegli il piano perfetto per le tue esigenze. Sempre con garanzia soddisfatti o rimborsati 30 giorni.</p>
            </section>

            <section style={styles.pricing}>
                <div style={styles.pricingGrid}>
                    {plans.map((plan, i) => (
                        <div key={i} style={{...styles.pricingCard, ...(plan.popular ? styles.popularCard : {})}}>
                            {plan.popular && <div style={styles.popularBadge}>PIÙ POPOLARE</div>}
                            <h3 style={styles.planName}>{plan.name}</h3>
                            <div style={styles.planPrice}>
                                <span style={styles.priceAmount}>{plan.price}</span>
                                <span style={styles.pricePeriod}>{plan.period}</span>
                            </div>
                            <p style={styles.planDescription}>{plan.description}</p>
                            <Link href={plan.href} style={{...styles.planCta, ...(plan.popular ? styles.popularCta : {})}}>
                                {plan.cta}
                            </Link>
                            <ul style={styles.featureList}>
                                {plan.features.map((feature, j) => (
                                    <li key={j} style={styles.featureItem}>
                                        <HiCheckCircle style={styles.checkIcon} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.comparison}>
                <h2 style={styles.comparisonTitle}>Confronto dettagliato</h2>
                <div style={styles.comparisonTable}>
                    <div style={styles.tableHeader}>
                        <div style={styles.featureColumn}>Funzionalità</div>
                        <div style={styles.planColumn}>Free</div>
                        <div style={styles.planColumn}>Pro</div>
                        <div style={styles.planColumn}>Enterprise</div>
                    </div>
                    {[
                        { feature: 'Elaborazioni al giorno', free: '10', pro: 'Illimitate', enterprise: 'Illimitate' },
                        { feature: 'Dimensione file max', free: '10 MB', pro: '100 MB', enterprise: 'Custom' },
                        { feature: 'Qualità output', free: 'Standard', pro: '4K Premium', enterprise: '4K Premium' },
                        { feature: 'Watermark', free: 'Sì', pro: 'No', enterprise: 'No' },
                        { feature: 'Priorità elaborazione', free: 'No', pro: 'Sì', enterprise: 'Dedicata' },
                        { feature: 'API Access', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Supporto', free: 'Community', pro: 'Prioritario', enterprise: 'Dedicato' },
                        { feature: 'SLA', free: 'No', pro: '99.9%', enterprise: '99.99%' }
                    ].map((row, i) => (
                        <div key={i} style={styles.tableRow}>
                            <div style={styles.featureColumn}>{row.feature}</div>
                            <div style={styles.planColumn}>{row.free}</div>
                            <div style={styles.planColumn}>{row.pro}</div>
                            <div style={styles.planColumn}>{row.enterprise}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.faq}>
                <h2 style={styles.faqTitle}>Domande Frequenti</h2>
                <div style={styles.faqGrid}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={styles.faqItem}>
                            <h3 style={styles.faqQuestion}>{faq.question}</h3>
                            <p style={styles.faqAnswer}>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.cta}>
                <h2 style={styles.ctaTitle}>Pronto a iniziare?</h2>
                <p style={styles.ctaText}>Prova gratis per 7 giorni. Nessuna carta di credito richiesta.</p>
                <Link href="/contact" style={styles.ctaButton}>Inizia la Prova Gratuita</Link>
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
    pricing: { maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' },
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' },
    pricingCard: { position: 'relative', padding: '40px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '20px', transition: 'all 0.3s' },
    popularCard: { background: 'rgba(102, 126, 234, 0.1)', border: '2px solid #667eea', transform: 'scale(1.05)' },
    popularBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: '#667eea', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#ffffff' },
    planName: { fontSize: '24px', fontWeight: '800', margin: '0 0 16px', color: '#e2e8f0' },
    planPrice: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' },
    priceAmount: { fontSize: '48px', fontWeight: '900', color: '#667eea' },
    pricePeriod: { fontSize: '18px', color: '#94a3b8' },
    planDescription: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' },
    planCta: { display: 'block', width: '100%', padding: '14px', background: 'rgba(102, 126, 234, 0.15)', border: '1px solid #667eea', borderRadius: '12px', color: '#cbd5e1', fontSize: '16px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', marginBottom: '32px', transition: 'all 0.2s' },
    popularCta: { background: '#667eea', color: '#ffffff', border: 'none' },
    featureList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
    featureItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: '#cbd5e1' },
    checkIcon: { width: 20, height: 20, color: '#10b981', flexShrink: 0, marginTop: '2px' },
    comparison: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    comparisonTitle: { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '48px', color: '#e2e8f0' },
    comparisonTable: { background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '20px', background: 'rgba(102, 126, 234, 0.1)', fontWeight: '700', fontSize: '14px', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '20px', borderTop: '1px solid rgba(102, 126, 234, 0.1)' },
    featureColumn: { color: '#cbd5e1', fontSize: '15px' },
    planColumn: { color: '#94a3b8', fontSize: '15px', textAlign: 'center' },
    faq: { maxWidth: '900px', margin: '0 auto', padding: '80px 24px' },
    faqTitle: { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '48px', color: '#e2e8f0' },
    faqGrid: { display: 'flex', flexDirection: 'column', gap: '24px' },
    faqItem: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    faqQuestion: { fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#e2e8f0' },
    faqAnswer: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    cta: { maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' },
    ctaTitle: { fontSize: '36px', fontWeight: '900', margin: '0 0 16px', color: '#e2e8f0' },
    ctaText: { fontSize: '18px', color: '#94a3b8', marginBottom: '32px' },
    ctaButton: { display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#ffffff', fontSize: '18px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s' }
};
