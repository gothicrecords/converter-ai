import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiSparkles, HiHome, HiMenu, HiX, HiDotsVertical } from 'react-icons/hi';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { tools } from '../lib/tools';
import { getAllCategories, getToolsByCategory } from '../lib/conversionRegistry';
import { useTranslation } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import DropdownPortal from './DropdownPortal';
import { throttle } from '../lib/performance';

const Navbar = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSecondaryMenuOpen, setMobileSecondaryMenuOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const navRef = useRef(null);
    // refs for dropdown buttons
    const buttonRefs = useRef({});
    const closeTimeoutRef = useRef(null);
    
    // Safe client-side mobile detection with throttling
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const checkMobile = () => {
            const width = window.innerWidth;
            const isMobileWidth = width <= 768;
            setIsMobile(isMobileWidth);
            
            // Se non è mobile, chiudi i menu
            if (!isMobileWidth) {
                setMobileMenuOpen(false);
                setMobileSecondaryMenuOpen(false);
            }
        };
        
        // Check immediately
        checkMobile();
        
        // Throttle resize events for better performance
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkMobile, 150);
        };
        
        window.addEventListener('resize', handleResize, { passive: true });
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);
    
    useEffect(() => {
        if (!isMobile) {
            setMobileMenuOpen(false);
            setMobileSecondaryMenuOpen(false);
            setExpandedCategory(null);
        }
    }, [isMobile]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        if (mobileMenuOpen || mobileSecondaryMenuOpen) {
            // Prevent scroll
            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalWidth = document.body.style.width;
            
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            return () => {
                // Restore scroll on cleanup
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.width = originalWidth;
            };
        }
    }, [mobileMenuOpen, mobileSecondaryMenuOpen]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
        // Throttle scroll handler for better performance
        const handleScroll = throttle(() => {
            setScrolled(window.scrollY > 50);
        }, 100); // Update at most once per 100ms

        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setDropdownOpen(null);
                setMobileMenuOpen(false);
                setMobileSecondaryMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
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
        
        // Unisco categorie simili per semplificare la navbar
        const pdfAndDocs = [
            ...tools.filter(t => t.category === 'PDF' || t.category === 'Testo'),
            ...(conversionToolsByCat['Document'] || []),
            ...(conversionToolsByCat['Presentation'] || []),
            ...(conversionToolsByCat['Spreadsheet'] || [])
        ];
        
        const mediaTools = [
            ...(conversionToolsByCat['Video'] || []),
            ...(conversionToolsByCat['Audio'] || [])
        ];
        
        // Categorizzazione semplificata e intuitiva
        const allCategories = {
            'AI & Immagini': [
                ...tools.filter(t => t.category === 'Immagini'),
                ...(conversionToolsByCat['Image'] || [])
            ],
            'Documenti & PDF': pdfAndDocs,
            'Video & Audio': [
                ...tools.filter(t => t.category === 'Video' || t.category === 'Audio'),
                ...mediaTools
            ],
            'Grafica': [
                ...(conversionToolsByCat['Vector'] || []),
                ...(conversionToolsByCat['Font'] || [])
            ],
            'Archivi & Ebook': [
                ...(conversionToolsByCat['Archive'] || []),
                ...(conversionToolsByCat['Ebook'] || [])
            ]
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
        
        // Filtra categorie vuote
        return Object.fromEntries(
            Object.entries(allCategories).filter(([_, tools]) => tools && tools.length > 0)
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
            zIndex: 100000,
            background: scrolled ? 'rgba(10, 14, 26, 0.95)' : 'rgba(10, 14, 26, 0.98)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(102, 126, 234, 0.2)',
            padding: scrolled ? '8px 0' : '12px 0',
            boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 2px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'visible',
            boxSizing: 'border-box',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            willChange: 'background, box-shadow, padding'
        },
        navContent: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'visible',
            zIndex: 100000,
            boxSizing: 'border-box'
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
            flexShrink: 0
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
            gap: '4px',
            alignItems: 'center',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            flexShrink: 1,
            overflow: 'visible',
            position: 'relative',
            zIndex: 100001
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
            position: 'relative',
            zIndex: 100002
        },
        dropdownBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            fontSize: '13px',
            fontWeight: '600',
            color: '#cbd5e1',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap'
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
            zIndex: 100003,
            animation: 'fadeInUp 0.3s ease-out',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(102, 126, 234, 0.5) rgba(15, 23, 42, 0.3)',
            isolation: 'isolate'
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
            overflow: 'hidden',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 1
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
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            overflow: 'hidden',
            willChange: 'transform, box-shadow'
        },
        hamburgerBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '26px',
            marginRight: '8px',
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        secondaryMenuBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '26px',
            marginRight: '12px',
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: mobileMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '85%',
            maxWidth: '340px',
            minWidth: '280px',
            background: 'rgba(10, 14, 26, 0.99)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.3)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 20px',
            zIndex: 999999,
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.6)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            display: 'block',
            visibility: mobileMenuOpen ? 'visible' : 'hidden',
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)'
        },
        mobileSecondaryMenu: {
            position: 'fixed',
            top: 0,
            right: mobileSecondaryMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '85%',
            maxWidth: '320px',
            minWidth: '260px',
            background: 'rgba(10, 14, 26, 0.99)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.3)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 20px',
            zIndex: 999999,
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.6)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            display: 'block',
            visibility: mobileSecondaryMenuOpen ? 'visible' : 'hidden',
            opacity: mobileSecondaryMenuOpen ? 1 : 0,
            pointerEvents: mobileSecondaryMenuOpen ? 'auto' : 'none',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)'
        },
        mobileOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
            zIndex: 999998,
            opacity: (mobileMenuOpen || mobileSecondaryMenuOpen) ? 1 : 0,
            visibility: (mobileMenuOpen || mobileSecondaryMenuOpen) ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease',
            WebkitTapHighlightColor: 'transparent',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)'
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
            fontSize: '28px',
            cursor: 'pointer',
            padding: '8px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.2)',
            touchAction: 'manipulation',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(102, 126, 234, 0.25)',
            marginBottom: '10px',
            cursor: 'pointer',
            minHeight: '48px',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.2)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        mobileCategoryHeader: {
            padding: '14px 18px',
            color: '#667eea',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '16px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'rgba(102, 126, 234, 0.15)',
            borderRadius: '10px',
            minHeight: '48px',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.3)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        },
        mobileDropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px 12px 36px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            background: 'rgba(15, 23, 42, 0.7)',
            marginBottom: '6px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'rgba(102, 126, 234, 0.2)',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none'
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
            <nav style={styles.navbar} ref={navRef} suppressHydrationWarning>
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

                    {Object.keys(categories).map(catName => {
                        const isOpen = dropdownOpen === catName;
                        return (
                        <div
                            key={catName}
                            style={styles.dropdown}
                            onMouseEnter={() => handleDropdownEnter(catName)}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button
                                style={{
                                    ...styles.dropdownBtn,
                                    background: hoveredItem === `cat-${catName}` || isOpen ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                                }}
                                ref={(el) => {
                                    if (el) buttonRefs.current[catName] = el;
                                }}
                                onClick={() => setDropdownOpen(isOpen ? null : catName)}
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
                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        opacity: 0.8
                                    }} 
                                />
                            </button>
                            {isOpen && buttonRefs.current[catName] && (
                                <DropdownPortal
                                    anchorEl={buttonRefs.current[catName]}
                                    open={isOpen}
                                    onClose={() => setDropdownOpen(null)}
                                >
                                    <div 
                                        className="dropdown-menu-scroll"
                                        style={{ ...styles.dropdownMenu, maxWidth: 'calc(100vw - 32px)' }}
                                        onWheel={(e) => {
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
                                                <div
                                                    style={{
                                                        ...styles.dropdownItem,
                                                        background: hoveredItem === `item-${tool.href}` ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={(e) => {
                                                        // Non fermare la propagazione per permettere la navigazione
                                                        if (closeTimeoutRef.current) {
                                                            clearTimeout(closeTimeoutRef.current);
                                                        }
                                                        setDropdownOpen(null);
                                                        setHoveredItem(null);
                                                        // Naviga usando router.push
                                                        if (tool.href) {
                                                            router.push(tool.href);
                                                        }
                                                    }}
                                                    onMouseDown={(e) => {
                                                        // Previeni la chiusura del dropdown quando si clicca
                                                        e.stopPropagation();
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
                                                </div>
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
                                        >
                                            <span>Vedi tutti ({categories[catName].length})</span>
                                            <BsChevronRight style={{ marginLeft: '8px', width: '14px', height: '14px' }} />
                                        </Link>
                                    )}
                                    </div>
                                </DropdownPortal>
                            )}
                        </div>
                    );
                    })}
                    
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
                            backgroundImage: hoveredItem === 'login' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                            aria-label="Apri menu"
                            title="Apri menu"
                        >
                            <HiMenu />
                        </button>
                        
                        <button 
                            style={styles.secondaryMenuBtn}
                            onClick={() => {
                                setMobileSecondaryMenuOpen(!mobileSecondaryMenuOpen);
                                setMobileMenuOpen(false);
                            }}
                            aria-label="Apri menu secondario"
                            title="Apri menu secondario"
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
                    onClick={(e) => {
                        e.stopPropagation();
                        setMobileMenuOpen(false);
                        setMobileSecondaryMenuOpen(false);
                    }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        setMobileMenuOpen(false);
                        setMobileSecondaryMenuOpen(false);
                    }}
                />
            )}

            {/* Mobile menu principale (categorie e strumenti) */}
            {isMobile && (
                <div 
                    style={styles.mobileMenu}
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <div style={styles.mobileMenuHeader}>
                        <h3 style={styles.mobileMenuTitle}>Menu</h3>
                        <button 
                            style={styles.closeBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileMenuOpen(false);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMobileMenuOpen(false);
                            }}
                            aria-label="Chiudi menu"
                            title="Chiudi menu"
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
                <div 
                    style={styles.mobileSecondaryMenu}
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <div style={styles.mobileMenuHeader}>
                        <h3 style={styles.mobileMenuTitle}>Account</h3>
                        <button 
                            style={styles.closeBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileSecondaryMenuOpen(false);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMobileSecondaryMenuOpen(false);
                            }}
                            aria-label="Chiudi menu"
                            title="Chiudi menu"
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
};

// Memoize Navbar to prevent unnecessary re-renders
export default memo(Navbar);
