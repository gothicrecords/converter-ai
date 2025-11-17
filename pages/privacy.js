import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';

export default function PrivacyPage() {
    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Privacy Policy - Come Proteggiamo i Tuoi Dati"
                description="Informativa sulla privacy di MegaPixelAI: scopri come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali in conformità con il GDPR."
                canonical="/privacy"
                keywords={['privacy', 'privacy policy', 'gdpr', 'protezione dati', 'informativa']}
            />
            <Navbar />

            <div style={styles.container}>
                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.updated}>Ultimo aggiornamento: Gennaio 2025</p>

                <section style={styles.section}>
                    <h2 style={styles.heading}>1. Introduzione</h2>
                    <p style={styles.text}>
                        MegaPixelAI ("noi", "ci", "nostro") si impegna a proteggere la privacy e la sicurezza dei dati personali dei propri utenti. 
                        Questa Privacy Policy descrive come raccogliamo, utilizziamo, condividiamo e proteggiamo le informazioni quando utilizzi i nostri servizi.
                    </p>
                    <p style={styles.text}>
                        Rispettiamo il Regolamento Generale sulla Protezione dei Dati (GDPR) dell'Unione Europea e tutte le leggi applicabili sulla privacy.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>2. Dati che Raccogliamo</h2>
                    <h3 style={styles.subheading}>2.1 Informazioni Fornite Direttamente</h3>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Indirizzo email (per newsletter e supporto)</li>
                        <li style={styles.listItem}>Nome e cognome (opzionali, per account Pro/Enterprise)</li>
                        <li style={styles.listItem}>Informazioni di pagamento (gestite tramite processori terzi sicuri)</li>
                        <li style={styles.listItem}>Messaggi di supporto e feedback</li>
                    </ul>

                    <h3 style={styles.subheading}>2.2 Informazioni Raccolte Automaticamente</h3>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Indirizzo IP e informazioni sul dispositivo</li>
                        <li style={styles.listItem}>Tipo di browser e sistema operativo</li>
                        <li style={styles.listItem}>Pagine visitate e durata della sessione</li>
                        <li style={styles.listItem}>File caricati per l'elaborazione (cancellati dopo 24 ore)</li>
                    </ul>

                    <h3 style={styles.subheading}>2.3 Cookie e Tecnologie Simili</h3>
                    <p style={styles.text}>
                        Utilizziamo cookie essenziali per il funzionamento del sito e cookie analitici (con il tuo consenso) per migliorare i nostri servizi.
                        Puoi gestire le preferenze sui cookie tramite le impostazioni del browser.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>3. Come Utilizziamo i Tuoi Dati</h2>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>Fornire i servizi:</strong> Elaborare i tuoi file, gestire il tuo account, processare pagamenti</li>
                        <li style={styles.listItem}><strong>Migliorare la piattaforma:</strong> Analizzare l'utilizzo per ottimizzare funzionalità e performance</li>
                        <li style={styles.listItem}><strong>Comunicazioni:</strong> Inviare aggiornamenti, newsletter (solo con consenso), risposte al supporto</li>
                        <li style={styles.listItem}><strong>Sicurezza:</strong> Prevenire frodi, abusi e violazioni dei Termini di Servizio</li>
                        <li style={styles.listItem}><strong>Conformità legale:</strong> Rispettare obblighi legali e richieste delle autorità competenti</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>4. Condivisione dei Dati</h2>
                    <p style={styles.text}>
                        <strong>Non vendiamo mai i tuoi dati personali.</strong> Condividiamo informazioni solo nei seguenti casi:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>Fornitori di servizi:</strong> Processori di pagamento (Stripe, PayPal), servizi di hosting (AWS, Vercel), analytics (Google Analytics)</li>
                        <li style={styles.listItem}><strong>API terze:</strong> Remove.bg per rimozione sfondo, Pollinations.ai per generazione immagini (solo i file necessari)</li>
                        <li style={styles.listItem}><strong>Obblighi legali:</strong> Quando richiesto dalla legge o per proteggere i nostri diritti</li>
                        <li style={styles.listItem}><strong>Consenso esplicito:</strong> In altri casi, solo con il tuo consenso preventivo</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>5. Sicurezza dei Dati</h2>
                    <p style={styles.text}>
                        Implementiamo misure di sicurezza tecniche e organizzative appropriate:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Crittografia SSL/TLS per tutte le comunicazioni</li>
                        <li style={styles.listItem}>Cancellazione automatica dei file caricati dopo 24 ore</li>
                        <li style={styles.listItem}>Accesso limitato ai dati solo al personale autorizzato</li>
                        <li style={styles.listItem}>Backup regolari e monitoraggio della sicurezza</li>
                        <li style={styles.listItem}>Auditing periodici delle pratiche di sicurezza</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>6. Conservazione dei Dati</h2>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>File caricati:</strong> Cancellati automaticamente dopo 24 ore</li>
                        <li style={styles.listItem}><strong>Dati dell'account:</strong> Conservati fino alla cancellazione dell'account</li>
                        <li style={styles.listItem}><strong>Log di sistema:</strong> Conservati per 90 giorni per motivi di sicurezza</li>
                        <li style={styles.listItem}><strong>Dati di fatturazione:</strong> Conservati per 10 anni per obblighi fiscali</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>7. I Tuoi Diritti (GDPR)</h2>
                    <p style={styles.text}>Hai diritto a:</p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>Accesso:</strong> Richiedere una copia dei tuoi dati personali</li>
                        <li style={styles.listItem}><strong>Rettifica:</strong> Correggere dati inesatti o incompleti</li>
                        <li style={styles.listItem}><strong>Cancellazione:</strong> Richiedere la cancellazione dei tuoi dati ("diritto all'oblio")</li>
                        <li style={styles.listItem}><strong>Portabilità:</strong> Ricevere i tuoi dati in formato strutturato</li>
                        <li style={styles.listItem}><strong>Opposizione:</strong> Opporti al trattamento dei tuoi dati per finalità specifiche</li>
                        <li style={styles.listItem}><strong>Limitazione:</strong> Richiedere la limitazione del trattamento</li>
                        <li style={styles.listItem}><strong>Reclamo:</strong> Presentare reclamo all'autorità di controllo (Garante Privacy)</li>
                    </ul>
                    <p style={styles.text}>
                        Per esercitare questi diritti, contattaci a <strong>privacy@megapixelai.com</strong>
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>8. Trasferimenti Internazionali</h2>
                    <p style={styles.text}>
                        I nostri server sono ubicati nell'Unione Europea. In caso di trasferimento di dati al di fuori dell'UE, 
                        garantiamo livelli di protezione adeguati tramite clausole contrattuali standard o certificazioni Privacy Shield.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>9. Minori</h2>
                    <p style={styles.text}>
                        I nostri servizi non sono destinati a minori di 16 anni. Non raccogliamo consapevolmente dati di minori. 
                        Se veniamo a conoscenza di aver raccolto dati di un minore, li cancelleremo immediatamente.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>10. Modifiche alla Privacy Policy</h2>
                    <p style={styles.text}>
                        Ci riserviamo il diritto di aggiornare questa Privacy Policy periodicamente. 
                        Ti notificheremo eventuali modifiche sostanziali tramite email o banner sul sito.
                        L'uso continuato dei servizi dopo le modifiche costituisce accettazione della nuova policy.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>11. Contatti</h2>
                    <p style={styles.text}>
                        Per domande, richieste o reclami relativi alla privacy:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>Email:</strong> privacy@megapixelai.com</li>
                        <li style={styles.listItem}><strong>Modulo contatti:</strong> <a href="/contact" style={styles.link}>megapixelai.com/contact</a></li>
                        <li style={styles.listItem}><strong>Data Protection Officer:</strong> dpo@megapixelai.com</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '80px 24px' },
    title: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: '0 0 16px', color: '#e2e8f0', textAlign: 'center' },
    updated: { fontSize: '14px', color: '#94a3b8', textAlign: 'center', marginBottom: '60px' },
    section: { marginBottom: '48px' },
    heading: { fontSize: '28px', fontWeight: '800', margin: '0 0 20px', color: '#cbd5e1', borderLeft: '4px solid #667eea', paddingLeft: '16px' },
    subheading: { fontSize: '20px', fontWeight: '700', margin: '24px 0 12px', color: '#cbd5e1' },
    text: { fontSize: '16px', color: '#94a3b8', lineHeight: '1.8', margin: '0 0 16px' },
    list: { listStyle: 'disc', paddingLeft: '24px', margin: '16px 0' },
    listItem: { fontSize: '16px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '8px' },
    link: { color: '#667eea', textDecoration: 'underline' }
};
