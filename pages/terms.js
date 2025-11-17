import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';

export default function TermsPage() {
    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="Termini e Condizioni - Regole d'Uso dei Servizi"
                description="Termini e condizioni d'uso di MegaPixelAI: scopri le regole, i diritti e le responsabilità quando utilizzi i nostri strumenti AI."
                canonical="/terms"
                keywords={['termini', 'condizioni', 'terms of service', 'regole', 'uso']}
            />
            <Navbar />

            <div style={styles.container}>
                <h1 style={styles.title}>Termini e Condizioni</h1>
                <p style={styles.updated}>Ultimo aggiornamento: Gennaio 2025</p>

                <section style={styles.section}>
                    <h2 style={styles.heading}>1. Accettazione dei Termini</h2>
                    <p style={styles.text}>
                        Accedendo e utilizzando i servizi di MegaPixelAI, accetti di essere vincolato dai presenti Termini e Condizioni ("Termini"). 
                        Se non accetti questi Termini, non sei autorizzato a utilizzare i nostri servizi.
                    </p>
                    <p style={styles.text}>
                        Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche saranno effettive immediatamente 
                        dopo la pubblicazione sul sito. L'uso continuato dei servizi dopo le modifiche costituisce accettazione dei nuovi Termini.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>2. Descrizione dei Servizi</h2>
                    <p style={styles.text}>
                        MegaPixelAI fornisce una piattaforma online con strumenti di elaborazione basati su intelligenza artificiale, inclusi ma non limitati a:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Rimozione sfondo da immagini</li>
                        <li style={styles.listItem}>Upscaling e miglioramento qualità immagini</li>
                        <li style={styles.listItem}>Generazione immagini da testo</li>
                        <li style={styles.listItem}>OCR (riconoscimento ottico caratteri)</li>
                        <li style={styles.listItem}>Conversione formati PDF</li>
                        <li style={styles.listItem}>Altri strumenti AI per elaborazione contenuti multimediali</li>
                    </ul>
                    <p style={styles.text}>
                        Ci riserviamo il diritto di aggiungere, modificare o rimuovere funzionalità in qualsiasi momento senza preavviso.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>3. Registrazione e Account</h2>
                    <h3 style={styles.subheading}>3.1 Piano Gratuito</h3>
                    <p style={styles.text}>
                        Non è richiesta registrazione per utilizzare il piano gratuito. Tuttavia, i servizi sono soggetti a limitazioni 
                        giornaliere e dimensioni massime dei file.
                    </p>

                    <h3 style={styles.subheading}>3.2 Account Pro/Enterprise</h3>
                    <p style={styles.text}>
                        Per piani a pagamento, devi fornire informazioni accurate e complete durante la registrazione. 
                        Sei responsabile della sicurezza delle tue credenziali e di tutte le attività che avvengono tramite il tuo account.
                    </p>
                    <p style={styles.text}>
                        Devi avere almeno 16 anni per creare un account. Gli account non possono essere trasferiti o condivisi con terzi.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>4. Uso Accettabile</h2>
                    <h3 style={styles.subheading}>4.1 Utilizzi Consentiti</h3>
                    <p style={styles.text}>
                        Puoi utilizzare i nostri servizi per scopi legali e conformi a questi Termini, inclusi uso personale, commerciale e professionale.
                    </p>

                    <h3 style={styles.subheading}>4.2 Utilizzi Proibiti</h3>
                    <p style={styles.text}>È vietato utilizzare i servizi per:</p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Caricare contenuti illegali, offensivi, diffamatori, osceni o che violino diritti di terzi</li>
                        <li style={styles.listItem}>Generare deepfake, contenuti ingannevoli o materiale con intento fraudolento</li>
                        <li style={styles.listItem}>Violare copyright, marchi registrati o altri diritti di proprietà intellettuale</li>
                        <li style={styles.listItem}>Inviare malware, virus o codice dannoso</li>
                        <li style={styles.listItem}>Tentare di hackerare, sovraccaricare o compromettere i sistemi</li>
                        <li style={styles.listItem}>Utilizzare bot, scraper o strumenti automatizzati non autorizzati</li>
                        <li style={styles.listItem}>Rivendere i servizi senza autorizzazione scritta</li>
                        <li style={styles.listItem}>Creare contenuti che violino leggi sulla privacy o protezione minori</li>
                    </ul>
                    <p style={styles.text}>
                        Ci riserviamo il diritto di sospendere o terminare immediatamente l'accesso in caso di violazione di questi divieti.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>5. Proprietà Intellettuale</h2>
                    <h3 style={styles.subheading}>5.1 Contenuti Caricati</h3>
                    <p style={styles.text}>
                        Tu mantieni tutti i diritti sui file che carichi. Garantisci di avere i diritti necessari per caricare e elaborare tali contenuti.
                        Concedi a MegaPixelAI una licenza temporanea limitata per elaborare i file esclusivamente per fornire i servizi richiesti.
                    </p>

                    <h3 style={styles.subheading}>5.2 Output Generati</h3>
                    <p style={styles.text}>
                        I risultati elaborati (immagini upscalate, sfondi rimossi, immagini generate, ecc.) sono di tua proprietà, 
                        soggetto ai diritti sui contenuti originali. Per immagini generate con AI, devi rispettare le policy delle API terze utilizzate.
                    </p>

                    <h3 style={styles.subheading}>5.3 Piattaforma e Tecnologia</h3>
                    <p style={styles.text}>
                        Tutti i diritti, titoli e interessi nella piattaforma, nel codice, negli algoritmi e nella tecnologia di MegaPixelAI 
                        sono e rimarranno di proprietà esclusiva di MegaPixelAI e dei suoi licenziatari.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>6. Pagamenti e Fatturazione</h2>
                    <h3 style={styles.subheading}>6.1 Prezzi</h3>
                    <p style={styles.text}>
                        I prezzi per piani a pagamento sono indicati sul sito e possono variare. Tutti i prezzi sono in Euro e includono IVA dove applicabile.
                    </p>

                    <h3 style={styles.subheading}>6.2 Pagamenti</h3>
                    <p style={styles.text}>
                        Accetti di pagare tutte le tariffe associate al tuo piano. I pagamenti sono processati tramite fornitori terzi sicuri (Stripe, PayPal).
                        Le sottoscrizioni si rinnovano automaticamente fino alla cancellazione.
                    </p>

                    <h3 style={styles.subheading}>6.3 Rimborsi</h3>
                    <p style={styles.text}>
                        Offriamo garanzia soddisfatti o rimborsati 30 giorni per nuove sottoscrizioni Pro. 
                        I rimborsi non sono disponibili per rinnovi o piani Enterprise personalizzati (salvo accordi specifici).
                    </p>

                    <h3 style={styles.subheading}>6.4 Cancellazione</h3>
                    <p style={styles.text}>
                        Puoi cancellare la sottoscrizione in qualsiasi momento. L'accesso continuerà fino alla fine del periodo pagato. 
                        Non emettiamo rimborsi parziali per periodi di fatturazione non utilizzati.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>7. Limitazioni di Servizio</h2>
                    <p style={styles.text}>
                        I servizi sono forniti "così come sono" senza garanzie di alcun tipo. Non garantiamo:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Disponibilità ininterrotta o esente da errori</li>
                        <li style={styles.listItem}>Risultati specifici o accuratezza al 100%</li>
                        <li style={styles.listItem}>Compatibilità con tutti i formati di file o dispositivi</li>
                        <li style={styles.listItem}>Conservazione permanente dei file elaborati</li>
                    </ul>
                    <p style={styles.text}>
                        Ci riserviamo il diritto di limitare l'uso dei servizi per garantire performance e disponibilità per tutti gli utenti.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>8. Limitazione di Responsabilità</h2>
                    <p style={styles.text}>
                        Nella massima misura consentita dalla legge, MegaPixelAI non sarà responsabile per:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>Danni indiretti, incidentali, consequenziali o punitivi</li>
                        <li style={styles.listItem}>Perdita di profitti, dati, uso o opportunità</li>
                        <li style={styles.listItem}>Interruzioni del servizio o malfunzionamenti tecnici</li>
                        <li style={styles.listItem}>Azioni di terzi o violazioni della sicurezza</li>
                        <li style={styles.listItem}>Uso improprio dei servizi o output generati</li>
                    </ul>
                    <p style={styles.text}>
                        La nostra responsabilità totale è limitata all'importo pagato per i servizi nei 12 mesi precedenti.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>9. Indennizzo</h2>
                    <p style={styles.text}>
                        Accetti di indennizzare e tenere indenne MegaPixelAI da qualsiasi reclamo, danno, perdita o spesa 
                        derivante da: (a) il tuo uso dei servizi; (b) violazione di questi Termini; (c) violazione di diritti di terzi; 
                        (d) contenuti che carichi o generi.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>10. Terminazione</h2>
                    <p style={styles.text}>
                        Possiamo sospendere o terminare il tuo accesso in qualsiasi momento se riteniamo che tu abbia violato questi Termini, 
                        senza preavviso e senza obbligo di rimborso.
                    </p>
                    <p style={styles.text}>
                        Puoi terminare il tuo account in qualsiasi momento contattandoci o cancellando la sottoscrizione dalla dashboard.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>11. Legge Applicabile e Foro Competente</h2>
                    <p style={styles.text}>
                        Questi Termini sono regolati dalla legge italiana. Qualsiasi controversia sarà di competenza esclusiva del Foro di [Città], Italia.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>12. Disposizioni Varie</h2>
                    <p style={styles.text}>
                        Se una disposizione è ritenuta invalida, le restanti rimangono in vigore. 
                        Il mancato esercizio di un diritto non costituisce rinuncia. 
                        Questi Termini costituiscono l'accordo integrale tra le parti.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>13. Contatti</h2>
                    <p style={styles.text}>
                        Per domande sui Termini e Condizioni:
                    </p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>Email:</strong> legal@megapixelai.com</li>
                        <li style={styles.listItem}><strong>Modulo contatti:</strong> <a href="/contact" style={styles.link}>megapixelai.com/contact</a></li>
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

