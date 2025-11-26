import { useRouter } from 'next/router';
import { useMemo, memo, useCallback } from 'react';
import { getToolsByCategory } from '../lib/conversionRegistry';

const ConverterCards = memo(function ConverterCards({ currentTool, currentSlug }) {
  const router = useRouter();
  const categories = useMemo(() => getToolsByCategory(), []);
  
  // Ottieni i tool della stessa categoria del tool corrente
  const sameCategoryTools = useMemo(() => {
    if (!currentTool?.category) return [];
    const categoryTools = categories[currentTool.category] || [];
    // Rimuovi duplicati basati sull'href
    const uniqueTools = [];
    const seenHrefs = new Set();
    categoryTools.forEach(tool => {
      if (!seenHrefs.has(tool.href)) {
        seenHrefs.add(tool.href);
        uniqueTools.push(tool);
      }
    });
    return uniqueTools;
  }, [currentTool, categories]);

  // Se ci sono meno di 2 tool nella categoria, non mostrare le card
  if (sameCategoryTools.length < 2) return null;

  // Determina lo slug corrente in modo più robusto
  const activeSlug = useMemo(() => {
    if (currentSlug) return String(currentSlug);
    if (currentTool?.slug) return String(currentTool.slug);
    if (router.query.slug) return String(router.query.slug);
    // Estrai dall'href se disponibile
    if (currentTool?.href) {
      const match = currentTool.href.match(/\/tools\/(.+)$/);
      if (match) return match[1];
    }
    return null;
  }, [currentSlug, currentTool, router.query.slug]);

  // Colori per le card (simili a quelli del PDF converter)
  const colors = [
    '#f093fb', '#43e97b', '#ff9f43', '#10b981', '#60a5fa',
    '#4facfe', '#fa709a', '#f97316', '#22c55e', '#a78bfa',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'
  ];

  const handleCardClick = useCallback((href) => {
    router.push(href);
  }, [router]);

  return (
    <>
      <div style={styles.cardsContainer}>
        <h3 style={styles.cardsTitle}>Altri convertitori {currentTool?.category || ''}</h3>
        <div style={styles.cardsGrid}>
          {sameCategoryTools.map((tool, index) => {
            // Estrai lo slug dal tool in modo più robusto
            const toolSlug = tool.slug || (tool.href ? tool.href.replace('/tools/', '') : null);
            // Confronta gli slug in modo case-insensitive e normalizzato
            const normalizedToolSlug = toolSlug ? String(toolSlug).toLowerCase().trim() : null;
            const normalizedActiveSlug = activeSlug ? String(activeSlug).toLowerCase().trim() : null;
            const isActive = normalizedToolSlug === normalizedActiveSlug;
            const color = colors[index % colors.length];
            
            return (
              <div
                key={tool.href || tool.slug || index}
                onClick={() => !isActive && handleCardClick(tool.href)}
                style={{
                  ...styles.card,
                  ...(isActive ? {
                    borderColor: color,
                    background: `${color}15`,
                    boxShadow: `0 4px 12px ${color}40`,
                    color: '#fff'
                  } : {
                    background: '#0f172a',
                    borderColor: 'rgba(148,163,184,0.24)',
                    color: '#cfe0ff'
                  })
                }}
                className={isActive ? 'converter-card active' : 'converter-card'}
              >
                <span style={styles.cardLabel}>{tool.title}</span>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .converter-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .converter-card:hover:not(.active) {
          transform: translateY(-2px);
          border-color: rgba(148, 163, 184, 0.36);
        }
        .converter-card.active {
          cursor: default;
        }
      `}</style>
    </>
  );
});

export default ConverterCards;

const styles = {
  cardsContainer: {
    marginTop: '32px',
    marginBottom: '24px'
  },
  cardsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e6eef8',
    marginBottom: '16px',
    textAlign: 'center'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
    justifyContent: 'center',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      padding: '0 8px',
    }
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#0f172a',
    color: '#cfe0ff',
    border: '2px solid rgba(148,163,184,0.24)',
    borderRadius: '12px',
    padding: '14px 10px',
    fontWeight: 600,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 14px rgba(0,0,0,0.25)',
    fontSize: '15px',
    minWidth: '120px',
    justifyContent: 'center',
    textAlign: 'center',
    '@media (max-width: 768px)': {
      padding: '12px 6px',
      fontSize: '14px',
    }
  },
  cardLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

