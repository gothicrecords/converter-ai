import { useState, useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from 'react-icons/hi';

let toastId = 0;
const toastListeners = new Set();

export const showToast = (message, type = 'success', duration = 4000) => {
    const id = toastId++;
    const toast = { id, message, type, duration };
    toastListeners.forEach(listener => listener(toast));
    return id;
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (toast) => {
            setToasts(prev => [...prev, toast]);
            
            if (toast.duration > 0) {
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                }, toast.duration);
            }
        };

        toastListeners.add(listener);
        return () => toastListeners.delete(listener);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <HiCheckCircle style={styles.icon} />;
            case 'error': return <HiXCircle style={styles.icon} />;
            case 'info': return <HiInformationCircle style={styles.icon} />;
            default: return <HiInformationCircle style={styles.icon} />;
        }
    };

    const getColors = (type) => {
        switch(type) {
            case 'success': 
                return { bg: 'rgba(16, 185, 129, 0.95)', border: 'rgba(16, 185, 129, 1)' };
            case 'error': 
                return { bg: 'rgba(239, 68, 68, 0.95)', border: 'rgba(239, 68, 68, 1)' };
            case 'info': 
                return { bg: 'rgba(59, 130, 246, 0.95)', border: 'rgba(59, 130, 246, 1)' };
            default: 
                return { bg: 'rgba(102, 126, 234, 0.95)', border: 'rgba(102, 126, 234, 1)' };
        }
    };

    return (
        <div style={styles.container}>
            {toasts.map((toast, index) => {
                const colors = getColors(toast.type);
                return (
                    <div 
                        key={toast.id}
                        style={{
                            ...styles.toast,
                            background: colors.bg,
                            borderColor: colors.border,
                            animation: 'slideInRight 0.3s ease-out, fadeOut 0.3s ease-in ' + (toast.duration - 300) + 'ms forwards'
                        }}
                    >
                        {getIcon(toast.type)}
                        <span style={styles.message}>{toast.message}</span>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            style={styles.closeBtn}
                            aria-label="Chiudi notifica"
                        >
                            <HiX style={{ width: 16, height: 16 }} />
                        </button>
                    </div>
                );
            })}
            <style jsx global>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
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
        gap: '12px',
        pointerEvents: 'none'
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        minWidth: '300px',
        maxWidth: '500px',
        backdropFilter: 'blur(12px)',
        border: '2px solid',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        pointerEvents: 'auto',
        cursor: 'default'
    },
    icon: {
        width: 24,
        height: 24,
        flexShrink: 0
    },
    message: {
        flex: 1,
        lineHeight: '1.4'
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '6px',
        padding: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        transition: 'background 0.2s',
        flexShrink: 0
    }
};
