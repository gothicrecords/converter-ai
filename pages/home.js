import Link from 'next/link';
import { useState } from 'react';
import { 
    HiSparkles, HiLightningBolt, HiShieldCheck, HiTrendingUp, 
    HiUsers, HiCheckCircle, HiArrowRight, HiStar 
} from 'react-icons/hi';
import { useTranslation } from '../lib/i18n';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';
import { tools as allTools } from '../lib/tools';
import { useIsMobile } from '../lib/useMediaQuery';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const features = [
        { icon: HiLightningBolt, title: t('features.fastProcessing'), description: t('home.feature1Desc') },
        { icon: HiShieldCheck, title: t('features.secure'), description: t('home.feature2Desc') },
        { icon: HiTrendingUp, title: t('home.premiumQuality'), description: t('home.feature3Desc') },
        { icon: HiUsers, title: t('home.users'), description: t('home.feature4Desc') }
    ];

    const testimonials = [
        { name: t('home.testimonial1Name'), role: t('home.testimonial1Role'), avatar: '👨‍🎨', text: t('home.testimonial1Text'), rating: 5 },
        { name: t('home.testimonial2Name'), role: t('home.testimonial2Role'), avatar: '👩‍💼', text: t('home.testimonial2Text'), rating: 5 },
        { name: t('home.testimonial3Name'), role: t('home.testimonial3Role'), avatar: '🎬', text: t('home.testimonial3Text'), rating: 5 }
    ];

    const stats = [
        { value: '50K+', label: t('home.activeUsers') },
        { value: '2M+', label: t('home.imagesProcessed') },
        { value: '99.9%', label: t('home.uptime') },
        { value: '4.9/5', label: t('home.avgRating') }
    ];

    const styles = getStyles(isMobile);
    
    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title={t('seo.homeTitle')}
                description={t('seo.homeDesc')}
                canonical="/"
                keywords={['AI tools', 'image upscaler', 'background remover', 'PDF converter', 'OCR', 'strumenti AI']}
            />
            <Navbar />

            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>
                        <HiSparkles style={{ width: 16, height: 16 }} />
                        <span>{t('home.poweredBy')}</span>
                    </div>
                    <h1 style={styles.heroTitle}>
                        {t('home.heroTitle1')} <span style={styles.gradient}>{t('home.heroTitle2')}</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        {t('home.heroSubtitle')}
                    </p>
                    <div style={styles.heroCta}>
                        <Link href="/tools" style={styles.ctaPrimary}>
                            {t('hero.cta')}
                            <HiArrowRight style={{ width: 20, height: 20 }} />
                        </Link>
                        <Link href="/#features" style={styles.ctaSecondary}>{t('home.learnMore')}</Link>
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
                    <h2 style={styles.sectionTitle}>{t('home.whyChoose')}</h2>
                    <p style={styles.sectionSubtitle}>{t('home.whyChooseSubtitle')}</p>
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

            <section style={styles.testimonials}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>{t('home.testimonials')}</h2>
                    <p style={styles.sectionSubtitle}>{t('home.testimonialsSubtitle')}</p>
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
                    <h2 style={styles.ctaTitle}>{t('home.ctaTitle')}</h2>
                    <p style={styles.ctaText}>{t('home.ctaText')}</p>
                    <Link href="/#tools" style={styles.ctaButton}>
                        {t('home.ctaButton')}
                        <HiArrowRight style={{ width: 20, height: 20 }} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

