import Link from 'next/link';
import Head from 'next/head';
import { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { HiArrowRight, HiLightningBolt, HiSparkles } from 'react-icons/hi';
import { tools } from '../lib/tools';
import { useTranslation } from '../lib/i18n';
import { useIsMobile } from '../lib/useMediaQuery';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';

// Lazy load Footer per migliorare FCP
const Footer = dynamic(() => import('../components/Footer'), {
  ssr: true,
  loading: () => <div style={{ minHeight: '200px' }}></div>
});

// Memoized components for better performance
const AnimatedBadge = memo(({ icon: Icon, text }) => (
  <div style={styles.mainHeroBadge} className="animate-fade-in-up">
    <Icon style={{ width: 16, height: 16 }} />
    <span>{text}</span>
  </div>
));
AnimatedBadge.displayName = 'AnimatedBadge';

const StatItem = memo(({ value, label, delay }) => (
  <div style={styles.statItem} className="animate-fade-in" data-delay={delay}>
    <div style={styles.statValue} className="animate-count-up">{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
));
StatItem.displayName = 'StatItem';

const FeatureCard = memo(({ icon, title, description, delay }) => (
  <div style={styles.featureCard} className="animate-slide-up" data-delay={delay}>
    <div style={styles.featureIconPro}>
      {icon}
    </div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{description}</p>
  </div>
));
FeatureCard.displayName = 'FeatureCard';

export default function HomePage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Memoize static data
  const stats = useMemo(() => [
    { value: '50K+', label: t('home.activeUsers'), delay: 0 },
    { value: '2M+', label: t('home.imagesProcessed'), delay: 100 },
    { value: '99.9%', label: t('home.uptime'), delay: 200 },
    { value: '4.9/5', label: t('home.avgRating'), delay: 300 }
  ], [t]);
  
  return (
    <div style={styles.homeWrap} suppressHydrationWarning>
      {/* Animated background elements */}
      <div style={styles.bgOverlay}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
        <div style={styles.bgGrid}></div>
      </div>
      
      <SEOHead
        title="MegaPixelAI - Strumenti AI Professionali per Immagini, PDF e Documenti"
        description="Piattaforma completa di strumenti AI professionali: upscaling immagini, conversione PDF, OCR avanzato, rimozione sfondo, traduzione documenti, trascrizione audio e molto altro. Gratis, veloce e sicuro."
        canonical="/"
        keywords={['AI tools', 'strumenti AI', 'upscaler immagini', 'convertitore PDF', 'OCR', 'rimozione sfondo', 'traduzione documenti', 'trascrizione audio']}
        type="website"
      />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Preload risorse critiche - CSS ora importati come moduli */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </Head>
      
      <Navbar />

      {/* Nuova sezione hero principale */}
      <div style={{
        ...styles.mainHero,
        ...(isMobile ? { padding: '60px 16px 40px' } : {})
      }}>
        <div style={styles.mainHeroContent}>
          <AnimatedBadge icon={HiSparkles} text={t('home.poweredBy')} />
          <h1 style={{
            ...styles.mainHeroTitle,
            ...(isMobile ? { fontSize: 'clamp(28px, 8vw, 40px)', padding: '0 8px' } : {})
          }} className="animate-fade-in-up">
            {t('home.heroTitle1')}<span style={styles.gradient}>{t('home.heroTitle2')}</span>
          </h1>
          <p style={{
            ...styles.mainHeroSubtitle,
            ...(isMobile ? { fontSize: '15px', padding: '0 16px' } : {})
          }} className="animate-fade-in-up">
            {t('home.heroSubtitle')}
          </p>
          <div style={{
            ...styles.mainHeroCta,
            ...(isMobile ? { flexDirection: 'column', width: '100%', padding: '0 16px' } : {})
          }} className="animate-fade-in-up">
            <Link href="/tools" style={{
              ...styles.mainPrimaryCta,
              ...(isMobile ? { width: '100%', padding: '12px 24px', fontSize: '15px' } : {})
            }} className="hover-lift">
              <span>{t('hero.cta')}</span>
              <HiArrowRight style={{ width: 20, height: 20 }} />
            </Link>
            <Link href="/home" style={{
              ...styles.mainSecondaryCta,
              ...(isMobile ? { width: '100%', padding: '12px 24px', fontSize: '15px' } : {})
            }} className="hover-lift">
              <span>{t('home.learnMore')}</span>
            </Link>
          </div>
          <div style={{
            ...styles.statsGrid,
            ...(isMobile ? { 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px',
              padding: '24px 16px 0'
            } : {})
          }}>
            {stats.map((stat, i) => (
              <StatItem key={i} value={stat.value} label={stat.label} delay={stat.delay} />
            ))}
          </div>
        </div>
      </div>

      {/* Sezione Documenti AI - Enhanced */}
      <div style={{
        ...styles.aiDocumentsSection,
        ...(isMobile ? { padding: '50px 16px' } : {})
      }}>
        <div style={{
          ...styles.aiDocumentsHero,
          ...(isMobile ? { padding: '40px 20px', borderRadius: '24px' } : {})
        }}>
          <div style={styles.heroBadge} className="animate-fade-in-up">
            <HiLightningBolt style={{ width: 16, height: 16 }} />
            <span>NUOVO STRUMENTO</span>
          </div>
          <h1 style={{
            ...styles.aiDocumentsTitle,
            ...(isMobile ? { fontSize: 'clamp(24px, 6vw, 32px)', padding: '0 8px' } : {})
          }} className="animate-fade-in-up">
            {t('hero.title')}
          </h1>
          <p style={{
            ...styles.aiDocumentsSubtitle,
            ...(isMobile ? { fontSize: '15px', padding: '0 8px', marginBottom: '32px' } : {})
          }} className="animate-fade-in-up">
            {t('hero.subtitle')}
          </p>
          
          {/* Features Grid */}
          <div style={{
            ...styles.aiDocumentsFeaturesGrid,
            ...(isMobile ? { 
              gridTemplateColumns: '1fr', 
              gap: '16px',
              marginBottom: '32px'
            } : {})
          }}>
            <div style={styles.aiDocumentsFeature} className="animate-slide-up ai-feature-hover" data-delay="0">
              <div style={styles.aiDocumentsFeatureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3 style={styles.aiDocumentsFeatureTitle}>Multi-Formato</h3>
              <p style={styles.aiDocumentsFeatureDesc}>Supporta PDF, DOCX, TXT, immagini con OCR automatico</p>
            </div>
            <div style={styles.aiDocumentsFeature} className="animate-slide-up ai-feature-hover" data-delay="1">
              <div style={styles.aiDocumentsFeatureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 style={styles.aiDocumentsFeatureTitle}>Chat Intelligente</h3>
              <p style={styles.aiDocumentsFeatureDesc}>Conversazioni naturali con i tuoi documenti usando AI avanzata</p>
            </div>
            <div style={styles.aiDocumentsFeature} className="animate-slide-up ai-feature-hover" data-delay="2">
              <div style={styles.aiDocumentsFeatureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <h3 style={styles.aiDocumentsFeatureTitle}>Ricerca Semantica</h3>
              <p style={styles.aiDocumentsFeatureDesc}>Trova informazioni precise anche in documenti complessi</p>
            </div>
            <div style={styles.aiDocumentsFeature} className="animate-slide-up ai-feature-hover" data-delay="3">
              <div style={styles.aiDocumentsFeatureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 style={styles.aiDocumentsFeatureTitle}>Analisi Istantanea</h3>
              <p style={styles.aiDocumentsFeatureDesc}>Estrazione automatica di concetti chiave e riassunti</p>
            </div>
          </div>

          <div style={styles.ctaButtons} className="animate-fade-in-up">
            <Link href="/chat" style={styles.primaryCta} className="hover-lift">
              <span>{t('hero.tryNow')}</span>
              <HiArrowRight style={{ width: 20, height: 20 }} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{
        ...styles.featuresSection,
        ...(isMobile ? { padding: '50px 16px 40px' } : {})
      }}>
        <h2 style={{
          ...styles.featuresTitle,
          ...(isMobile ? { fontSize: 'clamp(24px, 6vw, 32px)', padding: '0 16px' } : {})
        }} className="animate-fade-in-up">{t('features.title')}</h2>
        <div style={{
          ...styles.featuresGrid,
          ...(isMobile ? { gridTemplateColumns: '1fr', gap: '20px' } : {})
        }}>
          <FeatureCard
            delay={0}
            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>}
            title={t('features.aiPowered')}
            description={t('features.aiPoweredDesc')}
          />
          <FeatureCard
            delay={1}
            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>}
            title={t('features.fastProcessing')}
            description={t('features.fastProcessingDesc')}
          />
          <FeatureCard
            delay={2}
            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>}
            title={t('features.cloudBased')}
            description={t('features.cloudBasedDesc')}
          />
          <FeatureCard
            delay={3}
            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>}
            title={t('features.secure')}
            description={t('features.secureDesc')}
          />
        </div>
      </div>

      <div style={styles.howItWorksSection}>
        <h2 style={styles.howItWorksTitle} className="animate-fade-in-up">{t('howItWorks.title')}</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard} className="animate-slide-up" data-delay="0">
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>{t('howItWorks.step1Title')}</h3>
            <p style={styles.stepDesc}>{t('howItWorks.step1Desc')}</p>
          </div>
          <div style={styles.stepCard} className="animate-slide-up" data-delay="1">
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>{t('howItWorks.step2Title')}</h3>
            <p style={styles.stepDesc}>{t('howItWorks.step2Desc')}</p>
          </div>
          <div style={styles.stepCard} className="animate-slide-up" data-delay="2">
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>{t('howItWorks.step3Title')}</h3>
            <p style={styles.stepDesc}>{t('howItWorks.step3Desc')}</p>
          </div>
        </div>
      </div>

      <div style={{
        ...styles.toolsPreview,
        ...(isMobile ? { padding: '40px 20px', borderRadius: '24px' } : {})
      }}>
        <div style={styles.toolsPreviewBadge} className="animate-fade-in-up">
          <HiSparkles style={{ width: 14, height: 14 }} />
          <span>9 STRUMENTI PROFESSIONALI</span>
        </div>
        <h2 style={{
          ...styles.toolsPreviewTitle,
          ...(isMobile ? { fontSize: 'clamp(24px, 6vw, 28px)', padding: '0 8px' } : {})
        }} className="animate-fade-in-up">{t('additionalTools.title')}</h2>
        <p style={{
          ...styles.toolsPreviewDesc,
          ...(isMobile ? { fontSize: '14px', padding: '0 8px', marginBottom: '24px' } : {})
        }} className="animate-fade-in-up">
          {t('additionalTools.description')}
        </p>
        
        {/* Tool highlights grid con icone SVG professionali */}
        <div style={{
          ...styles.toolHighlightsGrid,
          ...(isMobile ? { 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            maxWidth: '100%'
          } : {})
        }}>
          <div style={styles.toolHighlight} className="animate-slide-up tool-highlight-hover" data-delay="0">
            <div style={styles.toolHighlightIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div style={styles.toolHighlightTitle}>Immagini</div>
            <div style={styles.toolHighlightCount}>4 strumenti</div>
          </div>
          <div style={styles.toolHighlight} className="animate-slide-up tool-highlight-hover" data-delay="1">
            <div style={styles.toolHighlightIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div style={styles.toolHighlightTitle}>PDF</div>
            <div style={styles.toolHighlightCount}>4 strumenti</div>
            {/* Sub-links for SEO and quick access */}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/pdf/jpg2pdf" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 11, padding: '4px 8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '6px', transition: 'all 0.2s', fontWeight: 500 }} className="pdf-tool-link">JPG→PDF</Link>
              <Link href="/pdf/pdf2jpg" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 11, padding: '4px 8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '6px', transition: 'all 0.2s', fontWeight: 500 }} className="pdf-tool-link">PDF→JPG</Link>
              <Link href="/pdf/docx2pdf" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 11, padding: '4px 8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '6px', transition: 'all 0.2s', fontWeight: 500 }} className="pdf-tool-link">DOCX→PDF</Link>
              <Link href="/pdf/pdf2docx" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 11, padding: '4px 8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '6px', transition: 'all 0.2s', fontWeight: 500 }} className="pdf-tool-link">PDF→DOCX</Link>
            </div>
          </div>
          <div style={styles.toolHighlight} className="animate-slide-up tool-highlight-hover" data-delay="2">
            <div style={styles.toolHighlightIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <div style={styles.toolHighlightTitle}>Audio</div>
            <div style={styles.toolHighlightCount}>2 strumenti</div>
          </div>
          <div style={styles.toolHighlight} className="animate-slide-up tool-highlight-hover" data-delay="3">
            <div style={styles.toolHighlightIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 7 4 4 20 4 20 7"></polyline>
                <line x1="9" y1="20" x2="15" y2="20"></line>
                <line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
            </div>
            <div style={styles.toolHighlightTitle}>Testo</div>
            <div style={styles.toolHighlightCount}>1 strumento</div>
          </div>
        </div>
        
        <Link href="/tools" style={styles.toolsPreviewCta} className="hover-lift animate-fade-in-up">
          {t('additionalTools.explore')}
          <HiArrowRight style={{ width: 18, height: 18 }} />
        </Link>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  homeWrap: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1720 100%)',
    backgroundAttachment: 'fixed',
    overflow: 'hidden'
  },
  heroSection: {
    textAlign: 'center',
    padding: '60px 24px 50px',
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  aiDocumentsSection: {
    padding: '80px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  aiDocumentsHero: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.1) 100%)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '32px',
    padding: '60px 40px',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2), 0 0 40px rgba(102, 126, 234, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateZ(0)',
    willChange: 'transform, box-shadow',
    position: 'relative',
    overflow: 'hidden'
  },
  aiDocumentsTitle: {
    fontSize: 'clamp(32px, 5vw, 52px)',
    fontWeight: '900',
    margin: '0 0 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
    letterSpacing: '-0.03em',
    textShadow: '0 0 40px rgba(102, 126, 234, 0.3)'
  },
  aiDocumentsSubtitle: {
    fontSize: '17px',
    color: '#cbd5e1',
    margin: '0 0 48px',
    lineHeight: 1.8,
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  aiDocumentsFeaturesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  aiDocumentsFeature: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '20px',
    padding: '24px 20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'default',
    transform: 'translateZ(0)',
    willChange: 'transform, border-color'
  },
  aiDocumentsFeatureIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  aiDocumentsFeatureTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#e2e8f0',
    margin: '0 0 8px',
    letterSpacing: '-0.01em'
  },
  aiDocumentsFeatureDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.5
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    background: 'rgba(102, 126, 234, 0.12)',
    border: '1px solid rgba(102, 126, 234, 0.25)',
    borderRadius: '20px',
    color: '#a78bfa',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  heroTitle: {
    fontSize: 'clamp(28px, 4.5vw, 42px)',
    fontWeight: '800',
    margin: '0 0 16px',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  heroSubtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    margin: '0 0 28px',
    lineHeight: 1.7
  },
  ctaButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.35)',
  },
  secondaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.25)',
    borderRadius: '12px',
    color: '#cbd5e1',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  featuresSection: {
    padding: '80px 24px 60px',
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  featuresTitle: {
    fontSize: '36px',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginTop: '48px'
  },
  featureCard: {
    position: 'relative',
    padding: '32px 24px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '24px',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden',
    willChange: 'transform, box-shadow',
    transform: 'translateZ(0)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  featureIconPro: {
    width: '64px',
    height: '64px',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    color: '#a78bfa',
    transition: 'all 0.4s ease'
  },
  featureTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: '10px',
    letterSpacing: '-0.01em'
  },
  featureDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0
  },
  toolsPreview: {
    textAlign: 'center',
    padding: '60px 40px',
    maxWidth: '900px',
    margin: '0 auto 40px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.08) 100%)',
    borderRadius: '32px',
    border: '1px solid rgba(102, 126, 234, 0.25)',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.12)',
    backdropFilter: 'blur(10px)'
  },
  toolsPreviewBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: 'rgba(102, 126, 234, 0.15)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    color: '#a78bfa',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  toolsPreviewTitle: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#e2e8f0',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  toolsPreviewDesc: {
    fontSize: '15px',
    color: '#cbd5e1',
    marginBottom: '32px',
    lineHeight: 1.7,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  toolHighlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  toolHighlight: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(102, 126, 234, 0.25)',
    borderRadius: '16px',
    padding: '20px 16px',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transform: 'translateZ(0)',
    willChange: 'transform, box-shadow'
  },
  toolHighlightIcon: {
    fontSize: '28px',
    marginBottom: '8px'
  },
  toolHighlightTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: '4px'
  },
  toolHighlightCount: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  toolsPreviewCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(102, 126, 234, 0.15)',
    border: '1px solid rgba(102, 126, 234, 0.35)',
    borderRadius: '12px',
    color: '#a78bfa',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s',
    transform: 'translateZ(0)',
    willChange: 'transform, box-shadow'
  },
  howItWorksSection: {
    padding: '80px 24px 60px',
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  howItWorksTitle: {
    fontSize: '36px',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '48px',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px'
  },
  stepCard: {
    position: 'relative',
    padding: '32px 24px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '24px',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden'
  },
  stepNumber: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 auto 20px',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.4s ease'
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: '12px',
    letterSpacing: '-0.01em'
  },
  stepDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: 0
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px 60px'
  },
  toolCardWrap: {
    position: 'relative'
  },
  toolCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 24px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(102, 126, 234, 0.25)',
    borderRadius: '16px',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.1)',
    cursor: 'pointer',
    height: '100%',
    willChange: 'transform, box-shadow'
  },
  toolIconWrap: {
    position: 'relative',
    width: '52px',
    height: '52px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '12px',
    transition: 'transform 0.3s ease'
  },
  toolIcon: {
    width: '28px',
    height: '28px',
    color: '#a78bfa',
    transition: 'all 0.3s ease'
  },
  toolTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 10px',
    textDecoration: 'none'
  },
  toolDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '0 0 16px',
    flex: 1
  },
  toolFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid rgba(102, 126, 234, 0.1)'
  },
  toolCta: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a78bfa'
  },
  toolArrow: {
    width: '20px',
    height: '20px',
    color: '#a78bfa',
    transition: 'transform 0.3s ease'
  },
  homeFooter: {
    textAlign: 'center',
    padding: '32px 24px',
    color: '#64748b',
    fontSize: '14px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  // Nuovi stili per sezione hero principale
  mainHero: {
    textAlign: 'center',
    padding: '80px 24px 60px',
    maxWidth: '1000px',
    margin: '0 auto',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    position: 'relative',
    zIndex: 1
  },
  mainHeroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center'
  },
  mainHeroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: 'rgba(102, 126, 234, 0.15)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '600'
  },
  mainHeroTitle: {
    fontSize: 'clamp(32px, 5.5vw, 52px)',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: 0,
    letterSpacing: '-0.02em',
    maxWidth: '850px',
    color: '#e2e8f0'
  },
  gradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  mainHeroSubtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '650px'
  },
  mainHeroCta: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  mainPrimaryCta: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: '200% 200%',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4), 0 0 20px rgba(102, 126, 234, 0.2)',
    willChange: 'transform, box-shadow',
    transform: 'translateZ(0)',
    letterSpacing: '0.01em',
    position: 'relative',
    overflow: 'hidden'
  },
  mainSecondaryCta: {
    padding: '12px 28px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    color: '#cbd5e1',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s',
    willChange: 'transform',
    transform: 'translateZ(0)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '20px',
    marginTop: '36px',
    paddingTop: '28px',
    borderTop: '1px solid rgba(148, 163, 184, 0.15)',
    maxWidth: '700px',
    width: '100%'
  },
  statItem: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '4px',
    display: 'inline-block'
  },
  statLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  // Background decorations
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden'
  },
  bgCircle1: {
    position: 'absolute',
    top: '10%',
    right: '5%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'float 8s ease-in-out infinite',
    willChange: 'transform',
    contain: 'layout style paint'
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(118, 75, 162, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'float 10s ease-in-out infinite reverse',
    willChange: 'transform',
    contain: 'layout style paint'
  },
  bgCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(100px)',
    animation: 'pulse 6s ease-in-out infinite',
    willChange: 'opacity',
    contain: 'layout style paint'
  },
  bgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    opacity: 0.5
  }
};

export async function getServerSideProps({ locale }) {
  const { loadTranslationsSSR } = await import('../lib/i18n-server');
  const translations = await loadTranslationsSSR(locale || 'en');
  
  return {
    props: {
      translations
    }
  };
}
