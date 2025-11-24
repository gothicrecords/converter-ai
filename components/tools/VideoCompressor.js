import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsCameraVideo, BsCloudUpload, BsDownload, BsX } from 'react-icons/bs';
import { HiCheckCircle } from 'react-icons/hi';

export default function VideoCompressor() {
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quality, setQuality] = useState('medium');
    const [originalSize, setOriginalSize] = useState(null);
    const [compressedSize, setCompressedSize] = useState(null);

    const qualityOptions = [
        { value: 'low', label: 'Bassa (massima compressione)', bitrate: '500k' },
        { value: 'medium', label: 'Media (bilanciata)', bitrate: '1000k' },
        { value: 'high', label: 'Alta (qualità preservata)', bitrate: '2000k' },
    ];

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setVideo(file);
        setOriginalSize(file.size);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
        setCompressedSize(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
            'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']
        },
        maxFiles: 1,
    });

    const handleCompress = async () => {
        if (!video) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('video', video);
            formData.append('quality', quality);

            const response = await fetch('/api/tools/compress-video', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Errore nella compressione';
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
            setCompressedSize(blob.size);
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
        a.download = `compressed_${video.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setVideo(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setOriginalSize(null);
        setCompressedSize(null);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const compressionRatio = originalSize && compressedSize 
        ? Math.round((1 - compressedSize / originalSize) * 100) 
        : null;

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
            borderColor: '#667eea',
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
        qualitySelector: {
            marginTop: '30px',
            marginBottom: '20px'
        },
        qualityLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '12px'
        },
        qualityOptions: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        qualityOption: {
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
        },
        qualityOptionActive: {
            borderColor: '#667eea',
            background: 'rgba(102, 126, 234, 0.1)'
        },
        qualityOptionLabel: {
            color: '#e6eef8',
            fontWeight: 500,
            fontSize: '14px',
            margin: 0
        },
        videoPreview: {
            marginTop: '30px',
            marginBottom: '20px'
        },
        videoContainer: {
            position: 'relative',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)'
        },
        video: {
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            display: 'block'
        },
        fileInfo: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '8px',
            marginTop: '15px'
        },
        fileInfoText: {
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
        },
        compressionStats: {
            display: 'flex',
            gap: '20px',
            marginTop: '15px',
            padding: '15px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px'
        },
        statItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        },
        statLabel: {
            fontSize: '12px',
            color: '#94a3b8'
        },
        statValue: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#10b981'
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
        }
    };

    return (
        <div style={styles.container}>
            {!preview ? (
                <div
                    {...getRootProps()}
                    style={{
                        ...styles.dropzone,
                        ...(isDragActive ? styles.dropzoneActive : {})
                    }}
                >
                    <input {...getInputProps()} />
                    <BsCameraVideo style={styles.uploadIcon} />
                    <p style={styles.dropzoneText}>
                        {isDragActive ? 'Rilascia qui...' : 'Carica un video'}
                    </p>
                    <p style={styles.dropzoneSubtext}>
                        MP4, AVI, MOV, MKV, WEBM, FLV, WMV
                    </p>
                </div>
            ) : (
                <>
                    <div style={styles.qualitySelector}>
                        <label style={styles.qualityLabel}>Qualità di compressione</label>
                        <div style={styles.qualityOptions}>
                            {qualityOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setQuality(opt.value)}
                                    style={{
                                        ...styles.qualityOption,
                                        ...(quality === opt.value ? styles.qualityOptionActive : {})
                                    }}
                                >
                                    <p style={styles.qualityOptionLabel}>{opt.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.videoPreview}>
                        <div style={styles.videoContainer}>
                            <video
                                src={preview}
                                controls
                                style={styles.video}
                            />
                        </div>
                        <div style={styles.fileInfo}>
                            <p style={styles.fileInfoText}>
                                <strong>File originale:</strong> {video.name}
                            </p>
                            <p style={styles.fileInfoText}>
                                <strong>Dimensione:</strong> {formatFileSize(originalSize)}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <p style={styles.errorText}>{error}</p>
                        </div>
                    )}

                    {!result && (
                        <div style={styles.actionsRow}>
                            <button
                                onClick={handleCompress}
                                disabled={loading}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    ...(loading ? styles.buttonDisabled : {})
                                }}
                            >
                                {loading ? 'Compressione in corso...' : 'Comprimi Video'}
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
                        <>
                            <div style={styles.resultBox}>
                                <HiCheckCircle style={styles.successIcon} />
                                <h3 style={styles.resultTitle}>Video compresso con successo!</h3>
                                
                                {compressionRatio !== null && (
                                    <div style={styles.compressionStats}>
                                        <div style={styles.statItem}>
                                            <span style={styles.statLabel}>Dimensione originale</span>
                                            <span style={styles.statValue}>{formatFileSize(originalSize)}</span>
                                        </div>
                                        <div style={styles.statItem}>
                                            <span style={styles.statLabel}>Dimensione compressa</span>
                                            <span style={styles.statValue}>{formatFileSize(compressedSize)}</span>
                                        </div>
                                        <div style={styles.statItem}>
                                            <span style={styles.statLabel}>Riduzione</span>
                                            <span style={styles.statValue}>{compressionRatio}%</span>
                                        </div>
                                    </div>
                                )}

                                <div style={styles.actionsRow}>
                                    <button
                                        onClick={handleDownload}
                                        style={{...styles.button, ...styles.buttonSuccess}}
                                    >
                                        <BsDownload style={{width: 20, height: 20}} />
                                        <span>Scarica Video</span>
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        style={{...styles.button, ...styles.buttonSecondary}}
                                    >
                                        <BsX style={{width: 20, height: 20}} />
                                        <span>Nuovo Video</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

