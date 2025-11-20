import { useState, useCallback, useMemo, useEffect } from 'react';
import { HiDownload, HiRefresh, HiX } from 'react-icons/hi';
import { SafeMotionDiv, SafeAnimatePresence, fadeInUp, scaleIn } from '../../lib/animations';
import EnhancedDropzone from '../EnhancedDropzone';
import ExportModal from '../ExportModal';
import { LoadingOverlay, ProgressBar } from '../Loading';
import { showToast, updateToast } from '../Toast';
import { saveToHistory } from '../../utils/history';

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
    const [autoProcess, setAutoProcess] = useState(true);
    const [compare, setCompare] = useState(50);
    const [showExportModal, setShowExportModal] = useState(false);

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
            showToast('Carica prima un\'immagine', 'error', 4000, {
                details: 'Nessun file selezionato per l\'elaborazione',
                technical: 'Status: No file provided'
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setProcessedImage(null);
        setProgress(0);

        const startTime = Date.now();
        const file = files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        const toastId = showToast('Elaborazione in corso...', 'progress', 0, {
            progress: 0,
            details: `File: ${file.name.substring(0, 25)}${file.name.length > 25 ? '...' : ''} • ${fileSize} MB`,
            technical: `Type: ${subjectType} • Size: ${mappedSize} • Crop: ${crop ? 'Yes' : 'No'}`
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', subjectType);
        formData.append('size', mappedSize);
        formData.append('crop', crop ? 'true' : 'false');
        if (crop) formData.append('crop_margin', `${cropMargin}%`);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = Math.min(prev + 10, 90);
                updateToast(toastId, { progress: newProgress });
                return newProgress;
            });
        }, 200);

        try {
            const response = await fetch('/api/tools/remove-background', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(95);
            updateToast(toastId, { progress: 95, message: 'Finalizzazione...' });

            if (!response.ok) {
                // Prova a leggere come JSON, altrimenti come testo
                let errorMessage = 'Qualcosa è andato storto';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {
                    errorMessage = `Errore HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setProcessedImage(imageUrl);
            setProgress(100);

            const processTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const outputSize = (blob.size / 1024 / 1024).toFixed(2);

            // Save to history
            const reader = new FileReader();
            reader.onload = () => {
                saveToHistory({
                    tool: 'Rimozione Sfondo AI',
                    filename: file.name,
                    thumbnail: reader.result,
                    params: { subjectType, quality: mappedSize, crop, cropMargin },
                    result: imageUrl
                });
            };
            reader.readAsDataURL(blob);

            updateToast(toastId, {
                type: 'success',
                message: 'Sfondo rimosso con successo!',
                progress: 100,
                details: `Tempo elaborazione: ${processTime}s • Output: ${outputSize} MB`,
                technical: `Algorithm: AI Background Removal • Quality: ${mappedSize} • Compression: ${((1 - blob.size / file.size) * 100).toFixed(1)}%`
            });

        } catch (err) {
            setError(err.message);
            updateToast(toastId, {
                type: 'error',
                message: err.message,
                details: 'Errore durante l\'elaborazione dell\'immagine',
                technical: `Error: ${err.message} • File: ${file.name}`
            });
            clearInterval(progressInterval);
        } finally {
            setIsLoading(false);
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

    // Auto-process when file or main controls change
    useEffect(() => {
        if (autoProcess && files.length > 0) {
            const id = setTimeout(() => handleProcessImage(), 300);
            return () => clearTimeout(id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, subjectType, quality, crop, cropMargin, autoProcess]);

    return (
        <div style={styles.container}>
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
                    <label style={styles.label}>Tipo soggetto</label>
                    <select value={subjectType} onChange={(e)=>setSubjectType(e.target.value)} style={styles.select}>
                        <option value="auto">Auto</option>
                        <option value="person">Persona</option>
                        <option value="product">Prodotto</option>
                        <option value="car">Auto</option>
                        <option value="animal">Animale</option>
                    </select>
                </div>
                <div style={styles.controlBox}>
                    <div style={styles.flexBetween}>
                        <label style={styles.label}>Qualità/Dettagli</label>
                        <span style={styles.badge}>{mappedSize}</span>
                    </div>
                    <input type="range" min="0" max="100" value={quality} onChange={(e)=>setQuality(parseInt(e.target.value,10))} style={styles.slider} />
                </div>
                <div style={styles.controlBox}>
                    <label style={styles.label}>Ritaglio intelligente</label>
                    <div style={styles.checkboxRow}>
                        <input id="crop" type="checkbox" checked={crop} onChange={(e)=>setCrop(e.target.checked)} />
                        <label htmlFor="crop" style={styles.checkLabel}>Crop intorno al soggetto</label>
                    </div>
                    <div style={{...styles.marginControl, opacity: crop ? 1 : 0.5, pointerEvents: crop ? 'auto' : 'none'}}>
                        <div style={styles.flexBetween}>
                            <span style={styles.label}>Margine</span>
                            <span style={styles.badgeSmall}>{cropMargin}%</span>
                        </div>
                        <input type="range" min="0" max="30" value={cropMargin} onChange={(e)=>setCropMargin(parseInt(e.target.value,10))} style={styles.slider} />
                    </div>
                </div>
                <div style={styles.controlBox}>
                    <label style={styles.label}>Anteprima sfondo</label>
                    <div style={styles.bgGrid}>
                        {['checker','transparent','white','black'].map(opt => (
                            <button key={opt} onClick={()=>setBgPreview(opt)} style={{...styles.bgBtn, ...(bgPreview===opt ? styles.bgBtnActive : {}), ...(opt==='checker' ? styles.bgChecker : opt==='white' ? styles.bgWhite : opt==='black' ? styles.bgBlack : styles.bgTransparent)}}>
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
                            <input type="range" min="0" max="100" value={compare} onChange={(e)=>setCompare(parseInt(e.target.value,10))} style={styles.compareSlider} />
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
    compareSection: { marginTop: '32px' },
    compareTitle: { fontSize: '24px', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '16px' },
    compareBox: { position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)' },
    checkerBg: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' },
    imageContainer: { position: 'relative', width: '100%' },
    beforeImg: { display: 'block', width: '100%', height: 'auto', userSelect: 'none' },
    afterImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' },
    divider: { position: 'absolute', top: 0, bottom: 0 },
    dividerLine: { width: '2px', height: '100%', background: '#a78bfa', boxShadow: '0 0 8px rgba(167, 139, 250, 0.6)' },
    sliderRow: { marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' },
    sliderLabel: { fontSize: '12px', color: '#94a3b8' },
    compareSlider: { flex: 1, cursor: 'pointer' }
};
