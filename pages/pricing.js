import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Link from 'next/link';
import { HiCheckCircle } from 'react-icons/hi';
import { useTranslation } from '../lib/i18n';

export default function PricingPage() {
    const { t } = useTranslation();
    const plans = [
        {
            name: t('pricing.free'),
            price: '€0',
            period: t('pricing.month'),
            description: t('pricing.freePlanDesc'),
            features: [
                t('pricing.allTools'),
                `10 ${t('pricing.processPerDay')}`,
                `${t('pricing.fileSize')} 10 MB`,
                t('pricing.standardQuality'),
                t('pricing.noRegistration'),
                t('pricing.watermark')
            ],
            cta: t('pricing.startFree'),
            href: '/#tools',
            popular: false
        },
        {
            name: t('pricing.pro'),
            price: '€2.99',
            period: t('pricing.month'),
            description: t('pricing.proPlanDesc'),
            features: [
                t('pricing.allTools'),
                t('pricing.unlimited'),
                `${t('pricing.fileSize')} 100 MB`,
                t('pricing.premiumQuality'),
                t('pricing.noWatermark'),
                t('pricing.priorityQueue'),
                t('pricing.prioritySupport'),
                t('pricing.apiAccess'),
                t('pricing.batchProcessing'),
                t('pricing.multipleDownloads')
            ],
            cta: t('pricing.startTrial'),
            href: '/contact',
            popular: true
        },
        {
            name: t('pricing.enterprise'),
            price: 'Custom',
            period: '',
            description: t('pricing.enterprisePlanDesc'),
            features: [
                t('pricing.everythingInPro'),
                t('pricing.dedicatedInfra'),
                t('pricing.slaGuarantee'),
                t('pricing.whiteLabel'),
                t('pricing.accountManager'),
                t('pricing.customTraining'),
                t('pricing.customIntegration'),
                t('pricing.customBilling')
            ],
            cta: t('pricing.contactUs'),
            href: '/contact',
            popular: false
        }
    ];

    const faqs = [
        {
            question: t('pricing.faq1Q'),
            answer: t('pricing.faq1A')
        },
        {
            question: t('pricing.faq2Q'),
            answer: t('pricing.faq2A')
        },
        {
            question: t('pricing.faq3Q'),
            answer: t('pricing.faq3A')
        },
        {
            question: t('pricing.faq4Q'),
            answer: t('pricing.faq4A')
        },
        {
            question: t('pricing.faq5Q'),
            answer: t('pricing.faq5A')
        }
    ];

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title={t('seo.pricingTitle')}
                description={t('seo.pricingDesc')}
                canonical="/pricing"
                keywords={['pricing', 'prezzi', 'piani', 'abbonamento', 'pro', 'enterprise']}
            />
            <Navbar />

            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>{t('pricing.hero')}</h1>
                <p style={styles.heroSubtitle}>{t('pricing.subtitle')}</p>
            </section>

            <section style={styles.pricing}>
                <div style={styles.pricingGrid}>
                    {plans.map((plan, i) => (
                        <div key={i} style={{...styles.pricingCard, ...(plan.popular ? styles.popularCard : {})}}>
                            {plan.popular && <div style={styles.popularBadge}>{t('pricing.mostPopular')}</div>}
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
