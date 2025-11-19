import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiX, HiDocumentText, HiPhotograph } from 'react-icons/hi';

export default function FileUploadZone({ onFilesSelected, maxFiles = 10 }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (onFilesSelected) {
      onFilesSelected([...uploadedFiles, ...newFiles]);
    }
    
    setUploading(false);
  }, [uploadedFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
      if (onFilesSelected) {
        onFilesSelected(updated);
      }
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
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
          ...(uploading ? styles.dropzoneUploading : {})
        }}
      >
        <input {...getInputProps()} />
        <div style={styles.uploadIcon}>
          <HiOutlineUpload style={{ fontSize: '48px', color: isDragActive ? '#667eea' : '#94a3b8' }} />
        </div>
        <h3 style={styles.uploadTitle}>
          {isDragActive ? 'Rilascia i file qui' : 'Trascina i file o clicca per selezionare'}
        </h3>
        <p style={styles.uploadDesc}>
          Supportati: PDF, DOCX, XLSX, TXT, CSV, Immagini<br/>
          Max 100MB per file
        </p>
        {uploading && (
          <div style={styles.uploadingIndicator}>
            <div style={styles.spinner}></div>
            <span>Caricamento...</span>
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
    overflow: 'hidden'
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
