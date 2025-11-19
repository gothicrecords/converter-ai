import Navbar from '../../components/Navbar';
import BackgroundRemover from '../../components/tools/BackgroundRemover';
import SEOHead from '../../components/SEOHead';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function RimozioneSfondoAIPage({ articleData }) {
  const faqItems = [
    {
      question: "Come funziona la rimozione dello sfondo con AI?",
      answer: "La nostra tecnologia AI utilizza algoritmi avanzati di deep learning per identificare automaticamente il soggetto principale dell'immagine e rimuovere lo sfondo con precisione. Il sistema analizza pixel per pixel per creare un ritaglio preciso e professionale."
    },
    {
      question: "Quali formati di immagine sono supportati?",
      answer: "Supportiamo tutti i formati immagine comuni: JPG, PNG, WEBP, GIF e BMP. Puoi caricare immagini fino a 10MB di dimensione."
    },
    {
      question: "La rimozione dello sfondo è gratuita?",
      answer: "Sì, offriamo un servizio gratuito per la rimozione dello sfondo. Per utenti PRO, offriamo elaborazioni più veloci e immagini ad alta risoluzione senza limiti."
    },
    {
      question: "Quanto tempo richiede l'elaborazione?",
      answer: "L'elaborazione è istantanea per la maggior parte delle immagini. Le immagini più complesse possono richiedere pochi secondi. Gli utenti PRO hanno accesso a elaborazioni prioritarie ancora più veloci."
    },
    {
      question: "Le mie immagini sono sicure?",
      answer: "Assolutamente sì. Tutte le immagini vengono elaborate in modo sicuro e vengono eliminate automaticamente dai nostri server dopo 24 ore. Non condividiamo mai le tue immagini con terze parti."
    },
    {
      question: "Posso rimuovere lo sfondo da più immagini contemporaneamente?",
      answer: "Sì, puoi elaborare più immagini in sequenza. Gli utenti PRO possono elaborare batch di immagini più grandi con elaborazione prioritaria."
    }
  ];

  const howToSteps = [
    {
      name: "Carica l'immagine",
      text: "Trascina e rilascia la tua immagine nell'area di upload oppure clicca per selezionare un file dal tuo computer.",
      image: null,
      url: "/tools/rimozione-sfondo-ai"
    },
    {
      name: "Elaborazione automatica",
      text: "La nostra AI analizza automaticamente l'immagine, identifica il soggetto principale e rimuove lo sfondo con precisione.",
      image: null,
      url: "/tools/rimozione-sfondo-ai"
    },
    {
      name: "Scarica il risultato",
      text: "Una volta completata l'elaborazione, puoi scaricare l'immagine con sfondo trasparente in formato PNG ad alta qualità.",
      image: null,
      url: "/tools/rimozione-sfondo-ai"
    }
  ];

  // articleData is provided via getStaticProps to avoid hydration drift

  return (
    <div style={styles.pageWrap}>
      <SEOHead
        title="Rimozione Sfondo AI - Strumento Gratuito Online"
        description="Rimuovi lo sfondo da qualsiasi immagine con un click usando l'intelligenza artificiale. Soggetto rilevato automaticamente, qualità professionale, ritaglio preciso. Gratis, veloce e sicuro. Supporta JPG, PNG, WEBP."
        canonical="/tools/rimozione-sfondo-ai"
        toolName="Rimozione Sfondo AI"
        toolCategory="ImageApplication"
        keywords={['rimozione sfondo', 'remove background', 'AI sfondo', 'trasparente', 'foto editing', 'ritaglio immagini', 'background remover', 'PNG trasparente']}
        faqItems={faqItems}
        howToSteps={howToSteps}
        articleData={articleData}
        type="article"
      />
      <Navbar />
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.title}>Rimozione Sfondo AI</h1>
          <p style={styles.subtitle}>
            Rimuovi lo sfondo da qualsiasi immagine con un click usando l'intelligenza artificiale avanzata. 
            Il nostro strumento rileva automaticamente il soggetto principale e crea un ritaglio preciso con sfondo trasparente.
          </p>
        </header>

        {/* Tool Component */}
        <BackgroundRemover />

        {/* Rich Content Section for SEO */}
        <section style={styles.contentSection}>
          <h2 style={styles.sectionTitle}>Come Rimuovere lo Sfondo dalle Immagini con AI</h2>
          <p style={styles.contentText}>
            La rimozione dello sfondo è una delle operazioni più comuni nell'editing fotografico. 
            Con il nostro strumento AI, puoi rimuovere lo sfondo da qualsiasi immagine in pochi secondi, 
            senza bisogno di competenze tecniche o software complessi.
          </p>
          
          <h3 style={styles.subsectionTitle}>Caratteristiche Principali</h3>
          <ul style={styles.featureList}>
            <li><strong>Rilevamento automatico:</strong> L'AI identifica automaticamente il soggetto principale dell'immagine</li>
            <li><strong>Alta precisione:</strong> Ritaglio preciso anche per dettagli complessi come capelli e pelliccia</li>
            <li><strong>Velocità:</strong> Elaborazione istantanea per la maggior parte delle immagini</li>
            <li><strong>Qualità professionale:</strong> Risultati pronti per uso commerciale e professionale</li>
            <li><strong>Sicurezza:</strong> Le tue immagini vengono eliminate automaticamente dopo 24 ore</li>
            <li><strong>Formati supportati:</strong> JPG, PNG, WEBP, GIF, BMP</li>
          </ul>

          <h3 style={styles.subsectionTitle}>Casi d'Uso</h3>
          <p style={styles.contentText}>
            Questo strumento è perfetto per:
          </p>
          <ul style={styles.useCaseList}>
            <li>Creazione di cataloghi prodotti per e-commerce</li>
            <li>Design di grafiche per social media</li>
            <li>Creazione di presentazioni professionali</li>
            <li>Editing fotografico personale</li>
            <li>Creazione di materiale marketing</li>
            <li>Design di loghi e branding</li>
          </ul>

          <h3 style={styles.subsectionTitle}>FAQ - Domande Frequenti</h3>
          <div style={styles.faqSection}>
            {faqItems.map((faq, index) => (
              <div key={index} style={styles.faqItem}>
                <h4 style={styles.faqQuestion}>{faq.question}</h4>
                <p style={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>

          <h3 style={styles.subsectionTitle}>Strumenti Correlati</h3>
          <div style={styles.relatedTools}>
            <Link href="/upscaler" style={styles.relatedToolLink}>
              Upscaler AI - Migliora la risoluzione delle immagini
            </Link>
            <Link href="/tools/generazione-immagini-ai" style={styles.relatedToolLink}>
              Generazione Immagini AI - Crea immagini da testo
            </Link>
            <Link href="/tools/thumbnail-generator" style={styles.relatedToolLink}>
              Thumbnail Generator - Crea miniature per video
            </Link>
            <Link href="/pdf" style={styles.relatedToolLink}>
              Convertitore PDF - Converti immagini in PDF
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  // Compute stable article data on the server to avoid client/server mismatches
  const articleData = {
    datePublished: '2024-01-01T00:00:00Z',
    // Use build-time timestamp; page will revalidate daily
    dateModified: new Date().toISOString(),
    tags: ['AI', 'rimozione sfondo', 'editing immagini', 'foto editing', 'trasparente', 'ritaglio']
  };

  return {
    props: { articleData },
    revalidate: 86400 // 24h
  };
}

const styles = {
  pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
  mainContent: { maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { 
    fontSize: 'clamp(32px, 5vw, 48px)', 
    fontWeight: 900, 
    margin: 0, 
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: { 
    color: '#94a3b8', 
    marginTop: 16,
    fontSize: '18px',
    lineHeight: 1.6,
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  contentSection: {
    marginTop: '60px',
    padding: '40px',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '20px',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '20px',
    color: '#e2e8f0'
  },
  contentText: {
    fontSize: '16px',
    lineHeight: 1.8,
    color: '#cbd5e1',
    marginBottom: '20px'
  },
  subsectionTitle: {
    fontSize: '22px',
    fontWeight: 700,
    marginTop: '32px',
    marginBottom: '16px',
    color: '#e2e8f0'
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '24px'
  },
  'featureList li': {
    padding: '8px 0',
    color: '#cbd5e1',
    fontSize: '15px',
    lineHeight: 1.7
  },
  useCaseList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '24px'
  },
  'useCaseList li': {
    padding: '8px 0',
    color: '#cbd5e1',
    fontSize: '15px',
    lineHeight: 1.7,
    paddingLeft: '24px',
    position: 'relative'
  },
  'useCaseList li:before': {
    content: '"✓"',
    position: 'absolute',
    left: 0,
    color: '#a78bfa'
  },
  faqSection: {
    marginTop: '32px'
  },
  faqItem: {
    marginBottom: '24px',
    padding: '20px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.1)'
  },
  faqQuestion: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#a78bfa'
  },
  faqAnswer: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#cbd5e1',
    margin: 0
  },
  relatedTools: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px'
  },
  relatedToolLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '12px 16px',
    background: 'rgba(96, 165, 250, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(96, 165, 250, 0.2)',
    transition: 'all 0.3s'
  }
};
