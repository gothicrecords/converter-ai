import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsTranslate, BsCloudUpload, BsDownload, BsX, BsFileText } from 'react-icons/bs';
import { HiCheckCircle } from 'react-icons/hi';
import ProBadge from '../ProBadge';
import Link from 'next/link';

export default function DocumentTranslator() {
    const [document, setDocument] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [preserveFormatting, setPreserveFormatting] = useState(true);

    const languages = [
        { code: 'en', name: 'Inglese' },
        { code: 'es', name: 'Spagnolo' },
        { code: 'fr', name: 'Francese' },
        { code: 'de', name: 'Tedesco' },
        { code: 'it', name: 'Italiano' },
        { code: 'pt', name: 'Portoghese' },
        { code: 'ru', name: 'Russo' },
        { code: 'zh', name: 'Cinese' },
        { code: 'ja', name: 'Giapponese' },
        { code: 'ko', name: 'Coreano' },
        { code: 'ar', name: 'Arabo' },
        { code: 'hi', name: 'Hindi' },
    ];

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setDocument(file);
        setResult(null);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
        },
        maxFiles: 1,
    });

    const handleTranslate = async () => {
        if (!document) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('document', document);
            formData.append('targetLanguage', targetLanguage);
            formData.append('preserveFormatting', preserveFormatting.toString());

            const { getApiUrl } = await import('../../utils/getApiUrl');
            const response = await fetch(getApiUrl('/api/tools/translate-document'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Prova a leggere come JSON, altrimenti usa il testo
                let errorMessage = 'Errore durante la traduzione';
                let errorData = null;
                
                try {
                    const text = await response.text();
                    if (text && text.trim()) {
                        errorData = JSON.parse(text);
                        errorMessage = errorData.error || errorMessage;
                    }
                } catch (jsonError) {
                    // Se non è JSON, prova a leggere come testo
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            errorMessage = errorText;
                        } else {
                            errorMessage = `Errore ${response.status}: ${response.statusText || 'Errore del server'}`;
                        }
                    } catch (textError) {
                        errorMessage = `Errore ${response.status}: ${response.statusText || 'Errore del server'}`;
                    }
                }
                
                // Se è un errore di limite, mostra messaggio di upgrade
                if (errorData && errorData.requiresPro) {
                    const limitError = new Error(errorMessage);
                    limitError.isLimitError = true;
                    limitError.upgradeMessage = errorData.upgradeMessage || 'Passa a PRO per utilizzare questo tool senza limiti!';
                    limitError.limitType = errorData.limitType;
                    limitError.current = errorData.current;
                    limitError.max = errorData.max;
                    throw limitError;
                }
                
                throw new Error(errorMessage);
            }

            // Verifica che la risposta sia un blob valido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/') && !contentType.includes('text/')) {
                throw new Error('Risposta del server non valida. Il documento potrebbe non essere stato tradotto correttamente.');
            }

            const blob = await response.blob();
            
            // Verifica che il blob non sia vuoto
            if (blob.size === 0) {
                throw new Error('Il documento tradotto è vuoto. Riprova con un file diverso.');
            }
            
            const url = URL.createObjectURL(blob);
            
            // Determina il nome del file in base al tipo originale
            const ext = document.name.split('.').pop();
            const filename = `translated_${targetLanguage}_${document.name}`;
            
            setResult({ url, filename });
        } catch (err) {
            console.error('Errore traduzione:', err);
            setError(err.message || 'Errore sconosciuto durante la traduzione. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setDocument(null);
        setResult(null);
        setError(null);
    };

    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px'
        },
        dropzone: {
            border: '3px dashed rgba(148, 163, 184, 0.3)',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(15, 23, 42, 0.4)'
        },
        dropzoneActive: {
            border: '3px dashed #667eea',
            background: 'rgba(102, 126, 234, 0.1)'
        },
        uploadIcon: {
            fontSize: '64px',
            color: '#667eea',
            marginBottom: '20px'
        },
        dropzoneText: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#e6eef8',
            margin: '10px 0'
        },
        dropzoneSubtext: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: '5px 0'
        },
        optionsSection: {
            marginTop: '30px',
            marginBottom: '20px'
        },
        optionGroup: {
            marginBottom: '24px'
        },
        optionLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '12px'
        },
        languageSelect: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#e6eef8',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        checkboxContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        checkbox: {
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            accentColor: '#667eea'
        },
        checkboxLabel: {
            color: '#e6eef8',
            fontSize: '14px',
            cursor: 'pointer',
            margin: 0
        },
        fileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            marginTop: '20px',
            marginBottom: '20px'
        },
        fileIcon: {
            fontSize: '32px',
            color: '#667eea'
        },
        fileDetails: {
            flex: 1
        },
        fileName: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#e6eef8',
            margin: 0,
            marginBottom: '4px'
        },
        fileSize: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
        },
        actionsRow: {
            display: 'flex',
            gap: '12px',
            marginTop: '30px',
            flexWrap: 'wrap'
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            minWidth: '140px'
        },
        buttonPrimary: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        },
        buttonSuccess: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        },
        buttonSecondary: {
            background: 'rgba(51, 65, 85, 0.8)',
            color: '#cbd5e1'
        },
        buttonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        errorBox: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px'
        },
        errorText: {
            color: '#ef4444',
            margin: 0
        },
        resultBox: {
            marginTop: '30px',
            padding: '25px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            textAlign: 'center'
        },
        successIcon: {
            fontSize: '48px',
            color: '#10b981',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#e6eef8',
            marginBottom: '20px'
        },
        resultInfo: {
            fontSize: '14px',
            color: '#94a3b8',
            marginBottom: '20px'
        },
        proInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
        },
        proInfoText: {
            fontSize: '13px',
            color: '#cbd5e1',
            margin: 0,
            flex: 1,
            lineHeight: '1.6',
        },
        proLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '8px',
            transition: 'color 0.2s',
        },
    };

    return (
        <div style={styles.container}>
            {/* Badge PRO e info limiti */}
            <div style={styles.proInfo}>
                <ProBadge size="medium" />
                <p style={styles.proInfoText}>
                    <strong>Piano Gratuito:</strong> 5 documenti/giorno • 
                    <Link href="/pricing" style={styles.proLink}>
                        <strong>Passa a PRO</strong>
                    </Link> per utilizzi illimitati
                </p>
            </div>

            {!document ? (
                <div
                    {...getRootProps()}
                    style={{
                        ...styles.dropzone,
                        ...(isDragActive ? styles.dropzoneActive : {})
                    }}
                    role="button"
                    aria-label="Area di caricamento documento. Trascina un file qui o clicca per selezionare"
                    tabIndex={0}
                >
                    <input 
                        {...getInputProps()} 
                        aria-label="Seleziona documento da tradurre (PDF, DOC, DOCX, TXT, MD)"
                        title="Seleziona documento da tradurre"
                    />
                    <BsTranslate style={styles.uploadIcon} />
                    <p style={styles.dropzoneText}>
                        {isDragActive ? 'Rilascia qui...' : 'Carica un documento'}
                    </p>
                    <p style={styles.dropzoneSubtext}>
                        PDF, DOC, DOCX, TXT, MD
                    </p>
                </div>
            ) : (
                <>
                    <div style={styles.optionsSection}>
                        <div style={styles.optionGroup}>
                            <label htmlFor="targetLanguage" style={styles.optionLabel}>Lingua di destinazione</label>
                            <select
                                id="targetLanguage"
                                name="targetLanguage"
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                style={styles.languageSelect}
                                aria-label="Seleziona lingua di destinazione"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.optionGroup}>
                            <div
                                style={styles.checkboxContainer}
                                onClick={() => setPreserveFormatting(!preserveFormatting)}
                            >
                                <input
                                    id="preserveFormatting"
                                    name="preserveFormatting"
                                    type="checkbox"
                                    checked={preserveFormatting}
                                    onChange={(e) => setPreserveFormatting(e.target.checked)}
                                    style={styles.checkbox}
                                    aria-label="Mantieni la formattazione originale"
                                />
                                <label htmlFor="preserveFormatting" style={styles.checkboxLabel}>
                                    Mantieni la formattazione originale
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={styles.fileInfo}>
                        <BsFileText style={styles.fileIcon} />
                        <div style={styles.fileDetails}>
                            <p style={styles.fileName}>{document.name}</p>
                            <p style={styles.fileSize}>
                                {(document.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                        <button
                            onClick={handleReset}
                            aria-label="Rimuovi documento"
                            title="Rimuovi documento"
                            style={{
                                padding: '8px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#ef4444'
                            }}
                        >
                            <BsX style={{width: 20, height: 20}} />
                        </button>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <p style={styles.errorText}>
                                {error.split('\n').map((line, index) => (
                                    <span key={index}>
                                        {line}
                                        {index < error.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                            
                            {/* Messaggio di upgrade per limiti */}
                            {error.includes('limite') || error.includes('Limite') || error.includes('raggiunto') ? (
                                <div style={{ marginTop: '15px' }}>
                                    <div style={{ 
                                        padding: '16px', 
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', 
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: '12px', 
                                        marginBottom: '12px' 
                                    }}>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#cbd5e1', fontWeight: '600' }}>
                                            🚀 Passa a PRO per utilizzare questo tool senza limiti!
                                        </p>
                                        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8' }}>
                                            Con PRO ottieni utilizzi illimitati, file più grandi e funzionalità avanzate.
                                        </p>
                                        <Link href="/pricing" style={{
                                            display: 'inline-block',
                                            padding: '10px 20px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            transition: 'transform 0.2s',
                                        }}>
                                            Vedi Piani PRO →
                                        </Link>
                                    </div>
                                </div>
                            ) : (error.includes('limite di richieste') || error.includes('rate')) && (
                                <div style={{ marginTop: '15px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginBottom: '12px' }}>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#93c5fd' }}>
                                            💡 <strong>Suggerimento:</strong> Se il PDF contiene testo nativo (non scansionato), 
                                            prova a convertirlo in DOCX o TXT usando il tool di conversione, poi traduci il file convertito.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleTranslate}
                                        disabled={loading}
                                        style={{
                                            ...styles.button,
                                            ...styles.buttonPrimary,
                                            ...(loading ? styles.buttonDisabled : {}),
                                            width: '100%',
                                            marginTop: '10px'
                                        }}
                                    >
                                        {loading ? 'Riprova in corso...' : '🔄 Riprova Traduzione'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {!result && (
                        <div style={styles.actionsRow}>
                            <button
                                onClick={handleTranslate}
                                disabled={loading}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    ...(loading ? styles.buttonDisabled : {})
                                }}
                            >
                                {loading ? 'Traduzione in corso...' : 'Traduci Documento'}
                            </button>
                            <button
                                onClick={handleReset}
                                style={{...styles.button, ...styles.buttonSecondary}}
                            >
                                <BsX style={{width: 20, height: 20}} />
                                <span>Reset</span>
                            </button>
                        </div>
                    )}

                    {result && (
                        <div style={styles.resultBox}>
                            <HiCheckCircle style={styles.successIcon} />
                            <h3 style={styles.resultTitle}>Documento tradotto con successo!</h3>
                            <p style={styles.resultInfo}>
                                Traduzione in <strong>{languages.find(l => l.code === targetLanguage)?.name}</strong> completata
                            </p>
                            <div style={styles.actionsRow}>
                                <button
                                    onClick={handleDownload}
                                    style={{...styles.button, ...styles.buttonSuccess}}
                                >
                                    <BsDownload style={{width: 20, height: 20}} />
                                    <span>Scarica Documento</span>
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{...styles.button, ...styles.buttonSecondary}}
                                >
                                    <BsX style={{width: 20, height: 20}} />
                                    <span>Nuovo Documento</span>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

