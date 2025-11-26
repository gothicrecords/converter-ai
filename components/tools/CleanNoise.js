import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsSoundwave, BsCloudUpload, BsDownload, BsX } from 'react-icons/bs';
import { HiCheckCircle } from 'react-icons/hi';
import ProBadge from '../ProBadge';
import Link from 'next/link';

export default function CleanNoise() {
    const [audio, setAudio] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [noiseLevel, setNoiseLevel] = useState('medium');

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setAudio(file);
        setResult(null);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']
        },
        maxFiles: 1,
    });

    const handleProcess = async () => {
        if (!audio) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('audio', audio);
            formData.append('noiseLevel', noiseLevel);

            const { getApiUrl } = await import('../../utils/getApiUrl');
            const apiUrl = await getApiUrl('/api/tools/clean-noise');
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Errore durante l\'elaborazione';
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
        a.download = `cleaned_${audio.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setAudio(null);
        setResult(null);
        setError(null);
    };

    const styles = {
        container: {
            maxWidth: '900px',
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
        audioInfo: {
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        },
        audioIcon: {
            fontSize: '48px',
            color: '#667eea',
            marginBottom: '15px'
        },
        fileName: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '5px'
        },
        fileSize: {
            fontSize: '14px',
            color: '#666'
        },
        noiseLevelSection: {
            marginBottom: '25px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
        },
        levelGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
        },
        levelBtn: {
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: 'white',
            color: '#333'
        },
        levelBtnActive: {
            borderColor: '#667eea',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
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
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        downloadBtn: {
            background: '#10b981'
        },
        resetBtn: {
            background: '#6b7280',
            padding: '12px'
        },
        buttonGroup: {
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '10px',
            marginTop: '20px'
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
        result: {
            marginTop: '30px',
            padding: '25px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center'
        },
        successIcon: {
            fontSize: '48px',
            color: '#10b981',
            marginBottom: '15px'
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '15px'
        },
        audioPlayer: {
            width: '100%',
            marginBottom: '20px',
            borderRadius: '8px'
        },
        hint: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '8px',
            fontStyle: 'italic'
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

            {!audio ? (
                <div
                    {...getRootProps()}
                    style={{
                        ...styles.dropzone,
                        ...(isDragActive ? styles.dropzoneActive : {})
                    }}
                >
                    <input 
                        {...getInputProps()} 
                        aria-label="Seleziona immagine per rimozione rumore"
                        title="Seleziona immagine"
                    />
                    <BsCloudUpload style={styles.uploadIcon} />
                    <p style={styles.dropzoneTitle}>
                        {isDragActive ? 'Rilascia qui il file audio...' : 'Trascina qui un file audio o clicca per selezionare'}
                    </p>
                    <p style={styles.dropzoneText}>
                        Supporta MP3, WAV, OGG, M4A, FLAC, AAC
                    </p>
                </div>
            ) : (
                <div>
                    <div style={styles.audioInfo}>
                        <BsSoundwave style={styles.audioIcon} />
                        <div style={styles.fileName}>{audio.name}</div>
                        <div style={styles.fileSize}>{formatFileSize(audio.size)}</div>
                    </div>

                    {!result && (
                        <>
                            <div style={styles.noiseLevelSection}>
                                <label style={styles.label}>
                                    Livello di riduzione rumore
                                </label>
                                <div style={styles.levelGrid}>
                                    <button
                                        onClick={() => setNoiseLevel('light')}
                                        style={{
                                            ...styles.levelBtn,
                                            ...(noiseLevel === 'light' ? styles.levelBtnActive : {})
                                        }}
                                    >
                                        Leggero
                                    </button>
                                    <button
                                        onClick={() => setNoiseLevel('medium')}
                                        style={{
                                            ...styles.levelBtn,
                                            ...(noiseLevel === 'medium' ? styles.levelBtnActive : {})
                                        }}
                                    >
                                        Medio
                                    </button>
                                    <button
                                        onClick={() => setNoiseLevel('strong')}
                                        style={{
                                            ...styles.levelBtn,
                                            ...(noiseLevel === 'strong' ? styles.levelBtnActive : {})
                                        }}
                                    >
                                        Forte
                                    </button>
                                </div>
                                <p style={styles.hint}>
                                    Livelli più alti riducono più rumore ma potrebbero alterare la qualità audio
                                </p>
                            </div>

                            <button
                                onClick={handleProcess}
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
                                {loading ? 'Elaborazione in corso...' : 'Riduci Rumore'}
                            </button>
                        </>
                    )}

                    {error && (
                        <div style={styles.error}>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div style={styles.result}>
                            <HiCheckCircle style={styles.successIcon} />
                            <h3 style={styles.resultTitle}>Audio Pulito con Successo!</h3>
                            
                            <audio controls style={styles.audioPlayer}>
                                <source src={result} type="audio/mpeg" />
                                Il tuo browser non supporta l'elemento audio.
                            </audio>

                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={handleDownload}
                                    style={{
                                        ...styles.button,
                                        ...styles.downloadBtn
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <BsDownload style={{ fontSize: '20px' }} />
                                    Scarica Audio
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        ...styles.button,
                                        ...styles.resetBtn
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#4b5563';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#6b7280';
                                    }}
                                >
                                    <BsX style={{ fontSize: '24px' }} />
                                </button>
                            </div>
                        </div>
                    )}

                    {!result && (
                        <button
                            onClick={handleReset}
                            style={{
                                ...styles.button,
                                ...styles.resetBtn
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#4b5563';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#6b7280';
                            }}
                        >
                            <BsX style={{ fontSize: '24px' }} />
                            Cambia File
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
