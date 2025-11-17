import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { 
    HiUser, HiLogout, HiChartBar, HiClock, HiStar, HiCog, 
    HiDownload, HiTrendingUp, HiCheckCircle, HiSparkles, HiEye
} from 'react-icons/hi';
import { getCurrentUser, logout, isAuthenticated, getUserStats } from '../lib/auth';
import { getHistory } from '../lib/history';
import { useTranslation } from '../lib/i18n';

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            if (!isAuthenticated()) {
                router.push('/login');
                return;
            }

            const userData = await getCurrentUser();
            if (!userData) {
                router.push('/login');
                return;
            }

            setUser(userData);
            const userStats = getUserStats(userData);
            setStats(userStats);
            setHistory(getHistory());
            
            if (router.query.welcome === 'true') {
                setShowWelcome(true);
                setTimeout(() => setShowWelcome(false), 5000);
            }
        };

        loadUserData();
    }, [router]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!user) {
        return (
            <div style={styles.pageWrap}>
                <Navbar />
                <div style={styles.loading}>Caricamento...</div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: t('dashboard.overview'), icon: HiChartBar },
        { id: 'history', label: t('dashboard.history'), icon: HiClock },
        { id: 'favorites', label: t('dashboard.favorites'), icon: HiStar },
        { id: 'settings', label: t('dashboard.settings'), icon: HiCog }
    ];

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title={t('seo.dashboardTitle')}
                description={t('seo.dashboardDesc')}
                canonical="/dashboard"
            />
            <Navbar />

            {showWelcome && (
                <div style={styles.welcomeBanner}>
                    <HiCheckCircle style={{ width: 24, height: 24 }} />
                    <span>{t('dashboard.welcomeBanner')}</span>
                </div>
            )}

            <div style={styles.container}>
                {/* Header con informazioni utente */}
                <div style={styles.header}>
                    <div style={styles.userInfo}>
                        <div style={styles.avatar}>
                            <HiUser style={{ width: 32, height: 32 }} />
                        </div>
                        <div>
                            <h1 style={styles.userName}>{user.name}</h1>
                            <p style={styles.userEmail}>{user.email}</p>
                        </div>
                    </div>
                    <div style={styles.headerActions}>
                        <div style={styles.discountBadge}>
                            <HiSparkles style={{ width: 16, height: 16 }} />
                            <span>Sconto 5% Attivo</span>
                        </div>
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            <HiLogout style={{ width: 18, height: 18 }} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Statistiche principali */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(102, 126, 234, 0.15)' }}>
                            <HiDownload style={{ width: 24, height: 24, color: '#667eea' }} />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats?.imagesProcessed || 0}</div>
                            <div style={styles.statLabel}>Immagini Processate</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)' }}>
                            <HiTrendingUp style={{ width: 24, height: 24, color: '#10b981' }} />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats?.toolsUsed || 0}</div>
                            <div style={styles.statLabel}>Strumenti Utilizzati</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)' }}>
                            <HiClock style={{ width: 24, height: 24, color: '#f59e0b' }} />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats?.registeredDays || 0}</div>
                            <div style={styles.statLabel}>Giorni da Registrazione</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)' }}>
                            <HiChartBar style={{ width: 24, height: 24, color: '#8b5cf6' }} />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats?.averageDaily || 0}</div>
                            <div style={styles.statLabel}>Media Giornaliera</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.id ? styles.tabActive : {})
                            }}
                        >
                            <tab.icon style={{ width: 20, height: 20 }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contenuto tabs */}
                <div style={styles.tabContent}>
                    {activeTab === 'overview' && (
                        <div style={styles.overview}>
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Il Tuo Piano</h2>
                                <div style={styles.planCard}>
                                    <div style={styles.planHeader}>
                                        <div>
                                            <div style={styles.planName}>Piano {user.plan === 'free' ? 'Gratuito' : user.plan.toUpperCase()}</div>
                                            <div style={styles.planDesc}>
                                                {user.plan === 'free' 
                                                    ? '10 elaborazioni al giorno • File fino a 10MB'
                                                    : 'Elaborazioni illimitate • File fino a 100MB'
                                                }
                                            </div>
                                        </div>
                                        {user.plan === 'free' && (
                                            <button style={styles.upgradeButton} onClick={() => router.push('/pricing')}>
                                                Passa a Pro con 5% sconto
                                            </button>
                                        )}
                                    </div>
                                    {user.discount > 0 && (
                                        <div style={styles.discountInfo}>
                                            <HiCheckCircle style={{ width: 20, height: 20, color: '#10b981' }} />
                                            <span>Hai uno sconto del {user.discount}% su tutti gli upgrade!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Ultimi Lavori</h2>
                                {history.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <HiEye style={{ width: 48, height: 48, color: '#64748b' }} />
                                        <p>Nessun lavoro ancora. Inizia a usare gli strumenti!</p>
                                    </div>
                                ) : (
                                    <div style={styles.historyGrid}>
                                        {history.slice(0, 6).map((item, i) => (
                                            <div key={i} style={styles.historyCard}>
                                                {item.thumbnail && (
                                                    <img src={item.thumbnail} alt="Preview" style={styles.historyThumb} />
                                                )}
                                                <div style={styles.historyInfo}>
                                                    <div style={styles.historyTool}>{item.toolName}</div>
                                                    <div style={styles.historyDate}>{item.timestamp}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Statistiche Settimanali</h2>
                                <div style={styles.chartCard}>
                                    <div style={styles.chartPlaceholder}>
                                        <HiChartBar style={{ width: 64, height: 64, color: '#64748b' }} />
                                        <p>Grafici dettagliati in arrivo presto</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={styles.historySection}>
                            <h2 style={styles.sectionTitle}>Cronologia Completa</h2>
                            {history.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <HiClock style={{ width: 48, height: 48, color: '#64748b' }} />
                                    <p>La tua cronologia apparirà qui</p>
                                </div>
                            ) : (
                                <div style={styles.historyList}>
                                    {history.map((item, i) => (
                                        <div key={i} style={styles.historyItem}>
                                            {item.thumbnail && (
                                                <img src={item.thumbnail} alt="Preview" style={styles.historyItemThumb} />
                                            )}
                                            <div style={styles.historyItemInfo}>
                                                <div style={styles.historyItemTool}>{item.toolName}</div>
                                                <div style={styles.historyItemDate}>{item.timestamp}</div>
                                            </div>
                                            <button style={styles.historyItemButton}>Visualizza</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div style={styles.favoritesSection}>
                            <h2 style={styles.sectionTitle}>Strumenti Preferiti</h2>
                            <div style={styles.emptyState}>
                                <HiStar style={{ width: 48, height: 48, color: '#64748b' }} />
                                <p>Aggiungi strumenti ai preferiti per accesso rapido</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={styles.settingsSection}>
                            <h2 style={styles.sectionTitle}>Impostazioni Account</h2>
                            <div style={styles.settingsCard}>
                                <div style={styles.settingItem}>
                                    <div>
                                        <div style={styles.settingLabel}>Nome</div>
                                        <div style={styles.settingValue}>{user.name}</div>
                                    </div>
                                </div>
                                <div style={styles.settingItem}>
                                    <div>
                                        <div style={styles.settingLabel}>Email</div>
                                        <div style={styles.settingValue}>{user.email}</div>
                                    </div>
                                </div>
                                <div style={styles.settingItem}>
                                    <div>
                                        <div style={styles.settingLabel}>Data Registrazione</div>
                                        <div style={styles.settingValue}>{new Date(user.createdAt).toLocaleDateString('it-IT')}</div>
                                    </div>
                                </div>
                                <div style={styles.settingItem}>
                                    <div>
                                        <div style={styles.settingLabel}>Sconto Attivo</div>
                                        <div style={styles.settingValue}>{user.discount}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontSize: '18px', color: '#94a3b8' },
    welcomeBanner: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', fontWeight: '600' },
    container: { maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '20px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
    avatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' },
    userName: { fontSize: '28px', fontWeight: '900', margin: '0 0 4px', color: '#e2e8f0' },
    userEmail: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    headerActions: { display: 'flex', alignItems: 'center', gap: '16px' },
    discountBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#10b981', fontSize: '14px', fontWeight: '700' },
    logoutButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' },
    statCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    statIcon: { width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: '32px', fontWeight: '900', color: '#e2e8f0', marginBottom: '4px' },
    statLabel: { fontSize: '14px', color: '#94a3b8', fontWeight: '500' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '32px', padding: '8px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '16px' },
    tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', background: 'transparent', border: 'none', borderRadius: '12px', color: '#94a3b8', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    tabActive: { background: 'rgba(102, 126, 234, 0.15)', color: '#cbd5e1' },
    tabContent: { minHeight: '400px' },
    overview: { display: 'flex', flexDirection: 'column', gap: '32px' },
    section: {},
    sectionTitle: { fontSize: '22px', fontWeight: '800', margin: '0 0 20px', color: '#e2e8f0' },
    planCard: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    planHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    planName: { fontSize: '24px', fontWeight: '800', color: '#e2e8f0', marginBottom: '4px' },
    planDesc: { fontSize: '14px', color: '#94a3b8' },
    upgradeButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
    discountInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981', fontSize: '14px', fontWeight: '600' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center', color: '#64748b' },
    historyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
    historyCard: { padding: '16px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
    historyThumb: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' },
    historyInfo: {},
    historyTool: { fontSize: '14px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' },
    historyDate: { fontSize: '12px', color: '#64748b' },
    historySection: {},
    historyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    historyItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '12px' },
    historyItemThumb: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' },
    historyItemInfo: { flex: 1 },
    historyItemTool: { fontSize: '16px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' },
    historyItemDate: { fontSize: '13px', color: '#64748b' },
    historyItemButton: { padding: '8px 16px', background: 'rgba(102, 126, 234, 0.15)', border: 'none', borderRadius: '8px', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    favoritesSection: {},
    settingsSection: {},
    settingsCard: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' },
    settingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid rgba(102, 126, 234, 0.1)' },
    settingLabel: { fontSize: '14px', color: '#94a3b8', marginBottom: '4px' },
    settingValue: { fontSize: '16px', fontWeight: '700', color: '#e2e8f0' },
    chartCard: { padding: '40px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    chartPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#64748b' }
};
