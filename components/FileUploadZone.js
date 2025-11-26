import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiX, HiDocumentText, HiPhotograph } from 'react-icons/hi';

export default function FileUploadZone({ onFilesSelected, maxFiles = 10 }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadProgress({ current: 0, total: acceptedFiles.length });
    
    try {
      // Prepara FormData per inviare i file al server
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Carica e analizza i file sul server
      // Usa AbortController per timeout (opzionale)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minuti timeout

      const { getApiUrl } = await import('../utils/getApiUrl');
      const apiUrl = await getApiUrl('/api/chat/upload-document');
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // L'API restituisce sempre JSON, quindi proviamo sempre a parsare come JSON
      let result;
      try {
        const text = await response.text();
        result = text && text.trim() ? JSON.parse(text) : {};
      } catch (jsonError) {
        // Se il parsing JSON fallisce, è un errore grave
        console.error('Error parsing JSON response:', jsonError);
        if (!response.ok) {
          throw new Error(`Errore HTTP ${response.status}: impossibile parsare la risposta`);
        }
        throw new Error('Formato risposta non valido dal server');
      }

      // Controlla se la risposta è OK dopo il parsing
      if (!response.ok) {
        const errorMessage = result?.error || result?.details || `Errore HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('Upload API response:', result);

      // Verifica che result.files esista e sia un array
      if (!result.files || !Array.isArray(result.files)) {
        console.warn('Invalid response format:', result);
        throw new Error('Formato risposta non valido dal server');
      }

      // Crea oggetti file con i fileId dal server
      const newFiles = result.files
        .filter(f => f.success && f.fileId)
        .map(fileResult => ({
          id: fileResult.fileId,
          fileId: fileResult.fileId,
          name: fileResult.filename,
          size: fileResult.size || 0,
          type: 'document', // Tipo generico per documenti analizzati
          wordCount: fileResult.wordCount || 0,
          chunkCount: fileResult.chunkCount || 0,
          pages: fileResult.pages || 0,
          preview: null, // Non mostriamo preview per documenti testuali
        }));

      console.log('Processed new files:', newFiles);
      console.log('Full API response files:', result.files);
      console.log('Result structure:', JSON.stringify(result, null, 2));
      
      // Mostra messaggio di successo o errore
      if (newFiles.length > 0) {
        console.log(`${newFiles.length} file analizzati con successo`);
        setUploadProgress({ current: acceptedFiles.length, total: acceptedFiles.length });
        
        // Aggiorna lo stato
        setUploadedFiles(prev => {
          const updated = [...prev, ...newFiles];
          console.log('Updated uploaded files:', updated);
          
          // Chiama onFilesSelected dopo che lo stato è stato aggiornato
          // Usa setTimeout per evitare il warning React
          setTimeout(() => {
            if (onFilesSelected) {
              console.log('Calling onFilesSelected with files:', updated);
              onFilesSelected(updated);
            }
          }, 0);
          
          return updated;
        });
      } else {
        // Se non ci sono file validi, mostra un errore
        const failedFiles = result.files.filter(f => !f.success);
        if (failedFiles.length > 0) {
          // Usa console.warn invece di console.error per evitare l'overlay di Next.js
          console.warn('Alcuni file non sono stati caricati:', failedFiles);
          console.warn('Failed files details:', failedFiles.map(f => ({ filename: f.filename, error: f.error })));
          
          const errorDetails = failedFiles.map(f => `- ${f.filename}: ${f.error || 'Errore sconosciuto'}`).join('\n');
          alert(`Errore: ${failedFiles.length} file non sono stati caricati.\n\nDettagli:\n${errorDetails}\n\nVerifica che siano documenti supportati (PDF, DOCX, XLSX, TXT).`);
        } else {
          console.warn('Nessun file valido nella risposta:', result);
          console.warn('Result structure:', JSON.stringify(result, null, 2));
          alert('Errore: nessun file valido ricevuto dal server. Riprova.\n\nControlla la console per più dettagli.');
        }
      }
    } catch (error) {
      // Usa console.warn per errori gestiti per evitare l'overlay di Next.js
      console.warn('Errore caricamento file:', error);
      const errorMessage = error.message || 'Errore sconosciuto durante il caricamento';
      alert(`Errore nel caricamento: ${errorMessage}\n\nVerifica che:\n- Il file sia un documento supportato (PDF, DOCX, XLSX, TXT)\n- Il file non superi i 50MB\n- La tua connessione internet sia attiva`);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }, [onFilesSelected]); // Rimuovo uploadedFiles dalle dipendenze

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Disabilita il click automatico sul root, lo gestiamo manualmente
    noKeyboard: false, // Assicura che la tastiera funzioni
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      
      // Chiama onFilesSelected dopo che lo stato è stato aggiornato
      setTimeout(() => {
        if (onFilesSelected) {
          onFilesSelected(updated);
        }
      }, 0);
      
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <HiPhotograph style={{ fontSize: '24px', color: '#667eea' }} />;
    return <HiDocumentText style={{ fontSize: '24px', color: '#667eea' }} />;
  };

  return (
    <div style={styles.container}>
      <div
        {...getRootProps({
          onClick: (e) => {
            // Ferma la propagazione per evitare che il click chiuda altri elementi
            e.stopPropagation();
            // Apri il file dialog quando si clicca sulla zona
            if (!uploading) {
              open();
            }
          },
          onKeyDown: (e) => {
            // Ferma la propagazione anche per la tastiera
            e.stopPropagation();
            // Apri il file dialog con Enter o Space
            if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
              e.preventDefault();
              open();
            }
          }
        })}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
          ...(uploading ? styles.dropzoneUploading : {})
        }}
      >
        <input 
          {...getInputProps()} 
          aria-label="Carica documenti da analizzare"
          title="Carica documenti"
        />
        <div style={{ ...styles.uploadIcon, pointerEvents: 'none' }}>
          <HiOutlineUpload style={{ fontSize: '48px', color: isDragActive ? '#667eea' : '#94a3b8' }} />
        </div>
        <h3 style={{ ...styles.uploadTitle, pointerEvents: 'none' }}>
          {isDragActive ? 'Rilascia i file qui' : 'Trascina i file o clicca per selezionare'}
        </h3>
        <p style={{ ...styles.uploadDesc, pointerEvents: 'none' }}>
          Supportati: PDF, DOCX, XLSX, TXT, CSV, Immagini<br/>
          Max 100MB per file
        </p>
        {uploading && (
          <div style={{ ...styles.uploadingIndicator, pointerEvents: 'none' }}>
            <div style={styles.spinner}></div>
            <span>
              {uploadProgress.total > 1 
                ? `Caricamento ${uploadProgress.current}/${uploadProgress.total} file...`
                : 'Caricamento e analisi in corso...'}
            </span>
            {uploadProgress.total > 1 && (
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div style={styles.filesList}>
          <h4 style={styles.filesListTitle}>File caricati ({uploadedFiles.length})</h4>
          <div style={styles.filesGrid}>
            {uploadedFiles.map((fileItem) => (
              <div key={fileItem.id} style={styles.fileCard}>
                <button
                  onClick={() => removeFile(fileItem.id)}
                  style={styles.removeBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  <HiX style={{ fontSize: '16px' }} />
                </button>
                
                {fileItem.preview ? (
                  <div style={styles.filePreview}>
                    <img src={fileItem.preview} alt={fileItem.name} style={styles.previewImage} />
                  </div>
                ) : (
                  <div style={styles.fileIcon}>
                    {getFileIcon(fileItem.type)}
                  </div>
                )}
                
                <div style={styles.fileInfo}>
                  <div style={styles.fileName}>{fileItem.name}</div>
                  <div style={styles.fileSize}>{formatFileSize(fileItem.size)}</div>
                </div>
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
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto'
  },
  dropzone: {
    border: '2px dashed rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    padding: '56px 32px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
    backdropFilter: 'blur(16px)',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
  },
  dropzoneActive: {
    borderColor: '#667eea',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%)',
    transform: 'scale(1.02)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 40px rgba(102, 126, 234, 0.2)'
  },
  dropzoneUploading: {
    opacity: 0.7,
    pointerEvents: 'none'
  },
  uploadIcon: {
    marginBottom: '16px'
  },
  uploadTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px'
  },
  uploadDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0
  },
  uploadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '16px',
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '600'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  progressBar: {
    width: '100%',
    maxWidth: '300px',
    height: '4px',
    background: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #8a5db8 100%)',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },
  filesList: {
    marginTop: '32px'
  },
  filesListTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '16px'
  },
  filesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px'
  },
  fileCard: {
    position: 'relative',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 126, 234, 0.25)',
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden'
  },
  removeBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ef4444',
    transition: 'all 0.2s',
    zIndex: 1
  },
  filePreview: {
    width: '100%',
    height: '120px',
    marginBottom: '12px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  fileIcon: {
    width: '100%',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  fileInfo: {
    textAlign: 'left'
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  fileSize: {
    fontSize: '12px',
    color: '#64748b'
  }
};
