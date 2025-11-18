import { useState, useCallback, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiX, HiDownload } from 'react-icons/hi';

// Generic converter UI: upload a file, select output (currently limited), perform placeholder conversion.
function GenericConverter({ tool }) {
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

  const availableOutputs = [tool.targetFormat, 'pdf', 'txt', 'jpg', 'png']; // initial generic options

  // Drag and drop handler
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      // Generate preview for images
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  }, []);

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
    if (!file) return;
    setLoading(true); 
    setError(null); 
    setResultDataUrl(null); 
    setResultName(null);
    try {
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
      
      const res = await fetch(`/api/convert/${outputFormat}`, { 
        method: 'POST', 
        body: form,
        // Timeout per file grandi
        signal: AbortSignal.timeout(300000) // 5 minuti
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Conversione fallita');
      }
      
      const data = await res.json();
      setResultName(data.name);
      setResultDataUrl(data.dataUrl);
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Timeout: il file è troppo grande o la conversione richiede troppo tempo.');
      } else {
        setError(e.message || 'Errore durante la conversione');
      }
    } finally {
      setLoading(false);
    }
  }, [file, outputFormat, width, height, quality, vWidth, vHeight, vBitrate, aBitrate, page]);

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
          <a href={resultDataUrl} download={resultName} style={styles.downloadBtn}>
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
