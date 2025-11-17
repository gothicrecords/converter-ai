import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { HiSparkles, HiLightningBolt, HiUsers, HiHeart } from 'react-icons/hi';

export default function AboutPage() {
    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Chi Siamo - La Storia di MegaPixelAI"
                description="Scopri la storia di MegaPixelAI: una startup italiana che democratizza l'accesso agli strumenti AI professionali per creativi e professionisti."
                canonical="/about"
                keywords={['chi siamo', 'about', 'storia', 'team', 'missione', 'startup']}
            />
            <Navbar />

            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>
                    Rendiamo l'AI accessibile a <span style={styles.gradient}>tutti</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    MegaPixelAI nasce dalla convinzione che strumenti AI professionali non dovrebbero essere un privilegio riservato a pochi, ma un diritto accessibile a tutti i creativi e professionisti.
                </p>
            </section>

            <section style={styles.story}>
                <div style={styles.storyContent}>
                    <div style={styles.storyText}>
                        <h2 style={styles.sectionTitle}>La Nostra Storia</h2>
                        <p style={styles.paragraph}>
                            Tutto è iniziato nel 2023, quando un gruppo di sviluppatori e designer italiani si è reso conto che gli strumenti AI più potenti erano troppo costosi o troppo complessi per la maggior parte delle persone.
                        </p>
                        <p style={styles.paragraph}>
                            Volevamo creare una piattaforma dove chiunque - dal fotografo freelance allo studente, dal graphic designer all'agenzia - potesse accedere a tecnologie all'avanguardia senza barriere economiche o tecniche.
                        </p>
                        <p style={styles.paragraph}>
                            Dopo mesi di sviluppo intenso, abbiamo lanciato MegaPixelAI con una missione chiara: democratizzare l'accesso all'intelligenza artificiale e permettere a ogni creativo di esprimere il proprio potenziale senza limiti.
                        </p>
                    </div>
                </div>
            </section>

            <section style={styles.values}>
                <h2 style={styles.sectionTitle}>I Nostri Valori</h2>
                <div style={styles.valuesGrid}>
                    <div style={styles.valueCard}>
                        <div style={styles.valueIcon}>
                            <HiSparkles style={{ width: 32, height: 32 }} />
                        </div>
                        <h3 style={styles.valueTitle}>Innovazione</h3>
                        <p style={styles.valueText}>
                            Integriamo costantemente le ultime tecnologie AI per offrire sempre il meglio ai nostri utenti.
                        </p>
                    </div>
                    <div style={styles.valueCard}>
                        <div style={styles.valueIcon}>
                            <HiLightningBolt style={{ width: 32, height: 32 }} />
                        </div>
                        <h3 style={styles.valueTitle}>Semplicità</h3>
                        <p style={styles.valueText}>
                            Crediamo che la tecnologia complessa debba essere resa semplice e accessibile a tutti.
                        </p>
                    </div>
                    <div style={styles.valueCard}>
                        <div style={styles.valueIcon}>
                            <HiUsers style={{ width: 32, height: 32 }} />
                        </div>
                        <h3 style={styles.valueTitle}>Comunità</h3>
                        <p style={styles.valueText}>
                            Costruiamo insieme ai nostri utenti, ascoltando feedback e integrando nuove funzionalità.
                        </p>
                    </div>
                    <div style={styles.valueCard}>
                        <div style={styles.valueIcon}>
                            <HiHeart style={{ width: 32, height: 32 }} />
                        </div>
                        <h3 style={styles.valueTitle}>Trasparenza</h3>
                        <p style={styles.valueText}>
                            Nessun costo nascosto, nessuna trappola. Prezzi chiari e servizio onesto.
                        </p>
                    </div>
                </div>
            </section>

            <section style={styles.mission}>
                <div style={styles.missionBox}>
                    <h2 style={styles.missionTitle}>La Nostra Missione</h2>
                    <p style={styles.missionText}>
                        Democratizzare l'accesso agli strumenti AI più avanzati, permettendo a creativi, professionisti e aziende di ogni dimensione di competere ad armi pari nel mercato globale.
                    </p>
                    <p style={styles.missionText}>
                        Crediamo che l'intelligenza artificiale debba essere uno strumento di crescita e opportunità, non un privilegio riservato a pochi. Per questo manteniamo sempre un piano gratuito generoso e prezzi trasparenti.
                    </p>
                </div>
            </section>

            <section style={styles.stats}>
                <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                        <div style={styles.statNumber}>50K+</div>
                        <div style={styles.statLabel}>Utenti Attivi</div>
                    </div>
                    <div style={styles.statBox}>
                        <div style={styles.statNumber}>2M+</div>
                        <div style={styles.statLabel}>Immagini Processate</div>
                    </div>
                    <div style={styles.statBox}>
                        <div style={styles.statNumber}>15+</div>
                        <div style={styles.statLabel}>Strumenti AI</div>
                    </div>
                    <div style={styles.statBox}>
                        <div style={styles.statNumber}>99.9%</div>
                        <div style={styles.statLabel}>Uptime Garantito</div>
                    </div>
                </div>
            </section>

            <section style={styles.team}>
                <h2 style={styles.sectionTitle}>Il Team</h2>
                <p style={styles.teamIntro}>
                    Un team di appassionati con un obiettivo comune: rendere l'AI accessibile a tutti.
                </p>
                <div style={styles.teamNote}>
                    <p style={styles.paragraph}>
                        Siamo sviluppatori, designer, data scientist e product manager uniti dalla passione per l'intelligenza artificiale e dalla convinzione che la tecnologia debba essere al servizio delle persone.
                    </p>
                    <p style={styles.paragraph}>
                        Il nostro team lavora remotamente da diverse città italiane, condividendo la visione di un futuro dove l'AI potenzia la creatività umana anziché sostituirla.
                    </p>
                </div>
            </section>

            <section style={styles.contact}>
                <h2 style={styles.contactTitle}>Vuoi saperne di più?</h2>
                <p style={styles.contactText}>
                    Siamo sempre felici di ascoltare feedback, suggerimenti o semplicemente fare due chiacchiere.
                </p>
                <a href="/contact" style={styles.contactButton}>Contattaci</a>
            </section>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' },
    heroTitle: { fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: '1.1' },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSubtitle: { fontSize: '20px', color: '#94a3b8', lineHeight: '1.7', margin: 0 },
    story: { maxWidth: '800px', margin: '0 auto', padding: '80px 24px' },
    storyContent: { display: 'flex', flexDirection: 'column', gap: '40px' },
    storyText: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sectionTitle: { fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: '800', margin: '0 0 32px', color: '#e2e8f0', textAlign: 'center' },
    paragraph: { fontSize: '17px', color: '#cbd5e1', lineHeight: '1.8', margin: 0 },
    values: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' },
    valueCard: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px', textAlign: 'center' },
    valueIcon: { width: '72px', height: '72px', margin: '0 auto 20px', background: 'rgba(102, 126, 234, 0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea' },
    valueTitle: { fontSize: '22px', fontWeight: '700', margin: '0 0 12px', color: '#e2e8f0' },
    valueText: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    mission: { maxWidth: '900px', margin: '0 auto', padding: '80px 24px' },
    missionBox: { padding: '48px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '20px', textAlign: 'center' },
    missionTitle: { fontSize: '32px', fontWeight: '800', margin: '0 0 24px', color: '#e2e8f0' },
    missionText: { fontSize: '18px', color: '#cbd5e1', lineHeight: '1.8', margin: '0 0 16px' },
    stats: { maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' },
    statBox: { padding: '32px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px', textAlign: 'center' },
    statNumber: { fontSize: '48px', fontWeight: '900', color: '#667eea', marginBottom: '8px' },
    statLabel: { fontSize: '16px', color: '#94a3b8', fontWeight: '600' },
    team: { maxWidth: '800px', margin: '0 auto', padding: '80px 24px' },
    teamIntro: { fontSize: '18px', color: '#94a3b8', textAlign: 'center', marginBottom: '40px' },
    teamNote: { padding: '40px', background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '16px' },
    contact: { maxWidth: '700px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' },
    contactTitle: { fontSize: '32px', fontWeight: '800', margin: '0 0 16px', color: '#e2e8f0' },
    contactText: { fontSize: '18px', color: '#94a3b8', marginBottom: '32px' },
    contactButton: { display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#ffffff', fontSize: '18px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s' }
};
