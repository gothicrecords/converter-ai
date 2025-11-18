import Link from 'next/link';
import Head from 'next/head';
import { HiArrowRight, HiLightningBolt, HiSparkles } from 'react-icons/hi';
import { tools } from '../lib/tools';
import { useTranslation } from '../lib/i18n';
import { loadTranslationsSSR } from '../lib/i18n-server';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div style={styles.homeWrap}>
      {/* Animated background elements */}
      <div style={styles.bgOverlay}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
        <div style={styles.bgGrid}></div>
      </div>
      
      <Head>
        <title>MegaPixelAI - Analisi Documenti con Intelligenza Artificiale</title>
        <meta name="description" content="Carica i tuoi documenti e chatta con l'AI. Analisi automatica di PDF, DOCX, immagini con OCR e ricerca semantica." />
        
        {/* Preload risorse critiche */}
        <link rel="preload" href="/styles.css" as="style" />
        <link rel="preload" as="image" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Head>
      
      <Navbar />

      {/* Nuova sezione hero principale */}
      <div style={styles.mainHero}>
        <div style={styles.mainHeroContent}>
          <div style={styles.mainHeroBadge}>
            <HiSparkles style={{ width: 16, height: 16 }} />
            <span>{t('home.poweredBy')}</span>
          </div>
          <h1 style={styles.mainHeroTitle}>
            {t('home.heroTitle1')}<span style={styles.gradient}>{t('home.heroTitle2')}</span>
          </h1>
          <p style={styles.mainHeroSubtitle}>
            {t('home.heroSubtitle')}
          </p>
          <div style={styles.mainHeroCta}>
            <Link href="/tools" style={styles.mainPrimaryCta}>
              <span>{t('hero.cta')}</span>
              <HiArrowRight style={{ width: 20, height: 20 }} />
            </Link>
            <Link href="/home" style={styles.mainSecondaryCta}>
              <span>{t('home.learnMore')}</span>
            </Link>
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>50K+</div>
              <div style={styles.statLabel}>{t('home.activeUsers')}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>2M+</div>
              <div style={styles.statLabel}>{t('home.imagesProcessed')}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>99.9%</div>
              <div style={styles.statLabel}>{t('home.uptime')}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>4.9/5</div>
              <div style={styles.statLabel}>{t('home.avgRating')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Documenti AI */}
      <div style={styles.heroSection}>
        <div style={styles.heroBadge}>
          <HiLightningBolt style={{ width: 16, height: 16 }} />
          <span>{t('hero.cta')}</span>
        </div>
        <h1 style={styles.heroTitle}>
          {t('hero.title')}
        </h1>
        <p style={styles.heroSubtitle}>
          {t('hero.subtitle')}
        </p>
        <div style={styles.ctaButtons}>
          <Link href="/chat" style={styles.primaryCta}>
            <span>{t('hero.tryNow')}</span>
            <HiArrowRight style={{ width: 20, height: 20 }} />
          </Link>
        </div>
      </div>

      <div style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>{t('features.title')}</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIconPro}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>{t('features.aiPowered')}</h3>
            <p style={styles.featureDesc}>{t('features.aiPoweredDesc')}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconPro}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>{t('features.fastProcessing')}</h3>
            <p style={styles.featureDesc}>{t('features.fastProcessingDesc')}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconPro}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>{t('features.cloudBased')}</h3>
            <p style={styles.featureDesc}>{t('features.cloudBasedDesc')}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconPro}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>{t('features.secure')}</h3>
            <p style={styles.featureDesc}>{t('features.secureDesc')}</p>
          </div>
        </div>
      </div>

      <div style={styles.howItWorksSection}>
        <h2 style={styles.howItWorksTitle}>{t('howItWorks.title')}</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>{t('howItWorks.step1Title')}</h3>
            <p style={styles.stepDesc}>{t('howItWorks.step1Desc')}</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>{t('howItWorks.step2Title')}</h3>
            <p style={styles.stepDesc}>{t('howItWorks.step2Desc')}</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>{t('howItWorks.step3Title')}</h3>
            <p style={styles.stepDesc}>{t('howItWorks.step3Desc')}</p>
          </div>
        </div>
      </div>

      <div style={styles.toolsPreview}>
        <h2 style={styles.toolsPreviewTitle}>{t('additionalTools.title')}</h2>
        <p style={styles.toolsPreviewDesc}>
          {t('additionalTools.description')}
        </p>
        <Link href="/tools" style={styles.toolsPreviewCta}>
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
    background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)',
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
    padding: '28px 20px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(102, 126, 234, 0.15)',
    borderRadius: '20px',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden'
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
    padding: '50px 24px',
    maxWidth: '700px',
    margin: '0 auto 40px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderRadius: '24px',
    border: '1px solid rgba(102, 126, 234, 0.15)',
    position: 'relative',
    zIndex: 1
  },
  toolsPreviewTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: '12px',
    letterSpacing: '-0.01em'
  },
  toolsPreviewDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '24px',
    lineHeight: 1.6
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
    transition: 'all 0.3s'
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
    padding: '24px 20px',
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    height: '100%',
    willChange: 'transform'
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
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    transition: 'transform 0.2s',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.35)'
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
    transition: 'all 0.2s'
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
    marginBottom: '4px'
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
    animation: 'float 8s ease-in-out infinite'
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
    animation: 'float 10s ease-in-out infinite reverse'
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
    animation: 'pulse 6s ease-in-out infinite'
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
  const translations = await loadTranslationsSSR(locale || 'en');
  
  return {
    props: {
      translations
    }
  };
}
