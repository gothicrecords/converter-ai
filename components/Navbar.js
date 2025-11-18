import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HiSparkles, HiHome, HiMenu, HiX, HiDotsVertical } from 'react-icons/hi';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { tools } from '../lib/tools';
import { useTranslation } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSecondaryMenuOpen, setMobileSecondaryMenuOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const navRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    useEffect(() => {
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

    const categories = {
        'Immagini': tools.filter(t => t.category === 'Immagini'),
        'PDF': tools.filter(t => t.category === 'PDF'),
        'Testo': tools.filter(t => t.category === 'Testo'),
        'Video': tools.filter(t => t.category === 'Video'),
        'Audio': tools.filter(t => t.category === 'Audio')
    };

    const handleDropdownEnter = (catName) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setDropdownOpen(catName);
    };

    const handleDropdownLeave = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(null);
        }, 300); // 0.3 secondi di ritardo prima di chiudere
    };

    const styles = {
        navbar: {
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: scrolled ? 'rgba(10, 14, 26, 0.85)' : 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
            padding: scrolled ? '4px 0' : '8px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden'
        },
        navContent: {
            width: '100%',
            maxWidth: '100%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflowX: 'hidden'
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
            display: 'flex',
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
            display: 'inline-flex',
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
            marginTop: '5px',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            padding: '8px',
            minWidth: '240px',
            zIndex: 1001
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s'
        },
        signupBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 18px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        },
        hamburgerBtn: {
            display: 'none',
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
            display: 'none',
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
            left: mobileMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '80%',
            maxWidth: '320px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'left 0.3s ease',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.5)'
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
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)'
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

    // Media query per nascondere menu desktop e mostrare hamburger su mobile
    if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            styles.navMenu.display = 'none';
            styles.hamburgerBtn.display = 'flex';
            styles.secondaryMenuBtn.display = 'flex';
        }
    }

    return (
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
                        href="/chat" 
                        style={{
                            ...styles.dropdownBtn,
                            background: hoveredItem === 'chat' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={() => setHoveredItem('chat')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {t('nav.tools')}
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
                                    background: hoveredItem === `cat-${catName}` ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                                }}
                                onClick={() => setDropdownOpen(dropdownOpen === catName ? null : catName)}
                                onMouseEnter={() => setHoveredItem(`cat-${catName}`)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {catName}
                                <BsChevronDown style={{ width: 14, height: 14, marginLeft: 6 }} />
                            </button>
                            {dropdownOpen === catName && (
                                <div style={styles.dropdownMenu}>
                                    {categories[catName].map(tool => (
                                        <Link
                                            key={tool.href}
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
                                            <tool.icon style={{ width: 18, height: 18 }} />
                                            <span>{tool.title}</span>
                                        </Link>
                                    ))}
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

                {/* Mobile buttons */}
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
            </div>

            {/* Overlay per chiudere menu mobile */}
            {(mobileMenuOpen || mobileSecondaryMenuOpen) && (
                <div 
                    style={styles.mobileOverlay}
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSecondaryMenuOpen(false);
                    }}
                />
            )}

            {/* Mobile menu principale (categorie e strumenti) */}
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
                    href="/chat" 
                    style={styles.mobileMenuItem}
                    onClick={() => setMobileMenuOpen(false)}
                >
                    {t('nav.tools')}
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
                        {expandedCategory === catName && categories[catName].map(tool => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                style={styles.mobileDropdownItem}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <tool.icon style={{ width: 18, height: 18 }} />
                                <span>{tool.title}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            {/* Mobile menu secondario (login, pricing, faq, lingua) */}
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
        </nav>
    );
}
