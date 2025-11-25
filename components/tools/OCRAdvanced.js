import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFileEarmarkText, BsCloudUpload } from 'react-icons/bs';
import { HiClipboard, HiCheckCircle } from 'react-icons/hi';
import ProBadge from '../ProBadge';
import Link from 'next/link';

export default function OCRAdvanced() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const onDrop = async (acceptedFiles) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setResult('');
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleExtract = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const { getApiUrl } = await import('../../utils/getApiUrl');
            const response = await fetch(getApiUrl('/api/tools/ocr-advanced'), {
                method: 'POST',
                body: formData,
            });

            const text = await response.text();
            let data;
            try {
                data = text && text.trim() ? JSON.parse(text) : {};
            } catch {
                throw new Error('Risposta non valida dal server');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante l\'estrazione');
            }

            setResult(data.text);
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

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
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
        dropzone: {
            border: '3px dashed #ccc',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#fafafa'
        },
        dropzoneActive: {
            borderColor: '#667eea',
            background: '#f0f4ff'
        },
        uploadIcon: {
            fontSize: '64px',
            color: '#667eea',
            marginBottom: '20px'
        },
        dropzoneTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
        },
        dropzoneText: {
            fontSize: '14px',
            color: '#666'
        },
        fileInfo: {
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        },
        fileLabel: {
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px',
            display: 'block'
        },
        fileName: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        fileIcon: {
            fontSize: '24px',
            color: '#667eea'
        },
        button: {
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            marginBottom: '20px'
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        error: {
            padding: '15px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '14px'
        },
        resultSection: {
            marginTop: '20px'
        },
        resultHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
        },
        copyBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: copied ? '#10b981' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
        },
        textarea: {
            width: '100%',
            padding: '15px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6',
            resize: 'vertical',
            minHeight: '300px',
            maxHeight: '500px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            background: 'white'
        },
        resetBtn: {
            width: '100%',
            padding: '12px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '15px',
            transition: 'background 0.2s'
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

            {!file ? (
                <div
                    {...getRootProps()}
                    style={{
                        ...styles.dropzone,
                        ...(isDragActive ? styles.dropzoneActive : {})
                    }}
                >
                    <input 
                        {...getInputProps()} 
                        aria-label="Seleziona immagine da analizzare con OCR"
                        title="Seleziona immagine"
                    />
                    <BsCloudUpload style={styles.uploadIcon} />
                    <p style={styles.dropzoneTitle}>
                        {isDragActive ? 'Rilascia qui il file...' : 'Trascina qui un file o clicca per selezionare'}
                    </p>
                    <p style={styles.dropzoneText}>Supporta immagini (PNG, JPG, JPEG) e PDF</p>
                </div>
            ) : (
                <div>
                    <div style={styles.fileInfo}>
                        <span style={styles.fileLabel}>File caricato:</span>
                        <div style={styles.fileName}>
                            <BsFileEarmarkText style={styles.fileIcon} />
                            {file.name}
                        </div>
                    </div>

                    {!result && (
                        <button
                            onClick={handleExtract}
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            {loading ? 'Estrazione in corso...' : 'Estrai Testo'}
                        </button>
                    )}

                    {error && (
                        <div style={styles.error}>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div style={styles.resultSection}>
                            <div style={styles.resultHeader}>
                                <h3 style={styles.resultTitle}>Testo estratto</h3>
                                <button
                                    onClick={handleCopy}
                                    style={styles.copyBtn}
                                >
                                    {copied ? (
                                        <>
                                            <HiCheckCircle style={{ fontSize: '18px' }} />
                                            Copiato!
                                        </>
                                    ) : (
                                        <>
                                            <HiClipboard style={{ fontSize: '18px' }} />
                                            Copia
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                value={result}
                                readOnly
                                style={styles.textarea}
                            />
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setResult('');
                                    setError(null);
                                }}
                                style={styles.resetBtn}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#4b5563';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#6b7280';
                                }}
                            >
                                Carica Nuovo File
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
