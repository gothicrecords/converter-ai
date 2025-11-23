// Componente badge PRO riutilizzabile
export default function ProBadge({ style = {}, size = 'small' }) {
    const sizes = {
        small: {
            fontSize: '10px',
            padding: '3px 8px',
        },
        medium: {
            fontSize: '12px',
            padding: '4px 10px',
        },
        large: {
            fontSize: '14px',
            padding: '6px 12px',
        },
    };

    const sizeStyle = sizes[size] || sizes.small;

    return (
        <span
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: '700',
                borderRadius: '12px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
                ...sizeStyle,
                ...style,
            }}
        >
            PRO
        </span>
    );
}

