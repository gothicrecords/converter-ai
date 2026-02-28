import { useRouter } from 'next/router';
import { useState, useEffect, Suspense, lazy, useMemo, memo } from 'react';
import { tools } from '../../lib/tools';
import { getConversionTool, listConversionSlugs } from '../../lib/conversionRegistry';
import GenericConverter from '../../components/GenericConverter';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import ProBadge from '../../components/ProBadge';
import { toolSEOContent } from '../../lib/tool-seo-content';
import { LoadingOverlay, LoadingSpinner } from '../../components/Loading';

// Lazy load all heavy tool components for better performance
const BackgroundRemover = lazy(() => import('../../components/tools/BackgroundRemover'));
const ImageGenerator = lazy(() => import('../../components/tools/ImageGenerator'));
const CleanNoise = lazy(() => import('../../components/tools/CleanNoise'));
const AudioTranscription = lazy(() => import('../../components/tools/AudioTranscription'));
const OCRAdvanced = lazy(() => import('../../components/tools/OCRAdvanced'));
const TextSummarizer = lazy(() => import('../../components/tools/TextSummarizer'));
const GrammarChecker = lazy(() => import('../../components/tools/GrammarChecker'));
const ThumbnailGenerator = lazy(() => import('../../components/tools/ThumbnailGenerator'));
const CombineSplitPDF = lazy(() => import('../../components/tools/CombineSplitPDF'));
const VideoCompressor = lazy(() => import('../../components/tools/VideoCompressor'));
const DocumentTranslator = lazy(() => import('../../components/tools/DocumentTranslator'));
const Upscaler = lazy(() => import('../../components/tools/Upscaler'));

