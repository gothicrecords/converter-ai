import Link from 'next/link';
import { useState } from 'react';
import { 
    HiSparkles, HiLightningBolt, HiShieldCheck, HiTrendingUp, 
    HiUsers, HiCheckCircle, HiArrowRight, HiStar 
} from 'react-icons/hi';
import { useTranslation } from '../lib/i18n';
import { loadTranslationsSSR } from '../lib/i18n-server';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';
import { tools as allTools } from '../lib/tools';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const { t } = useTranslation();

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
    toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
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

export async function getServerSideProps({ locale }) {
    const translations = await loadTranslationsSSR(locale || 'en');
    
    return {
        props: {
            translations
        }
    };
}
