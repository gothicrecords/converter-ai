export function LoadingSpinner({ size = 40, color = '#667eea' }) {
    return (
        <div style={{ ...styles.spinner, width: size, height: size, borderTopColor: color }}>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export function ProgressBar({ progress, showPercentage = true }) {
    return (
        <div style={styles.progressContainer}>
            <div style={styles.progressTrack}>
                <div 
                    style={{
                        ...styles.progressFill,
                        width: `${Math.min(100, Math.max(0, progress))}%`
                    }}
                />
            </div>
            {showPercentage && (
                <span style={styles.progressText}>
                    {Math.round(progress)}%
                </span>
            )}
        </div>
    );
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8 }) {
    return (
        <div style={{
            ...styles.skeleton,
            width,
            height,
            borderRadius
        }}>
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
            `}</style>
        </div>
    );
}

export function LoadingOverlay({ message = 'Elaborazione in corso...' }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.overlayContent}>
                <LoadingSpinner size={50} color="#667eea" />
                <p style={styles.overlayText}>{message}</p>
            </div>
        </div>
    );
}

const styles = {
    spinner: {
        border: '4px solid rgba(102, 126, 234, 0.2)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%'
    },
    progressTrack: {
        flex: 1,
        height: '8px',
        background: 'rgba(102, 126, 234, 0.15)',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
    },
    progressText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#cbd5e1',
        minWidth: '45px',
        textAlign: 'right'
    },
    skeleton: {
        background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.2) 50%, rgba(102, 126, 234, 0.1) 100%)',
        backgroundSize: '1000px 100%',
        animation: 'shimmer 2s infinite linear'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 14, 26, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998
    },
    overlayContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
    },
    overlayText: {
        color: '#e2e8f0',
        fontSize: '16px',
        fontWeight: '500',
        margin: 0
    }
};
