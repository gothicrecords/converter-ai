import Link from 'next/link';
import Head from 'next/head';
import { HiArrowRight, HiLightningBolt } from 'react-icons/hi';
import { tools } from '../lib/tools';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <div style={styles.homeWrap}>
      <Head>
        <title>MegaPixelAI - Strumenti AI Professionali</title>
        <meta name="description" content="Potenzia i tuoi contenuti con l'intelligenza artificiale - Upscaling, conversione, editing e molto altro" />
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
          <span>Powered by AI</span>
        </div>
        <h1 style={styles.heroTitle}>
          Trasforma i tuoi contenuti<br/>con la potenza dell'AI
        </h1>
        <p style={styles.heroSubtitle}>
          Strumenti professionali per immagini, PDF, video e audio.<br/>Veloce, potente, gratuito.
        </p>
      </div>

      <div style={styles.toolsGrid}>
        {tools.map((tool, index) => {
          const IconComponent = tool.icon;
          return (
            <div 
              key={tool.href} 
              style={{
                ...styles.toolCardWrap,
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={() => {
                // Prefetch on hover for instant navigation
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = tool.href;
                document.head.appendChild(link);
              }}
            >
              <Link 
                href={tool.href} 
                prefetch={true}
                style={styles.toolCard}
                className="tool-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate3d(0, -6px, 0)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  const icon = e.currentTarget.querySelector('.tool-icon-wrap');
                  if (icon) icon.style.transform = 'scale(1.1) rotate(5deg)';
                  const arrow = e.currentTarget.querySelector('.tool-arrow');
                  if (arrow) arrow.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate3d(0, 0, 0)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  const icon = e.currentTarget.querySelector('.tool-icon-wrap');
                  if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
                  const arrow = e.currentTarget.querySelector('.tool-arrow');
                  if (arrow) arrow.style.transform = 'translateX(0)';
                }}
              >
                <div style={styles.toolIconWrap} className="tool-icon-wrap">
                  <IconComponent style={styles.toolIcon} />
                </div>
                <h2 style={styles.toolTitle}>{tool.title}</h2>
                <p style={styles.toolDesc}>{tool.description}</p>
                <div style={styles.toolFooter}>
                  <span style={styles.toolCta}>Inizia ora</span>
                  <HiArrowRight style={styles.toolArrow} className="tool-arrow" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <footer style={styles.homeFooter}>
        <p style={{margin: 0}}>Tutti gli strumenti sono gratuiti e rispettano la tua privacy.</p>
      </footer>
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
    margin: 0,
    lineHeight: 1.7
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