const getStyles = (isMobile) => ({
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '80px 16px 50px' : '120px 24px 80px', 
        textAlign: 'center' 
    },
    heroContent: { display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '24px', alignItems: 'center' },
    heroBadge: { 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: isMobile ? '6px 12px' : '8px 16px', 
        background: 'rgba(102, 126, 234, 0.15)', 
        border: '1px solid rgba(102, 126, 234, 0.3)', 
        borderRadius: '24px', 
        color: '#667eea', 
        fontSize: isMobile ? '12px' : '14px', 
        fontWeight: '600' 
    },
    heroTitle: { 
        fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(32px, 6vw, 56px)', 
        fontWeight: '900', 
        lineHeight: '1.1', 
        margin: 0, 
        letterSpacing: '-0.02em', 
        maxWidth: '900px',
        padding: isMobile ? '0 8px' : '0'
    },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSubtitle: { 
        fontSize: isMobile ? '15px' : '18px', 
        color: '#94a3b8', 
        lineHeight: '1.6', 
        margin: 0, 
        maxWidth: '700px',
        padding: isMobile ? '0 16px' : '0'
    },
    heroCta: { 
        display: 'flex', 
        gap: isMobile ? '12px' : '16px', 
        marginTop: '16px', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        width: isMobile ? '100%' : 'auto',
        padding: isMobile ? '0 16px' : '0'
    },
    ctaPrimary: { 
        padding: isMobile ? '12px 24px' : '14px 32px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        border: 'none', 
        borderRadius: '12px', 
        color: '#ffffff', 
        fontSize: isMobile ? '14px' : '16px', 
        fontWeight: '600', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        textDecoration: 'none', 
        transition: 'transform 0.2s',
        width: isMobile ? '100%' : 'auto',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    },
    ctaSecondary: { 
        padding: isMobile ? '12px 24px' : '14px 32px', 
        background: 'rgba(102, 126, 234, 0.1)', 
        border: '1px solid rgba(102, 126, 234, 0.3)', 
        borderRadius: '12px', 
        color: '#cbd5e1', 
        fontSize: isMobile ? '14px' : '16px', 
        fontWeight: '600', 
        cursor: 'pointer', 
        textDecoration: 'none', 
        transition: 'all 0.2s',
        width: isMobile ? '100%' : 'auto',
        textAlign: 'center',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    },
    heroStats: { 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: isMobile ? '16px' : '24px', 
        marginTop: isMobile ? '24px' : '32px', 
        paddingTop: isMobile ? '24px' : '32px', 
        borderTop: '1px solid rgba(148, 163, 184, 0.2)', 
        maxWidth: '800px', 
        width: '100%',
        padding: isMobile ? '24px 16px 0' : '32px 0 0'
    },
    statItem: { textAlign: 'center' },
    statValue: { fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#667eea', marginBottom: '4px' },
    statLabel: { fontSize: isMobile ? '11px' : '13px', color: '#94a3b8', fontWeight: '500' },
    features: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '50px 16px' : '80px 24px' 
    },
    sectionHeader: { 
        textAlign: 'center', 
        marginBottom: isMobile ? '40px' : '60px' 
    },
    sectionTitle: { 
        fontSize: isMobile ? 'clamp(24px, 6vw, 32px)' : 'clamp(28px, 5vw, 42px)', 
        fontWeight: '800', 
        margin: '0 0 16px', 
        letterSpacing: '-0.02em',
        padding: isMobile ? '0 16px' : '0'
    },
    sectionSubtitle: { 
        fontSize: isMobile ? '15px' : '18px', 
        color: '#94a3b8', 
        margin: 0,
        padding: isMobile ? '0 16px' : '0'
    },
    featuresGrid: { 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: isMobile ? '20px' : '32px' 
    },
    featureCard: { 
        padding: isMobile ? '24px 20px' : '32px', 
        background: 'rgba(102, 126, 234, 0.05)', 
        border: '1px solid rgba(102, 126, 234, 0.2)', 
        borderRadius: '16px', 
        transition: 'all 0.3s' 
    },
    featureIcon: { 
        width: isMobile ? '56px' : '64px', 
        height: isMobile ? '56px' : '64px', 
        background: 'rgba(102, 126, 234, 0.15)', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#667eea', 
        marginBottom: isMobile ? '16px' : '20px' 
    },
    featureTitle: { 
        fontSize: isMobile ? '18px' : '20px', 
        fontWeight: '700', 
        margin: '0 0 12px', 
        color: '#e2e8f0' 
    },
    featureDesc: { 
        fontSize: isMobile ? '14px' : '15px', 
        color: '#94a3b8', 
        lineHeight: '1.6', 
        margin: 0 
    },
    toolsSection: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '50px 16px' : '80px 24px' 
    },
    toolsGrid: { 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: isMobile ? '16px' : '24px' 
    },
    toolCard: { 
        position: 'relative', 
        padding: '24px', 
        background: 'rgba(30, 41, 59, 0.5)', 
        border: '1px solid rgba(102, 126, 234, 0.2)', 
        borderRadius: '12px', 
        textDecoration: 'none', 
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        cursor: 'pointer'
    },
    proBadge: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '12px',
        letterSpacing: '0.5px'
    },
    toolIconWrapper: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
    },
    toolIcon: {
        width: '24px',
        height: '24px',
        color: '#fff'
    },
    toolTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: '8px',
        textAlign: 'left',
        margin: '0 0 8px 0'
    },
    toolDescription: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: '0 0 16px 0',
        textAlign: 'left',
        flex: 1
    },
    toolArrow: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        width: '100%',
        color: '#667eea',
        marginTop: 'auto'
    },
    enterpriseFooter: { textAlign: 'center', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: '#cbd5e1' },
    testimonials: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '50px 16px' : '80px 24px' 
    },
    testimonialsGrid: { 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: isMobile ? '20px' : '32px' 
    },
    testimonialCard: { 
        padding: isMobile ? '24px 20px' : '32px', 
        background: 'rgba(102, 126, 234, 0.05)', 
        border: '1px solid rgba(102, 126, 234, 0.2)', 
        borderRadius: '16px' 
    },
    testimonialRating: { display: 'flex', gap: '4px', marginBottom: '16px' },
    testimonialText: { 
        fontSize: isMobile ? '14px' : '15px', 
        color: '#cbd5e1', 
        lineHeight: '1.6', 
        marginBottom: isMobile ? '20px' : '24px', 
        fontStyle: 'italic' 
    },
    testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
    testimonialAvatar: { 
        width: isMobile ? '40px' : '48px', 
        height: isMobile ? '40px' : '48px', 
        borderRadius: '50%', 
        background: 'rgba(102, 126, 234, 0.2)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: isMobile ? '20px' : '24px' 
    },
    testimonialName: { 
        fontSize: isMobile ? '14px' : '16px', 
        fontWeight: '700', 
        color: '#e2e8f0' 
    },
    testimonialRole: { 
        fontSize: isMobile ? '12px' : '14px', 
        color: '#94a3b8' 
    },
    ctaSection: { 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: isMobile ? '50px 16px' : '80px 24px', 
        margin: isMobile ? '50px 0' : '80px 0' 
    },
    ctaContent: { 
        maxWidth: '800px', 
        margin: '0 auto', 
        textAlign: 'center' 
    },
    ctaTitle: { 
        fontSize: isMobile ? 'clamp(24px, 6vw, 32px)' : 'clamp(32px, 5vw, 48px)', 
        fontWeight: '900', 
        margin: '0 0 16px', 
        color: '#ffffff',
        padding: isMobile ? '0 8px' : '0'
    },
    ctaText: { 
        fontSize: isMobile ? '15px' : '18px', 
        color: 'rgba(255,255,255,0.9)', 
        marginBottom: isMobile ? '24px' : '32px',
        padding: isMobile ? '0 8px' : '0'
    },
    ctaButton: { 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: isMobile ? '14px 32px' : '16px 40px', 
        background: '#ffffff', 
        color: '#667eea', 
        borderRadius: '12px', 
        fontSize: isMobile ? '16px' : '18px', 
        fontWeight: '700', 
        textDecoration: 'none', 
        transition: 'transform 0.2s',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    }
});

export async function getServerSideProps({ locale }) {
    const { loadTranslationsSSR } = await import('../lib/i18n-server');
    const translations = await loadTranslationsSSR(locale || 'en');
    
    return {
        props: {
            translations
        }
    };
}
