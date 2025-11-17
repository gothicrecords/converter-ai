import Head from 'next/head';
import Navbar from '../../components/Navbar';
import BackgroundRemover from '../../components/tools/BackgroundRemover';

export default function RimozioneSfondoAIPage() {
  return (
    <div style={styles.pageWrap}>
      <Head>
        <title>Rimozione Sfondo AI | MegaPixelAI</title>
        <meta name="description" content="Rimuovi lo sfondo da qualsiasi immagine con un click. Soggetto rilevato in modo intelligente, qualità elevata e ritaglio preciso." />
      </Head>
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
