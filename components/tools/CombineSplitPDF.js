import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFilePdf, BsDownload, BsX } from 'react-icons/bs';
import { HiCheckCircle } from 'react-icons/hi';

export default function CombineSplitPDF() {
    const [mode, setMode] = useState('combine'); // 'combine' o 'split'
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    
    // Per split PDF
    const [splitRanges, setSplitRanges] = useState('');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        multiple: mode === 'combine',
        onDrop: (acceptedFiles) => {
            setError('');
            setResult(null);
            if (mode === 'combine') {
                setFiles([...files, ...acceptedFiles]);
            } else {
                setFiles([acceptedFiles[0]]);
            }
        }
    });

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const moveFile = (index, direction) => {
        const newFiles = [...files];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < files.length) {
            [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
            setFiles(newFiles);
        }
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            setError('Carica almeno un file PDF');
            return;
        }

        if (mode === 'combine' && files.length < 2) {
            setError('Carica almeno 2 file PDF da combinare');
            return;
        }

        setProcessing(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('mode', mode);
            
            if (mode === 'combine') {
                files.forEach((file, index) => {
                    formData.append('files', file);
                });
            } else {
                formData.append('file', files[0]);
                formData.append('ranges', splitRanges);
            }

            const { getApiUrl } = await import('../../utils/getApiUrl');
            const apiUrl = await getApiUrl('/api/tools/combine-split-pdf');
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                // Verifica se la risposta è JSON
                const contentType = response.headers.get('content-type');
                let errorMessage = 'Errore durante l\'elaborazione del PDF';
                
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const text = await response.text();
                        if (text && text.trim()) {
                            const errorData = JSON.parse(text);
                            errorMessage = errorData.detail || errorData.error || errorMessage;
                        }
                    } catch (e) {
                        // Se il parsing JSON fallisce, usa il messaggio di default
                        errorMessage = response.status === 413 
                            ? 'File troppo grande. Dimensione massima: 50MB per file'
                            : `Errore ${response.status}: ${response.statusText}`;
                    }
                } else {
                    // Se la risposta non è JSON, estrai il testo o usa un messaggio generico
                    try {
                        const text = await response.text();
                        errorMessage = response.status === 413 
                            ? 'File troppo grande. Dimensione massima: 50MB per file'
                            : text || `Errore ${response.status}: ${response.statusText}`;
                    } catch (e) {
                        errorMessage = response.status === 413 
                            ? 'File troppo grande. Dimensione massima: 50MB per file'
                            : `Errore ${response.status}: ${response.statusText}`;
                    }
                }
                
                throw new Error(errorMessage);
            }

            // Gestisci sia blob binario che JSON con dataUrl
            const contentType = response.headers.get('content-type');
            let url;
            let filename = mode === 'combine' ? 'combined.pdf' : 'split.pdf';
            
            if (contentType && contentType.includes('application/json')) {
                // Risposta JSON con dataUrl (backend Python)
                const jsonData = await response.json();
                if (jsonData.url || jsonData.dataUrl) {
                    url = jsonData.url || jsonData.dataUrl;
                    if (jsonData.name) {
                        filename = jsonData.name;
                    }
                } else {
                    throw new Error('Formato risposta non valido');
                }
            } else {
                // Risposta blob binario (API Next.js)
                const blob = await response.blob();
                url = URL.createObjectURL(blob);
            }
            
            setResult({
                url,
                filename
            });
        } catch (err) {
            console.error('Errore:', err);
            setError(err.message || 'Errore durante l\'elaborazione del PDF');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (result) {
            const link = document.createElement('a');
            link.href = result.url;
            link.download = result.filename;
            link.click();
        }
    };

    const resetAll = () => {
        setFiles([]);
        setResult(null);
        setError('');
        setSplitRanges('');
    };

    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px'
        },
        modeSelector: {
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            justifyContent: 'center'
        },
        modeBtn: {
            padding: '12px 30px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#e0e0e0',
            color: '#333'
        },
        modeBtnActive: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        },
        dropzone: {
            border: '3px dashed #ccc',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: '#fafafa',
            marginBottom: '20px'
        },
        dropzoneActive: {
            borderColor: '#667eea',
            background: '#f0f4ff'
        },
        dropzoneIcon: {
            fontSize: '48px',
            color: '#667eea',
            marginBottom: '15px'
        },
        dropzoneText: {
            fontSize: '16px',
            color: '#666',
            margin: '10px 0'
        },
        filesList: {
            marginTop: '20px',
            marginBottom: '20px'
        },
        fileItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            background: 'white',
            borderRadius: '8px',
            marginBottom: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        fileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1
        },
        fileIcon: {
            fontSize: '24px',
            color: '#dc2626'
        },
        fileName: {
            fontSize: '14px',
            color: '#333',
            fontWeight: '500'
        },
        fileActions: {
            display: 'flex',
            gap: '8px'
        },
        actionBtn: {
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            background: '#f3f4f6',
            color: '#333',
            transition: 'background 0.2s'
        },
        removeBtn: {
            background: '#fee2e2',
            color: '#dc2626'
        },
        splitInput: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
        },
        hint: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '5px'
        },
        processBtn: {
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
            marginTop: '20px'
        },
        processBtnDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        error: {
            padding: '15px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            marginTop: '20px',
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
            marginBottom: '20px'
        },
        downloadBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 30px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginRight: '10px'
        },
        resetBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 30px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.modeSelector}>
                <button
                    onClick={() => { setMode('combine'); resetAll(); }}
                    style={{
                        ...styles.modeBtn,
                        ...(mode === 'combine' ? styles.modeBtnActive : {})
                    }}
                >
                    Combina PDF
                </button>
                <button
                    onClick={() => { setMode('split'); resetAll(); }}
                    style={{
                        ...styles.modeBtn,
                        ...(mode === 'split' ? styles.modeBtnActive : {})
                    }}
                >
                    Splitta PDF
                </button>
            </div>

            {mode === 'combine' ? (
                <>
                    <div
                        {...getRootProps()}
                        style={{
                            ...styles.dropzone,
                            ...(isDragActive ? styles.dropzoneActive : {})
                        }}
                    >
                        <input 
                            {...getInputProps()} 
                            aria-label="Seleziona file PDF da elaborare"
                            title="Seleziona file PDF"
                        />
                        <BsFilePdf style={styles.dropzoneIcon} />
                        <p style={styles.dropzoneText}>
                            <strong>Trascina qui i file PDF</strong> oppure clicca per selezionarli
                        </p>
                        <p style={{...styles.dropzoneText, fontSize: '14px', color: '#999'}}>
                            Aggiungi almeno 2 file PDF da combinare
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div style={styles.filesList}>
                            <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#333'}}>
                                File da combinare ({files.length})
                            </h3>
                            {files.map((file, index) => (
                                <div key={index} style={styles.fileItem}>
                                    <div style={styles.fileInfo}>
                                        <BsFilePdf style={styles.fileIcon} />
                                        <span style={styles.fileName}>{file.name}</span>
                                    </div>
                                    <div style={styles.fileActions}>
                                        {index > 0 && (
                                            <button
                                                onClick={() => moveFile(index, -1)}
                                                style={styles.actionBtn}
                                            >
                                                ↑
                                            </button>
                                        )}
                                        {index < files.length - 1 && (
                                            <button
                                                onClick={() => moveFile(index, 1)}
                                                style={styles.actionBtn}
                                            >
                                                ↓
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeFile(index)}
                                            style={{...styles.actionBtn, ...styles.removeBtn}}
                                        >
                                            <BsX />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div
                        {...getRootProps()}
                        style={{
                            ...styles.dropzone,
                            ...(isDragActive ? styles.dropzoneActive : {})
                        }}
                    >
                        <input 
                            {...getInputProps()} 
                            aria-label="Seleziona file PDF da elaborare"
                            title="Seleziona file PDF"
                        />
                        <BsFilePdf style={styles.dropzoneIcon} />
                        <p style={styles.dropzoneText}>
                            <strong>Trascina qui il file PDF</strong> oppure clicca per selezionarlo
                        </p>
                        <p style={{...styles.dropzoneText, fontSize: '14px', color: '#999'}}>
                            Seleziona un singolo file PDF da dividere
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div style={styles.filesList}>
                            <div style={styles.fileItem}>
                                <div style={styles.fileInfo}>
                                    <BsFilePdf style={styles.fileIcon} />
                                    <span style={styles.fileName}>{files[0].name}</span>
                                </div>
                                <button
                                    onClick={() => setFiles([])}
                                    style={{...styles.actionBtn, ...styles.removeBtn}}
                                >
                                    <BsX />
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={styles.splitInput}>
                        <label style={styles.label}>
                            Specifica le pagine da estrarre
                        </label>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="es: 1-3,5,7-10"
                            value={splitRanges}
                            onChange={(e) => setSplitRanges(e.target.value)}
                        />
                        <p style={styles.hint}>
                            Inserisci pagine singole (5) o intervalli (1-3) separati da virgola
                        </p>
                    </div>
                </>
            )}

            {!result && (
                <button
                    onClick={handleProcess}
                    disabled={processing || files.length === 0 || (mode === 'combine' && files.length < 2)}
                    style={{
                        ...styles.processBtn,
                        ...(processing || files.length === 0 || (mode === 'combine' && files.length < 2) ? styles.processBtnDisabled : {})
                    }}
                >
                    {processing ? 'Elaborazione in corso...' : mode === 'combine' ? 'Combina PDF' : 'Splitta PDF'}
                </button>
            )}

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {result && (
                <div style={styles.result}>
                    <HiCheckCircle style={styles.successIcon} />
                    <h3 style={styles.resultTitle}>
                        {mode === 'combine' ? 'PDF Combinato con Successo!' : 'PDF Splittato con Successo!'}
                    </h3>
                    <button onClick={handleDownload} style={styles.downloadBtn}>
                        <BsDownload /> Scarica PDF
                    </button>
                    <button onClick={resetAll} style={styles.resetBtn}>
                        Nuova Operazione
                    </button>
                </div>
            )}
        </div>
    );
}
