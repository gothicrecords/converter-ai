import { useRouter } from 'next/router';
import Head from 'next/head';
import { tools } from '../../lib/tools';
import { getConversionTool, listConversionSlugs } from '../../lib/conversionRegistry';
import GenericConverter from '../../components/GenericConverter';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports con loading prioritizzato per strumenti più usati
const BackgroundRemover = dynamic(() => import('../../components/tools/BackgroundRemover'), {
    loading: () => <div style={styles.loading}>Caricamento...</div>,
    ssr: false
});
const ImageGenerator = dynamic(() => import('../../components/tools/ImageGenerator'), {
    loading: () => <div style={styles.loading}>Caricamento...</div>,
    ssr: false
});
const CleanNoise = dynamic(() => import('../../components/tools/CleanNoise'), { ssr: false });
const AudioTranscription = dynamic(() => import('../../components/tools/AudioTranscription'), { ssr: false });
const OCRAdvanced = dynamic(() => import('../../components/tools/OCRAdvanced'), { ssr: false });
const TextSummarizer = dynamic(() => import('../../components/tools/TextSummarizer'), { ssr: false });
const GrammarChecker = dynamic(() => import('../../components/tools/GrammarChecker'), { ssr: false });
const ThumbnailGenerator = dynamic(() => import('../../components/tools/ThumbnailGenerator'), { ssr: false });
const CombineSplitPDF = dynamic(() => import('../../components/tools/CombineSplitPDF'), { ssr: false });

const ToolPage = ({ initialSlug, meta }) => {
    const router = useRouter();
    const slug = initialSlug || router.query.slug;

    // First try AI tools list, then conversion registry.
    const aiTool = tools.find(t => t.href === `/tools/${slug}`);
    const conversionTool = getConversionTool(slug);
    const tool = aiTool || (conversionTool && {
        title: conversionTool.title,
        description: conversionTool.description,
        icon: aiTool?.icon || HiArrowRight // fallback icon
    });
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
        if (conversionTool) {
            return <GenericConverter tool={conversionTool} />;
        }
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
                <title>{`${meta?.title || tool.title} | Suite di Strumenti AI`}</title>
                <meta name="description" content={meta?.description || tool.description} />
                <meta property="og:title" content={`${meta?.title || tool.title} | Suite di Strumenti AI`} />
                <meta property="og:description" content={meta?.description || tool.description} />
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

export async function getStaticPaths() {
    const aiSlugs = tools.map(t => t.href.replace('/tools/', ''));
    const convSlugs = listConversionSlugs();
    const slugs = Array.from(new Set([...aiSlugs, ...convSlugs]));
    const paths = slugs.map(slug => ({ params: { slug } }));
    return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const aiTool = tools.find(t => t.href === `/tools/${slug}`);
    const conversionTool = getConversionTool(slug);
    const meta = aiTool
        ? { title: aiTool.title, description: aiTool.description }
        : conversionTool
            ? { title: conversionTool.title, description: conversionTool.description }
            : { title: 'Strumento non trovato', description: 'Lo strumento richiesto non esiste.' };
    return { props: { initialSlug: slug, meta }, revalidate: 3600 };
}

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
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        fontSize: '16px',
        color: '#94a3b8'
    }
};
