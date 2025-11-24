import { useState } from 'react';
import { HiSparkles, HiDownload, HiLightningBolt } from 'react-icons/hi';
import ExportModal from '../ExportModal';
import { LoadingOverlay, ProgressBar } from '../Loading';
import { showToast, updateToast } from '../Toast';
import { saveToHistory } from '../../utils/history';
import ProBadge from '../ProBadge';
import Link from 'next/link';

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aspect, setAspect] = useState('1:1');
    const [detail, setDetail] = useState(1);
    const [realism, setRealism] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showExportModal, setShowExportModal] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            showToast('Inserisci una descrizione', 'error', 4000, {
                details: 'Il campo prompt è obbligatorio per la generazione',
                technical: 'Status: Empty prompt validation failed'
            });
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);

        const startTime = Date.now();
        const promptLength = prompt.length;
        const wordCount = prompt.trim().split(/\s+/).length;
        
        const toastId = showToast('Generazione immagine AI in corso...', 'progress', 0, {
            progress: 0,
            details: `Prompt: ${wordCount} parole • Rapporto: ${aspect} • Dettaglio: ${detail.toFixed(1)}x`,
            technical: `Model: AI Image Generator • Realism: ${realism ? 'Enabled' : 'Disabled'} • Prompt Length: ${promptLength} chars`
        });

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = Math.min(prev + 8, 90);
                updateToast(toastId, { 
                    progress: newProgress,
                    message: newProgress < 40 ? 'Elaborazione prompt...' : newProgress < 80 ? 'Generazione immagine...' : 'Finalizzazione...'
                });
                return newProgress;
            });
        }, 150);

        try {
            const response = await fetch('/api/tools/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, aspect, detail, realism }),
            });

            clearInterval(progressInterval);
            setProgress(95);
            updateToast(toastId, { progress: 95, message: 'Elaborazione finale...' });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    let errorMessage = 'Errore durante la generazione';
                    try {
                        if (text && text.trim()) {
                            const errorData = JSON.parse(text);
                            errorMessage = errorData.error || errorMessage;
                        }
                    } catch {}
                    throw new Error(errorMessage);
                } else {
                    throw new Error(`Errore HTTP ${response.status}`);
                }
            }

            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Immagine vuota ricevuta');
            }
            
            const url = URL.createObjectURL(blob);
            setResult(url);
            setProgress(100);

            const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const imageSize = (blob.size / 1024 / 1024).toFixed(2);

            // Save to history
            saveToHistory({
                tool: 'Generazione Immagini AI',
                filename: `generated_${Date.now()}_4k.jpg`,
                thumbnail: url,
                params: { prompt, aspect, detail, realism },
                result: url
            });

            updateToast(toastId, {
                type: 'success',
                message: 'Immagine generata con successo!',
                progress: 100,
                details: `Tempo generazione: ${generationTime}s • Dimensione: ${imageSize} MB • Risoluzione: ${aspect}`,
                technical: `AI Model: Image Generation • Quality: 4K • Format: JPEG • Compression: ${((blob.size / (4096 * 4096 * 3)) * 100).toFixed(1)}%`
            });
        } catch (err) {
            console.error('Generation error:', err);
            setError(err.message);
            updateToast(toastId, {
                type: 'error',
                message: err.message,
                details: 'Errore durante la generazione dell\'immagine',
                technical: `Error: ${err.message} • Status: ${err.message.includes('HTTP') ? 'Network Error' : 'Generation Failed'}`
            });
            clearInterval(progressInterval);
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        setShowExportModal(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey && !loading && prompt.trim()) {
            handleGenerate();
        }
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

            {loading && (
                <LoadingOverlay message={`Generazione in corso... ${Math.round(progress)}%`} />
            )}

            {showExportModal && result && (
                <ExportModal
                    imageData={result}
                    filename={`generated_${Date.now()}_4k`}
                    onClose={() => setShowExportModal(false)}
                />
            )}

            <div style={styles.card}>
                <div style={styles.inputSection}>
                    <label style={styles.label}>
                        <HiSparkles style={{ width: 16, height: 16 }} />
                        Descrivi l'immagine che vuoi creare
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Es: Un paesaggio montano al tramonto con un lago cristallino, stile fotografico realistico..."
                        style={styles.textarea}
                        rows={4}
                        disabled={loading}
                    />
                    <p style={styles.hint}>
                        💡 Suggerimento: Sii dettagliato! Specifica colori, stile, atmosfera e dettagli per risultati migliori.
                    </p>
                </div>

                <div style={styles.controlsRow}>
                    <div style={styles.controlGroup}>
                        <label style={styles.smallLabel}>Rapporto</label>
                        <select
                            value={aspect}
                            onChange={(e) => setAspect(e.target.value)}
                            style={styles.select}
                            disabled={loading}
                        >
                            <option value="1:1">1 : 1 (Quadrato)</option>
                            <option value="16:9">16 : 9 (Wide)</option>
                            <option value="9:16">9 : 16 (Verticale)</option>
                            <option value="4:3">4 : 3 (Classico)</option>
                            <option value="3:4">3 : 4 (Verticale)</option>
                        </select>
                    </div>

                    <div style={styles.controlGroup}>
                        <label style={styles.smallLabel}>Dettaglio</label>
                        <input
                            type="range"
                            min={0.6}
                            max={1.4}
                            step={0.1}
                            value={detail}
                            onChange={(e) => setDetail(Number(e.target.value))}
                            style={styles.slider}
                            disabled={loading}
                        />
                        <div style={styles.sliderMarks}>
                            <span>Basso</span><span>Alto</span>
                        </div>
                    </div>

                    <div style={styles.controlGroupToggle}>
                        <label style={styles.smallLabel}>Realismo</label>
                        <button
                            type="button"
                            onClick={() => setRealism(v => !v)}
                            disabled={loading}
                            style={{
                                ...styles.toggle,
                                background: realism ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'rgba(148,163,184,0.2)'
                            }}
                        >
                            {realism ? 'Attivo' : 'Off'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    style={{
                        ...styles.button,
                        ...(loading || !prompt.trim() ? styles.buttonDisabled : {})
                    }}
                    onMouseEnter={(e) => {
                        if (!loading && prompt.trim()) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
                    }}
                >
                    <HiSparkles style={{ width: 20, height: 20 }} />
                    {loading ? 'Generazione in corso...' : 'Genera Immagine'}
                </button>

                {loading && (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>
                            Generazione procedurale in corso - Immagine 4K ({aspect})...<br/>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Elaborazione locale avanzata — può richiedere 20-40 secondi</span>
                        </p>
                    </div>
                )}

                {error && (
                    <div style={styles.errorBox}>
                        <p style={styles.errorText}>❌ {error}</p>
                    </div>
                )}

                {result && (
                    <div style={styles.resultSection}>
                        <h3 style={styles.resultTitle}>✨ Immagine Generata</h3>
                        <div style={styles.imageContainer}>
                            <img src={result} alt="Generated" style={styles.image} />
                        </div>
                        <button
                            onClick={handleDownload}
                            style={styles.downloadButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(67, 233, 123, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(67, 233, 123, 0.3)';
                            }}
                        >
                            <HiDownload style={{ width: 20, height: 20 }} />
                            Scarica Immagine
                        </button>
                    </div>
                )}
            </div>

            <div style={styles.examples}>
                <h3 style={styles.examplesTitle}>💡 Esempi di prompt efficaci:</h3>
                <div style={styles.exampleGrid}>
                    {[
                        'Un gatto astronauta nello spazio profondo, stile fotorealistico, illuminazione cinematografica',
                        'Paesaggio fantasy con castello medievale su una montagna, tramonto dorato, arte digitale dettagliata',
                        'Ritratto di un robot futuristico, stile cyberpunk, neon blu e viola, altamente dettagliato',
                        'Una città sott\'acqua con architettura moderna, raggi di luce dall\'alto, atmosfera serena'
                    ].map((example, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPrompt(example)}
                            style={styles.exampleButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                            }}
                            disabled={loading}
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px'
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
    card: {
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        marginBottom: '32px'
    },
    inputSection: {
        marginBottom: '24px'
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: '12px'
    },
    textarea: {
        width: '100%',
        padding: '16px',
        background: 'rgba(10, 14, 26, 0.6)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        color: '#e2e8f0',
        fontSize: '15px',
        fontFamily: 'inherit',
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s, background 0.2s',
        lineHeight: '1.6'
    },
    hint: {
        fontSize: '13px',
        color: '#64748b',
        marginTop: '8px',
        marginBottom: 0
    },
    button: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none !important',
        boxShadow: 'none !important'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px',
        marginTop: '24px',
        background: 'rgba(102, 126, 234, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(102, 126, 234, 0.2)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        color: '#cbd5e1',
        textAlign: 'center',
        margin: 0,
        fontSize: '16px',
        fontWeight: '500'
    },
    errorBox: {
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px'
    },
    errorText: {
        color: '#f87171',
        margin: 0,
        fontSize: '14px'
    },
    resultSection: {
        marginTop: '32px',
        animation: 'fadeIn 0.5s ease-out'
    },
    resultTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: '16px',
        textAlign: 'center'
    },
    imageContainer: {
        border: '2px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
        background: '#000'
    },
    image: {
        width: '100%',
        display: 'block',
        height: 'auto'
    },
    downloadButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)'
    },
    examples: {
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        borderRadius: '16px',
        padding: '24px'
    },
    controlsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
    },
    controlGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(10, 14, 26, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        borderRadius: '12px',
        padding: '12px'
    },
    controlGroupToggle: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px',
        background: 'rgba(10, 14, 26, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        borderRadius: '12px',
        padding: '12px'
    },
    smallLabel: {
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: 600
    },
    select: {
        background: 'rgba(15, 23, 42, 0.7)',
        color: '#e2e8f0',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '10px',
        padding: '10px 12px',
        fontSize: '14px',
        outline: 'none'
    },
    slider: {
        WebkitAppearance: 'none',
        width: '100%'
    },
    sliderMarks: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
    },
    toggle: {
        border: 'none',
        color: '#0b1220',
        fontWeight: 700,
        borderRadius: '10px',
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 6px 14px rgba(56, 249, 215, 0.25)'
    },
    examplesTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#cbd5e1',
        marginBottom: '16px',
        marginTop: 0
    },
    exampleGrid: {
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
    },
    exampleButton: {
        padding: '14px 16px',
        background: 'rgba(102, 126, 234, 0.08)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '10px',
        color: '#94a3b8',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s',
        lineHeight: '1.5'
    }
};
