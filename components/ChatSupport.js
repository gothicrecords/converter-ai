import { useState, useEffect, useRef } from 'react';
import { 
  HiChat, HiX, HiSearch, HiLightBulb, HiQuestionMarkCircle,
  HiChevronDown, HiChevronUp, HiPaperAirplane, HiSparkles
} from 'react-icons/hi';
import { searchKnowledgeBase, getSuggestions, getRelatedFAQs } from '../lib/supportKnowledgeBase';

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'faq'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Safe client-side mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Messaggio iniziale
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Ciao! 👋 Sono il tuo assistente virtuale. Posso aiutarti con:\n\n• Domande su strumenti e funzionalità\n• Problemi tecnici\n• Informazioni su account e fatturazione\n• Suggerimenti e best practices\n\nCome posso aiutarti oggi?',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Scroll automatico
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Suggerimenti iniziali
  const initialSuggestions = getSuggestions('');

  // Cerca nella base di conoscenza
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const results = searchKnowledgeBase(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Invia messaggio
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Cerca nella base di conoscenza
      const kbResults = searchKnowledgeBase(inputValue.trim());
      
      // Chiama API supporto AI
      const { getApiUrl } = await import('../utils/getApiUrl');
      const apiUrl = await getApiUrl('/api/support/chat');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          context: kbResults.slice(0, 3).map(r => ({
            question: r.question,
            answer: r.answer
          })),
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Errore nella risposta del supporto');
      }

      const text = await response.text();
      const data = text && text.trim() ? JSON.parse(text) : {};
      
      const assistantMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        type: 'text',
        relatedFAQs: data.relatedFAQs || [],
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Se ci sono FAQ correlate, mostra suggerimenti
      if (data.relatedFAQs && data.relatedFAQs.length > 0) {
        setShowSuggestions(true);
      }

    } catch (error) {
      console.error('Support chat error:', error);
      
      // Fallback: usa risultati base di conoscenza
      const kbResults = searchKnowledgeBase(inputValue.trim());
      
      let fallbackResponse = 'Mi dispiace, non sono riuscito a trovare una risposta precisa. ';
      
      if (kbResults.length > 0) {
        fallbackResponse += `Ecco alcune informazioni che potrebbero aiutarti:\n\n**${kbResults[0].question}**\n${kbResults[0].answer}`;
      } else {
        fallbackResponse += 'Potresti riformulare la domanda o contattare il supporto diretto?';
      }

      const assistantMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        type: 'text',
        relatedFAQs: kbResults.slice(0, 3)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Click su suggerimento
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  // Click su FAQ
  const handleFAQClick = (faq) => {
    const message = {
      id: `faq-${Date.now()}`,
      role: 'assistant',
      content: `**${faq.question}**\n\n${faq.answer}`,
      timestamp: new Date().toISOString(),
      type: 'faq',
      faqId: faq.id
    };
    setMessages(prev => [...prev, message]);
    setExpandedFAQ(faq.id);
    
    // Mostra FAQ correlate
    const related = getRelatedFAQs(faq.id);
    if (related.length > 0) {
      setTimeout(() => {
        const relatedMessage = {
          id: `related-${Date.now()}`,
          role: 'assistant',
          content: `**FAQ correlate:**\n\n${related.map(f => `• ${f.question}`).join('\n')}`,
          timestamp: new Date().toISOString(),
          type: 'suggestions'
        };
        setMessages(prev => [...prev, relatedMessage]);
      }, 500);
    }
  };

  // Tasto Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={styles.floatingButton}
        aria-label="Supporto Chat"
        title="Supporto Chat"
      >
        <HiChat style={{ width: 24, height: 24 }} />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)}>
          <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.headerIcon}>
                  <HiSparkles style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={styles.headerTitle}>Supporto AI</h3>
                  <p style={styles.headerSubtitle}>Assistente virtuale intelligente</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={styles.closeButton}
                aria-label="Chiudi"
              >
                <HiX style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'chat' ? styles.tabActive : {})
                }}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'faq' ? styles.tabActive : {})
                }}
              >
                FAQ
              </button>
            </div>

            {/* Content */}
            <div style={styles.content}>
              {activeTab === 'chat' ? (
                <>
                  {/* Messages */}
                  <div style={styles.messagesContainer}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          ...styles.message,
                          ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
                        }}
                      >
                        <div style={styles.messageContent}>
                          {message.type === 'text' && (
                            <div style={styles.textContent}>
                              {message.content.split('\n').map((line, i) => {
                                // Formattazione markdown semplice
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return (
                                    <strong key={i} style={styles.boldText}>
                                      {line.replace(/\*\*/g, '')}
                                    </strong>
                                  );
                                }
                                if (line.trim() === '') {
                                  return <br key={i} />;
                                }
                                return <p key={i} style={styles.paragraph}>{line}</p>;
                              })}
                            </div>
                          )}

                          {/* FAQ Correlate */}
                          {message.relatedFAQs && message.relatedFAQs.length > 0 && (
                            <div style={styles.relatedFAQs}>
                              <div style={styles.relatedTitle}>Potrebbe interessarti:</div>
                              {message.relatedFAQs.map((faq) => (
                                <button
                                  key={faq.id}
                                  onClick={() => handleFAQClick(faq)}
                                  style={styles.faqButton}
                                >
                                  <HiQuestionMarkCircle style={{ width: 16, height: 16 }} />
                                  {faq.question}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Timestamp */}
                          <div style={styles.timestamp}>
                            {new Date(message.timestamp).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div style={styles.loadingMessage}>
                        <div style={styles.typingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggestions */}
                  {showSuggestions && messages.length <= 1 && (
                    <div style={styles.suggestionsContainer}>
                      <div style={styles.suggestionsTitle}>
                        <HiLightBulb style={{ width: 16, height: 16 }} />
                        Suggerimenti
                      </div>
                      <div style={styles.suggestionsGrid}>
                        {initialSuggestions.slice(0, 4).map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={styles.suggestionButton}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div style={styles.inputContainer}>
                    <div style={styles.inputWrapper}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Scrivi la tua domanda..."
                        style={styles.input}
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        style={{
                          ...styles.sendButton,
                          ...((!inputValue.trim() || isLoading) && styles.sendButtonDisabled)
                        }}
                      >
                        <HiPaperAirplane style={{ width: 18, height: 18 }} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={styles.faqContainer}>
                  {/* Search */}
                  <div style={styles.searchContainer}>
                    <HiSearch style={{ width: 20, height: 20, color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Cerca nelle FAQ..."
                      style={styles.searchInput}
                    />
                  </div>

                  {/* Results */}
                  <div style={styles.faqResults}>
                    {searchResults.length > 0 ? (
                      searchResults.map((faq) => (
                        <div key={faq.id} style={styles.faqItem}>
                          <button
                            onClick={() => {
                              setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id);
                              handleFAQClick(faq);
                            }}
                            style={styles.faqQuestion}
                          >
                            <span>{faq.question}</span>
                            {expandedFAQ === faq.id ? (
                              <HiChevronUp style={{ width: 20, height: 20 }} />
                            ) : (
                              <HiChevronDown style={{ width: 20, height: 20 }} />
                            )}
                          </button>
                          {expandedFAQ === faq.id && (
                            <div style={styles.faqAnswer}>
                              {faq.answer.split('\n').map((line, i) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return (
                                    <strong key={i} style={styles.boldText}>
                                      {line.replace(/\*\*/g, '')}
                                    </strong>
                                  );
                                }
                                return <p key={i} style={styles.paragraph}>{line}</p>;
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={styles.emptyState}>
                        <HiQuestionMarkCircle style={{ width: 48, height: 48, color: '#94a3b8', marginBottom: '16px' }} />
                        <p style={styles.emptyText}>
                          {searchQuery ? 'Nessun risultato trovato' : 'Cerca nelle FAQ o passa alla chat'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    zIndex: 9998,
    transition: 'all 0.3s',
    WebkitTapHighlightColor: 'transparent'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  panel: {
    background: 'rgba(15, 23, 42, 0.98)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a78bfa'
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#e2e8f0'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8'
  },
  closeButton: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
  },
  tab: {
    flex: 1,
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#667eea',
    borderBottomColor: '#667eea'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '85%',
    animation: 'fadeIn 0.3s ease-in'
  },
  userMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start'
  },
  messageContent: {
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  textContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#e2e8f0'
  },
  paragraph: {
    margin: '4px 0',
    color: '#e2e8f0'
  },
  boldText: {
    fontWeight: '700',
    color: '#a78bfa',
    display: 'block',
    margin: '8px 0'
  },
  relatedFAQs: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)'
  },
  relatedTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  faqButton: {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '6px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '8px',
    color: '#a78bfa',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  timestamp: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '8px'
  },
  loadingMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    maxWidth: '85px'
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px'
  },
  suggestionsContainer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
    background: 'rgba(102, 126, 234, 0.05)'
  },
  suggestionsTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  suggestionButton: {
    padding: '10px 14px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '8px',
    color: '#a78bfa',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  inputContainer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
    background: 'rgba(15, 23, 42, 0.8)'
  },
  inputWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  sendButton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  faqContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  searchContainer: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(102, 126, 234, 0.05)'
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none'
  },
  faqResults: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px'
  },
  faqItem: {
    marginBottom: '12px',
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  faqQuestion: {
    width: '100%',
    padding: '16px',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    transition: 'background 0.2s'
  },
  faqAnswer: {
    padding: '0 16px 16px',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#cbd5e1'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  }
};

// Aggiungi animazioni
if (typeof document !== 'undefined') {
  const styleId = 'chat-support-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

