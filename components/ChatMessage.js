import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function ChatMessage({ message, onFileClick }) {
  const [formattedTime, setFormattedTime] = useState('');
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  useEffect(() => {
    if (message.created_at) {
      setFormattedTime(
        new Date(message.created_at).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    }
  }, [message.created_at]);

  if (isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div style={{
          background: 'rgba(148, 163, 184, 0.1)',
          color: '#64748b',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '20px',
      animation: 'fadeIn 0.3s ease-in'
    }}>
      <div style={{ maxWidth: '700px', width: '100%', paddingLeft: isUser ? '60px' : '0', paddingRight: isUser ? '0' : '60px' }}>
        {/* Avatar & Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          flexDirection: isUser ? 'row-reverse' : 'row'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            background: isUser ? '#667eea' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            color: 'white'
          }}>
            {isUser ? '👤' : '🤖'}
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {formattedTime && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {formattedTime}
            </span>
          )}
        </div>

        {/* Message Content */}
        <div style={{
          borderRadius: '16px',
          padding: '16px 20px',
          background: isUser ? '#667eea' : 'rgba(255, 255, 255, 0.05)',
          border: isUser ? 'none' : '1px solid rgba(102, 126, 234, 0.2)',
          color: isUser ? 'white' : '#f1f5f9',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ borderRadius: '8px', margin: '8px 0' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code style={{
                      background: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.2)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }} {...props}>
                      {children}
                    </code>
                  );
                },
                a({ href, children }) {
                  return (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline', color: isUser ? 'white' : '#a78bfa' }}
                    >
                      {children}
                    </a>
                  );
                },
                p({ children }) {
                  return <p style={{ margin: '8px 0' }}>{children}</p>;
                },
                ul({ children }) {
                  return <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>;
                },
                ol({ children }) {
                  return <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* File Citations */}
          {message.file_references && message.file_references.length > 0 && (
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', opacity: 0.8 }}>
                📚 Referenced Files:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {message.file_references.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => onFileClick && onFileClick(file)}
                    style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.2)',
                      border: 'none',
                      color: isUser ? 'white' : '#a78bfa',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isUser ? 'rgba(255,255,255,0.3)' : 'rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isUser ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.2)';
                    }}
                  >
                    <span>📄</span>
                    <span style={{ fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.filename || file.original_filename}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thinking Indicator */}
        {message.thinking && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%', animation: 'bounce 1s infinite 150ms' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%', animation: 'bounce 1s infinite 300ms' }}></div>
            </div>
            <span style={{ fontSize: '12px' }}>AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
