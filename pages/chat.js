import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import Navbar from '../components/Navbar';
import FileUploadZone from '../components/FileUploadZone';
import Footer from '../components/Footer';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    // Allow access without login for testing
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
    await loadFiles();
    await loadConversations();
    setLoading(false);
  };

  const loadFiles = async () => {
    // Mock per ora - in futuro collegare alle API
    setFiles([]);
  };

  const loadConversations = async () => {
    // Mock per ora
    setConversations([]);
  };

  const startNewConversation = async () => {
    setCurrentConversationId(crypto.randomUUID());
    setMessages([]);
  };

  const handleSendMessage = async ({ content, fileIds }) => {
    setSending(true);

    // Add user message
    const userMsg = {
      role: 'user',
      content,
      file_references: fileIds.map(id => files.find(f => f.id === id)).filter(Boolean),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Add thinking indicator
    const thinkingMsg = {
      role: 'assistant',
      content: '',
      thinking: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, thinkingMsg]);

    try {
      // Simulate API call (sostituire con vera chiamata API quando Supabase sarà configurato)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse = {
        role: 'assistant',
        content: `I received your message: "${content}"\n\nThis is currently a demo response. Once Supabase and OpenAI are configured, I will be able to:\n- Search through your files\n- Analyze documents\n- Provide intelligent AI responses\n- Cite specific sources`,
        file_references: [],
        created_at: new Date().toISOString(),
      };

      setMessages(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [...filtered, aiResponse];
      });

    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => prev.filter(m => !m.thinking));
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleFileClick = (file) => {
    console.log('File clicked:', file);
  };

  const handleFilesUploaded = (uploadedFiles) => {
    console.log('Files uploaded:', uploadedFiles);
    // Mock: in futuro salvare su server
    const mockFiles = uploadedFiles.map(f => ({
      id: f.id,
      name: f.name,
      original_filename: f.name,
      size: f.size,
      type: f.type
    }));
    setFiles(prev => [...prev, ...mockFiles]);
    setShowUpload(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI Chat - MegaPixelAI</title>
      </Head>

      <div style={styles.container}>
        <Navbar />

        <div style={styles.chatContainer}>
          {/* Sidebar - Desktop only */}
          {!isMobile && sidebarOpen && (
            <aside style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <h2 style={styles.sidebarTitle}>Conversations</h2>
                <button
                  onClick={startNewConversation}
                  style={styles.newChatBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>+</span>
                  <span>New Chat</span>
                </button>
              </div>

              <div style={styles.conversationsList}>
                {conversations.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>No conversations yet.</p>
                    <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>Start a new chat!</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {/* load conversation */}}
                      style={styles.conversationItem}
                    >
                      {conv.title}
                    </button>
                  ))
                )}
              </div>

              <div style={styles.sidebarFooter}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <span>Your Documents</span>
                </div>
                
                {files.length === 0 ? (
                  <div style={{ 
                    padding: '24px 16px', 
                    textAlign: 'center',
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowUpload(true)}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto', color: '#667eea' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                      No documents uploaded
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#667eea',
                      fontWeight: '600'
                    }}>
                      Click to upload
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.filesList}>
                      {files.slice(0, 10).map((file) => (
                        <div key={file.id} style={styles.fileItem}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span style={styles.fileName}>{file.original_filename || file.name}</span>
                        </div>
                      ))}
                    </div>
                    {files.length > 10 && (
                      <div style={{ 
                        textAlign: 'center', 
                        fontSize: '12px', 
                        color: '#64748b',
                        marginTop: '8px'
                      }}>
                        +{files.length - 10} altri file
                      </div>
                    )}
                    <button
                      onClick={() => router.push('/dashboard')}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '12px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '8px',
                        color: '#667eea',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                    >
                      Manage Files
                    </button>
                  </>
                )}
              </div>
            </aside>
          )}

          {/* Chat Area */}
          <main style={styles.main}>
            {/* Header */}
            <div style={{
              ...styles.chatHeader,
              padding: isMobile ? '8px 12px' : '20px 24px',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              {!isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={styles.toggleBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              )}
              <h1 style={{
                ...styles.chatTitle,
                fontSize: isMobile ? '16px' : '20px'
              }}>
                <svg width={isMobile ? "18" : "24"} height={isMobile ? "18" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: isMobile ? '6px' : '12px' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{isMobile ? 'Documenti AI' : 'AI Document Intelligence'}</span>
              </h1>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {showUpload ? (
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
                      Carica Documenti
                    </h2>
                    <button
                      onClick={() => setShowUpload(false)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Chiudi
                    </button>
                  </div>
                  <FileUploadZone onFilesSelected={handleFilesUploaded} />
                </div>
              ) : messages.length === 0 ? (
                <div style={styles.emptyChat}>
                  {isMobile ? (
                    /* Mobile empty state */
                    <>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                        Analizza Documenti
                      </h2>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5', maxWidth: '280px' }}>
                        Carica file e inizia a chattare con l'AI
                      </p>
                      <button
                        onClick={() => setShowUpload(true)}
                        style={{
                          padding: '12px 32px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '28px',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Carica Documenti
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', width: '70px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            margin: '0 auto 8px',
                            background: 'rgba(102, 126, 234, 0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          </div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>PDF, DOCX</span>
                        </div>
                        <div style={{ textAlign: 'center', width: '70px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            margin: '0 auto 8px',
                            background: 'rgba(102, 126, 234, 0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8"></circle>
                              <path d="m21 21-4.35-4.35"></path>
                            </svg>
                          </div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ricerca AI</span>
                        </div>
                        <div style={{ textAlign: 'center', width: '70px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            margin: '0 auto 8px',
                            background: 'rgba(102, 126, 234, 0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Chat AI</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Desktop empty state */
                    <>
                      <div style={styles.aiAvatar}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <h2 style={styles.emptyChatTitle}>Analyze Your Documents with AI</h2>
                      <p style={styles.emptyChatDesc}>
                        Upload files and ask questions about the content. AI analyzes, extracts information, and answers your questions.
                      </p>

                      <div style={styles.suggestedPrompts}>
                    <button
                      onClick={() => handleSendMessage({ content: 'How does document analysis work?', fileIds: [] })}
                      style={styles.promptBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <div style={styles.promptIconPro}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                      <div>
                        <div style={styles.promptTitle}>How It Works</div>
                        <div style={styles.promptDesc}>Discover the features</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSendMessage({ content: 'What file formats are supported?', fileIds: [] })}
                      style={styles.promptBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <div style={styles.promptIconPro}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <div>
                        <div style={styles.promptTitle}>Supported Formats</div>
                        <div style={styles.promptDesc}>PDF, DOCX, XLSX, images</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSendMessage({ content: 'What can you do with my documents?', fileIds: [] })}
                      style={styles.promptBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <div style={styles.promptIconPro}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                      </div>
                      <div>
                        <div style={styles.promptTitle}>AI Capabilities</div>
                        <div style={styles.promptDesc}>Analysis and semantic search</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowUpload(true)}
                      style={styles.promptBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <div style={styles.promptIconPro}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <div>
                        <div style={styles.promptTitle}>Upload Documents</div>
                        <div style={styles.promptDesc}>Start analysis</div>
                      </div>
                    </button>
                  </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={styles.messagesList}>
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      onFileClick={handleFileClick}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={sending}
              selectedFiles={files}
            />
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Footer />
    </>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(102, 126, 234, 0.3)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#f1f5f9',
  },
  chatContainer: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    maxWidth: '1800px',
    margin: '0 auto',
  },
  sidebar: {
    width: '320px',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(102, 126, 234, 0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#f1f5f9',
  },
  newChatBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    padding: '40px 20px',
  },
  conversationItem: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.2s',
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
  },
  filesList: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '6px',
    marginBottom: '6px',
    fontSize: '13px',
  },
  fileName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#cbd5e1',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(30, 41, 59, 0.5)',
  },
  chatHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  toggleBtn: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '8px',
    color: '#f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  chatTitle: {
    fontSize: '20px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  emptyChat: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  aiAvatar: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  },
  emptyChatTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#f1f5f9',
  },
  emptyChatDesc: {
    fontSize: '16px',
    color: '#94a3b8',
    marginBottom: '32px',
    maxWidth: '500px',
  },
  suggestedPrompts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    maxWidth: '700px',
  },
  promptBtn: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    color: '#f1f5f9',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  promptIconPro: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    marginRight: '16px',
    flexShrink: 0,
    color: '#667eea'
  },
  promptTitle: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  promptDesc: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  messagesList: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  }
};
