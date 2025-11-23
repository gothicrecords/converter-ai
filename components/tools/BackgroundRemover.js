import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { HiDownload, HiRefresh, HiX } from 'react-icons/hi';
import { SafeMotionDiv, SafeAnimatePresence, fadeInUp, scaleIn } from '../../lib/animations';
import EnhancedDropzone from '../EnhancedDropzone';
import ExportModal from '../ExportModal';
import { LoadingOverlay, ProgressBar } from '../Loading';
import { showToast, updateToast } from '../Toast';
import { saveToHistory } from '../../utils/history';
import ProBadge from '../ProBadge';
import Link from 'next/link';

const PRESETS = {
    portrait: { type: 'person', quality: 90, crop: true, cropMargin: 5, name: 'Ritratto' },
    product: { type: 'product', quality: 85, crop: true, cropMargin: 10, name: 'Prodotto' },
    car: { type: 'car', quality: 85, crop: true, cropMargin: 8, name: 'Auto' },
    document: { type: 'auto', quality: 70, crop: false, cropMargin: 0, name: 'Documento' }
};

const BackgroundRemover = () => {
    const [files, setFiles] = useState([]);
    const [processedImage, setProcessedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [subjectType, setSubjectType] = useState('auto');
    const [quality, setQuality] = useState(90);
    const [crop, setCrop] = useState(true);
    const [cropMargin, setCropMargin] = useState(8);
    const [bgPreview, setBgPreview] = useState('checker');
    const [autoProcess, setAutoProcess] = useState(false); // Disabilitato di default - l'utente deve cliccare manualmente
    const [compare, setCompare] = useState(50);
    const [showExportModal, setShowExportModal] = useState(false);
    const progressIntervalRef = useRef(null);
    const toastIdRef = useRef(null);

    const onFilesAccepted = useCallback((acceptedFiles) => {
        setProcessedImage(null);
        setError(null);
        setFiles(acceptedFiles);
    }, []);

    const mappedSize = useMemo(() => {
        if (quality >= 85) return 'full';
        if (quality >= 60) return 'medium';
        if (quality >= 35) return 'regular';
        if (quality >= 15) return 'small';
        return 'preview';
    }, [quality]);

    const handleProcessImage = async () => {
        if (files.length === 0) {
            // Usa setTimeout per evitare chiamate durante il render
            setTimeout(() => {
                showToast('Carica prima un\'immagine', 'error', 4000, {
                    details: 'Nessun file selezionato per l\'elaborazione',
                    technical: 'Status: No file provided'
                });
            }, 0);
            return;
        }

        setIsLoading(true);
        setError(null);
        setProcessedImage(null);
        setProgress(0);

        const startTime = Date.now();
        const file = files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Usa setTimeout per evitare chiamate durante il render
        let toastId;
        await new Promise(resolve => {
            setTimeout(() => {
                toastId = showToast('Elaborazione in corso...', 'progress', 0, {
                    progress: 0,
                    details: `File: ${file.name.substring(0, 25)}${file.name.length > 25 ? '...' : ''} • ${fileSize} MB`,
                    technical: `Type: ${subjectType} • Size: ${mappedSize} • Crop: ${crop ? 'Yes' : 'No'}`
                });
                resolve();
            }, 0);
        });

        // Verifica che il file sia valido prima di inviare
        if (!file || !file.size || file.size === 0) {
            setError('Il file selezionato non è valido o è vuoto.');
            setIsLoading(false);
            updateToast(toastId, {
                type: 'error',
                message: 'File non valido',
                details: 'Il file selezionato è vuoto o corrotto.'
            });
            return;
        }

        console.log('Sending file to API:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', subjectType);
        formData.append('size', mappedSize);
        formData.append('crop', crop ? 'true' : 'false');
        if (crop) formData.append('crop_margin', `${cropMargin}%`);

        // Verifica che il file sia nel FormData
        console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => [
            key, 
            value instanceof File ? { name: value.name, size: value.size, type: value.type } : value
        ]));

        // Salva il toastId in un ref per usarlo nel progress interval
        toastIdRef.current = toastId;
        
        // Simulate progress - usa setTimeout per evitare chiamate durante il render
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = Math.min(prev + 10, 90);
                // Usa setTimeout per evitare chiamate durante il render
                setTimeout(() => {
                    if (toastIdRef.current) {
                        updateToast(toastIdRef.current, { progress: newProgress });
                    }
                }, 0);
                return newProgress;
            });
        }, 200);

        try {
            console.log('Sending request to /api/tools/remove-background...');
            const response = await fetch('/api/tools/remove-background', {
                method: 'POST',
                body: formData,
            });

            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            setProgress(95);
            setTimeout(() => {
                if (toastIdRef.current) {
                    updateToast(toastIdRef.current, { progress: 95, message: 'Finalizzazione...' });
                }
            }, 0);

            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                // Prova a leggere come JSON, altrimenti come testo
                let errorMessage = 'Qualcosa è andato storto';
                let errorDetails = '';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        errorDetails = errorData.debug ? JSON.stringify(errorData.debug, null, 2) : '';
                        console.error('Error details from server:', errorData);
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                        console.error('Error text from server:', errorText);
                    }
                } catch (e) {
                    console.error('Error reading response:', e);
                    errorMessage = `Errore HTTP ${response.status}: ${response.statusText}`;
                }
                console.error('Full error:', { status: response.status, message: errorMessage, details: errorDetails });
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setProcessedImage(imageUrl);
            setProgress(100);

            const processTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const outputSize = (blob.size / 1024 / 1024).toFixed(2);

            // Save to history - converti il blob in data URL per renderlo persistente
            if (typeof window !== 'undefined' && typeof document !== 'undefined') {
                const reader = new FileReader();
                reader.onload = () => {
                    const resultDataUrl = reader.result; // Data URL del risultato completo
                    
                    // Crea un thumbnail più piccolo per la history (max 200x200)
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                            const maxSize = 200;
                            let thumbWidth = img.width;
                            let thumbHeight = img.height;
                            
                            if (thumbWidth > maxSize || thumbHeight > maxSize) {
                                const ratio = Math.min(maxSize / thumbWidth, maxSize / thumbHeight);
                                thumbWidth = Math.round(thumbWidth * ratio);
                                thumbHeight = Math.round(thumbHeight * ratio);
                            }
                            
                            canvas.width = thumbWidth;
                            canvas.height = thumbHeight;
                            ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
                            const thumbnail = canvas.toDataURL('image/png', 0.7);
                            
                            saveToHistory({
                                tool: 'Rimozione Sfondo AI',
                                filename: file.name,
                                thumbnail: thumbnail,
                                params: { subjectType, quality: mappedSize, crop, cropMargin },
                                result: resultDataUrl // Data URL persistente invece di blob URL
                            });
                        };
                        img.onerror = () => {
                            // Fallback: usa il data URL completo come thumbnail
                            saveToHistory({
                                tool: 'Rimozione Sfondo AI',
                                filename: file.name,
                                thumbnail: resultDataUrl,
                                params: { subjectType, quality: mappedSize, crop, cropMargin },
                                result: resultDataUrl
                            });
                        };
                        img.src = resultDataUrl;
                    } catch (canvasError) {
                        console.warn('Canvas not available, using full data URL:', canvasError);
                        // Fallback: usa il data URL completo
                        saveToHistory({
                            tool: 'Rimozione Sfondo AI',
                            filename: file.name,
                            thumbnail: resultDataUrl,
                            params: { subjectType, quality: mappedSize, crop, cropMargin },
                            result: resultDataUrl
                        });
                    }
                };
                reader.onerror = (err) => {
                    console.error('Failed to read blob for history:', err);
                    // Fallback: salva comunque con il blob URL
                    saveToHistory({
                        tool: 'Rimozione Sfondo AI',
                        filename: file.name,
                        thumbnail: null,
                        params: { subjectType, quality: mappedSize, crop, cropMargin },
                        result: imageUrl
                    });
                };
                reader.readAsDataURL(blob);
            } else {
                // Fallback se non siamo in browser
                saveToHistory({
                    tool: 'Rimozione Sfondo AI',
                    filename: file.name,
                    thumbnail: null,
                    params: { subjectType, quality: mappedSize, crop, cropMargin },
                    result: imageUrl
                });
            }

            setTimeout(() => {
                if (toastIdRef.current) {
                    updateToast(toastIdRef.current, {
                        type: 'success',
                        message: 'Sfondo rimosso con successo!',
                        progress: 100,
                        details: `Tempo elaborazione: ${processTime}s • Output: ${outputSize} MB`,
                        technical: `Algorithm: AI Background Removal • Quality: ${mappedSize} • Compression: ${((1 - blob.size / file.size) * 100).toFixed(1)}%`
                    });
                }
            }, 0);

        } catch (err) {
            setError(err.message);
            setTimeout(() => {
                if (toastIdRef.current) {
                    updateToast(toastIdRef.current, {
                        type: 'error',
                        message: err.message,
                        details: 'Errore durante l\'elaborazione dell\'immagine',
                        technical: `Error: ${err.message} • File: ${file.name}`
                    });
                }
            }, 0);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        } finally {
            setIsLoading(false);
            toastIdRef.current = null;
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const applyPreset = (presetKey) => {
        const preset = PRESETS[presetKey];
        setSubjectType(preset.type);
        setQuality(preset.quality);
        setCrop(preset.crop);
        setCropMargin(preset.cropMargin);
        showToast(`Preset "${preset.name}" applicato`, 'info', 3000, {
            details: `Tipo: ${preset.type} • Qualità: ${preset.quality}% • Ritaglio: ${preset.crop ? 'Sì' : 'No'}`,
            technical: `Preset: ${presetKey} • Crop Margin: ${preset.cropMargin}%`
        });
    };

    const handleRemoveFile = () => {
        setFiles([]);
        setProcessedImage(null);
        setError(null);
        setProgress(0);
    };

    // Auto-process when file or main controls change (solo se autoProcess è abilitato)
    useEffect(() => {
        if (autoProcess && files.length > 0 && !isLoading) {
            const file = files[0];
            // Verifica che il file sia valido e pronto
            if (!file || !file.size || file.size === 0) {
                console.warn('File not ready for processing:', file);
                return;
            }
            // Usa setTimeout per evitare chiamate durante il render e dare tempo al file di essere completamente caricato
            const id = setTimeout(() => {
                // Verifica di nuovo prima di processare
                if (files.length > 0 && files[0] && files[0].size > 0 && !isLoading) {
                    handleProcessImage();
                }
            }, 1000); // Aumentato a 1 secondo per dare più tempo al file di essere completamente caricato
            return () => clearTimeout(id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, subjectType, quality, crop, cropMargin, autoProcess]);

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

            {isLoading && (
                <LoadingOverlay message={`Rimozione sfondo in corso... ${progress}%`} />
            )}

            <EnhancedDropzone 
                onFilesAccepted={onFilesAccepted}
                category="image"
                multiple={false}
                maxFiles={1}
            />

            <div style={styles.presetsRow}>
                <div style={styles.controlBox}>
                    <label htmlFor="subject-type-select" style={styles.label}>Tipo soggetto</label>
                    <select 
                        id="subject-type-select"
                        value={subjectType} 
                        onChange={(e)=>setSubjectType(e.target.value)} 
                        style={styles.select}
                        aria-label="Seleziona il tipo di soggetto dell'immagine"
                    >
                        <option value="auto">Auto</option>
                        <option value="person">Persona</option>
                        <option value="product">Prodotto</option>
                        <option value="car">Auto</option>
                        <option value="animal">Animale</option>
                    </select>
                </div>
                <div style={styles.controlBox}>
                    <div style={styles.flexBetween}>
                        <label htmlFor="quality-range" style={styles.label}>Qualità/Dettagli</label>
                        <span style={styles.badge}>{mappedSize}</span>
                    </div>
                    <input 
                        id="quality-range"
                        type="range" 
                        min="0" 
                        max="100" 
                        value={quality} 
                        onChange={(e)=>setQuality(parseInt(e.target.value,10))} 
                        style={styles.slider}
                        aria-label={`Qualità immagine: ${quality}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={quality}
                    />
                </div>
                <div style={styles.controlBox}>
                    <label style={styles.label}>Ritaglio intelligente</label>
                    <div style={styles.checkboxRow}>
                        <input id="crop" type="checkbox" checked={crop} onChange={(e)=>setCrop(e.target.checked)} />
                        <label htmlFor="crop" style={styles.checkLabel}>Crop intorno al soggetto</label>
                    </div>
                    <div style={{...styles.marginControl, opacity: crop ? 1 : 0.5, pointerEvents: crop ? 'auto' : 'none'}}>
                        <div style={styles.flexBetween}>
                            <label htmlFor="crop-margin-range" style={styles.label}>Margine</label>
                            <span style={styles.badgeSmall}>{cropMargin}%</span>
                        </div>
                        <input 
                            id="crop-margin-range"
                            type="range" 
                            min="0" 
                            max="30" 
                            value={cropMargin} 
                            onChange={(e)=>setCropMargin(parseInt(e.target.value,10))} 
                            style={styles.slider}
                            aria-label={`Margine ritaglio: ${cropMargin}%`}
                            aria-valuemin={0}
                            aria-valuemax={30}
                            aria-valuenow={cropMargin}
                            disabled={!crop}
                        />
                    </div>
                </div>
                <div style={styles.controlBox}>
                    <label style={styles.label}>Anteprima sfondo</label>
                    <div style={styles.bgGrid}>
                        {['checker','transparent','white','black'].map(opt => (
                            <button 
                                key={opt} 
                                onClick={()=>setBgPreview(opt)} 
                                style={{...styles.bgBtn, ...(bgPreview===opt ? styles.bgBtnActive : {}), ...(opt==='checker' ? styles.bgChecker : opt==='white' ? styles.bgWhite : opt==='black' ? styles.bgBlack : styles.bgTransparent)}}
                                aria-label={`Anteprima sfondo: ${opt === 'checker' ? 'Scacchiera' : opt === 'transparent' ? 'Trasparente' : opt === 'white' ? 'Bianco' : 'Nero'}`}
                                title={opt === 'checker' ? 'Scacchiera' : opt === 'transparent' ? 'Trasparente' : opt === 'white' ? 'Bianco' : 'Nero'}
                            >
                            <span style={{position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0}}>
                                {opt === 'checker' ? 'Scacchiera' : opt === 'transparent' ? 'Trasparente' : opt === 'white' ? 'Bianco' : 'Nero'}
                            </span>
                            </button>
                        ))}
                    </div>
                    <div style={styles.checkboxRow}>
                        <input id="auto" type="checkbox" checked={autoProcess} onChange={(e)=>setAutoProcess(e.target.checked)} />
                        <label htmlFor="auto" style={styles.checkLabel}>Elabora automaticamente</label>
                    </div>
                </div>
            </div>

            <SafeAnimatePresence>
                {files.length > 0 && (
                    <SafeMotionDiv
                        {...fadeInUp}
                        style={styles.filePreview}
                    >
                        <div style={styles.fileRow}>
                            <div style={styles.fileInfo}>
                                <img src={files[0].preview} alt="Anteprima" style={styles.fileThumb} />
                                <div>
                                    <p style={styles.fileName}>{files[0].name}</p>
                                    <p style={styles.fileSize}>{(files[0].size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button onClick={handleRemoveFile} style={styles.removeBtn}>
                                <HiX style={styles.removeIcon} />
                            </button>
                        </div>
                        <div style={styles.actionGrid}>
                            <button
                                onClick={handleProcessImage}
                                disabled={isLoading}
                                style={{...styles.processBtn, ...(isLoading ? styles.processBtnDisabled : {})}}
                            >
                                {isLoading ? (
                                    <>
                                        <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Elaborazione in corso...
                                    </>
                                ) : 'Rimuovi Sfondo'}
                            </button>
                            <a
                                href={processedImage || '#'}
                                onClick={(e)=>{ if(!processedImage) e.preventDefault(); }}
                                download={processedImage ? `sfondo-rimosso-${files[0].name}` : undefined}
                                style={processedImage ? styles.downloadBtn : styles.downloadBtnDisabled}
                            >
                                <HiDownload style={styles.downloadIcon} />
                                Scarica PNG
                            </a>
                        </div>
                    </SafeMotionDiv>
                )}
            </SafeAnimatePresence>

            {error && (
                <SafeMotionDiv
                    {...scaleIn}
                    style={styles.errorBox}
                >
                    <p><strong>Errore:</strong> {error}</p>
                </SafeMotionDiv>
            )}

            <SafeAnimatePresence>
                {processedImage && (
                    <SafeMotionDiv
                        {...scaleIn}
                        style={styles.compareSection}
                    >
                        <h3 style={styles.compareTitle}>Confronto Prima/Dopo</h3>
                        <div style={{...styles.compareBox, background: bgPreview==='white'?'#fff':bgPreview==='black'?'#000':'transparent'}}>
                            {bgPreview==='checker' && (
                                <div style={styles.checkerBg} />
                            )}
                            <div style={styles.imageContainer}>
                                <img src={files[0]?.preview} alt="Prima" style={styles.beforeImg} />
                                <img src={processedImage} alt="Dopo" style={{...styles.afterImg, clipPath:`polygon(0 0, ${compare}% 0, ${compare}% 100%, 0 100%)`}} />
                                <div style={{...styles.divider, left:`calc(${compare}% - 1px)`}}>
                                    <div style={styles.dividerLine} />
                                </div>
                            </div>
                        </div>
                        <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Prima</span>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={compare} 
                                onChange={(e)=>setCompare(parseInt(e.target.value,10))} 
                                style={styles.compareSlider}
                                aria-label={`Confronto prima/dopo: ${compare}%`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={compare}
                            />
                            <span style={styles.sliderLabel}>Dopo</span>
                        </div>
                    </SafeMotionDiv>
                )}
            </SafeAnimatePresence>
        </div>
    );
};

export default BackgroundRemover;

const styles = {
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '24px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px' },
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
    dropzone: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '240px', padding: '24px', border: '2px dashed rgba(148, 163, 184, 0.4)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
    dropzoneActive: { borderColor: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)' },
    uploadIcon: { width: '48px', height: '48px', color: '#94a3b8', marginBottom: '16px' },
    dropText: { fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' },
    dropTextActive: { fontSize: '18px', fontWeight: 600, color: '#a78bfa' },
    dropHint: { fontSize: '14px', color: '#94a3b8' },
    controlsGrid: { marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' },
    controlBox: { padding: '16px', background: 'rgba(51, 65, 85, 0.6)', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.2)' },
    label: { display: 'block', fontSize: '14px', color: '#cbd5e1', marginBottom: '8px' },
    select: { width: '100%', background: 'rgba(15, 23, 42, 0.8)', color: '#e2e8f0', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '8px 12px', fontSize: '14px' },
    flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
    badge: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 },
    badgeSmall: { fontSize: '11px', color: '#94a3b8' },
    slider: { width: '100%', cursor: 'pointer' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },
    checkLabel: { fontSize: '14px', color: '#e2e8f0' },
    marginControl: { marginTop: '12px' },
    bgGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' },
    bgBtn: { height: '40px', borderRadius: '6px', border: '2px solid rgba(148, 163, 184, 0.3)', cursor: 'pointer', transition: 'border-color 0.2s' },
    bgBtnActive: { borderColor: '#a78bfa' },
    bgChecker: { backgroundImage: 'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)', backgroundSize: '14px 14px', backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px' },
    bgWhite: { background: '#fff' },
    bgBlack: { background: '#000' },
    bgTransparent: { background: 'transparent' },
    filePreview: { marginTop: '24px' },
    fileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(51, 65, 85, 0.6)', borderRadius: '8px' },
    fileInfo: { display: 'flex', alignItems: 'center' },
    fileThumb: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', marginRight: '16px' },
    fileName: { fontWeight: 600, color: '#fff', marginBottom: '4px' },
    fileSize: { fontSize: '14px', color: '#94a3b8' },
    removeBtn: { padding: '8px', color: '#94a3b8', background: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' },
    removeIcon: { width: '24px', height: '24px' },
    actionGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '16px' },
    processBtn: { padding: '12px 24px', background: '#a78bfa', color: '#fff', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' },
    processBtnDisabled: { background: '#6b7280', cursor: 'not-allowed' },
    spinner: { width: '20px', height: '20px', marginRight: '8px', animation: 'spin 1s linear infinite' },
    spinnerCircle: { opacity: 0.25 },
    spinnerPath: { opacity: 0.75 },
    downloadBtn: { padding: '12px 24px', background: '#10b981', color: '#fff', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', fontSize: '15px' },
    downloadBtnDisabled: { padding: '12px 24px', background: '#4b5563', color: '#9ca3af', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', fontSize: '15px' },
    downloadIcon: { width: '20px', height: '20px', marginRight: '8px' },
    errorBox: { marginTop: '24px', padding: '16px', background: 'rgba(153, 27, 27, 0.8)', border: '1px solid rgba(220, 38, 38, 0.6)', borderRadius: '8px', color: '#fecaca', textAlign: 'center' },
    compareSection: { marginTop: '32px', width: '100%' },
    compareTitle: { fontSize: '24px', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '24px' },
    compareBox: { 
        position: 'relative', 
        width: '100%', 
        maxWidth: '100%',
        minHeight: '400px',
        overflow: 'hidden', 
        borderRadius: '12px', 
        border: '1px solid rgba(148, 163, 184, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkerBg: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' },
    imageContainer: { position: 'relative', width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    beforeImg: { display: 'block', maxWidth: '100%', maxHeight: '70vh', width: 'auto', height: 'auto', objectFit: 'contain', userSelect: 'none' },
    afterImg: { position: 'absolute', inset: 0, maxWidth: '100%', maxHeight: '70vh', width: 'auto', height: 'auto', margin: 'auto', objectFit: 'contain' },
    divider: { position: 'absolute', top: 0, bottom: 0 },
    dividerLine: { width: '2px', height: '100%', background: '#a78bfa', boxShadow: '0 0 8px rgba(167, 139, 250, 0.6)' },
    sliderRow: { marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' },
    sliderLabel: { fontSize: '12px', color: '#94a3b8' },
    compareSlider: { flex: 1, cursor: 'pointer' }
};
