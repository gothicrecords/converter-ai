import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Link from 'next/link';
import { HiCheckCircle, HiLightningBolt, HiSparkles, HiLockClosed, HiCog, HiArrowUp, HiCloud } from 'react-icons/hi';
import { useTranslation } from '../lib/i18n';
import getStripe from '../lib/stripe-client';
import { getCurrentUser } from '../lib/auth';
import * as analytics from '../lib/analytics';

function PricingPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Carica utente autenticato
        const loadUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };
        loadUser();
    }, []);

    const handleSubscribe = async (priceId) => {
        // Verifica se l'utente è autenticato
        if (!user) {
            analytics.trackButtonClick('Subscribe (Not Logged In)', 'Pricing Page');
            alert('Devi effettuare il login per abbonarti al piano Pro');
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        setLoading(true);

        // Track begin checkout
        const planName = priceId.includes('pro') ? 'pro' : 'premium';
        const planPrice = planName === 'pro' ? 3.99 : 9.99;
        analytics.trackBeginCheckout(planPrice, [{
            item_id: planName,
            item_name: `${planName} Plan`,
            price: planPrice,
            quantity: 1,
        }]);

        try {
            // Crea sessione checkout con dati utente reali
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: user.id,
                    userEmail: user.email,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    success: false,
                    error: 'Errore sconosciuto',
                    code: 'UNKNOWN_ERROR'
                }));

                // Messaggi di errore più specifici
                let errorMessage = errorData.error || `Errore ${response.status}: ${response.statusText}`;

                if (errorData.code === 'INVALID_PRICE_ID' || errorData.code === 'STRIPE_RESOURCE_MISSING') {
                    errorMessage = 'Il price ID configurato non è valido. Contatta il supporto.';
                } else if (errorData.code === 'STRIPE_NOT_CONFIGURED') {
                    errorMessage = 'Stripe non è configurato correttamente. Contatta il supporto.';
                } else if (errorData.code === 'MISSING_PRICE_ID') {
                    errorMessage = 'Price ID mancante. Contatta il supporto.';
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.success || !data.url) {
                throw new Error(data.error || 'URL di checkout non ricevuto');
            }

            // Track checkout redirect
            analytics.trackButtonClick('Checkout Redirect', 'Pricing Page');

            // Redirect a Stripe Checkout
            window.location.href = data.url;
        } catch (error) {
            analytics.trackError(error.message, 'Pricing Page', 'checkout_error');
            console.error('Subscription error:', error);

            // Mostra un messaggio di errore più user-friendly
            const userMessage = error.message.includes('Price ID')
                ? 'Errore di configurazione del pagamento. Il price ID non è valido. Contatta il supporto tecnico.'
                : `Errore durante il pagamento: ${error.message}. Riprova più tardi o contatta il supporto.`;

            alert(userMessage);
        } finally {
            setLoading(false);
        }
    };

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
            popular: false,
            singleColumn: true
        },
        {
            name: t('pricing.pro'),
            price: '€3.99',
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
                t('pricing.multipleDownloads'),
                t('pricing.advancedOCR'),
                t('pricing.aiImageGen'),
                t('pricing.documentTranslation'),
                t('pricing.backgroundRemoval'),
                t('pricing.upscaling4K'),
                t('pricing.noRateLimits'),
                t('pricing.cloudStorage'),
                t('pricing.exportFormats')
            ],
            cta: t('pricing.startTrial'),
            stripePrice: 'price_1SWmnKA5FzBkqU1E7Xn0egBr',
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
                t('pricing.customBilling'),
                t('pricing.enterpriseSupport'),
                t('pricing.customWorkflows'),
                t('pricing.bulkLicenses'),
                t('pricing.onPremiseOption')
            ],
            cta: t('pricing.contactUs'),
            href: '/contact',
            popular: false,
            singleColumn: true
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

            {/* Box speciale vantaggi PRO */}
            <div style={styles.proBenefitsBox}>
                <h2 style={styles.proBenefitsTitle}>Perché scegliere il Piano PRO?</h2>
                <div style={styles.proBenefitsGrid}>
                    <div style={styles.proBenefitItem}>
                        <HiLightningBolt style={styles.proBenefitIcon} />
                        <h3 style={styles.proBenefitTitle}>Elaborazioni Illimitate</h3>
                        <p style={styles.proBenefitText}>Nessun limite giornaliero o mensile. Elabora migliaia di file senza preoccuparti di raggiungere il limite.</p>
                    </div>
                    <div style={styles.proBenefitItem}>
                        <HiSparkles style={styles.proBenefitIcon} />
                        <h3 style={styles.proBenefitTitle}>Qualità 4K Premium</h3>
                        <p style={styles.proBenefitText}>Risultati di qualità professionale con risoluzione fino a 4K. Perfetto per stampa, pubblicazioni e progetti commerciali.</p>
                    </div>
                    <div style={styles.proBenefitItem}>
                        <HiLockClosed style={styles.proBenefitIcon} />
                        <h3 style={styles.proBenefitTitle}>Nessun Watermark</h3>
                        <p style={styles.proBenefitText}>File puliti e pronti per l'uso commerciale. Nessun logo o watermark sui tuoi risultati.</p>
                    </div>
                    <div style={styles.proBenefitItem}>
                        <HiCog style={styles.proBenefitIcon} />
                        <h3 style={styles.proBenefitTitle}>Tutti i Tool PRO</h3>
                        <p style={styles.proBenefitText}>Accesso completo a tutti gli strumenti AI avanzati: OCR, generazione immagini, traduzione documenti, upscaling 4K e molto altro.</p>
                    </div>
                    <div style={styles.proBenefitItem}>
                        <HiArrowUp style={styles.proBenefitIcon} />
                        <h3 style={styles.proBenefitTitle}>Priorità Assoluta</h3>
                        <p style={styles.proBenefitText}>Le tue elaborazioni vengono processate per prime, senza code d'attesa. Risultati più veloci sempre.</p>
                    </div>
                    <div style={styles.proBenefitItem}>
                        <HiCloud style={styles.proBenefitIcon} />
                        <h3 style={styles.proBenefitTitle}>File Fino a 100MB</h3>
                        <p style={styles.proBenefitText}>Elabora file di grandi dimensioni senza limitazioni. Perfetto per progetti professionali complessi.</p>
                    </div>
                </div>
            </div>

            <section style={styles.pricing}>
                <div style={styles.pricingGrid}>
                    {plans.map((plan, i) => (
                        <div key={i} style={{
                            ...styles.pricingCard,
                            ...(plan.popular ? styles.popularCard : {}),
                            ...(plan.singleColumn ? styles.centeredCard : {})
                        }}>
                            {plan.popular && <div style={styles.popularBadge}>{t('pricing.mostPopular')}</div>}

                            {plan.singleColumn ? (
                                // Layout centrato per Free ed Enterprise
                                <div style={styles.centeredContent}>
                                    <h3 style={styles.planName}>{plan.name}</h3>
                                    <div style={styles.planPrice}>
                                        <span style={styles.priceAmount}>{plan.price}</span>
                                        <span style={styles.pricePeriod}>{plan.period}</span>
                                    </div>
                                    <p style={styles.planDescription}>{plan.description}</p>

                                    {plan.stripePrice ? (
                                        <button
                                            onClick={() => handleSubscribe(plan.stripePrice)}
                                            disabled={loading}
                                            style={{
                                                ...styles.planCta,
                                                ...(plan.popular ? styles.popularCta : {}),
                                                ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                                            }}
                                        >
                                            {loading ? 'Caricamento...' : plan.cta}
                                        </button>
                                    ) : (
                                        <Link href={plan.href} style={{
                                            ...styles.planCta,
                                            ...(plan.popular ? styles.popularCta : {})
                                        }}>
                                            {plan.cta}
                                        </Link>
                                    )}

                                    <ul style={styles.featureListSingle}>
                                        {plan.features.map((feature, j) => {
                                            const displayFeature = feature.includes(' - ')
                                                ? feature.split(' - ')[0]
                                                : feature;
                                            return (
                                                <li key={j} style={styles.featureItemCentered}>
                                                    <HiCheckCircle style={styles.checkIcon} />
                                                    <span>{displayFeature}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                // Layout normale per PRO
                                <>
                                    <h3 style={{ ...styles.planName, textAlign: 'center' }}>{plan.name}</h3>
                                    <div style={styles.planPrice}>
                                        <span style={styles.priceAmount}>{plan.price}</span>
                                        <span style={styles.pricePeriod}>{plan.period}</span>
                                    </div>
                                    <p style={{ ...styles.planDescription, textAlign: 'center' }}>{plan.description}</p>
                                    {plan.stripePrice ? (
                                        <button
                                            onClick={() => handleSubscribe(plan.stripePrice)}
                                            disabled={loading}
                                            style={{
                                                ...styles.planCta,
                                                ...(plan.popular ? styles.popularCta : {}),
                                                ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                                                ...styles.proCta
                                            }}
                                        >
                                            {loading ? 'Caricamento...' : plan.cta}
                                        </button>
                                    ) : (
                                        <Link href={plan.href} style={{ ...styles.planCta, ...(plan.popular ? styles.popularCta : {}) }}>
                                            {plan.cta}
                                        </Link>
                                    )}
                                    <ul style={styles.featureList}>
                                        {plan.features.map((feature, j) => {
                                            const displayFeature = feature.includes(' - ')
                                                ? feature.split(' - ')[0]
                                                : feature;
                                            return (
                                                <li key={j} style={styles.featureItem}>
                                                    <HiCheckCircle style={styles.checkIcon} />
                                                    <span>{displayFeature}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            )}
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
                        { type: 'separator', feature: 'Limiti e Utilizzo' },
                        { feature: 'Elaborazioni al giorno', free: '10', pro: 'Illimitate', enterprise: 'Illimitate' },
                        { feature: 'Elaborazioni al mese', free: '100', pro: 'Illimitate', enterprise: 'Illimitate' },
                        { feature: 'Dimensione file max', free: '10 MB', pro: '100 MB', enterprise: 'Custom (fino a 500MB)' },
                        { feature: 'Rate Limiting', free: 'Sì (5/giorno)', pro: 'No', enterprise: 'No' },
                        { type: 'separator', feature: 'Qualità e Performance' },
                        { feature: 'Qualità output', free: 'Standard', pro: '4K Premium', enterprise: '4K Premium' },
                        { feature: 'Watermark', free: 'Sì', pro: 'No', enterprise: 'No' },
                        { feature: 'Priorità elaborazione', free: 'No', pro: 'Sì', enterprise: 'Dedicata' },
                        { feature: 'Velocità elaborazione', free: 'Standard', pro: 'Prioritaria', enterprise: 'Massima' },
                        { type: 'separator', feature: 'Tool PRO AI' },
                        { feature: 'Tool PRO disponibili', free: 'No', pro: 'Tutti', enterprise: 'Tutti + Custom' },
                        { feature: 'OCR Avanzato AI', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Generazione Immagini AI', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Traduzione Documenti AI', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Rimozione Sfondo AI', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Upscaling 4K AI', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Clean Noise AI', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Thumbnail Generator', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Elabora e Riassumi', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { type: 'separator', feature: 'Funzionalità Avanzate' },
                        { feature: 'Batch Processing', free: 'No', pro: 'Sì', enterprise: 'Sì + Massivo' },
                        { feature: 'Download multipli', free: 'No', pro: 'Sì', enterprise: 'Sì' },
                        { feature: 'Storage cloud', free: 'No', pro: 'Sì', enterprise: 'Sì + Dedicato' },
                        { feature: 'Export formati', free: 'Limitati', pro: 'Tutti', enterprise: 'Tutti + Custom' },
                        { feature: 'API Access', free: 'No', pro: 'Sì', enterprise: 'Sì + Webhooks' },
                        { type: 'separator', feature: 'Supporto e Infrastruttura' },
                        { feature: 'Supporto', free: 'Community', pro: 'Prioritario (24h)', enterprise: 'Dedicato 24/7' },
                        { feature: 'Account Manager', free: 'No', pro: 'No', enterprise: 'Sì' },
                        { feature: 'Training personalizzato', free: 'No', pro: 'No', enterprise: 'Sì' },
                        { feature: 'Infrastruttura', free: 'Condivisa', pro: 'Condivisa', enterprise: 'Dedicata' },
                        { feature: 'SLA', free: 'No', pro: '99.9%', enterprise: '99.99%' },
                        { type: 'separator', feature: 'Enterprise Esclusivo' },
                        { feature: 'Integrazione custom', free: 'No', pro: 'No', enterprise: 'Sì' },
                        { feature: 'White Label', free: 'No', pro: 'No', enterprise: 'Sì' },
                        { feature: 'Fatturazione', free: 'N/A', pro: 'Standard', enterprise: 'Custom' },
                        { feature: 'Licenze bulk', free: 'No', pro: 'No', enterprise: 'Sì' },
                        { feature: 'Opzione on-premise', free: 'No', pro: 'No', enterprise: 'Sì' }
                    ].map((row, i) => {
                        if (row.type === 'separator') {
                            return (
                                <div key={i} style={styles.tableSeparator}>
                                    <div style={styles.separatorColumn}>{row.feature}</div>
                                    <div style={styles.separatorColumn}></div>
                                    <div style={styles.separatorColumn}></div>
                                    <div style={styles.separatorColumn}></div>
                                </div>
                            );
                        }
                        return (
                            <div key={i} style={styles.tableRow}>
                                <div style={styles.featureColumn}>{row.feature}</div>
                                <div style={styles.planColumn}>{row.free}</div>
                                <div style={styles.planColumn}>{row.pro}</div>
                                <div style={styles.planColumn}>{row.enterprise}</div>
                            </div>
                        );
                    })}
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



export default PricingPage;

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { maxWidth: '800px', margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' },
    heroTitle: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: '0 0 20px', letterSpacing: '-0.02em' },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSubtitle: { fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    pricing: { maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' },
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' },
    pricingCard: {
        position: 'relative',
        padding: '28px 20px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '20px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.1)',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '420px',
        height: '100%'
    },
    popularCard: {
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%)',
        border: '2px solid #667eea',
        transform: 'scale(1.05)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4), 0 0 40px rgba(102, 126, 234, 0.2)'
    },
    popularBadge: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '6px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 200%',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#ffffff',
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.5)',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        zIndex: 10
    },
    planName: { fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#e2e8f0', textAlign: 'inherit' },
    planPrice: { display: 'flex', alignItems: 'baseline', gap: '4px', margin: '0 0 12px 0', justifyContent: 'center' },
    priceAmount: { fontSize: '32px', fontWeight: '900', color: '#667eea' },
    pricePeriod: { fontSize: '13px', color: '#94a3b8' },
    planDescription: { fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 20px 0', textAlign: 'inherit' },
    planCta: {
        display: 'block',
        width: '100%',
        padding: '12px 20px',
        background: 'rgba(102, 126, 234, 0.15)',
        border: '1px solid #667eea',
        borderRadius: '10px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '700',
        textAlign: 'center',
        textDecoration: 'none',
        margin: '0 0 24px 0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform, box-shadow',
        cursor: 'pointer'
    },
    popularCta: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 200%',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4), 0 0 20px rgba(102, 126, 234, 0.2)'
    },
    proCta: {
        margin: '0 0 24px 0',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '700'
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '6px 10px',
        flex: 1
    },
    featureListSingle: {
        display: 'flex',
        flexDirection: 'column',
        gridTemplateColumns: 'none',
        gap: '8px',
        alignItems: 'center',
        width: '100%',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        flexShrink: 0
    },
    centeredCard: {
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '28px 20px'
    },
    centeredContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px',
        width: '100%'
    },
    featureItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        fontSize: '12px',
        color: '#cbd5e1',
        lineHeight: '1.3'
    },
    featureItemCentered: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#cbd5e1',
        lineHeight: '1.3',
        width: '100%'
    },
    checkIcon: { width: 16, height: 16, color: '#10b981', flexShrink: 0, marginTop: '1px' },
    comparison: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    comparisonTitle: { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '48px', color: '#e2e8f0' },
    comparisonTable: {
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.1)'
    },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', padding: '14px 16px', background: 'rgba(102, 126, 234, 0.1)', fontWeight: '700', fontSize: '12px', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', padding: '10px 16px', borderTop: '1px solid rgba(102, 126, 234, 0.08)' },
    tableSeparator: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', padding: '12px 16px', background: 'rgba(102, 126, 234, 0.15)', borderTop: '2px solid rgba(102, 126, 234, 0.3)', borderBottom: '1px solid rgba(102, 126, 234, 0.2)', marginTop: '4px' },
    separatorColumn: { color: '#667eea', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
    featureColumn: { color: '#cbd5e1', fontSize: '13px', lineHeight: '1.4' },
    planColumn: { color: '#94a3b8', fontSize: '13px', textAlign: 'center', lineHeight: '1.4' },
    faq: { maxWidth: '900px', margin: '0 auto', padding: '80px 24px' },
    faqTitle: { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '48px', color: '#e2e8f0' },
    faqGrid: { display: 'flex', flexDirection: 'column', gap: '24px' },
    faqItem: {
        padding: '36px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.1)'
    },
    faqQuestion: { fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#e2e8f0' },
    faqAnswer: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    cta: { maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' },
    ctaTitle: { fontSize: '36px', fontWeight: '900', margin: '0 0 16px', color: '#e2e8f0' },
    ctaText: { fontSize: '18px', color: '#94a3b8', marginBottom: '32px' },
    ctaButton: { display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#ffffff', fontSize: '18px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s' },
    proBenefitsBox: {
        maxWidth: '1200px',
        margin: '0 auto 40px',
        padding: '24px 20px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(102, 126, 234, 0.4)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 40px rgba(102, 126, 234, 0.2)'
    },
    proBenefitsTitle: {
        fontSize: 'clamp(22px, 3vw, 28px)',
        fontWeight: '900',
        textAlign: 'center',
        margin: '0 0 20px',
        color: '#e2e8f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    proBenefitsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        gridAutoRows: '1fr'
    },
    proBenefitItem: {
        padding: '14px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '130px',
        height: '100%'
    },
    proBenefitIcon: {
        width: '24px',
        height: '24px',
        color: '#667eea',
        marginBottom: '8px',
        filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.5))'
    },
    proBenefitTitle: {
        fontSize: '14px',
        fontWeight: '700',
        margin: '0 0 6px',
        color: '#e2e8f0'
    },
    proBenefitText: {
        fontSize: '12px',
        color: '#94a3b8',
        lineHeight: '1.4',
        margin: 0,
        flex: 1
    }
};
