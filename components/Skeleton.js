// Skeleton Loading Component
export default function Skeleton({ className = '', width = '100%', height = '20px', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...style
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(148, 163, 184, 0.1)'
    }}>
      <Skeleton width="60px" height="60px" style={{ marginBottom: '16px' }} />
      <Skeleton width="70%" height="24px" style={{ marginBottom: '12px' }} />
      <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton width="90%" height="16px" />
    </div>
  );
}

export function SkeletonButton() {
  return <Skeleton width="140px" height="44px" />;
}
