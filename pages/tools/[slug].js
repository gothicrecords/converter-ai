import { useRouter } from 'next/router';
import Head from 'next/head';
import { tools } from '../../lib/tools';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// Importa qui i componenti specifici per ogni tool
import BackgroundRemover from '../../components/tools/BackgroundRemover';
import CleanNoise from '../../components/tools/CleanNoise';
import ImageGenerator from '../../components/tools/ImageGenerator';
import AudioTranscription from '../../components/tools/AudioTranscription';
import OCRAdvanced from '../../components/tools/OCRAdvanced';
import TextSummarizer from '../../components/tools/TextSummarizer';
import GrammarChecker from '../../components/tools/GrammarChecker';
import ThumbnailGenerator from '../../components/tools/ThumbnailGenerator';
import CombineSplitPDF from '../../components/tools/CombineSplitPDF';

const ToolPage = () => {
    const router = useRouter();
    const { slug } = router.query;

    const tool = tools.find(t => t.href === `/tools/${slug}`);
    const otherTools = tools.filter(t => t.href !== `/tools/${slug}`).slice(0, 6);

    if (!tool) {
        return (
            <>
                <Navbar />
                <div style={styles.notFound}>
                    <h1 style={styles.notFoundTitle}>404 - Strumento non trovato</h1>
                    <p style={styles.notFoundText}>Lo strumento che stai cercando non esiste o è stato spostato.</p>
                </div>
            </>
        );
    }

    const renderToolComponent = () => {
        switch (slug) {
            case 'rimozione-sfondo-ai':
                return <BackgroundRemover />;
            case 'clean-noise-ai':
                return <CleanNoise />;
            case 'generazione-immagini-ai':
                return <ImageGenerator />;
            case 'trascrizione-audio':
                return <AudioTranscription />;
            case 'ocr-avanzato-ai':
                return <OCRAdvanced />;
            case 'riassunto-testo':
            case 'elabora-e-riassumi':
                return <TextSummarizer />;
            case 'correttore-grammaticale':
                return <GrammarChecker />;
            case 'thumbnail-generator':
                return <ThumbnailGenerator />;
            case 'combina-splitta-pdf':
                return <CombineSplitPDF />;
            default:
                return (
                    <div style={styles.comingSoon}>
                        <h2 style={styles.comingSoonTitle}>Componente in arrivo</h2>
                        <p style={styles.comingSoonText}>
                            L'interfaccia per lo strumento "{tool.title}" è in fase di sviluppo.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div style={styles.pageWrap}>
            <Head>
                <title>{`${tool.title} | Suite di Strumenti AI`}</title>
                <meta name="description" content={tool.description} />
                <meta property="og:title" content={`${tool.title} | Suite di Strumenti AI`} />
                <meta property="og:description" content={tool.description} />
            </Head>

            <Navbar />

            <main style={styles.mainContent}>
                <header style={styles.toolHeader}>
                    <div style={styles.iconBadge}>
                        <tool.icon style={styles.iconBadgeIcon} />
                    </div>
                    <h1 style={styles.toolTitle}>
                        {tool.title}
                    </h1>
                    <p style={styles.toolDescription}>
                        {tool.description}
                    </p>
                </header>

                <div style={styles.toolContent}>
                    {renderToolComponent()}
                </div>

                {/* Altri strumenti consigliati */}
                <div style={styles.otherToolsSection}>
                    <h2 style={styles.otherToolsTitle}>Altri strumenti disponibili</h2>
                    <div style={styles.toolsGrid}>
                        {otherTools.map((t) => {
                            const IconComponent = t.icon;
                            return (
                                <Link key={t.href} href={t.href} style={styles.toolCard}>
                                    <div style={styles.toolCardIcon}>
                                        <IconComponent style={{width: 28, height: 28, color: '#a78bfa'}} />
                                    </div>
                                    <h3 style={styles.toolCardTitle}>{t.title}</h3>
                                    <p style={styles.toolCardDesc}>{t.description}</p>
                                    <div style={styles.toolCardFooter}>
                                        <span style={styles.toolCardCta}>Prova ora</span>
                                        <HiArrowRight style={{width: 18, height: 18}} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ToolPage;

const styles = {
    pageWrap: {
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e6eef8'
    },
    mainContent: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '48px 24px'
    },
    backLink: {
        marginBottom: '32px'
    },
    backLinkBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#94a3b8',
        textDecoration: 'none',
        transition: 'color 0.2s',
        fontSize: '15px'
    },
    toolHeader: {
        textAlign: 'center',
        marginBottom: '48px'
    },
    iconBadge: {
        display: 'inline-flex',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '50%',
        marginBottom: '16px'
    },
    iconBadgeIcon: {
        width: '40px',
        height: '40px',
        color: '#a78bfa'
    },
    toolTitle: {
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.02em'
    },
    toolDescription: {
        fontSize: '18px',
        color: '#94a3b8',
        marginTop: '8px',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    toolContent: {
        maxWidth: '900px',
        margin: '0 auto'
    },
    notFound: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e6eef8'
    },
    notFoundTitle: {
        fontSize: '36px',
        fontWeight: 700,
        marginBottom: '16px'
    },
    notFoundText: {
        color: '#94a3b8',
        marginBottom: '32px'
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#667eea',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background 0.2s',
        fontWeight: 600
    },
    comingSoon: {
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        padding: '48px 32px',
        textAlign: 'center'
    },
    comingSoonTitle: {
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '16px'
    },
    comingSoonText: {
        color: '#94a3b8'
    },
    otherToolsSection: {
        marginTop: '80px',
        paddingTop: '48px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
    },
    otherToolsTitle: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: '32px',
        textAlign: 'center'
    },
    toolsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    },
    toolCard: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    toolCardIcon: {
        width: '52px',
        height: '52px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '12px'
    },
    toolCardTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#f1f5f9',
        margin: '0 0 8px',
        textDecoration: 'none'
    },
    toolCardDesc: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: 1.5,
        margin: '0 0 16px',
        flex: 1
    },
    toolCardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        color: '#cbd5e1'
    },
    toolCardCta: {
        fontSize: '13px',
        fontWeight: 600
    }
};
