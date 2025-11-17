import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const categories = [
        {
            name: 'Generale',
            questions: [
                {
                    q: 'Cos\'è MegaPixelAI?',
                    a: 'MegaPixelAI è una piattaforma all-in-one che offre oltre 15 strumenti di elaborazione basati su intelligenza artificiale, tra cui rimozione sfondo, upscaling 4K, generazione immagini, OCR, conversione PDF e molto altro. Il nostro obiettivo è rendere strumenti AI professionali accessibili a tutti.'
                },
                {
                    q: 'È davvero gratuito?',
                    a: 'Sì! Offriamo un piano gratuito generoso con 10 elaborazioni al giorno e file fino a 10 MB. Non è richiesta registrazione. Per esigenze professionali, il piano Pro offre elaborazioni illimitate e qualità premium.'
                },
                {
                    q: 'Devo registrarmi per usare i servizi?',
                    a: 'No, il piano gratuito non richiede registrazione. Puoi iniziare subito a usare gli strumenti. La registrazione è richiesta solo per piani Pro/Enterprise per gestire abbonamenti e preferenze.'
                },
                {
                    q: 'Quali formati di file supportate?',
                    a: 'Supportiamo i formati più comuni: immagini (JPG, PNG, WEBP, GIF), PDF, DOCX per documenti, e MP3/WAV per audio. Ogni strumento specifica i formati accettati.'
                }
            ]
        },
        {
            name: 'Sicurezza e Privacy',
            questions: [
                {
                    q: 'I miei file sono al sicuro?',
                    a: 'Assolutamente. Usiamo crittografia SSL/TLS per tutte le trasmissioni. I file vengono elaborati su server sicuri e cancellati automaticamente dopo 24 ore. Non condividiamo mai i tuoi dati con terze parti per scopi commerciali.'
                },
                {
                    q: 'Cosa succede ai file che carico?',
                    a: 'I file caricati vengono elaborati immediatamente e conservati temporaneamente per permetterti di scaricare i risultati. Dopo 24 ore, tutti i file (originali e elaborati) vengono cancellati definitivamente dai nostri server.'
                },
                {
                    q: 'Conservate i miei dati personali?',
                    a: 'Per utenti del piano gratuito senza registrazione, non conserviamo alcun dato personale. Per utenti Pro, conserviamo solo email e dati di fatturazione necessari per il servizio, in conformità con il GDPR.'
                },
                {
                    q: 'Siete conformi al GDPR?',
                    a: 'Sì, rispettiamo pienamente il GDPR. Hai diritto di accesso, rettifica, cancellazione e portabilità dei tuoi dati. Consulta la nostra Privacy Policy per dettagli completi.'
                }
            ]
        },
        {
            name: 'Strumenti e Funzionalità',
            questions: [
                {
                    q: 'Come funziona la rimozione sfondo AI?',
                    a: 'Il nostro algoritmo AI analizza automaticamente l\'immagine, identifica il soggetto principale e rimuove lo sfondo con precisione pixel-perfetta. Puoi regolare parametri come margine, dimensione output e tipo di ritaglio. Supporta anche preset per ritratti, prodotti e documenti.'
                },
                {
                    q: 'Qual è la qualità dell\'upscaling?',
                    a: 'Il nostro upscaler usa algoritmi Lanczos3 con sharpening adattivo per ingrandire immagini fino a 4K mantenendo nitidezza e dettagli. Il piano Pro offre qualità premium con meno artefatti e colori più accurati.'
                },
                {
                    q: 'Posso generare immagini commerciali con l\'AI?',
                    a: 'Sì, le immagini generate sono di tua proprietà e puoi usarle per scopi commerciali. Tuttavia, rispetta le policy dell\'API sottostante (Pollinations.ai) riguardo contenuti vietati (violenza, nudità, copyright).'
                },
                {
                    q: 'L\'OCR funziona con tutte le lingue?',
                    a: 'Supportiamo oltre 100 lingue, incluse italiano, inglese, francese, spagnolo, tedesco, cinese, arabo e molte altre. L\'OCR può estrarre testo da documenti scansionati, foto e screenshot con alta accuratezza.'
                }
            ]
        },
        {
            name: 'Piani e Pagamenti',
            questions: [
                {
                    q: 'Quali sono le differenze tra Free e Pro?',
                    a: 'Il piano Free include 10 elaborazioni al giorno, file fino a 10 MB, qualità standard e watermark. Il piano Pro offre elaborazioni illimitate, file fino a 100 MB, qualità 4K premium, nessun watermark, priorità nella coda, API access e supporto prioritario.'
                },
                {
                    q: 'Posso provare il piano Pro gratuitamente?',
                    a: 'Sì! Offriamo 7 giorni di prova gratuita del piano Pro, senza richiedere carta di credito. Puoi testare tutte le funzionalità premium senza impegno.'
                },
                {
                    q: 'Come funziona la fatturazione?',
                    a: 'Il piano Pro costa €19/mese con rinnovo automatico. Puoi pagare con carta di credito (Visa, Mastercard, American Express) o PayPal. Puoi cancellare in qualsiasi momento e l\'accesso continuerà fino alla fine del periodo pagato.'
                },
                {
                    q: 'Offrite rimborsi?',
                    a: 'Sì, garantiamo soddisfatti o rimborsati 30 giorni per nuove sottoscrizioni Pro. Se non sei soddisfatto, contattaci e ti rimborseremo integralmente.'
                },
                {
                    q: 'Cosa include il piano Enterprise?',
                    a: 'Il piano Enterprise include tutto di Pro, plus infrastruttura dedicata, SLA 99.99%, white label, account manager dedicato, training personalizzato, integrazione custom e fatturazione su misura. Contattaci per un preventivo.'
                }
            ]
        },
        {
            name: 'Supporto Tecnico',
            questions: [
                {
                    q: 'L\'elaborazione fallisce, cosa faccio?',
                    a: 'Verifica che il file sia nel formato corretto e non superi i limiti di dimensione. Se il problema persiste, prova a ridurre la qualità/dimensione del file. Per supporto, contattaci con dettagli sull\'errore.'
                },
                {
                    q: 'Perché l\'elaborazione è lenta?',
                    a: 'I tempi dipendono dalla complessità del file e dal carico del server. Utenti Pro hanno priorità nella coda. Durante picchi di traffico, l\'elaborazione potrebbe richiedere qualche secondo in più.'
                },
                {
                    q: 'Posso elaborare più file contemporaneamente?',
                    a: 'Sì, alcuni strumenti supportano batch processing. Carica più file e verranno elaborati sequenzialmente. Il piano Pro consente batch più grandi (fino a 50 file).'
                },
                {
                    q: 'Come posso segnalare un bug?',
                    a: 'Usa il modulo contatti selezionando "Supporto Tecnico" e descrivi il problema con dettagli (browser, tipo file, messaggio errore). Apprezziamo molto i report degli utenti per migliorare il servizio.'
                },
                {
                    q: 'Avete API per sviluppatori?',
                    a: 'Sì, il piano Pro include accesso alle nostre API REST con documentazione completa. Puoi integrare i nostri strumenti nelle tue applicazioni. Contattaci per dettagli tecnici.'
                }
            ]
        }
    ];

    const toggleQuestion = (categoryIndex, questionIndex) => {
        const index = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div style={styles.pageWrap}>
            <SEOHead
                title="FAQ - Domande Frequenti su MegaPixelAI"
                description="Trova risposte alle domande più comuni su MegaPixelAI: funzionalità, sicurezza, piani, pagamenti, supporto tecnico e molto altro."
                canonical="/faq"
                keywords={['faq', 'domande frequenti', 'aiuto', 'supporto', 'guida']}
            />
            <Navbar />

            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>
                    Domande <span style={styles.gradient}>Frequenti</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    Trova risposte rapide alle domande più comuni. Non trovi quello che cerchi? <a href="/contact" style={styles.link}>Contattaci</a>
                </p>
            </section>

            <section style={styles.content}>
                {categories.map((category, catIndex) => (
                    <div key={catIndex} style={styles.category}>
                        <h2 style={styles.categoryTitle}>{category.name}</h2>
                        <div style={styles.questionsContainer}>
                            {category.questions.map((item, qIndex) => {
                                const index = `${catIndex}-${qIndex}`;
                                const isOpen = openIndex === index;
                                return (
                                    <div key={qIndex} style={styles.questionCard}>
                                        <button
                                            onClick={() => toggleQuestion(catIndex, qIndex)}
                                            style={styles.questionButton}
                                        >
                                            <span style={styles.questionText}>{item.q}</span>
                                            <HiChevronDown
                                                style={{
                                                    ...styles.chevron,
                                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                                }}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div style={styles.answerContainer}>
                                                <p style={styles.answerText}>{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            <section style={styles.cta}>
                <h2 style={styles.ctaTitle}>Non hai trovato la risposta?</h2>
                <p style={styles.ctaText}>Siamo qui per aiutarti. Contattaci e ti risponderemo entro 24 ore.</p>
                <a href="/contact" style={styles.ctaButton}>Contattaci</a>
            </section>
        </div>
    );
}

const styles = {
    pageWrap: { minHeight: '100vh', background: '#0a0e1a', color: '#e6eef8' },
    hero: { maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' },
    heroTitle: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: '0 0 20px', letterSpacing: '-0.02em' },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    heroSubtitle: { fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
    link: { color: '#667eea', textDecoration: 'underline', fontWeight: '600' },
    content: { maxWidth: '900px', margin: '0 auto', padding: '60px 24px' },
    category: { marginBottom: '60px' },
    categoryTitle: { fontSize: '28px', fontWeight: '800', margin: '0 0 24px', color: '#e2e8f0', paddingBottom: '12px', borderBottom: '2px solid rgba(102, 126, 234, 0.3)' },
    questionsContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    questionCard: { background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' },
    questionButton: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' },
    questionText: { fontSize: '17px', fontWeight: '700', color: '#cbd5e1', flex: 1, paddingRight: '16px' },
    chevron: { width: 24, height: 24, color: '#667eea', transition: 'transform 0.3s', flexShrink: 0 },
    answerContainer: { padding: '0 24px 20px 24px', borderTop: '1px solid rgba(102, 126, 234, 0.1)' },
    answerText: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.8', margin: '16px 0 0' },
    cta: { maxWidth: '700px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' },
    ctaTitle: { fontSize: '32px', fontWeight: '800', margin: '0 0 16px', color: '#e2e8f0' },
    ctaText: { fontSize: '18px', color: '#94a3b8', marginBottom: '32px' },
    ctaButton: { display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#ffffff', fontSize: '18px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s' }
};
