import { useState, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiX, HiDownload } from 'react-icons/hi';
import * as analytics from '../lib/analytics';
import { fetchWithErrorHandling, handleError } from '../utils/errorHandler';
import ConverterCards from './ConverterCards';

// Generic converter UI: upload a file, select output (currently limited), perform placeholder conversion.
function GenericConverter({ tool }) {
  const router = useRouter();
  // Estrai lo slug dall'URL o dal tool
  const currentSlug = router.query.slug || tool?.slug || (tool?.href ? tool.href.replace('/tools/', '') : null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outputFormat, setOutputFormat] = useState(tool.targetFormat);
  const [resultName, setResultName] = useState(null);
  const [resultDataUrl, setResultDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quality, setQuality] = useState('80');
  const [vWidth, setVWidth] = useState('');
  const [vHeight, setVHeight] = useState('');
  const [vBitrate, setVBitrate] = useState('2500k');
  const [aBitrate, setABitrate] = useState('192k');
  const [page, setPage] = useState('0');
  const [isDragActive, setIsDragActive] = useState(false);

  // Rimuovi duplicati dall'array degli output disponibili
  const availableOutputs = useMemo(() => {
    const outputs = [tool.targetFormat, 'pdf', 'txt', 'jpg', 'png'];
    // Rimuovi duplicati mantenendo l'ordine
    return [...new Set(outputs)];
  }, [tool.targetFormat]);

  // Drag and drop handler
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Track file upload
      const fileType = selectedFile.type || selectedFile.name.split('.').pop();
      analytics.trackFileUpload(fileType, selectedFile.size, tool?.title || tool?.name);
      analytics.trackToolStart(tool?.title || tool?.name, fileType, selectedFile.size);
      
      // Generate preview for images
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  }, [tool]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => {
      setIsDragActive(false);
      setError('File non supportato. Controlla il formato.');
    }
  });

  const handleConvert = useCallback(async () => {
    if (!file) {
      setError('Seleziona un file prima di convertire.');
      return;
    }
    
    // Valida che il file non sia vuoto
    if (file.size === 0) {
      setError('Il file è vuoto. Carica un file valido.');
      return;
    }
    
    setLoading(true); 
    setError(null); 
    setResultDataUrl(null); 
    setResultName(null);
    
    const startTime = Date.now();
    const fromFormat = file.name.split('.').pop() || file.type;
    
    try {
      // Verifica che il file esista e abbia una dimensione valida
      if (!file || file.size === 0) {
        throw new Error('Il file è vuoto o non valido. Carica un file valido.');
      }
      
      const form = new FormData();
      form.append('file', file);
      form.append('target', outputFormat);
      if (width) form.append('width', width);
      if (height) form.append('height', height);
      if (quality) form.append('quality', quality);
      if (vWidth) form.append('vwidth', vWidth);
      if (vHeight) form.append('vheight', vHeight);
      if (vBitrate) form.append('vbitrate', vBitrate);
      if (aBitrate) form.append('abitrate', aBitrate);
      if (page) form.append('page', page);
      
      // Determina quale API chiamare in base allo slug del tool
      let apiUrl = `/api/convert/${outputFormat}`;
      const toolSlug = tool?.slug || currentSlug;
      
      // Mappa dei convertitori PDF agli endpoint dedicati
      const pdfConverterMap = {
        'pdf-to-docx': '/api/pdf/pdf-to-docx',
        'pdf-to-pptx': '/api/pdf/pdf-to-pptx',
        'pdf-to-powerpoint': '/api/pdf/pdf-to-pptx',
        'pdf-to-xlsx': '/api/pdf/pdf-to-xlsx',
        'pdf-to-excel': '/api/pdf/pdf-to-xlsx',
        'pdf-to-jpg': '/api/pdf/pdf-to-jpg',
        'pdf-to-png': '/api/pdf/pdf-to-jpg', // PDF to PNG usa lo stesso endpoint
        'pdf-to-txt': '/api/pdf/pdf-to-txt',
        'pdf-to-html': '/api/pdf/pdf-to-html',
        'pdf-to-pdfa': '/api/pdf/pdf-to-pdfa',
        'docx-to-pdf': '/api/pdf/docx-to-pdf',
        'powerpoint-to-pdf': '/api/pdf/ppt-to-pdf',
        'excel-to-pdf': '/api/pdf/xls-to-pdf',
        'html-to-pdf': '/api/pdf/html-to-pdf'
      };
      
      // Se è un convertitore PDF, usa l'endpoint dedicato
      if (toolSlug && pdfConverterMap[toolSlug]) {
        apiUrl = pdfConverterMap[toolSlug];
      }
      
      // Verifica che l'URL sia valido
      if (!apiUrl || !apiUrl.startsWith('/')) {
        throw new Error(`URL API non valido: ${apiUrl}`);
      }
      
      // Crea un AbortController per gestire timeout
      const controller = new AbortController();
      let timeoutId;
      let response;
      
      try {
        timeoutId = setTimeout(() => {
          controller.abort();
          console.warn('Timeout raggiunto dopo 5 minuti');
        }, 300000); // 5 minuti
        
        console.log('Chiamata API:', apiUrl, 'con file:', file.name);
        
        // Use improved error handling
        response = await fetch(apiUrl, { 
          method: 'POST', 
          body: form,
          headers: {}, // Don't set Content-Type for FormData, browser will set it with boundary
          signal: controller.signal
        });
        
        console.log('Risposta ricevuta:', response.status, response.statusText);
        
        // Pulisci il timeout se la richiesta è completata
        clearTimeout(timeoutId);
        
        // Se la richiesta è stata abortita, esci
        if (controller.signal.aborted) {
          throw new Error('Operazione annullata per timeout');
        }
      } catch (fetchError) {
        // Pulisci sempre il timeout in caso di errore
        clearTimeout(timeoutId);
        
        // Gestisci errori di rete
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: l\'operazione ha richiesto troppo tempo. Riprova con un file più piccolo.');
        }
        
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          throw new Error('Errore di connessione. Controlla la tua connessione internet e riprova.');
        }
        
        // Rilancia altri errori
        throw new Error(`Errore durante la richiesta: ${fetchError.message || 'Errore sconosciuto'}`);
      }
      
      if (!response.ok) {
        let errorMessage = `Errore HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          // Gestisci diversi formati di errore
          if (errorData.error) {
            errorMessage = errorData.error;
            // Se c'è un hint, aggiungilo al messaggio
            if (errorData.hint) {
              errorMessage += `. ${errorData.hint}`;
            }
          } else if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Se la risposta non è JSON, usa il messaggio di default
          errorMessage = `Errore durante l'upload: il file potrebbe essere vuoto o non valido`;
        }
        
        // Messaggi di errore più specifici per errori comuni
        if (response.status === 400) {
          errorMessage = errorMessage.includes('vuoto') || errorMessage.includes('empty') 
            ? errorMessage 
            : 'File non valido o formato non supportato. ' + (errorMessage !== `Errore HTTP ${response.status}` ? errorMessage : '');
        } else if (response.status === 413) {
          errorMessage = 'File troppo grande. Dimensione massima: 50MB per file';
        } else if (response.status === 500) {
          errorMessage = errorMessage !== `Errore HTTP ${response.status}` ? errorMessage : 'Errore del server durante la conversione';
        }
        
        throw new Error(errorMessage);
      }
      
      // Verifica che la risposta sia JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Prova a leggere come testo per vedere cosa c'è
        const text = await response.text();
        console.error('Risposta non JSON ricevuta:', text.substring(0, 200));
        throw new Error('Il server ha restituito una risposta non valida. Riprova più tardi.');
      }
      
      // Parsing della risposta JSON con gestione errori
      let data;
      try {
        const text = await response.text();
        if (!text || text.trim().length === 0) {
          throw new Error('Risposta vuota dal server');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Errore parsing JSON:', parseError);
        throw new Error('Errore nel parsing della risposta dal server. La conversione potrebbe essere fallita.');
      }
      
      const duration = Date.now() - startTime;
      
      // Verifica che i dati siano validi
      if (!data || (typeof data !== 'object')) {
        throw new Error('Formato risposta non valido dal server');
      }
      
      // Gestisci due tipi di risposta:
      // 1. { name, dataUrl } - da /api/convert/[target]
      // 2. { url } - da /api/pdf/pdf-to-* (ConvertAPI o altro)
      let resultName = null;
      let resultDataUrl = null;
      
      if (data.dataUrl) {
        // Formato standard { name, dataUrl }
        if (typeof data.dataUrl !== 'string' || data.dataUrl.trim().length === 0) {
          throw new Error('Data URL non valido nella risposta');
        }
        resultName = data.name || `converted.${outputFormat}`;
        resultDataUrl = data.dataUrl;
      } else if (data.url) {
        // Formato PDF converter { url, name? }
        if (typeof data.url !== 'string' || data.url.trim().length === 0) {
          throw new Error('URL non valido nella risposta');
        }
        
        // Gestisci diversi tipi di URL:
        // 1. Data URL già presente (es. pdf-to-pptx, pdf-to-xlsx)
        // 2. URL esterno (es. ConvertAPI per pdf-to-docx)
        if (data.url.startsWith('data:')) {
          // Data URL già presente - usa direttamente
          resultDataUrl = data.url;
        } else if (data.url.startsWith('http://') || data.url.startsWith('https://')) {
          // URL esterno (es. ConvertAPI) - scarica il file e convertilo in data URL
          try {
            const fileResponse = await fetch(data.url, { 
              signal: controller.signal 
            });
            if (!fileResponse.ok) {
              throw new Error(`Errore nel download del file convertito: HTTP ${fileResponse.status}`);
            }
            const blob = await fileResponse.blob();
            if (!blob || blob.size === 0) {
              throw new Error('File scaricato è vuoto');
            }
            const reader = new FileReader();
            resultDataUrl = await new Promise((resolve, reject) => {
              reader.onloadend = () => {
                if (reader.result) {
                  resolve(reader.result);
                } else {
                  reject(new Error('Errore nella lettura del file'));
                }
              };
              reader.onerror = () => reject(new Error('Errore nella lettura del file'));
              reader.readAsDataURL(blob);
            });
          } catch (downloadError) {
            console.error('Errore download file:', downloadError);
            throw new Error(`Errore nel download del file convertito: ${downloadError.message}`);
          }
        } else {
          // Altro formato - prova a usarlo come data URL
          resultDataUrl = data.url;
        }
        resultName = data.name || file.name.replace(/\.[^.]+$/, `.${outputFormat}`);
      } else {
        console.error('Risposta non riconosciuta:', data);
        throw new Error('Formato risposta non riconosciuto dal server. Risposta: ' + JSON.stringify(data).substring(0, 100));
      }
      
      // Track successful conversion
      analytics.trackConversion(
        'file_conversion',
        fromFormat,
        outputFormat,
        file.size,
        duration
      );
      analytics.trackToolComplete(tool?.title || tool?.name, duration, true);
      
      setResultName(resultName);
      setResultDataUrl(resultDataUrl);
    } catch (e) {
      const duration = Date.now() - startTime;
      
      // Track failed conversion
      analytics.trackToolComplete(tool?.title || tool?.name, duration, false);
      analytics.trackError(
        e.message || 'Conversion failed',
        'GenericConverter',
        'conversion_error'
      );
      
      // Error handling
      const handledError = handleError(e);
      setError(handledError.message);
      console.error('Errore conversione:', e);
    } finally {
      // Assicurati che il timeout venga sempre pulito
      if (typeof timeoutId !== 'undefined') {
        clearTimeout(timeoutId);
      }
      setLoading(false);
    }
  }, [file, outputFormat, width, height, quality, vWidth, vHeight, vBitrate, aBitrate, page, tool, currentSlug]);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResultDataUrl(null);
    setResultName(null);
    setError(null);
  }, []);

  return (
    <div style={styles.wrap}>
      {/* Card dei convertitori della stessa categoria */}
      <ConverterCards currentTool={tool} currentSlug={currentSlug} />
      
      <div style={styles.panel}>
        <h2 style={styles.title}>Converti {tool.title}</h2>
        <p style={styles.desc}>{tool.description}</p>
        
        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            {...getRootProps()}
            style={{
              ...styles.dropzone,
              ...(isDragActive ? styles.dropzoneActive : {})
            }}
          >
            <input {...getInputProps()} onChange={handleFileSelect} />
            <HiUpload style={styles.uploadIcon} />
            <h3 style={styles.dropzoneTitle}>
              {isDragActive ? 'Rilascia qui il file' : 'Trascina il file qui o clicca per selezionare'}
            </h3>
            <p style={styles.dropzoneSubtitle}>
              Supportati: Immagini, PDF, Documenti, Video, Audio
            </p>
          </div>
        ) : (
          <div style={styles.filePreviewContainer}>
            {preview && (
              <div style={styles.imagePreview}>
                <img src={preview} alt="Preview" style={styles.previewImg} />
              </div>
            )}
            <div style={styles.fileInfo}>
              <div style={styles.fileName}>{file.name}</div>
              <div style={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button onClick={handleRemoveFile} style={styles.removeBtn}>
              <HiX style={{ width: 20, height: 20 }} />
            </button>
          </div>
        )}
        <label style={styles.label}>Formato di destinazione</label>
        <select 
          value={outputFormat} 
          onChange={e => setOutputFormat(e.target.value)} 
          style={styles.select}
          disabled={loading}
        >
          {availableOutputs.map(fmt => <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>)}
        </select>
        {(outputFormat === 'jpg' || outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'png') && (
          <div style={styles.optionsRow}>
            <div style={styles.optionField}>
              <label style={styles.label}>Larghezza (px)</label>
              <input value={width} onChange={e => setWidth(e.target.value)} placeholder="es. 1920" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Altezza (px)</label>
              <input value={height} onChange={e => setHeight(e.target.value)} placeholder="es. 1080" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Qualità</label>
              <input value={quality} onChange={e => setQuality(e.target.value)} placeholder="1-100" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Pagina (PDF)</label>
              <input value={page} onChange={e => setPage(e.target.value)} placeholder="0 = prima pagina" style={styles.input} />
            </div>
          </div>
        )}
        {(['mp4','webm','avi','mkv','mov','flv'].includes(outputFormat)) && (
          <div style={styles.optionsRow}>
            <div style={styles.optionField}>
              <label style={styles.label}>Video larghezza</label>
              <input value={vWidth} onChange={e => setVWidth(e.target.value)} placeholder="es. 1280" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Video altezza</label>
              <input value={vHeight} onChange={e => setVHeight(e.target.value)} placeholder="es. 720" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Bitrate video</label>
              <input value={vBitrate} onChange={e => setVBitrate(e.target.value)} placeholder="es. 2500k" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Bitrate audio</label>
              <input value={aBitrate} onChange={e => setABitrate(e.target.value)} placeholder="es. 192k" style={styles.input} />
            </div>
          </div>
        )}
        <button 
          onClick={handleConvert} 
          disabled={!file || loading} 
          style={{
            ...styles.btn,
            ...(loading ? styles.btnLoading : {}),
            ...(!file ? styles.btnDisabled : {})
          }}
        >
          {loading ? (
            <>
              <span style={styles.spinner}></span>
              Conversione...
            </>
          ) : (
            'Converti'
          )}
        </button>
        {error && <div style={styles.error}>{error}</div>}
      </div>
      {resultDataUrl && (
        <div style={styles.result}>
          <h3 style={styles.resultTitle}>✓ Conversione completata!</h3>
          <p style={styles.resultName}>{resultName}</p>
          <a 
            href={resultDataUrl} 
            download={resultName} 
            style={styles.downloadBtn}
            onClick={() => {
              const fileType = resultName.split('.').pop() || 'unknown';
              analytics.trackDownload(fileType, tool?.title || tool?.name, file?.size);
            }}
          >
            <HiDownload style={{ width: 18, height: 18, marginRight: '8px' }} />
            Scarica file
          </a>
          {resultDataUrl.startsWith('data:image') && (
            <div style={styles.resultPreview}>
              <img src={resultDataUrl} alt={resultName} style={styles.resultImg} />
            </div>
          )}
          {resultDataUrl.startsWith('data:text') && (
            <textarea readOnly value={atob(resultDataUrl.split(',')[1])} style={styles.previewText} />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(GenericConverter);

const styles = {
  wrap: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '32px', 
    marginTop: '24px',
    animation: 'fadeIn 0.5s ease-out',
    '@media (max-width: 768px)': {
      gap: '24px',
      marginTop: '16px'
    }
  },
  panel: { 
    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%)', 
    border: '1px solid rgba(102, 126, 234, 0.2)', 
    padding: '32px', 
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    '@media (max-width: 768px)': {
      padding: '20px',
      borderRadius: '12px'
    }
  },
  title: { 
    margin: '0 0 8px', 
    fontSize: '24px', 
    fontWeight: 700,
    background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    '@media (max-width: 768px)': {
      fontSize: '20px'
    }
  },
  desc: { 
    margin: '0 0 24px', 
    color: '#94a3b8', 
    fontSize: '15px', 
    lineHeight: '1.6',
    '@media (max-width: 768px)': {
      fontSize: '14px',
      margin: '0 0 20px'
    }
  },
  dropzone: {
    border: '2px dashed rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(15, 23, 42, 0.4)',
    marginBottom: '24px',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    '@media (max-width: 768px)': {
      padding: '32px 16px',
      borderRadius: '12px',
      marginBottom: '20px'
    }
  },
  dropzoneActive: {
    borderColor: '#667eea',
    background: 'rgba(102, 126, 234, 0.1)',
    transform: 'scale(1.02)',
    '@media (max-width: 768px)': {
      transform: 'scale(1.01)'
    }
  },
  uploadIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
    color: '#667eea',
    '@media (max-width: 768px)': {
      width: '48px',
      height: '48px',
      margin: '0 auto 12px'
    }
  },
  dropzoneTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e6eef8',
    margin: '0 0 8px',
    '@media (max-width: 768px)': {
      fontSize: '16px'
    }
  },
  dropzoneSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: '13px',
      padding: '0 8px'
    }
  },
  filePreviewContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    '@media (max-width: 768px)': {
      padding: '12px',
      gap: '12px',
      marginBottom: '20px'
    }
  },
  imagePreview: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
    '@media (max-width: 768px)': {
      width: '50px',
      height: '50px'
    }
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  fileInfo: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e6eef8',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  fileSize: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  removeBtn: {
    padding: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#ef4444',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: { 
    fontSize: '12px', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em', 
    color: '#94a3b8',
    fontWeight: 600,
    marginBottom: '8px',
    display: 'block'
  },
  select: { 
    margin: '8px 0 16px', 
    padding: '12px', 
    borderRadius: '10px', 
    background: 'rgba(15, 23, 42, 0.8)', 
    color: '#e6eef8', 
    border: '1px solid rgba(102, 126, 234, 0.3)',
    width: '100%',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btn: { 
    padding: '14px 28px', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 600,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    width: '100%',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    '@media (max-width: 768px)': {
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '10px'
    }
  },
  btnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: 'rgba(102, 126, 234, 0.3)'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  error: { 
    marginTop: '16px', 
    padding: '12px 16px',
    color: '#ef4444', 
    fontSize: '14px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px'
  },
  result: { 
    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.8) 100%)', 
    border: '1px solid rgba(16, 185, 129, 0.3)', 
    padding: '32px', 
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    animation: 'slideIn 0.5s ease-out'
  },
  resultTitle: { 
    margin: '0 0 12px', 
    fontSize: '20px', 
    fontWeight: 700,
    color: '#10b981'
  },
  resultName: { 
    margin: '0 0 20px', 
    color: '#94a3b8', 
    fontSize: '14px' 
  },
  downloadBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px', 
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
    color: '#fff', 
    borderRadius: '12px', 
    textDecoration: 'none', 
    fontSize: '14px', 
    fontWeight: 600,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    marginBottom: '20px'
  },
  resultPreview: {
    marginTop: '20px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  resultImg: { 
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  previewText: { 
    marginTop: '16px', 
    width: '100%', 
    minHeight: '160px', 
    background: 'rgba(15, 23, 42, 0.8)', 
    color: '#e6eef8', 
    border: '1px solid rgba(102, 126, 234, 0.3)', 
    borderRadius: '10px', 
    padding: '16px', 
    fontFamily: 'monospace', 
    fontSize: '13px',
    lineHeight: '1.6',
    resize: 'vertical'
  },
  optionsRow: { 
    display: 'flex', 
    gap: '12px', 
    marginBottom: '20px',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '16px'
    }
  },
  optionField: { 
    flex: '1 1 200px',
    minWidth: '150px',
    '@media (max-width: 768px)': {
      flex: '1 1 100%',
      minWidth: '100%'
    }
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    background: 'rgba(15, 23, 42, 0.8)', 
    color: '#e6eef8', 
    border: '1px solid rgba(102, 126, 234, 0.3)',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    WebkitTapHighlightColor: 'transparent',
    '@media (max-width: 768px)': {
      padding: '10px',
      fontSize: '16px', // Prevent zoom on iOS
      borderRadius: '8px'
    }
  }
};

// Aggiungi animazioni CSS
if (typeof document !== 'undefined') {
  const styleId = 'generic-converter-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}
