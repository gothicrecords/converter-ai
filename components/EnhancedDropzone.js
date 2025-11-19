import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiX } from 'react-icons/hi';
import { validateFile, generatePreview, formatFileSize } from '../utils/fileValidation';
import { showToast } from './Toast';

export default function EnhancedDropzone({ 
    onFilesAccepted, 
    category = 'image',
    multiple = false,
    maxFiles = 1 
}) {
    const [previews, setPreviews] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        const files = multiple ? acceptedFiles : [acceptedFiles[0]];
        
        // Validate files
        const validFiles = [];
        const startTime = Date.now();
        for (const file of files) {
            const validation = validateFile(file, category);
            if (!validation.valid) {
                showToast(validation.error, 'error', 5000, {
                    details: `Tipo: ${file.type || 'sconosciuto'} • Dimensione: ${formatFileSize(file.size)}`,
                    technical: `File: ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`
                });
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // Generate previews
        const previewPromises = validFiles.map(async (file) => {
            const preview = await generatePreview(file);
            return {
                file,
                preview,
                name: file.name,
                size: formatFileSize(file.size)
            };
        });

        const newPreviews = await Promise.all(previewPromises);
        setPreviews(newPreviews);
        onFilesAccepted(validFiles);
        
        const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
        const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        showToast(`${validFiles.length} file caricato${validFiles.length > 1 ? 'i' : ''} con successo`, 'success', 4000, {
            details: `Dimensione totale: ${formatFileSize(totalSize)} • Tempo: ${loadTime}s`,
            technical: validFiles.length === 1 
                ? `${validFiles[0].name} (${validFiles[0].type})`
                : `${validFiles.length} file processati`
        });
    }, [category, multiple, onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
        onDrop,
        multiple,
        maxFiles,
        accept: category === 'image' ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] } : undefined
    });

    // Paste support
    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const files = [];
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }

            if (files.length > 0) {
                e.preventDefault();
                onDrop(files);
                const file = files[0];
                showToast('Immagine incollata dal clipboard', 'info', 3000, {
                    details: `Dimensione: ${formatFileSize(file.size)} • Tipo: ${file.type || 'sconosciuto'}`,
                    technical: `Source: Clipboard • Method: Paste Event`
                });
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [onDrop]);

    const removePreview = (index) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setPreviews([]);
        onFilesAccepted([]);
    };

    return (
        <div style={styles.container}>
            <div 
                {...getRootProps()} 
                style={{
                    ...styles.dropzone,
                    borderColor: dropzoneDragActive ? '#667eea' : 'rgba(102, 126, 234, 0.3)',
                    background: dropzoneDragActive ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.05)',
                    transform: dropzoneDragActive ? 'scale(1.02)' : 'scale(1)'
                }}
            >
                <input {...getInputProps()} />
                <div style={styles.uploadIcon}>
                    <HiOutlineUpload style={{ width: 48, height: 48 }} />
                </div>
                <h3 style={styles.dropzoneTitle}>
                    {dropzoneDragActive ? 'Rilascia qui!' : 'Trascina file o clicca'}
                </h3>
                <p style={styles.dropzoneHint}>
                    {multiple ? `Fino a ${maxFiles} file` : 'Un file alla volta'} • Max 10MB
                    <br />
                    <span style={styles.pasteHint}>💡 Puoi anche incollare con Ctrl+V</span>
                </p>
            </div>

            {previews.length > 0 && (
                <div style={styles.previewSection}>
                    <div style={styles.previewHeader}>
                        <span style={styles.previewTitle}>File caricati ({previews.length})</span>
                        <button onClick={clearAll} style={styles.clearBtn}>
                            Rimuovi tutti
                        </button>
                    </div>
                    <div style={styles.previewGrid}>
                        {previews.map((item, index) => (
                            <div key={index} style={styles.previewCard}>
                                {item.preview && (
                                    <img src={item.preview} alt={item.name} style={styles.previewImg} />
                                )}
                                <div style={styles.previewInfo}>
                                    <span style={styles.previewName}>{item.name}</span>
                                    <span style={styles.previewSize}>{item.size}</span>
                                </div>
                                <button 
                                    onClick={() => removePreview(index)} 
                                    style={styles.removeBtn}
                                    aria-label="Rimuovi file"
                                >
                                    <HiX style={{ width: 16, height: 16 }} />
                                </button>
                            </div>
                        ))}
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
        gap: '20px',
        width: '100%'
    },
    dropzone: {
        border: '3px dashed',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
    },
    uploadIcon: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(102, 126, 234, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#667eea'
    },
    dropzoneTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#e2e8f0'
    },
    dropzoneHint: {
        margin: 0,
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6'
    },
    pasteHint: {
        fontSize: '13px',
        color: '#667eea',
        fontWeight: '500'
    },
    previewSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    previewHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    previewTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1'
    },
    clearBtn: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '6px',
        padding: '6px 12px',
        color: '#ef4444',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    previewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
    },
    previewCard: {
        position: 'relative',
        background: 'rgba(102, 126, 234, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column'
    },
    previewImg: {
        width: '100%',
        height: '80px',
        objectFit: 'cover'
    },
    previewInfo: {
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1
    },
    previewName: {
        fontSize: '12px',
        color: '#cbd5e1',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    previewSize: {
        fontSize: '11px',
        color: '#94a3b8'
    },
    removeBtn: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        background: 'rgba(0, 0, 0, 0.7)',
        border: 'none',
        borderRadius: '6px',
        padding: '4px',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    }
};
