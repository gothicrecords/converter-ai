import Link from 'next/link';
import { useState, useMemo, memo, useCallback } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';
import { tools as aiTools } from '../lib/tools';
import { getAllConversionTools } from '../lib/conversionRegistry';
import { useIsMobile } from '../lib/useMediaQuery';

// Lazy load Footer per performance
const LazyFooter = dynamic(() => import('../components/Footer'), {
  ssr: true,
  loading: () => <div style={{ minHeight: '200px' }}></div>
});

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
    const [selectedCategory, setSelectedCategory] = useState('Tutti');
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const isMobile = useIsMobile();

    // Combine AI tools and conversion tools
    const conversionTools = getAllConversionTools();
    const allTools = [...aiTools, ...conversionTools];
    
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
        'Font': 'Font'
    };
    
    // Normalize categories - migliorata logica
    const normalizedTools = allTools.map(tool => {
        // Se il tool ha già una categoria italiana, usala
        const mappedCategory = categoryMap[tool.category] || tool.category;
        return {
            ...tool,
            category: mappedCategory
        };
    });
    
    // Ordina categorie per importanza (AI tools prima, poi convertitori)
    const categoryOrder = [
        'Tutti',
        'Immagini',
        'Video',
        'Audio',
        'PDF',
        'Documenti',
        'Testo',
        'Presentazioni',
        'Fogli di Calcolo',
        'Vettoriali',
        'Archivi',
        'Ebook',
        'Font'
    ];
    
    // Ottieni categorie uniche e ordinate
    const uniqueCategories = [...new Set(normalizedTools.map(tool => tool.category))];
    const sortedCategories = categoryOrder.filter(cat => 
        cat === 'Tutti' || uniqueCategories.includes(cat)
    );
    const remainingCategories = uniqueCategories.filter(cat => !categoryOrder.includes(cat));
    const categories = [...sortedCategories, ...remainingCategories];

    // Filtra strumenti per categoria
    const filteredTools = selectedCategory === 'Tutti' 
        ? normalizedTools 
        : normalizedTools.filter(tool => tool.category === selectedCategory);

    // Memoize filtered tools per performance
    const memoizedFilteredTools = useMemo(() => filteredTools, [filteredTools]);
    
    // Stili dinamici basati su mobile
    const getCardPadding = () => isMobile ? '16px' : '28px';
    const getIconSize = () => isMobile ? 40 : 56;
    const getIconInnerSize = () => isMobile ? 20 : 28;

    return (
        <div style={styles.pageWrap}>
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
                    <p style={styles.heroSubtitle}>
                        Esplora la nostra suite completa di strumenti AI e convertitori professionali
                    </p>
                </div>
            </section>

            {/* Filtri per categoria */}
            <section style={styles.filterSection}>
                <div style={styles.filterContainer}>
                    {isMobile ? (
                        <>
                            <div style={styles.filterBarMobile}>
                                <button
                                    onClick={() => setSelectedCategory('Tutti')}
                                    style={{
                                        ...styles.filterButtonCenter,
                                        ...(selectedCategory === 'Tutti' ? styles.filterButtonActive : {})
                                    }}
                                >
                                    Tutti
                                </button>
                                <button
                                    style={styles.filterMenuButton}
                                    onClick={() => setFiltersExpanded(prev => !prev)}
                                >
                                    Filtri
                                    {filtersExpanded ? (
                                        <BsChevronUp style={styles.filterMenuIcon} />
                                    ) : (
                                        <BsChevronDown style={styles.filterMenuIcon} />
                                    )}
                                </button>
                            </div>
                            {filtersExpanded && (
                                <div style={styles.filterGrid}>
                                    {categories.filter(cat => cat !== 'Tutti').map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setFiltersExpanded(false);
                                            }}
                                            style={{
                                                ...styles.filterButton,
                                                ...(selectedCategory === category ? styles.filterButtonActive : {})
                                            }}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={styles.filterContainerDesktop}>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
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
                            {memoizedFilteredTools.map((tool, i) => (
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

            <LazyFooter />
        </div>
    );
}

const styles = {
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
        '@media (max-width: 768px)': {
            padding: '30px 16px 60px'
        }
    },
    toolsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '28px',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '20px'
        }
    },
    toolCard: { 
        position: 'relative', 
        padding: '28px', 
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)', 
        border: '1px solid rgba(102, 126, 234, 0.2)', 
        borderRadius: '16px', 
        textDecoration: 'none', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        cursor: 'pointer',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        willChange: 'transform',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
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
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
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
        alignItems: 'center'
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
    filterBarMobile: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        padding: '12px 20px',
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '24px',
        position: 'relative'
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
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        transform: 'scale(1.05)'
    },
    filterButtonCenter: {
        padding: '10px 28px',
        background: 'transparent',
        border: 'none',
        borderRadius: '24px',
        color: '#94a3b8',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none',
        minWidth: '100px'
    },
    filterMenuButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: 'rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '16px',
        color: '#667eea',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none',
        position: 'absolute',
        right: '16px'
    },
    filterMenuIcon: {
        width: '14px',
        height: '14px'
    },
    filterGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        maxWidth: '700px',
        padding: '16px 0'
    },
    filterButton: {
        padding: '10px 24px',
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '20px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        minWidth: '100px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
    },
    filterButtonActive: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: 'transparent',
        color: '#fff',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
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

// Aggiungi animazioni CSS globali e stili per card
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const styleId = 'tools-page-animations';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            /* Card hover effects - Desktop only */
            @media (hover: hover) and (pointer: fine) {
                a[href^="/tools/"] {
                    position: relative;
                }
                
                a[href^="/tools/"]::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.4s ease;
                    z-index: 1;
                }
                
                a[href^="/tools/"]:hover::before {
                    transform: scaleX(1);
                }
                
                /* Icon wrapper ripple effect */
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
            
            /* Mobile touch optimizations */
            @media (max-width: 768px) {
                a[href^="/tools/"] {
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                
                a[href^="/tools/"]:active {
                    transform: scale(0.98);
                    transition: transform 0.1s ease;
                }
                
                /* Reduce animations on mobile for performance */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            }
        `;
        document.head.appendChild(style);
    }
}

export async function getServerSideProps() {
    return {
        props: {}
    };
}
