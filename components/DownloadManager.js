import { useState } from 'react';
import { 
  HiDownload, HiX, HiPause, HiPlay, HiTrash, HiClock, 
  HiCheckCircle, HiExclamationCircle, HiChevronDown, HiChevronUp
} from 'react-icons/hi';
import { useDownloadManager } from '../lib/useDownloadManager';
import { formatFileSize, formatSpeed, formatTimeRemaining } from '../lib/downloadManager';

export default function DownloadManager() {
  const {
    queue,
    activeDownloads,
    history,
    stats,
    resumeDownload,
    pauseDownload,
    cancelDownload,
    clearHistory,
    removeFromHistory
  } = useDownloadManager();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'history'
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Combina coda e download attivi
  const allActive = [
    ...queue.filter(item => item.status === 'pending'),
    ...Array.from(activeDownloads.values())
  ];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle style={{ width: 18, height: 18, color: '#10b981' }} />;
      case 'failed':
        return <HiExclamationCircle style={{ width: 18, height: 18, color: '#ef4444' }} />;
      case 'downloading':
        return <div style={styles.spinner}></div>;
      case 'paused':
        return <HiPause style={{ width: 18, height: 18, color: '#f59e0b' }} />;
      default:
        return <HiClock style={{ width: 18, height: 18, color: '#94a3b8' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'failed':
        return 'Fallito';
      case 'downloading':
        return 'In download...';
      case 'paused':
        return 'In pausa';
      case 'pending':
        return 'In attesa';
      default:
        return status;
    }
  };

  // Conta download attivi per badge
  const activeCount = allActive.length;

  if (!isOpen && activeCount === 0) {
    return null; // Non mostrare nulla se non ci sono download
  }

  return (
    <>
      {/* Floating Button */}
      {activeCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          style={styles.floatingButton}
          aria-label="Download Manager"
        >
          <HiDownload style={{ width: 20, height: 20 }} />
          {activeCount > 0 && (
            <span style={styles.badge}>{activeCount}</span>
          )}
        </button>
      )}

      {/* Modal/Panel */}
      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)}>
          <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <HiDownload style={{ width: 24, height: 24 }} />
                <h2 style={styles.title}>Download Manager</h2>
                {stats.downloading > 0 && (
                  <span style={styles.activeBadge}>
                    {stats.downloading} attivo{stats.downloading > 1 ? 'i' : ''}
                  </span>
                )}
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
                onClick={() => setActiveTab('queue')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'queue' ? styles.tabActive : {})
                }}
              >
                Coda ({allActive.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'history' ? styles.tabActive : {})
                }}
              >
                Cronologia ({history.length})
              </button>
            </div>

            {/* Content */}
            <div style={styles.content}>
              {activeTab === 'queue' ? (
                <div style={styles.queueContainer}>
                  {allActive.length === 0 ? (
                    <div style={styles.emptyState}>
                      <HiCheckCircle style={{ width: 48, height: 48, color: '#94a3b8', marginBottom: '16px' }} />
                      <p style={styles.emptyText}>Nessun download in corso</p>
                    </div>
                  ) : (
                    allActive.map((item) => (
                      <div key={item.id} style={styles.downloadItem}>
                        <div style={styles.downloadHeader}>
                          <div style={styles.downloadInfo}>
                            {getStatusIcon(item.status)}
                            <div style={styles.downloadDetails}>
                              <div style={styles.filename}>{item.filename}</div>
                              <div style={styles.meta}>
                                {item.tool && (
                                  <span style={styles.toolTag}>{item.tool}</span>
                                )}
                                {item.size > 0 && (
                                  <span style={styles.size}>{formatFileSize(item.size)}</span>
                                )}
                                <span style={styles.status}>{getStatusText(item.status)}</span>
                              </div>
                            </div>
                          </div>
                          <div style={styles.downloadActions}>
                            {item.status === 'downloading' && (
                              <button
                                onClick={() => pauseDownload(item.id)}
                                style={styles.actionButton}
                                title="Pausa"
                              >
                                <HiPause style={{ width: 16, height: 16 }} />
                              </button>
                            )}
                            {(item.status === 'paused' || item.status === 'failed') && (
                              <button
                                onClick={() => resumeDownload(item.id)}
                                style={styles.actionButton}
                                title="Riprendi"
                              >
                                <HiPlay style={{ width: 16, height: 16 }} />
                              </button>
                            )}
                            <button
                              onClick={() => cancelDownload(item.id)}
                              style={styles.actionButton}
                              title="Cancella"
                            >
                              <HiX style={{ width: 16, height: 16 }} />
                            </button>
                            <button
                              onClick={() => toggleExpanded(item.id)}
                              style={styles.actionButton}
                              title="Dettagli"
                            >
                              {expandedItems.has(item.id) ? (
                                <HiChevronUp style={{ width: 16, height: 16 }} />
                              ) : (
                                <HiChevronDown style={{ width: 16, height: 16 }} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {item.status === 'downloading' && (
                          <div style={styles.progressContainer}>
                            <div style={styles.progressBar}>
                              <div
                                style={{
                                  ...styles.progressFill,
                                  width: `${item.progress || 0}%`
                                }}
                              />
                            </div>
                            <div style={styles.progressInfo}>
                              <span>{item.progress || 0}%</span>
                              {item.speed > 0 && (
                                <span>{formatSpeed(item.speed)}</span>
                              )}
                              {item.size > 0 && item.downloaded > 0 && item.speed > 0 && (
                                <span>
                                  {formatTimeRemaining(item.downloaded, item.size, item.speed)} rimanenti
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedItems.has(item.id) && (
                          <div style={styles.expandedDetails}>
                            <div style={styles.detailRow}>
                              <span style={styles.detailLabel}>ID:</span>
                              <span style={styles.detailValue}>{item.id}</span>
                            </div>
                            {item.metadata && Object.keys(item.metadata).length > 0 && (
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Metadata:</span>
                                <span style={styles.detailValue}>
                                  {JSON.stringify(item.metadata, null, 2)}
                                </span>
                              </div>
                            )}
                            {item.error && (
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Errore:</span>
                                <span style={{ ...styles.detailValue, color: '#ef4444' }}>
                                  {item.error}
                                </span>
                              </div>
                            )}
                            {item.createdAt && (
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Creato:</span>
                                <span style={styles.detailValue}>
                                  {new Date(item.createdAt).toLocaleString('it-IT')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div style={styles.historyContainer}>
                  {history.length === 0 ? (
                    <div style={styles.emptyState}>
                      <HiClock style={{ width: 48, height: 48, color: '#94a3b8', marginBottom: '16px' }} />
                      <p style={styles.emptyText}>Nessun download nella cronologia</p>
                    </div>
                  ) : (
                    <>
                      <div style={styles.historyHeader}>
                        <button
                          onClick={clearHistory}
                          style={styles.clearButton}
                        >
                          <HiTrash style={{ width: 16, height: 16 }} />
                          Pulisci cronologia
                        </button>
                      </div>
                      {history.map((item) => (
                        <div key={item.id} style={styles.historyItem}>
                          <div style={styles.historyHeaderItem}>
                            <div style={styles.historyInfo}>
                              {getStatusIcon(item.status)}
                              <div style={styles.historyDetails}>
                                <div style={styles.filename}>{item.filename}</div>
                                <div style={styles.meta}>
                                  {item.tool && (
                                    <span style={styles.toolTag}>{item.tool}</span>
                                  )}
                                  {item.size > 0 && (
                                    <span style={styles.size}>{formatFileSize(item.size)}</span>
                                  )}
                                  <span style={styles.status}>{getStatusText(item.status)}</span>
                                  {item.completedAt && (
                                    <span style={styles.date}>
                                      {new Date(item.completedAt).toLocaleString('it-IT')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromHistory(item.id)}
                              style={styles.actionButton}
                              title="Rimuovi"
                            >
                              <HiTrash style={{ width: 16, height: 16 }} />
                            </button>
                          </div>
                          {item.status === 'failed' && item.error && (
                            <div style={styles.errorMessage}>
                              <HiExclamationCircle style={{ width: 16, height: 16 }} />
                              <span>{item.error}</span>
                            </div>
                          )}
                          {item.status === 'failed' && (
                            <button
                              onClick={() => resumeDownload(item.id)}
                              style={styles.resumeButton}
                            >
                              <HiPlay style={{ width: 16, height: 16 }} />
                              Riprendi download
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer Stats */}
            <div style={styles.footer}>
              <div style={styles.stats}>
                <span>Completati: {stats.completed || 0}</span>
                <span>Falliti: {stats.failed || 0}</span>
                <span>In attesa: {stats.pending || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
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
    zIndex: 10000,
    padding: '20px'
  },
  panel: {
    background: 'rgba(15, 23, 42, 0.98)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    maxWidth: '700px',
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
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#e2e8f0'
  },
  activeBadge: {
    padding: '4px 10px',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#10b981'
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
    overflowY: 'auto',
    padding: '20px'
  },
  queueContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  historyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px'
  },
  clearButton: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  downloadItem: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 0.2s'
  },
  historyItem: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 0.2s'
  },
  downloadHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  historyHeaderItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  downloadInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0
  },
  historyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0
  },
  downloadDetails: {
    flex: 1,
    minWidth: 0
  },
  historyDetails: {
    flex: 1,
    minWidth: 0
  },
  filename: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: '#94a3b8'
  },
  toolTag: {
    padding: '2px 8px',
    background: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '6px',
    color: '#a78bfa',
    fontWeight: '500'
  },
  size: {
    color: '#94a3b8'
  },
  status: {
    color: '#94a3b8'
  },
  date: {
    color: '#64748b',
    fontSize: '11px'
  },
  downloadActions: {
    display: 'flex',
    gap: '6px'
  },
  actionButton: {
    padding: '6px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '6px',
    color: '#cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  progressContainer: {
    marginTop: '12px'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease',
    borderRadius: '3px'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#94a3b8',
    gap: '12px'
  },
  expandedDetails: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(102, 126, 234, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  detailRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px'
  },
  detailLabel: {
    fontWeight: '600',
    color: '#94a3b8',
    minWidth: '80px'
  },
  detailValue: {
    color: '#cbd5e1',
    wordBreak: 'break-word'
  },
  errorMessage: {
    marginTop: '8px',
    padding: '8px 12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  resumeButton: {
    marginTop: '8px',
    padding: '8px 16px',
    background: 'rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '8px',
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
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
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: '12px',
    color: '#94a3b8',
    gap: '16px'
  },
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
    zIndex: 9999,
    transition: 'all 0.3s',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

// Aggiungi animazione spinner
if (typeof document !== 'undefined') {
  const styleId = 'download-manager-spinner';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