const ToolPage = ({ initialSlug, meta }) => {
    const router = useRouter();
    const slug = initialSlug || router.query.slug;

    // First try AI tools list, then conversion registry.
    const aiTool = tools.find(t => t.href === `/tools/${slug}`);
    const conversionTool = getConversionTool(slug);
    const tool = aiTool || (conversionTool && {
        title: conversionTool.title,
        description: conversionTool.description,
        icon: HiArrowRight // fallback icon sempre definito
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

    // Memoize tool component rendering for performance
    const renderToolComponent = useMemo(() => {
        if (conversionTool) {
            // Assicurati che il tool abbia lo slug per le card
            const toolWithSlug = { ...conversionTool, slug: slug };
            return <GenericConverter tool={toolWithSlug} />;
        }

        // Lazy load component based on slug with Suspense fallback
        const ToolComponent = (() => {
            switch (slug) {
                case 'rimozione-sfondo-ai':
                    return BackgroundRemover;
                case 'clean-noise-ai':
                    return CleanNoise;
                case 'generazione-immagini-ai':
                    return ImageGenerator;
                case 'trascrizione-audio':
                    return AudioTranscription;
                case 'ocr-avanzato-ai':
                    return OCRAdvanced;
                case 'riassunto-testo':
                case 'elabora-e-riassumi':
                    return TextSummarizer;
                case 'correttore-grammaticale':
                    return GrammarChecker;
                case 'thumbnail-generator':
                    return ThumbnailGenerator;
                case 'combina-splitta-pdf':
                    return CombineSplitPDF;
                case 'compressione-video':
                    return VideoCompressor;
                case 'traduzione-documenti-ai':
                    return DocumentTranslator;
                case 'upscaler-ai':
                    return Upscaler;
                default:
                    return null;
            }
        })();

        if (!ToolComponent) {
            return (
                <div style={styles.comingSoon}>
                    <h2 style={styles.comingSoonTitle}>Componente in arrivo</h2>
                    <p style={styles.comingSoonText}>
                        L'interfaccia per lo strumento "{tool.title}" è in fase di sviluppo.
                    </p>
                </div>
            );
        }

        return (
            <Suspense fallback={<LoadingOverlay message="Caricamento strumento..." />}>
                <ToolComponent />
            </Suspense>
        );
    }, [slug, conversionTool, tool.title]);

    // Get SEO content for this tool
    const seoContent = toolSEOContent[slug] || null;
    const articleData = seoContent ? {
        datePublished: '2024-01-01T00:00:00Z',
        dateModified: new Date().toISOString(),
        tags: seoContent.keywords || []
    } : null;

    // Determine if tool is "Core" (Document/PDF) or "Non-Core" (Image/Video/Audio)
    // Core tools are indexed, others are noindex
    const isCoreTool = useMemo(() => {
        const coreSlugs = [
            'ocr-avanzato-ai',
            'riassunto-testo',
            'elabora-e-riassumi',
            'correttore-grammaticale',
            'combina-splitta-pdf',
            'traduzione-documenti-ai'
        ];

        if (coreSlugs.includes(slug)) return true;

        // Check categories
        if (aiTool) {
            return aiTool.category === 'PDF' || aiTool.category === 'Testo';
        }

        if (conversionTool) {
            const allowedCats = ['Document', 'Presentation', 'Spreadsheet'];
            return allowedCats.includes(conversionTool.category);
        }

        return false;
    }, [slug, aiTool, conversionTool]);

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title={seoContent?.title || `${meta?.title || tool.title} | Suite di Strumenti AI`}
                description={seoContent?.description || meta?.description || tool.description}
                canonical={`/tools/${slug}`}
                toolName={tool.title}
                toolCategory={aiTool?.category || 'Tool'}
                keywords={seoContent?.keywords || []}
                faqItems={seoContent?.faq || []}
                articleData={articleData}
                type={seoContent ? "article" : "website"}
                noIndex={!isCoreTool}
            />

            <Navbar />

            <main style={styles.mainContent}>
                <header style={styles.toolHeader}>
                    {tool.icon && (
                        <div style={styles.iconBadge}>
                            {typeof tool.icon === 'function' ? (
                                <tool.icon style={styles.iconBadgeIcon} />
                            ) : (
                                <HiArrowRight style={styles.iconBadgeIcon} />
                            )}
                        </div>
                    )}
                    <div style={styles.titleRow}>
                        <h1 style={styles.toolTitle}>
                            {tool.title}
                        </h1>
                        {aiTool && aiTool.pro && (
                            <ProBadge size="medium" style={{ marginLeft: '12px' }} />
                        )}
                    </div>
                    <p style={styles.toolDescription}>
                        {seoContent?.mainDescription || tool.description}
                    </p>
                </header>

                <div style={styles.toolContent}>
                    {renderToolComponent}
                </div>

                {/* Rich Content Section for SEO */}
                {seoContent && (
                    <section style={styles.contentSection}>
                        <h2 style={styles.sectionTitle}>Come Utilizzare {tool.title}</h2>
                        <p style={styles.contentText}>
                            {seoContent.mainDescription}
                        </p>

                        {seoContent.features && seoContent.features.length > 0 && (
                            <>
                                <h3 style={styles.subsectionTitle}>Caratteristiche Principali</h3>
                                <ul style={styles.featureList}>
                                    {seoContent.features.map((feature, index) => (
                                        <li key={index} style={styles.featureListItem}>
                                            <strong>{feature.title}:</strong> {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {seoContent.useCases && seoContent.useCases.length > 0 && (
                            <>
                                <h3 style={styles.subsectionTitle}>Casi d'Uso</h3>
                                <p style={styles.contentText}>
                                    Questo strumento è perfetto per:
                                </p>
                                <ul style={styles.useCaseList}>
                                    {seoContent.useCases.map((useCase, index) => (
                                        <li key={index} style={styles.useCaseListItem}>
                                            <span style={styles.useCaseCheck}>✓</span> {useCase}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {seoContent.faq && seoContent.faq.length > 0 && (
                            <>
                                <h3 style={styles.subsectionTitle}>FAQ - Domande Frequenti</h3>
                                <div style={styles.faqSection}>
                                    {seoContent.faq.map((faq, index) => (
                                        <div key={index} style={styles.faqItem}>
                                            <h4 style={styles.faqQuestion}>{faq.question}</h4>
                                            <p style={styles.faqAnswer}>{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {seoContent.relatedTools && seoContent.relatedTools.length > 0 && (
                            <>
                                <h3 style={styles.subsectionTitle}>Strumenti Correlati</h3>
                                <div style={styles.relatedTools}>
                                    {seoContent.relatedTools.map((relatedTool, index) => (
                                        <Link key={index} href={relatedTool.href} style={styles.relatedToolLink}>
                                            {relatedTool.title}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                )}

                {/* Altri strumenti consigliati */}
                <div style={styles.otherToolsSection}>
                    <h2 style={styles.otherToolsTitle}>Altri strumenti disponibili</h2>
                    <div style={styles.toolsGrid}>
                        {otherTools.map((t) => {
                            const IconComponent = t.icon;
                            return (
                                <Link key={t.href} href={t.href} style={styles.toolCard}>
                                    <div style={styles.toolCardIcon}>
                                        <IconComponent style={{ width: 28, height: 28, color: '#a78bfa' }} />
                                    </div>
                                    <h3 style={styles.toolCardTitle}>{t.title}</h3>
                                    <p style={styles.toolCardDesc}>{t.description}</p>
                                    <div style={styles.toolCardFooter}>
                                        <span style={styles.toolCardCta}>Prova ora</span>
                                        <HiArrowRight style={{ width: 18, height: 18 }} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Memoize component to prevent unnecessary re-renders
export default memo(ToolPage);

export async function getStaticPaths() {
    const { tools } = await import('../../lib/tools');
    const { listConversionSlugs } = await import('../../lib/conversionRegistry');

    const aiSlugs = tools
        .map(t => {
            const parts = t.href.split('/');
            return parts[parts.length - 1];
        })
        .filter(slug => slug && slug !== 'tools');

    const conversionSlugs = listConversionSlugs();
    const allSlugs = [...new Set([...aiSlugs, ...conversionSlugs])];

    return {
        paths: allSlugs.map(slug => ({ params: { slug } })),
        fallback: false
    };
}

export async function getStaticProps({ params }) {
    try {
        const { slug } = params || {};
        if (!slug) {
            return { notFound: true };
        }

        const aiTool = tools.find(t => t.href === `/tools/${slug}`);
        const conversionTool = getConversionTool(slug);
        const meta = aiTool
            ? { title: aiTool.title || 'Strumento', description: aiTool.description || '' }
            : conversionTool
                ? { title: conversionTool.title || 'Convertitore', description: conversionTool.description || '' }
                : { title: 'Strumento non trovato', description: 'Lo strumento richiesto non esiste.' };

        return {
            props: {
                initialSlug: String(slug),
                meta
            }
        };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return {
            props: {
                initialSlug: params?.slug || 'unknown',
                meta: { title: 'Errore', description: 'Errore nel caricamento dello strumento.' }
            }
        };
    }
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
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px',
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
        margin: '0 auto',
        padding: '0 24px'
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
    featureListItem: {
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
    useCaseListItem: {
        padding: '8px 0',
        color: '#cbd5e1',
        fontSize: '15px',
        lineHeight: 1.7,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
    },
    useCaseCheck: {
        color: '#a78bfa',
        fontWeight: 'bold',
        flexShrink: 0
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
