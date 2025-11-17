import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HiSparkles, HiHome } from 'react-icons/hi';
import { BsChevronDown } from 'react-icons/bs';
import { tools } from '../lib/tools';

export default function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const categories = {
        'Immagini': tools.filter(t => t.category === 'Immagini'),
        'PDF': tools.filter(t => t.category === 'PDF'),
        'Testo': tools.filter(t => t.category === 'Testo'),
        'Video': tools.filter(t => t.category === 'Video'),
        'Audio': tools.filter(t => t.category === 'Audio')
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
            width: '100%'
        },
        navContent: {
            width: '100%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
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
        navMenu: {
            display: 'flex',
            gap: '2px',
            alignItems: 'center',
            paddingRight: '20px'
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
        }
    };

    return (
        <nav style={styles.navbar} ref={navRef}>
            <div style={styles.navContent}>
                <Link href="/" style={styles.navLogo}>
                    <HiSparkles style={{ width: scrolled ? 20 : 24, height: scrolled ? 20 : 24, transition: 'all 0.3s' }} />
                    <span>MegaPixelAI</span>
                </Link>

                <Link 
                    href="/" 
                    style={{
                        ...styles.homeBtn,
                        background: hoveredItem === 'home' ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                    }}
                    onMouseEnter={() => setHoveredItem('home')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <HiHome style={{ width: 16, height: 16 }} />
                    <span>Home</span>
                </Link>

                <div style={styles.navMenu}>
                    {Object.keys(categories).map(catName => (
                        <div
                            key={catName}
                            style={styles.dropdown}
                            onMouseEnter={() => setDropdownOpen(catName)}
                            onMouseLeave={() => setDropdownOpen(null)}
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
                </div>
            </div>
        </nav>
    );
}
