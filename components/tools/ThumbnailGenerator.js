import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiDownload, HiX } from 'react-icons/hi';
import ProBadge from '../ProBadge';
import Link from 'next/link';

export default function ThumbnailGenerator() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [size, setSize] = useState('1280x720');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sizes = [
        { id: '1280x720', name: 'YouTube (1280x720)' },
        { id: '1200x630', name: 'Facebook (1200x630)' },
        { id: '1080x1080', name: 'Instagram (1080x1080)' },
        { id: '1200x675', name: 'Twitter (1200x675)' },
    ];

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1,
    });

    const handleGenerate = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('size', size);

            const { getApiUrl } = await import('../../utils/getApiUrl');
            const apiUrl = await getApiUrl('/api/tools/thumbnail-generator');
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Errore nella generazione thumbnail';
                try {
                    const text = await response.text();
                    if (text && text.trim()) {
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.error || errorMessage;
                    }
                } catch {}
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setResult(url);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const a = document.createElement('a');
        a.href = result;
        a.download = `thumbnail_${size}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setError(null);
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

            {!preview ? (
                <div
                    {...getRootProps()}
                    style={{
                        ...styles.dropzone,
                        ...(isDragActive ? styles.dropzoneActive : {})
                    }}
                >
                    <input 
                        {...getInputProps()} 
                        aria-label="Seleziona immagine per generare thumbnail"
                        title="Seleziona immagine"
                    />
                    <HiUpload style={styles.uploadIcon} />
                    <p style={styles.dropzoneTitle}>
                        {isDragActive ? 'Rilascia qui...' : 'Carica un\'immagine'}
                    </p>
                    <p style={styles.dropzoneSubtitle}>PNG, JPG, JPEG o WEBP</p>
                </div>
            ) : (
                <div style={styles.editorSection}>
                    <div style={styles.sizeSelector}>
                        <h3 style={styles.sectionTitle}>Dimensione thumbnail</h3>
                        <div style={styles.sizesGrid}>
                            {sizes.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSize(s.id)}
                                    style={{
                                        ...styles.sizeButton,
                                        ...(size === s.id ? styles.sizeButtonActive : {})
                                    }}
                                >
                                    <p style={styles.sizeButtonText}>{s.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.imagesGrid}>
                        <div style={styles.imageBox}>
                            <h3 style={styles.imageTitle}>Originale</h3>
                            <div style={styles.imageContainer}>
                                <img
                                    src={preview}
                                    alt="Original"
                                    style={styles.image}
                                />
                            </div>
                        </div>
                        {result && (
                            <div style={styles.imageBox}>
                                <h3 style={styles.imageTitle}>Thumbnail</h3>
                                <div style={styles.imageContainer}>
                                    <img
                                        src={result}
                                        alt="Result"
                                        style={styles.image}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <p style={styles.errorText}>{error}</p>
                        </div>
                    )}

                    <div style={styles.actionsRow}>
                        {!result && (
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    ...(loading ? styles.buttonDisabled : {})
                                }}
                            >
                                {loading ? 'Generazione...' : 'Genera Thumbnail'}
                            </button>
                        )}
                        {result && (
                            <button
                                onClick={handleDownload}
                                style={{...styles.button, ...styles.buttonSuccess}}
                            >
                                <HiDownload style={{width: 20, height: 20}} />
                                <span>Scarica</span>
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            style={{...styles.button, ...styles.buttonSecondary}}
                        >
                            <HiX style={{width: 20, height: 20}} />
                            <span>Reset</span>
                        </button>
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
    dropzone: {
        border: '2px dashed rgba(148, 163, 184, 0.3)',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        background: 'rgba(15, 23, 42, 0.4)'
    },
    dropzoneActive: {
        borderColor: '#667eea',
        background: 'rgba(102, 126, 234, 0.1)'
    },
    uploadIcon: {
        width: '64px',
        height: '64px',
        margin: '0 auto 16px',
        color: '#94a3b8'
    },
    dropzoneTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#e6eef8',
        margin: '0 0 8px'
    },
    dropzoneSubtitle: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0
    },
    editorSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    sizeSelector: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    sizesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
    },
    sizeButton: {
        padding: '12px 16px',
        borderRadius: '12px',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        background: 'rgba(15, 23, 42, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left'
    },
    sizeButtonActive: {
        borderColor: '#667eea',
        background: 'rgba(102, 126, 234, 0.1)'
    },
    sizeButtonText: {
        color: '#e6eef8',
        fontWeight: 500,
        margin: 0,
        fontSize: '14px'
    },
    imagesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    },
    imageBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    imageTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#94a3b8',
        margin: 0
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(148, 163, 184, 0.2)',
        background: 'rgba(15, 23, 42, 0.4)'
    },
    image: {
        width: '100%',
        height: 'auto',
        maxHeight: '400px',
        objectFit: 'contain',
        display: 'block'
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
    actionsRow: {
        display: 'flex',
        gap: '12px',
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
    }
};
