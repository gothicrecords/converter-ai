import Link from 'next/link';
import { useState, useMemo, memo, useCallback, useEffect, useRef, startTransition } from 'react';
import { useRouter } from 'next/router';
import { HiArrowRight } from 'react-icons/hi';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';
import { tools as aiTools } from '../lib/tools';
import { getAllConversionTools } from '../lib/conversionRegistry';

// Memoized Tool Card Component per performance
const ToolCard = memo(({ tool, isMobile, getCardPadding, getIconSize, getIconInnerSize }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = tool.icon;

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
        <Link
            href={tool.href}
            prefetch={false}
            style={{
                ...styles.toolCard,
                padding: getCardPadding(),
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered
                    ? '0 12px 40px rgba(102, 126, 234, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {tool.pro && (
                <span style={styles.proBadge}>PRO</span>
            )}
            <div
                className="tool-icon-wrapper"
                style={{
                    ...styles.toolIconWrapper,
                    width: `${getIconSize()}px`,
                    height: `${getIconSize()}px`,
                    marginBottom: isMobile ? '16px' : '20px',
                    transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {IconComponent ? (
                    <IconComponent style={{
                        ...styles.toolIcon,
                        width: `${getIconInnerSize()}px`,
                        height: `${getIconInnerSize()}px`
                    }} />
                ) : (
                    <HiArrowRight style={{
                        ...styles.toolIcon,
                        width: `${getIconInnerSize()}px`,
                        height: `${getIconInnerSize()}px`
                    }} />
                )}
            </div>
            <h3 style={{
                ...styles.toolTitle,
                fontSize: isMobile ? '17px' : '20px',
                marginBottom: isMobile ? '8px' : '10px'
            }}>{tool.title}</h3>
            <p style={{
                ...styles.toolDescription,
                fontSize: isMobile ? '13px' : '14px',
                margin: isMobile ? '0 0 16px 0' : '0 0 20px 0'
            }}>{tool.description}</p>
            <div style={{
                ...styles.toolArrow,
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
            }}>
                <HiArrowRight style={{ width: 20, height: 20 }} />
            </div>
        </Link>
    );
});

ToolCard.displayName = 'ToolCard';

export default function ToolsPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('Tutti');
    const [isMobile, setIsMobile] = useState(false);

    // Mappa categorie dalla Navbar alle categorie della pagina tools
    const navbarToToolsCategory = {
        'AI & Immagini': 'Immagini',
        'Documenti & PDF': 'Documenti',
        'Video & Audio': 'Video',
        'Grafica': 'Vettoriali',
        'Archivi & Ebook': 'Archivi'
    };

    // Leggi categoria da URL query params
    useEffect(() => {
        if (router.query.category) {
            // Se la categoria dall'URL è una categoria della navbar, mappala
            const mappedCategory = navbarToToolsCategory[router.query.category] || router.query.category;
            setSelectedCategory(mappedCategory);
        }
    }, [router.query.category]);

    // Safe client-side mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Inject tool-specific styles client-side only
    useEffect(() => {
        const styleId = 'tools-page-specific-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @media (hover: hover) and (pointer: fine) {
                .tool-icon-wrapper::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s ease, height 0.6s ease;
                    pointer-events: none;
                }
                
                a[href^="/tools/"]:hover .tool-icon-wrapper::after {
                    width: 200px;
                    height: 200px;
                }
            }
            
            @media (max-width: 768px) {
                a[href^="/tools/"] {
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                
                a[href^="/tools/"]:active {
                    transform: scale(0.98);
                    transition: transform 0.1s ease;
                }
                
                .filter-scroll-container::-webkit-scrollbar {
                    display: none;
                }
                .filter-scroll-container {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }, []);

    const mobile = isMobile; // Always false in static mode

    // Combine AI tools and conversion tools - memoized per performance
    const allTools = useMemo(() => {
        const conversionTools = getAllConversionTools();
        return [...aiTools, ...conversionTools];
    }, []);

    // Map conversion tool categories to Italian - migliorata e più chiara
    const categoryMap = {
        'Image': 'Immagini',
        'Vector': 'Vettoriali',
        'Video': 'Video',
        'Audio': 'Audio',
        'Document': 'Documenti',
        'Presentation': 'Presentazioni',
        'Spreadsheet': 'Fogli di Calcolo',
        'Archive': 'Archivi',
        'Ebook': 'Ebook',
        'Font': 'Font',
        'PDF': 'PDF',
        'Text': 'Testo'
    };

    // Normalize categories - migliorata logica con memoization
    const normalizedTools = useMemo(() => {
        return allTools.map(tool => {
            // Se il tool ha già una categoria italiana, usala
            const mappedCategory = categoryMap[tool.category] || tool.category;
            return {
                ...tool,
                category: mappedCategory
            };
        });
    }, [allTools]);

    // Define the new categories logic for PDF/Docs
    const categoryOrder = [
        'Organize PDF', // Merge, Split, etc
        'Optimize PDF', // Compress, Repair
        'Convert PDF',  // All conversions
        'Edit PDF',     // Text, Rotate, etc
        'PDF Security'  // Protect, Unlock, Sign
    ];

    // Helper map to assign tools to super-categories
    // Since we don't have these properties on the tool objects, we map by slug/keyword
    const assignCategory = (tool) => {
        const h = tool.href || '';
        const title = tool.title || '';

        // Security
        if (h.includes('protect') || h.includes('proteggi') || h.includes('unlock') || h.includes('sblocca') || h.includes('sign') || h.includes('firma')) return 'PDF Security';

        // Optimize
        if (h.includes('compress') || h.includes('comprimi') || h.includes('repair') || h.includes('ripara')) return 'Optimize PDF';

        // Organize
        if (h.includes('merge') || h.includes('combina') || h.includes('split') || h.includes('dividi') || h.includes('sort') || h.includes('ordina') || h.includes('delete') || h.includes('elimina')) return 'Organize PDF';

        // Edit
        if (h.includes('rotate') || h.includes('ruota') || h.includes('number') || h.includes('numeri') || h.includes('watermark') || h.includes('ocr') || h.includes('edit') || h.includes('modifica') || tool.category === 'Testo' || tool.category === 'Text') return 'Edit PDF';

        // Convert (default fallback for most PDF tools)
        if (h.includes('to-pdf') || h.includes('pdf-to') || tool.category === 'PDF') return 'Convert PDF';

        // Fallback for document AI tools
        if (tool.category === 'Documenti' || tool.category === 'Document') return 'Edit PDF';

        return null; // Non-core tools
    };

    const categorizedTools = useMemo(() => {
        // Only consider core tools first
        const coreTools = allTools.filter(t => {
            const coreCats = ['PDF', 'Documenti', 'Document', 'Testo', 'Text', 'Presentazioni', 'Presentation', 'Fogli di Calcolo', 'Spreadsheet'];
            return coreCats.includes(t.category) || (t.href && (t.href.includes('ocr') || t.href.includes('chat')));
        });

        // Add 'superCategory' property to tools
        return coreTools.map(t => ({
            ...t,
            superCategory: assignCategory(t)
        })).filter(t => t.superCategory); // remove nulls
    }, [allTools]);


    // Get unique super categories that actually have tools
    const availableCategories = [...new Set(categorizedTools.map(t => t.superCategory))];
    const categories = ['Tutti', ...categoryOrder.filter(c => availableCategories.includes(c))];

    // Filter tools based on selection
    const filteredTools = useMemo(() => {
        if (selectedCategory === 'Tutti') {
            // Show all categorized tools
            return categorizedTools;
        }
        return categorizedTools.filter(t => t.superCategory === selectedCategory);
    }, [categorizedTools, selectedCategory]);

    // Legacy maps (kept empty/unused but defined to avoid breaking references if any)
    const normalizedTools = categorizedTools;
    const memoizedCategories = categories;

    // Memoize categories per evitare ricalcoli
    const memoizedCategories = useMemo(() => categories, [categories]);

    // Scroll automatico del filtro selezionato su mobile - ottimizzato
    const activeFilterRef = useRef(null);

    useEffect(() => {
        if (isMobile && activeFilterRef.current) {
            // Usa requestAnimationFrame per scroll più veloce
            requestAnimationFrame(() => {
                if (activeFilterRef.current) {
                    activeFilterRef.current.scrollIntoView({
                        behavior: 'auto',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            });
        }
    }, [selectedCategory, isMobile]);

    // Handler memoizzato per click sui filtri - ottimizzato per performance
    const handleFilterClick = useCallback((category) => {
        // Usa startTransition per renderizzare il cambio in modo non-blocking
        startTransition(() => {
            setSelectedCategory(category);
        });
    }, []);

    // Stili dinamici basati su mobile
    const getCardPadding = () => (mobile ? '16px' : '28px');
    const getIconSize = () => (mobile ? 40 : 56);
    const getIconInnerSize = () => (mobile ? 20 : 28);

    return (
        <div style={styles.pageWrap} suppressHydrationWarning>
            <SEOHead
                title="Tutti gli Strumenti - MegaPixelAI"
                description={`Esplora tutti i nostri strumenti AI professionali e convertitori. ${allTools.length}+ strumenti disponibili per immagini, PDF, audio, video, documenti e molto altro.`}
                canonical="/tools"
                keywords={['AI tools', 'strumenti AI', 'image tools', 'PDF tools', 'audio tools', 'video tools', 'convertitori', 'conversion tools']}
            />
            <Navbar />

            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Tutti gli Strumenti AI
                    </h1>
                    <p
                        style={{
                            ...styles.heroSubtitle,
                            ...(mobile ? { fontSize: '15px', padding: '0 16px' } : {})
                        }}
                    >
                        Esplora strumenti AI e convertitori per immagini, PDF, audio, video e documenti.
                    </p>
                </div>
            </section>

            {/* Filtri per categoria */}
            <section
                style={{
                    ...styles.filterSection,
                    ...(isMobile
                        ? {
                            padding: '0 0 20px',
                            position: 'sticky',
                            top: '60px',
                            background: 'rgba(10, 14, 26, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                            marginBottom: '0',
                            zIndex: 10,
                        }
                        : {})
                }}
            >
                <div style={styles.filterContainer}>
                    {isMobile ? (
                        <div style={styles.filterScrollContainer} className="filter-scroll-container">
                            <div style={styles.filterScrollWrapper}>
                                {memoizedCategories.map((category, index) => (
                                    <button
                                        key={category}
                                        ref={selectedCategory === category ? activeFilterRef : null}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleFilterClick(category);
                                        }}
                                        onTouchStart={(e) => {
                                            e.stopPropagation();
                                        }}
                                        style={{
                                            ...styles.filterButtonMobile,
                                            ...(selectedCategory === category ? styles.filterButtonActiveMobile : {}),
                                            ...(index === 0 ? { marginLeft: '0' } : {}),
                                            ...(index === memoizedCategories.length - 1 ? { marginRight: '0' } : {})
                                        }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.filterContainerDesktop}>
                            {memoizedCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleFilterClick(category);
                                    }}
                                    style={{
                                        ...styles.filterButtonDesktop,
                                        ...(selectedCategory === category ? styles.filterButtonActiveDesktop : {})
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section style={styles.toolsSection}>
                {filteredTools.length === 0 ? (
                    <div style={styles.noResults}>
                        <p style={styles.noResultsText}>
                            Nessun strumento trovato per la categoria "{selectedCategory}"
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={styles.resultsCount}>
                            {filteredTools.length} {filteredTools.length === 1 ? 'strumento' : 'strumenti'}
                            {selectedCategory !== 'Tutti' && ` in ${selectedCategory}`}
                        </div>
                        <div style={styles.toolsGrid}>
                            {filteredTools.map((tool, i) => (
                                <div
                                    key={`${tool.href}-${i}`}
                                    style={{
                                        animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`
                                    }}
                                >
                                    <ToolCard
                                        tool={tool}
                                        isMobile={isMobile}
                                        getCardPadding={getCardPadding}
                                        getIconSize={getIconSize}
                                        getIconInnerSize={getIconInnerSize}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>

            <Footer />
        </div>
    );
} const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 24px 50px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '@media (max-width: 768px)': {
            padding: '80px 16px 30px'
        }
    },
    heroContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        maxWidth: '900px'
    },
    heroTitle: {
        fontSize: 'clamp(32px, 6vw, 48px)',
        fontWeight: '900',
        lineHeight: '1.1',
        margin: 0,
        letterSpacing: '-0.02em',
        maxWidth: '800px',
        background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center'
    },
    heroSubtitle: {
        fontSize: '17px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: 0,
        maxWidth: '700px',
        textAlign: 'center',
        '@media (max-width: 768px)': {
            fontSize: '15px',
            padding: '0 16px'
        }
    },
    toolsSection: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        width: '100%',
        '@media (max-width: 768px)': {
            padding: '24px 16px 60px',
            boxSizing: 'border-box'
        }
    },
    toolsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '28px',
        width: '100%',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '16px',
            padding: '0'
        }
    },
    toolCard: {
        position: 'relative',
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '20px',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        cursor: 'pointer',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        willChange: 'transform',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.1)',
        width: '100%',
        boxSizing: 'border-box',
        '@media (max-width: 768px)': {
            padding: '24px 20px',
            borderRadius: '16px'
        }
    },
    proBadge: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '12px',
        letterSpacing: '0.5px'
    },
    toolIconWrapper: {
        width: '60px',
        height: '60px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 200%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 6px 24px rgba(102, 126, 234, 0.5), 0 0 20px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    toolIcon: {
        width: '24px',
        height: '24px',
        color: '#fff',
        '@media (max-width: 768px)': {
            width: '20px',
            height: '20px'
        }
    },
    toolTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: '8px',
        textAlign: 'left',
        margin: '0 0 8px 0',
        '@media (max-width: 768px)': {
            fontSize: '16px',
            marginBottom: '6px'
        }
    },
    toolDescription: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: '0 0 16px 0',
        textAlign: 'left',
        flex: 1,
        '@media (max-width: 768px)': {
            fontSize: '13px',
            lineHeight: '1.5',
            margin: '0 0 12px 0'
        }
    },
    toolArrow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        color: '#667eea',
        marginTop: 'auto'
    },
    filterSection: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        '@media (max-width: 768px)': {
            padding: '0 0 20px'
        }
    },
    filterContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        width: '100%'
    },
    filterContainerDesktop: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '50px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '100%'
    },
    filterScrollContainer: {
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        padding: '12px 0',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box',
        scrollBehavior: 'smooth',
        margin: '0 auto'
    },
    filterScrollWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '4px 16px',
        minWidth: 'max-content',
        width: 'auto',
        justifyContent: 'flex-start'
    },
    filterButtonMobile: {
        padding: '10px 20px',
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '24px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.1s ease, transform 0.1s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        minHeight: '44px',
        width: 'auto',
        maxWidth: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        boxSizing: 'border-box',
        willChange: 'background, transform',
        transform: 'translateZ(0)'
    },
    filterButtonActiveMobile: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: 'transparent',
        color: '#fff',
        transform: 'translateZ(0) scale(1.02)',
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4), 0 0 16px rgba(102, 126, 234, 0.2)',
        fontWeight: '700'
    },
    filterButtonDesktop: {
        padding: '8px 20px',
        background: 'transparent',
        border: 'none',
        borderRadius: '50px',
        color: '#94a3b8',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        position: 'relative',
        flexShrink: 0
    },
    filterButtonActiveDesktop: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '200% 200%',
        color: '#ffffff',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5), 0 0 20px rgba(102, 126, 234, 0.3)',
        transform: 'scale(1.05)',
        animation: 'gradientShift 3s ease infinite'
    },
    resultsCount: {
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#94a3b8',
        fontWeight: '500'
    },
    noResults: {
        textAlign: 'center',
        padding: '60px 24px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    noResultsText: {
        fontSize: '16px',
        color: '#94a3b8',
        margin: 0
    }
};

export async function getServerSideProps() {
    return {
        props: {}
    };
}
