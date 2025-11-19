import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiSparkles, HiHome, HiMenu, HiX, HiDotsVertical } from 'react-icons/hi';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { tools } from '../lib/tools';
import { getAllCategories, getToolsByCategory } from '../lib/conversionRegistry';
import { useTranslation } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { useIsMobile } from '../lib/useMediaQuery';

export default function Navbar() {
    const { t } = useTranslation();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSecondaryMenuOpen, setMobileSecondaryMenuOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const navRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    
    useEffect(() => {
        if (!isMobile) {
            setMobileMenuOpen(false);
            setMobileSecondaryMenuOpen(false);
            setExpandedCategory(null);
        }
    }, [isMobile]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setDropdownOpen(null);
                setMobileMenuOpen(false);
                setMobileSecondaryMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    // Memoize categories computation per evitare re-calcolo ad ogni render
    const categories = useMemo(() => {
        // Combine AI tools and conversion tools - categorizzazione migliorata
        const conversionToolsByCat = getToolsByCategory();
        
        // Categorizzazione più chiara e logica
        const allCategories = {
            'Immagini': [
                ...tools.filter(t => t.category === 'Immagini'),
                ...(conversionToolsByCat['Image'] || [])
            ],
            'Video': [
                ...tools.filter(t => t.category === 'Video'),
                ...(conversionToolsByCat['Video'] || [])
            ],
            'Audio': [
                ...tools.filter(t => t.category === 'Audio'),
                ...(conversionToolsByCat['Audio'] || [])
            ],
            'PDF': [
                ...tools.filter(t => t.category === 'PDF'),
                ...(conversionToolsByCat['Document'] || []).filter(t => 
                    t.targetFormat === 'pdf' || 
                    t.href.includes('pdf') || 
                    t.href.includes('pdf-to') ||
                    t.href.includes('to-pdf')
                )
            ],
            'Documenti': [
                ...tools.filter(t => t.category === 'Testo'),
                ...(conversionToolsByCat['Document'] || []).filter(t => 
                    t.targetFormat !== 'pdf' && 
                    !t.href.includes('pdf') &&
                    !t.href.includes('pdf-to') &&
                    !t.href.includes('to-pdf')
                )
            ],
            'Presentazioni': conversionToolsByCat['Presentation'] || [],
            'Fogli di Calcolo': conversionToolsByCat['Spreadsheet'] || [],
            'Vettoriali': conversionToolsByCat['Vector'] || [],
            'Archivi': conversionToolsByCat['Archive'] || [],
            'Ebook': conversionToolsByCat['Ebook'] || [],
            'Font': conversionToolsByCat['Font'] || []
        };
        
        // Ordina i tool all'interno di ogni categoria: prima AI/Pro, poi gli altri
        Object.keys(allCategories).forEach(cat => {
            allCategories[cat].sort((a, b) => {
                // Prima i tool AI/Pro
                const aIsPro = a.pro === true || a.href?.includes('ai') || a.href?.includes('upscaler');
                const bIsPro = b.pro === true || b.href?.includes('ai') || b.href?.includes('upscaler');
                
                if (aIsPro && !bIsPro) return -1;
                if (!aIsPro && bIsPro) return 1;
                
                // Poi ordina alfabeticamente
                return (a.title || '').localeCompare(b.title || '');
            });
        });
        
        // Ordina categorie per importanza e filtra quelle vuote
        const categoryOrder = [
            'Immagini',
            'Video',
            'Audio',
            'PDF',
            'Documenti',
            'Presentazioni',
            'Fogli di Calcolo',
            'Vettoriali',
            'Archivi',
            'Ebook',
            'Font'
        ];
        
        const sortedCategories = categoryOrder.filter(cat => 
            allCategories[cat] && allCategories[cat].length > 0
        );
        
        return Object.fromEntries(
            sortedCategories.map(cat => [cat, allCategories[cat]])
        );
    }, []);

    const handleDropdownEnter = useCallback((catName) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setDropdownOpen(catName);
    }, []);

    const handleDropdownLeave = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(null);
        }, 300); // 0.3 secondi di ritardo prima di chiudere
    }, []);

    const styles = {
        navbar: {
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: scrolled ? 'rgba(10, 14, 26, 0.9)' : 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(102, 126, 234, 0.2)',
            padding: scrolled ? '6px 0' : '10px 0',
            boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 2px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            maxWidth: '100vw',
            overflow: 'visible'
        },
        navContent: {
            width: '100%',
            maxWidth: '100%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'visible'
        },
        navLogo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: scrolled ? '16px' : '18px',
            fontWeight: '700',
            color: '#e2e8f0',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            paddingLeft: '20px'
        },
        logoText: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            lineHeight: '1.2'
        },
        logoMain: {
            fontSize: scrolled ? '16px' : '18px',
            fontWeight: '700',
            color: '#e2e8f0'
        },
        logoSub: {
            fontSize: scrolled ? '9px' : '10px',
            fontWeight: '600',
            color: '#667eea',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: '-2px'
        },
        navMenu: {
            display: isMobile ? 'none' : 'flex',
            gap: '2px',
            alignItems: 'center',
            paddingRight: '20px',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap'
        },
        homeBtn: {
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: isMobile ? 'none' : 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: '#cbd5e1',
            textDecoration: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s'
        },
        dropdown: {
            position: 'relative'
        },
        dropdownBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: '#cbd5e1',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s'
        },
        dropdownMenu: {
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(102, 126, 234, 0.2)',
            padding: '12px',
            minWidth: '280px',
            maxWidth: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 1001,
            animation: 'fadeInUp 0.3s ease-out',
            // Smooth scrolling
            scrollBehavior: 'smooth',
            // Custom scrollbar styling
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(102, 126, 234, 0.5) rgba(15, 23, 42, 0.3)'
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        },
        signupBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '10px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4), 0 0 15px rgba(102, 126, 234, 0.2)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: '200% 200%',
            position: 'relative',
            overflow: 'hidden',
            willChange: 'transform, box-shadow'
        },
        hamburgerBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '24px',
            marginRight: '8px'
        },
        secondaryMenuBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '24px',
            marginRight: '12px'
        },
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: mobileMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '80%',
            maxWidth: '320px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'right 0.3s ease',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            display: isMobile ? 'block' : 'none'
        },
        mobileSecondaryMenu: {
            position: 'fixed',
            top: 0,
            right: mobileSecondaryMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '280px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'right 0.3s ease',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            display: isMobile ? 'block' : 'none'
        },
        mobileOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1001,
            backdropFilter: 'blur(4px)'
        },
        mobileMenuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
        },
        mobileMenuTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#e2e8f0',
            margin: 0
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            marginBottom: '8px',
            cursor: 'pointer'
        },
        mobileCategoryHeader: {
            padding: '12px 16px',
            color: '#667eea',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px'
        },
        mobileDropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px 10px 32px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            background: 'rgba(15, 23, 42, 0.7)',
            marginBottom: '4px'
        }
    };

    return (
        <>
            <style jsx>{`
                /* Custom scrollbar per i dropdown menu */
                .dropdown-menu-scroll::-webkit-scrollbar {
                    width: 8px;
                }
                .dropdown-menu-scroll::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.3);
                    border-radius: 10px;
                }
                .dropdown-menu-scroll::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.5);
                    border-radius: 10px;
                    transition: background 0.2s;
                }
                .dropdown-menu-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(102, 126, 234, 0.7);
                }
            `}</style>
            <nav style={styles.navbar} ref={navRef}>
                <div style={styles.navContent}>
                {/* Logo */}
                <Link href="/" style={styles.navLogo}>
                    <svg width={scrolled ? "28" : "32"} height={scrolled ? "28" : "32"} viewBox="0 0 40 40" fill="none" style={{transition: 'all 0.3s'}}>
                        {/* Background gradient circle */}
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 1}} />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* Outer hexagon frame */}
                        <path d="M20 2 L34 10 L34 26 L20 34 L6 26 L6 10 Z" 
                              stroke="url(#logoGradient)" 
                              strokeWidth="1.5" 
                              fill="none"
                              opacity="0.6"/>
                        
                        {/* Inner pixel grid representing "Mega Pixel" */}
                        <rect x="14" y="12" width="4" height="4" fill="url(#logoGradient)" opacity="0.9"/>
                        <rect x="22" y="12" width="4" height="4" fill="url(#logoGradient)" opacity="0.7"/>
                        <rect x="14" y="18" width="4" height="4" fill="url(#logoGradient)" opacity="0.8"/>
                        <rect x="22" y="18" width="4" height="4" fill="url(#logoGradient)" opacity="1" filter="url(#glow)"/>
                        <rect x="14" y="24" width="4" height="4" fill="url(#logoGradient)" opacity="0.7"/>
                        <rect x="22" y="24" width="4" height="4" fill="url(#logoGradient)" opacity="0.6"/>
                        
                        {/* AI neural network nodes */}
                        <circle cx="10" cy="10" r="1.5" fill="#667eea" opacity="0.8"/>
                        <circle cx="30" cy="10" r="1.5" fill="#764ba2" opacity="0.8"/>
                        <circle cx="10" cy="30" r="1.5" fill="#764ba2" opacity="0.8"/>
                        <circle cx="30" cy="30" r="1.5" fill="#667eea" opacity="0.8"/>
                        
                        {/* Connection lines representing AI */}
                        <line x1="10" y1="10" x2="18" y2="14" stroke="#667eea" strokeWidth="0.5" opacity="0.4"/>
                        <line x1="30" y1="10" x2="26" y2="14" stroke="#764ba2" strokeWidth="0.5" opacity="0.4"/>
                        <line x1="10" y1="30" x2="18" y2="26" stroke="#764ba2" strokeWidth="0.5" opacity="0.4"/>
                        <line x1="30" y1="30" x2="26" y2="26" stroke="#667eea" strokeWidth="0.5" opacity="0.4"/>
                    </svg>
                    <div style={styles.logoText}>
                        <span style={styles.logoMain}>MegaPixelAI</span>
                        <span style={styles.logoSub}>ToolSuite</span>
                    </div>
                </Link>

                <div style={styles.navMenu}>
                    <Link 
                        href="/tools" 
                        style={{
                            ...styles.dropdownBtn,
                            background: hoveredItem === 'tools' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={() => setHoveredItem('tools')}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push('/tools');
                        }}
                    >
                        Tutti i Tool
                    </Link>

                    {Object.keys(categories).map(catName => (
                        <div
                            key={catName}
                            style={styles.dropdown}
                            onMouseEnter={() => handleDropdownEnter(catName)}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button
                                style={{
                                    ...styles.dropdownBtn,
                                    background: hoveredItem === `cat-${catName}` || dropdownOpen === catName ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                                }}
                                onClick={() => setDropdownOpen(dropdownOpen === catName ? null : catName)}
                                onMouseEnter={() => setHoveredItem(`cat-${catName}`)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {catName}
                                <BsChevronDown 
                                    style={{ 
                                        marginLeft: '6px',
                                        width: '14px',
                                        height: '14px',
                                        transition: 'transform 0.3s ease',
                                        transform: dropdownOpen === catName ? 'rotate(180deg)' : 'rotate(0deg)',
                                        opacity: 0.8
                                    }} 
                                />
                            </button>
                            {dropdownOpen === catName && (
                                <div 
                                    className="dropdown-menu-scroll"
                                    style={styles.dropdownMenu}
                                    onWheel={(e) => {
                                        // Permetti lo scroll con la rotella del mouse
                                        e.stopPropagation();
                                    }}
                                >
                                    {/* Mostra i tool ordinati (AI/Pro prima) */}
                                    {categories[catName].slice(0, 20).map((tool, index) => {
                                        // Aggiungi separatore visivo dopo i tool AI/Pro se necessario
                                        const isPro = tool.pro === true || tool.href?.includes('ai') || tool.href?.includes('upscaler');
                                        const nextTool = categories[catName][index + 1];
                                        const nextIsPro = nextTool && (nextTool.pro === true || nextTool.href?.includes('ai') || nextTool.href?.includes('upscaler'));
                                        const showSeparator = isPro && !nextIsPro && index < categories[catName].length - 1 && index < 19;
                                        
                                        return (
                                            <React.Fragment key={tool.href}>
                                                <Link
                                                    href={tool.href}
                                                    style={{
                                                        ...styles.dropdownItem,
                                                        background: hoveredItem === `item-${tool.href}` ? 'rgba(102, 126, 234, 0.2)' : 'transparent'
                                                    }}
                                                    onClick={() => {
                                                        if (closeTimeoutRef.current) {
                                                            clearTimeout(closeTimeoutRef.current);
                                                        }
                                                        setDropdownOpen(null);
                                                        setHoveredItem(null);
                                                    }}
                                                    onMouseEnter={() => setHoveredItem(`item-${tool.href}`)}
                                                    onMouseLeave={() => setHoveredItem(null)}
                                                >
                                                    {tool.icon && <tool.icon style={{ width: 18, height: 18, flexShrink: 0 }} />}
                                                    <span style={{ flex: 1, minWidth: 0 }}>{tool.title}</span>
                                                    {tool.pro && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            color: '#fff',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            PRO
                                                        </span>
                                                    )}
                                                </Link>
                                                {showSeparator && (
                                                    <div style={{
                                                        height: '1px',
                                                        background: 'rgba(102, 126, 234, 0.2)',
                                                        margin: '8px 0',
                                                        marginLeft: '16px',
                                                        marginRight: '16px'
                                                    }} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    {categories[catName].length > 20 && (
                                        <Link
                                            href="/tools"
                                            style={{
                                                ...styles.dropdownItem,
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                fontWeight: '600',
                                                justifyContent: 'center',
                                                marginTop: '8px',
                                                borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                                                paddingTop: '16px'
                                            }}
                                            onClick={() => {
                                                if (closeTimeoutRef.current) {
                                                    clearTimeout(closeTimeoutRef.current);
                                                }
                                                setDropdownOpen(null);
                                            }}
                                        >
                                            <span>Vedi tutti ({categories[catName].length})</span>
                                            <BsChevronRight style={{ marginLeft: '8px', width: '14px', height: '14px' }} />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <Link 
                        href="/pricing" 
                        style={{
                            ...styles.dropdownBtn,
                            background: hoveredItem === 'pricing' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={() => setHoveredItem('pricing')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {t('nav.pricing')}
                    </Link>
                    
                    <Link 
                        href="/faq" 
                        style={{
                            ...styles.dropdownBtn,
                            background: 'transparent',
                            textDecoration: 'none'
                        }}
                    >
                        FAQ
                    </Link>
                    
                    <Link 
                        href="/login" 
                        style={{
                            ...styles.signupBtn,
                            background: hoveredItem === 'login' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={() => setHoveredItem('login')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        Accedi
                    </Link>
                    
                    <LanguageSwitcher />
                </div>

                {/* Mobile buttons - show only on mobile */}
                {isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                            style={styles.hamburgerBtn}
                            onClick={() => {
                                setMobileMenuOpen(!mobileMenuOpen);
                                setMobileSecondaryMenuOpen(false);
                            }}
                        >
                            <HiMenu />
                        </button>
                        
                        <button 
                            style={styles.secondaryMenuBtn}
                            onClick={() => {
                                setMobileSecondaryMenuOpen(!mobileSecondaryMenuOpen);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <HiDotsVertical />
                        </button>
                    </div>
                )}
            </div>

            {/* Overlay per chiudere menu mobile */}
            {isMobile && (mobileMenuOpen || mobileSecondaryMenuOpen) && (
                <div 
                    style={styles.mobileOverlay}
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSecondaryMenuOpen(false);
                    }}
                />
            )}

            {/* Mobile menu principale (categorie e strumenti) */}
            {isMobile && (
                <div style={styles.mobileMenu}>
                    <div style={styles.mobileMenuHeader}>
                        <h3 style={styles.mobileMenuTitle}>Menu</h3>
                        <button 
                            style={styles.closeBtn}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <HiX />
                        </button>
                    </div>

                    <Link 
                        href="/tools" 
                        style={styles.mobileMenuItem}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMobileMenuOpen(false);
                            router.push('/tools');
                        }}
                    >
                        Tutti i Tool
                    </Link>

                    {Object.keys(categories).map(catName => (
                        <div key={catName}>
                            <div 
                                style={styles.mobileCategoryHeader}
                                onClick={() => setExpandedCategory(expandedCategory === catName ? null : catName)}
                            >
                                <span>{catName}</span>
                                <BsChevronRight 
                                    style={{ 
                                        width: 16, 
                                        height: 16,
                                        transform: expandedCategory === catName ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease'
                                    }} 
                                />
                            </div>
                            {expandedCategory === catName && categories[catName].slice(0, 15).map(tool => (
                                <Link
                                    key={tool.href}
                                    href={tool.href}
                                    style={styles.mobileDropdownItem}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {tool.icon && <tool.icon style={{ width: 18, height: 18 }} />}
                                    <span>{tool.title}</span>
                                </Link>
                            ))}
                            {expandedCategory === catName && categories[catName].length > 15 && (
                                <Link
                                    href="/tools"
                                    style={{
                                        ...styles.mobileDropdownItem,
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        fontWeight: '600',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span>Vedi tutti ({categories[catName].length})</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Mobile menu secondario (login, pricing, faq, lingua) */}
            {isMobile && (
                <div style={styles.mobileSecondaryMenu}>
                    <div style={styles.mobileMenuHeader}>
                        <h3 style={styles.mobileMenuTitle}>Account</h3>
                        <button 
                            style={styles.closeBtn}
                            onClick={() => setMobileSecondaryMenuOpen(false)}
                        >
                            <HiX />
                        </button>
                    </div>

                    <Link 
                        href="/login" 
                        style={{
                            ...styles.mobileMenuItem,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff'
                        }}
                        onClick={() => setMobileSecondaryMenuOpen(false)}
                    >
                        Accedi
                    </Link>
                    
                    <Link 
                        href="/pricing" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileSecondaryMenuOpen(false)}
                    >
                        {t('nav.pricing')}
                    </Link>
                    
                    <Link 
                        href="/faq" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileSecondaryMenuOpen(false)}
                    >
                        FAQ
                    </Link>

                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(102, 126, 234, 0.2)' }}>
                        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#667eea', fontWeight: '600' }}>
                            Lingua
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            )}
        </nav>
        </>
    );
}
