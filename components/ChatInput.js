import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSendMessage, disabled, selectedFiles = [] }) {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage({
      content: message,
      fileIds: attachedFiles.map(f => f.id),
    });

    setMessage('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const attachFile = (file) => {
    if (!attachedFiles.find(f => f.id === file.id)) {
      setAttachedFiles([...attachedFiles, file]);
    }
  };

  const removeFile = (fileId) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== fileId));
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    // TODO: Handle file upload logic
    console.log('Files selected:', files);
  };

  return (
    <div style={{
      borderTop: '1px solid rgba(102, 126, 234, 0.2)',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      padding: isMobile ? '8px 12px' : '20px 24px'
    }}>
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              style={{
                background: 'rgba(102, 126, 234, 0.15)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#f1f5f9'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span style={{ fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.original_filename}
              </span>
              <button
                onClick={() => removeFile(file.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a78bfa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick File Selection */}
      {selectedFiles.length > 0 && attachedFiles.length === 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Quick attach from your files:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedFiles.slice(0, 5).map((file) => (
              <button
                key={file.id}
                onClick={() => attachFile(file)}
                style={{
                  fontSize: '12px',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.original_filename}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: isMobile ? '6px' : '12px'
      }}>
        {/* File Upload Button (Mobile only) */}
        {isMobile && (
          <button
            type="button"
            onClick={handleFileUploadClick}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '32px',
              height: '32px',
              flexShrink: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isMobile ? "Scrivi un messaggio..." : "Ask me anything about your files... (Shift+Enter for new line)"}
            disabled={disabled}
            rows={1}
            style={{
              width: '100%',
              padding: isMobile ? '7px 12px' : '14px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: isMobile ? '16px' : '12px',
              color: '#f1f5f9',
              fontSize: isMobile ? '13px' : '15px',
              lineHeight: isMobile ? '18px' : '1.5',
              resize: 'none',
              maxHeight: isMobile ? '32px' : '200px',
              minHeight: isMobile ? '32px' : 'auto',
              overflow: isMobile ? 'hidden' : 'auto',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              whiteSpace: isMobile ? 'nowrap' : 'pre-wrap'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          />

          {/* Character Count */}
          {message.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '11px',
              color: '#64748b'
            }}>
              {message.length}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          style={{
            background: disabled ? '#4b5563' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: isMobile ? '6px' : '14px 20px',
            borderRadius: isMobile ? '50%' : '12px',
            border: 'none',
            fontWeight: '600',
            fontSize: isMobile ? '14px' : '15px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '0' : '8px',
            transition: 'all 0.3s',
            boxShadow: disabled ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)',
            opacity: disabled ? 0.5 : 1,
            minWidth: isMobile ? '32px' : 'auto',
            width: isMobile ? '32px' : 'auto',
            height: isMobile ? '32px' : 'auto',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          {disabled ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              {!isMobile && <span>Sending...</span>}
            </>
          ) : (
            <>
              {!isMobile && <span>Send</span>}
              <svg width={isMobile ? "16" : "18"} height={isMobile ? "16" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Helper Text */}
      {!isMobile && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Tip: Attach files to ask specific questions about their content</span>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
