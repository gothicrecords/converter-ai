import { useState } from 'react';
import { HiX, HiDownload } from 'react-icons/hi';

export default function ExportModal({ imageData, filename, onClose }) {
    const [format, setFormat] = useState('png');
    const [quality, setQuality] = useState(90);
    const [isConverting, setIsConverting] = useState(false);

    const handleExport = async () => {
        setIsConverting(true);
        try {
            // Convert image to selected format
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Necessario per immagini esterne (CORS)
            img.src = imageData;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Convert to blob with quality
            const mimeType = format === 'png' ? 'image/png' :
                format === 'jpg' ? 'image/jpeg' : 'image/webp';

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename.replace(/\.[^/.]+$/, '')}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setIsConverting(false);
                onClose();
            }, mimeType, quality / 100);

        } catch (error) {
            console.error('Export error:', error);
            setIsConverting(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Esporta Immagine</h3>
                    <button onClick={onClose} style={styles.closeBtn} aria-label="Chiudi">
                        <HiX style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <div style={styles.content}>
                    <div style={styles.section}>
                        <label style={styles.label}>Formato</label>
                        <div style={styles.formatGrid}>
                            {['png', 'jpg', 'webp'].map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt)}
                                    style={{
                                        ...styles.formatBtn,
                                        background: format === fmt ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)',
                                        borderColor: format === fmt ? '#667eea' : 'rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {format !== 'png' && (
                        <div style={styles.section}>
                            <label style={styles.label}>
                                Qualità: {quality}%
                            </label>
                            <input
                                type="range"
                                min="60"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                style={styles.slider}
                            />
                            <div style={styles.qualityHints}>
                                <span style={styles.hint}>Minore dimensione</span>
                                <span style={styles.hint}>Migliore qualità</span>
                            </div>
                        </div>
                    )}

                    <div style={styles.info}>
                        <p style={styles.infoText}>
                            {format === 'png' && '• PNG: Qualità massima, supporta trasparenza'}
                            {format === 'jpg' && '• JPG: File più piccolo, nessuna trasparenza'}
                            {format === 'webp' && '• WebP: Miglior compressione, supporta trasparenza'}
                        </p>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn}>
                        Annulla
                    </button>
                    <button
                        onClick={handleExport}
                        style={styles.exportBtn}
                        disabled={isConverting}
                    >
                        <HiDownload style={{ width: 18, height: 18 }} />
                        {isConverting ? 'Conversione...' : 'Scarica'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
    },
    modal: {
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0'
    },
    closeBtn: {
        background: 'rgba(102, 126, 234, 0.1)',
        border: 'none',
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        color: '#cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
    },
    content: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1'
    },
    formatGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
    },
    formatBtn: {
        padding: '12px',
        border: '2px solid',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    slider: {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        outline: 'none',
        background: 'rgba(102, 126, 234, 0.2)',
        cursor: 'pointer'
    },
    qualityHints: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '-4px'
    },
    hint: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    info: {
        background: 'rgba(102, 126, 234, 0.1)',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    infoText: {
        margin: 0,
        fontSize: '13px',
        color: '#cbd5e1',
        lineHeight: '1.5'
    },
    footer: {
        display: 'flex',
        gap: '12px',
        padding: '20px 24px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)'
    },
    cancelBtn: {
        flex: 1,
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    exportBtn: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    }
};
