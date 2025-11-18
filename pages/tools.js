import Link from 'next/link';
import { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { useTranslation } from '../lib/i18n';
import { loadTranslationsSSR } from '../lib/i18n-server';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import Footer from '../components/Footer';
import { tools as allTools } from '../lib/tools';

export default function ToolsPage() {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('Tutti');

    // Ottieni categorie uniche
    const categories = ['Tutti', ...new Set(allTools.map(tool => tool.category))];

    // Filtra strumenti per categoria
    const filteredTools = selectedCategory === 'Tutti' 
        ? allTools 
        : allTools.filter(tool => tool.category === selectedCategory);

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Tutti gli Strumenti - MegaPixelAI"
                description="Esplora tutti i nostri strumenti AI professionali per immagini, PDF, audio e video. 15+ strumenti disponibili."
                canonical="/tools"
                keywords={['AI tools', 'strumenti AI', 'image tools', 'PDF tools', 'audio tools', 'video tools']}
            />
            <Navbar />

            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        {t('home.availableTools')}
                    </h1>
                    <p style={styles.heroSubtitle}>
                        {t('home.availableToolsSubtitle')}
                    </p>
                </div>
            </section>

            {/* Filtri per categoria */}
            <section style={styles.filterSection}>
                <div style={styles.filterGrid}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                ...styles.filterButton,
                                ...(selectedCategory === category ? styles.filterButtonActive : {})
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            <section style={styles.toolsSection}>
                <div style={styles.toolsGrid}>
                    {filteredTools.map((tool, i) => {
                        const IconComponent = tool.icon;
                        return (
                            <Link key={i} href={tool.href} style={styles.toolCard}>
                                {tool.pro && (
                                    <span style={styles.proBadge}>PRO</span>
                                )}
                                <div style={styles.toolIconWrapper}>
                                    <IconComponent style={styles.toolIcon} />
                                </div>
                                <h3 style={styles.toolTitle}>{tool.title}</h3>
                                <p style={styles.toolDescription}>{tool.description}</p>
                                <div style={styles.toolArrow}>
                                    <HiArrowRight style={{ width: 18, height: 18 }} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 40px', textAlign: 'center' },
    heroContent: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
    heroTitle: { fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: '900', lineHeight: '1.1', margin: 0, letterSpacing: '-0.02em', maxWidth: '800px', color: '#e2e8f0' },
    heroSubtitle: { fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', margin: 0, maxWidth: '700px' },
    toolsSection: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' },
    toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
    toolCard: { 
        position: 'relative', 
        padding: '24px', 
        background: 'rgba(30, 41, 59, 0.5)', 
        border: '1px solid rgba(102, 126, 234, 0.2)', 
        borderRadius: '12px', 
        textDecoration: 'none', 
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        cursor: 'pointer'
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
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
    },
    toolIcon: {
        width: '24px',
        height: '24px',
        color: '#fff'
    },
    toolTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: '8px',
        textAlign: 'left',
        margin: '0 0 8px 0'
    },
    toolDescription: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: '0 0 16px 0',
        textAlign: 'left',
        flex: 1
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
        padding: '0 24px 40px'
    },
    filterGrid: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    filterButton: {
        padding: '10px 24px',
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '24px',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none'
    },
    filterButtonActive: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: 'transparent',
        color: '#fff',
        transform: 'scale(1.05)'
    }
};

export async function getServerSideProps({ locale }) {
    const translations = await loadTranslationsSSR(locale || 'en');
    
    return {
        props: {
            translations
        }
    };
}
