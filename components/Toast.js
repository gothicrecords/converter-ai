import { useState, useEffect, useRef } from 'react';
import { 
    HiCheckCircle, HiXCircle, HiInformationCircle, HiX, 
    HiExclamation, HiClock, HiLightningBolt, HiCog 
} from 'react-icons/hi';

let toastId = 0;
const toastListeners = new Set();

export const showToast = (message, type = 'success', duration = 4000, options = {}) => {
    const id = toastId++;
    const toast = { 
        id, 
        message, 
        type, 
        duration,
        timestamp: new Date(),
        progress: options.progress,
        details: options.details,
        technical: options.technical,
        action: options.action
    };
    toastListeners.forEach(listener => listener(toast));
    return id;
};

export const updateToast = (id, updates) => {
    toastListeners.forEach(listener => {
        if (typeof listener === 'function') {
            listener({ id, ...updates, update: true });
        }
    });
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const progressIntervals = useRef({});

    useEffect(() => {
        const listener = (toast) => {
            if (toast.update) {
                setToasts(prev => prev.map(t => 
                    t.id === toast.id ? { ...t, ...toast } : t
                ));
            } else {
                setToasts(prev => [...prev, toast]);
                
                if (toast.duration > 0 && toast.type !== 'loading' && toast.type !== 'progress') {
                    setTimeout(() => {
                        setToasts(prev => prev.filter(t => t.id !== toast.id));
                    }, toast.duration);
                }
            }
        };

        toastListeners.add(listener);
        return () => toastListeners.delete(listener);
    }, []);

    const removeToast = (id) => {
        if (progressIntervals.current[id]) {
            clearInterval(progressIntervals.current[id]);
            delete progressIntervals.current[id];
        }
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getIcon = (type) => {
        const iconStyle = { ...styles.icon, ...styles.iconPulse };
        switch(type) {
            case 'success': return <HiCheckCircle style={iconStyle} />;
            case 'error': return <HiXCircle style={iconStyle} />;
            case 'info': return <HiInformationCircle style={iconStyle} />;
            case 'warning': return <HiExclamation style={iconStyle} />;
            case 'loading': return <HiCog style={{ ...iconStyle, animation: 'spin 1s linear infinite' }} />;
            case 'progress': return <HiLightningBolt style={iconStyle} />;
            default: return <HiInformationCircle style={iconStyle} />;
        }
    };

    const getColors = (type) => {
        switch(type) {
            case 'success': 
                return { 
                    bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                    border: 'rgba(16, 185, 129, 1)',
                    glow: 'rgba(16, 185, 129, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'error': 
                return { 
                    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                    border: 'rgba(239, 68, 68, 1)',
                    glow: 'rgba(239, 68, 68, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'info': 
                return { 
                    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
                    border: 'rgba(59, 130, 246, 1)',
                    glow: 'rgba(59, 130, 246, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'warning':
                return {
                    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)',
                    border: 'rgba(245, 158, 11, 1)',
                    glow: 'rgba(245, 158, 11, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
            case 'loading':
            case 'progress':
                return {
                    bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)',
                    border: 'rgba(139, 92, 246, 1)',
                    glow: 'rgba(139, 92, 246, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.4)'
                };
            default: 
                return { 
                    bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%)',
                    border: 'rgba(102, 126, 234, 1)',
                    glow: 'rgba(102, 126, 234, 0.4)',
                    progress: 'rgba(255, 255, 255, 0.3)'
                };
        }
    };

    return (
        <div style={styles.container}>
            {toasts.map((toast, index) => {
                const colors = getColors(toast.type);
                const progress = toast.progress !== undefined ? Math.min(100, Math.max(0, toast.progress)) : null;
                
                return (
                    <div 
                        key={toast.id}
                        style={{
                            ...styles.toast,
                            background: colors.bg,
                            borderColor: colors.border,
                            boxShadow: `0 8px 32px ${colors.glow}, 0 0 0 1px ${colors.border}`,
                            transform: `translateY(${index * 8}px)`,
                            zIndex: 9999 - index,
                            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1), fadeOut 0.3s ease-in ' + (toast.duration - 300) + 'ms forwards'
                        }}
                    >
                        <div style={styles.toastContent}>
                            <div style={styles.iconContainer}>
                                {getIcon(toast.type)}
                            </div>
                            
                            <div style={styles.messageContainer}>
                                <div style={styles.messageHeader}>
                                    <span style={styles.message}>{toast.message}</span>
                                    {toast.timestamp && (
                                        <span style={styles.timestamp}>
                                            <HiClock style={{ width: 12, height: 12, marginRight: 4 }} />
                                            {formatTime(toast.timestamp)}
                                        </span>
                                    )}
                                </div>
                                
                                {toast.details && (
                                    <div style={styles.details}>
                                        {toast.details}
                                    </div>
                                )}
                                
                                {toast.technical && (
                                    <div style={styles.technical}>
                                        <code style={styles.technicalCode}>
                                            {toast.technical}
                                        </code>
                                    </div>
                                )}
                                
                                {(progress !== null || toast.type === 'loading' || toast.type === 'progress') && (
                                    <div style={styles.progressContainer}>
                                        <div style={styles.progressBar}>
                                            <div 
                                                style={{
                                                    ...styles.progressFill,
                                                    width: progress !== null ? `${progress}%` : '100%',
                                                    background: colors.progress,
                                                    animation: progress === null ? 'pulse 1.5s ease-in-out infinite' : 'none'
                                                }}
                                            />
                                        </div>
                                        {progress !== null && (
                                            <span style={styles.progressText}>{progress}%</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => removeToast(toast.id)}
                                style={styles.closeBtn}
                                aria-label="Chiudi notifica"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                }}
                            >
                                <HiX style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                        
                        {toast.action && (
                            <div style={styles.actionContainer}>
                                <button 
                                    onClick={() => {
                                        toast.action.onClick();
                                        if (toast.action.closeOnClick) {
                                            removeToast(toast.id);
                                        }
                                    }}
                                    style={styles.actionButton}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {toast.action.label}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
            <style jsx global>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(450px) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(120px) scale(0.9);
                    }
                }
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 1;
                    }
                }
                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        pointerEvents: 'none',
        maxWidth: '420px',
        width: '100%'
    },
    toast: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        minWidth: '320px',
        maxWidth: '420px',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1.5px solid',
        borderRadius: '16px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        pointerEvents: 'auto',
        cursor: 'default',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
    },
    toastContent: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px'
    },
    iconContainer: {
        flexShrink: 0,
        marginTop: '2px'
    },
    icon: {
        width: 26,
        height: 26,
        flexShrink: 0,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
    },
    iconPulse: {
        animation: 'pulse 2s ease-in-out infinite'
    },
    messageContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 0
    },
    messageHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
    },
    message: {
        flex: 1,
        lineHeight: '1.5',
        fontWeight: '600',
        fontSize: '15px',
        letterSpacing: '-0.01em'
    },
    timestamp: {
        fontSize: '11px',
        opacity: 0.85,
        display: 'flex',
        alignItems: 'center',
        fontWeight: '400',
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
    },
    details: {
        fontSize: '13px',
        opacity: 0.9,
        lineHeight: '1.5',
        marginTop: '2px',
        fontWeight: '400'
    },
    technical: {
        marginTop: '4px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        fontFamily: 'monospace',
        overflowX: 'auto'
    },
    technicalCode: {
        color: '#ffffff',
        opacity: 0.95,
        fontWeight: '500',
        letterSpacing: '0.3px'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '6px'
    },
    progressBar: {
        flex: 1,
        height: '6px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: {
        height: '100%',
        borderRadius: '10px',
        transition: 'width 0.3s ease-out',
        position: 'relative',
        overflow: 'hidden'
    },
    progressText: {
        fontSize: '11px',
        fontWeight: '600',
        opacity: 0.9,
        minWidth: '35px',
        textAlign: 'right',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '8px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        width: '28px',
        height: '28px',
        marginTop: '-2px'
    },
    actionContainer: {
        padding: '0 18px 16px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '8px',
        paddingTop: '12px'
    },
    actionButton: {
        width: '100%',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)'
    }
};
