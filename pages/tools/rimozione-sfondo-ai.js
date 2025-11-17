import Navbar from '../../components/Navbar';
import BackgroundRemover from '../../components/tools/BackgroundRemover';
import SEOHead from '../../components/SEOHead';

export default function RimozioneSfondoAIPage() {
  return (
    <div style={styles.pageWrap}>
      <SEOHead
        title="Rimozione Sfondo AI"
        description="Rimuovi lo sfondo da qualsiasi immagine con un click. Soggetto rilevato in modo intelligente, qualità elevata e ritaglio preciso. Gratis e senza registrazione."
        canonical="/tools/rimozione-sfondo-ai"
        toolName="Rimozione Sfondo AI"
        toolCategory="ImageApplication"
        keywords={['rimozione sfondo', 'remove background', 'AI sfondo', 'trasparente', 'foto editing']}
      />
      <Navbar />
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.title}>Rimozione Sfondo AI</h1>
          <p style={styles.subtitle}>Trascina l'immagine, rileviamo il soggetto e rimuoviamo lo sfondo con precisione.</p>
        </header>
        <BackgroundRemover />
      </main>
    </div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
  mainContent: { maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' },
  subtitle: { color: '#94a3b8', marginTop: 8 }
};
