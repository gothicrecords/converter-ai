import Link from 'next/link';
import Head from 'next/head';
import { HiArrowRight, HiLightningBolt } from 'react-icons/hi';
import { tools } from '../lib/tools';
import { useTranslation } from '../lib/i18n';
import { loadTranslationsSSR } from '../lib/i18n-server';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div style={styles.homeWrap}>
      <Head>
        <title>MegaPixelAI - Analisi Documenti con Intelligenza Artificiale</title>
        <meta name="description" content="Carica i tuoi documenti e chatta con l'AI. Analisi automatica di PDF, DOCX, immagini con OCR e ricerca semantica." />
      </Head>
      
      <div style={styles.animatedBg}>
        <div style={styles.particle1}></div>
        <div style={styles.particle2}></div>
        <div style={styles.energyFlow1}></div>
        <div style={styles.energyFlow2}></div>
        <div style={styles.energyFlow3}></div>
        <div style={styles.orb1}></div>
        <div style={styles.orb2}></div>
      </div>
      
      <Navbar />

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
            <span>{t('hero.cta')}</span>
            <HiArrowRight style={{ width: 20, height: 20 }} />
          </Link>
          <Link href="/home" style={styles.secondaryCta}>
            <span>{t('hero.tryNow')}</span>
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
        <Link href="/home" style={styles.toolsPreviewCta}>
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
    overflow: 'hidden'
  },
  animatedBg: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    opacity: 0.08
  },
  particle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
    top: '10%',
    left: '10%',
    animation: 'float 20s ease-in-out infinite',
    filter: 'blur(60px)',
    willChange: 'transform'
  },
  particle2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)',
    bottom: '20%',
    right: '15%',
    animation: 'float 25s ease-in-out infinite reverse',
    filter: 'blur(70px)',
    willChange: 'transform'
  },
  energyFlow1: {
    position: 'absolute',
    width: '6px',
    height: '280px',
    background: 'linear-gradient(180deg, transparent 0%, #667eea 40%, #667eea 60%, transparent 100%)',
    top: '20%',
    left: '30%',
    animation: 'flowDown 3s ease-in-out infinite',
    boxShadow: '0 0 30px #667eea, 0 0 60px rgba(102, 126, 234, 0.8), 0 0 90px rgba(102, 126, 234, 0.4)',
    filter: 'blur(0.3px)',
    willChange: 'transform, opacity'
  },
  energyFlow2: {
    position: 'absolute',
    width: '6px',
    height: '300px',
    background: 'linear-gradient(180deg, transparent 0%, #a78bfa 40%, #a78bfa 60%, transparent 100%)',
    top: '40%',
    right: '25%',
    animation: 'flowDown 4s ease-in-out infinite 1s',
    boxShadow: '0 0 30px #a78bfa, 0 0 60px rgba(167, 139, 250, 0.8), 0 0 90px rgba(167, 139, 250, 0.4)',
    filter: 'blur(0.3px)',
    willChange: 'transform, opacity'
  },
  energyFlow3: {
    position: 'absolute',
    width: '6px',
    height: '320px',
    background: 'linear-gradient(180deg, transparent 0%, #f093fb 40%, #f093fb 60%, transparent 100%)',
    top: '10%',
    left: '60%',
    animation: 'flowDown 5s ease-in-out infinite 2s',
    boxShadow: '0 0 30px #f093fb, 0 0 60px rgba(240, 147, 251, 0.8), 0 0 90px rgba(240, 147, 251, 0.4)',
    filter: 'blur(0.3px)',
    willChange: 'transform, opacity'
  },
  orb1: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(102, 126, 234, 1)',
    top: '15%',
    left: '15%',
    animation: 'orbit 20s linear infinite',
    boxShadow: '0 0 25px rgba(102, 126, 234, 0.9), 0 0 50px rgba(102, 126, 234, 0.5)',
    willChange: 'transform'
  },
  orb2: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(167, 139, 250, 1)',
    top: '60%',
    right: '20%',
    animation: 'orbit 25s linear infinite reverse',
    boxShadow: '0 0 25px rgba(167, 139, 250, 0.9), 0 0 50px rgba(167, 139, 250, 0.5)',
    willChange: 'transform'
  },
  heroSection: {
    textAlign: 'center',
    padding: '80px 24px 60px',
    maxWidth: '900px',
    margin: '0 auto',
    animation: 'fadeInUp 0.8s ease-out'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '24px',
    color: '#667eea',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    animation: 'glow 2s ease-in-out infinite'
  },
  heroTitle: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: '800',
    margin: '0 0 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    margin: '0 0 32px',
    lineHeight: 1.7
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
  },
  secondaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  featuresSection: {
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featuresTitle: {
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '48px',
    color: '#f1f5f9'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  featureCard: {
    padding: '32px 24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    textAlign: 'center',
    transition: 'all 0.3s'
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  featureIconPro: {
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    color: '#667eea'
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '12px'
  },
  featureDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0
  },
  toolsPreview: {
    textAlign: 'center',
    padding: '60px 24px 60px',
    maxWidth: '700px',
    margin: '0 auto',
    background: 'rgba(102, 126, 234, 0.05)',
    borderRadius: '24px',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  toolsPreviewTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '16px'
  },
  toolsPreviewDesc: {
    fontSize: '15px',
    color: '#94a3b8',
    marginBottom: '24px',
    lineHeight: 1.6
  },
  toolsPreviewCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'rgba(102, 126, 234, 0.15)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    borderRadius: '10px',
    color: '#667eea',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s'
  },
  howItWorksSection: {
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  howItWorksTitle: {
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '48px',
    color: '#f1f5f9'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px'
  },
  stepCard: {
    padding: '32px 24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    textAlign: 'center',
    transition: 'all 0.3s'
  },
  stepNumber: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '12px'
  },
  stepDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: 1.6,
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
