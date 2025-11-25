import { useState } from 'react';
import { HiClipboard, HiCheckCircle } from 'react-icons/hi';
import ProBadge from '../ProBadge';
import Link from 'next/link';

export default function TextSummarizer() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleSummarize = async () => {
        if (!text.trim()) {
            setError('Inserisci del testo da riassumere');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { getApiUrl } = await import('../../utils/getApiUrl');
            const response = await fetch(getApiUrl('/api/tools/text-summarizer'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            const text = await response.text();
            let data;
            try {
                data = text && text.trim() ? JSON.parse(text) : {};
            } catch {
                throw new Error('Risposta non valida dal server');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante il riassunto');
            }

            setResult(data.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

            <div style={styles.inputSection}>
                <label style={styles.label}>
                    Inserisci il testo da riassumere
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Incolla qui il testo lungo che vuoi riassumere..."
                    style={styles.textarea}
                    rows={10}
                />

                <button
                    onClick={handleSummarize}
                    disabled={loading || !text.trim()}
                    style={{
                        ...styles.button,
                        ...(loading || !text.trim() ? styles.buttonDisabled : {})
                    }}
                >
                    {loading ? 'Elaborazione...' : 'Riassumi Testo'}
                </button>
            </div>

            {error && (
                <div style={styles.errorBox}>
                    <p style={styles.errorText}>{error}</p>
                </div>
            )}

            {result && (
                <div style={styles.resultSection}>
                    <div style={styles.resultHeader}>
                        <h3 style={styles.resultTitle}>Riassunto</h3>
                        <button
                            onClick={handleCopy}
                            style={styles.copyButton}
                        >
                            {copied ? <HiCheckCircle style={{width: 16, height: 16}} /> : <HiClipboard style={{width: 16, height: 16}} />}
                            <span>{copied ? 'Copiato!' : 'Copia'}</span>
                        </button>
                    </div>
                    <div style={styles.resultBox}>
                        <p style={styles.resultText}>{result}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
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
    inputSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: '8px'
    },
    textarea: {
        width: '100%',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        color: '#e6eef8',
        fontSize: '15px',
        lineHeight: 1.6,
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    },
    button: {
        width: '100%',
        padding: '14px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none'
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px'
    },
    errorText: {
        color: '#ef4444',
        margin: 0
    },
    resultSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    resultHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    resultTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    copyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(51, 65, 85, 0.8)',
        border: 'none',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    resultBox: {
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
    },
    resultText: {
        color: '#e6eef8',
        fontSize: '15px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        margin: 0
    }
};
