// components/tools/Upscaler.js - Wrapper component for Upscaler tool
import { useState, useRef, useEffect } from 'react';
import { HiSparkles, HiUpload, HiDownload, HiPhotograph } from 'react-icons/hi';

// Safe analytics loader: defers import to client and no-ops if unavailable
function useSafeAnalytics() {
  const [a, setA] = useState(null);
  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined') return;
    import('../../lib/analytics')
      .then((mod) => { if (mounted) setA(mod); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);
  const noop = () => {};
  return a || {
    pageview: noop,
    event: noop,
    trackFileUpload: noop,
    trackToolStart: noop,
    trackToolComplete: noop,
    trackConversion: noop,
    trackDownload: noop,
    trackError: noop,
  };
}

export default function Upscaler() {
  const analytics = useSafeAnalytics();
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [upscaledUrl, setUpscaledUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [upscaledResolution, setUpscaledResolution] = useState(null);
  const sliderRef = useRef(null);
  const dragging = useRef(false);
  const rafId = useRef(null);
  const pendingPos = useRef(null);

  const onFileSelect = (file) => {
    if (!file || !file.type?.startsWith('image/')) {
      setStatus('Seleziona un file immagine.');
      return;
    }
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setUpscaledUrl(null);
    setStatus(`Selezionato: ${file.name}`);
    
    // Track file upload
    try {
      analytics.trackFileUpload(file.type, file.size, 'Image Upscaler');
      analytics.trackToolStart('Image Upscaler', file.type, file.size);
    } catch {}
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    onFileSelect(f);
  };

  const handleUpscale = async () => {
    if (!originalFile) return;
    setLoading(true);
    setProgress(0);
    setStatus('Preparazione immagine...');
    const startTime = Date.now();
    
    // Simula progresso durante l'upscaling
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 3, 95);
        if (newProgress < 20) {
          setStatus('Analisi immagine...');
        } else if (newProgress < 40) {
          setStatus('Denoising e pre-processing...');
        } else if (newProgress < 60) {
          setStatus('Upscaling multi-pass in corso...');
        } else if (newProgress < 80) {
          setStatus('Micro-ricostruzione pixel...');
        } else if (newProgress < 95) {
          setStatus('Enhancement finale e ottimizzazione...');
        }
        return newProgress;
      });
    }, 300);
    
    const fd = new FormData();
    fd.append('image', originalFile);
    try {
      const res = await fetch('/api/upscale', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.details || j.error || 'Upscale failed');
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('Completato!');
      
      // Estrai risoluzione dall'immagine upscalata
      const img = new Image();
      img.onload = () => {
        setUpscaledResolution(`${img.width}x${img.height}`);
      };
      img.src = j.url;
      
      const duration = Date.now() - startTime;
      try {
        analytics.trackToolComplete('Image Upscaler', duration, true);
        analytics.trackConversion('image_upscale', originalFile.type, 'upscaled_image', originalFile.size, duration);
      } catch {}
      
      setUpscaledUrl(j.url);
      
      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
    } catch (err) {
      clearInterval(progressInterval);
      const duration = Date.now() - startTime;
      try {
        analytics.trackToolComplete('Image Upscaler', duration, false);
        analytics.trackError(err.message, 'Upscaler', 'upscale_error');
      } catch {}
      setStatus(`Errore: ${err.message}`);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!upscaledUrl) return;
    try {
      const res = await fetch(upscaledUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upscaled-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Track download
      try { analytics.trackDownload('jpg', 'Image Upscaler', blob.size); } catch {}
    } catch (e) {
      try { analytics.trackError(e.message, 'Upscaler', 'download_error'); } catch {}
      console.error('Download failed:', e);
    }
  };

  // Slider interactions using Pointer Events for consistent mouse/touch/pen dragging
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      const el = sliderRef.current;
      if (!el || !upscaledUrl) return;

      const getPercent = (clientX) => {
        const r = el.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - r.left, 0), r.width);
        return (x / r.width) * 100;
      };

      const commit = () => {
        if (pendingPos.current == null) return;
        setSliderPos(pendingPos.current);
        rafId.current = null;
        pendingPos.current = null;
      };
      const schedule = () => {
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(commit);
      };
      const onPointerDown = (e) => {
        dragging.current = true;
        try { el.setPointerCapture(e.pointerId); } catch {}
        pendingPos.current = getPercent(e.clientX);
        schedule();
      };
      const onPointerMove = (e) => {
        if (!dragging.current) return;
        pendingPos.current = getPercent(e.clientX);
        schedule();
      };
      const onPointerUp = (e) => {
        dragging.current = false;
        try { el.releasePointerCapture(e.pointerId); } catch {}
      };

      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointercancel', onPointerUp);

      return () => {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerUp);
      };
    } catch (e) {
      try { analytics.trackError(e.message, 'Upscaler', 'slider_init_error'); } catch {}
    }
  }, [upscaledUrl]);

  return (
    <div style={styles.container}>
      {!originalUrl && (
        <div style={styles.card}>
          <div
            id="upscaler-dropzone"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            style={styles.dropzone}
          >
            <div style={styles.dropzoneContent}>
              <HiPhotograph style={styles.dropzoneIcon} />
              <p style={styles.dropzoneText}>Trascina qui la tua immagine o clicca per selezionare</p>
              <div style={styles.fileFormats}>JPG, PNG, WebP supportati</div>
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
              style={styles.fileInput}
            />
          </div>
        </div>
      )}

      {originalUrl && !upscaledUrl && (
        <div style={styles.card}>
          <div style={styles.controls}>
            <button 
              style={loading ? { ...styles.btnPrimary, ...styles.btnPrimaryDisabled } : styles.btnPrimary} 
              onClick={handleUpscale} 
              disabled={loading}
            >
              <HiUpload style={styles.btnIcon} />
              {loading ? 'Upscaling…' : 'Upscale a 4K'}
            </button>
          </div>
          {loading && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.progressText}>{progress}%</div>
            </div>
          )}
          {status && <div style={styles.status}>{status}</div>}
        </div>
      )}

      {!originalUrl && status && <div style={styles.status}>{status}</div>}

      {originalUrl && upscaledUrl && (
        <div style={styles.card}>
          <div style={styles.result}>
            <div 
              ref={sliderRef} 
              style={styles.slider}
              role="slider" 
              aria-valuemin={0} 
              aria-valuemax={100} 
              aria-valuenow={Math.round(sliderPos)}
            >
              <img src={originalUrl} alt="Originale" style={styles.sliderImg} />
              <div style={styles.badgeLeft}>Originale</div>
              <div
                style={{
                  ...styles.clip,
                  clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                }}
              >
                <img src={upscaledUrl} alt="Upscalata" style={styles.sliderImg} />
              </div>
              <div 
                style={{
                  ...styles.divider,
                  left: `${sliderPos}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div style={styles.handle}>↔</div>
              </div>
              <div style={styles.badgeRight}>
                {upscaledResolution ? `${upscaledResolution} 4K` : 'Upscalata 4K'}
              </div>
            </div>
            <div style={styles.downloadActions}>
              <button onClick={handleDownload} style={styles.btnDownload}>
                <HiDownload style={styles.btnIcon} />
                Download
              </button>
              <a href={upscaledUrl} target="_blank" rel="noreferrer" style={styles.openLink}>
                Apri a piena risoluzione
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    marginBottom: '32px'
  },
  dropzone: {
    border: '2px dashed rgba(148, 163, 184, 0.4)',
    padding: 'clamp(32px, 5vw, 48px)',
    borderRadius: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    minHeight: 'clamp(240px, 35vh, 320px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    width: '100%',
    visibility: 'visible',
    opacity: 1
  },
  dropzoneContent: {
    pointerEvents: 'none',
    position: 'relative',
    zIndex: 1
  },
  dropzoneIcon: {
    width: '64px',
    height: '64px',
    color: '#667eea',
    margin: '0 auto 16px',
    opacity: 0.9,
    filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.4))',
    transition: 'all 0.3s ease'
  },
  dropzoneText: {
    fontSize: 'clamp(15px, 2.5vw, 18px)',
    color: '#e2e8f0',
    margin: '0 0 12px',
    fontWeight: 600,
    letterSpacing: '-0.01em'
  },
  fileFormats: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 2
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 'clamp(20px, 3vw, 28px)',
    gap: '12px',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    borderRadius: '12px',
    fontSize: 'clamp(15px, 2.5vw, 16px)',
    padding: '14px 28px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: '200% 200%',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.3)',
    letterSpacing: '0.01em'
  },
  btnPrimaryDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none !important'
  },
  btnDownload: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    borderRadius: '12px',
    fontSize: 'clamp(15px, 2.5vw, 16px)',
    padding: '14px 28px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    backgroundSize: '200% 200%',
    color: '#fff',
    boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)'
  },
  btnIcon: {
    width: '20px',
    height: '20px',
    transition: 'transform 0.3s ease'
  },
  status: {
    marginTop: 'clamp(16px, 2vw, 20px)',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 'clamp(14px, 2vw, 16px)',
    minHeight: '24px',
    padding: '14px 20px',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    fontWeight: 500,
    transition: 'all 0.3s ease'
  },
  result: {
    marginTop: 'clamp(24px, 3vw, 32px)',
    textAlign: 'center',
    width: '100%'
  },
  slider: {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    height: 'clamp(450px, 80vh, 800px)',
    background: '#0b0f18',
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: 'ew-resize',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.3)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    transition: 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    margin: '0 auto'
  },
  sliderImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    background: '#000',
    transition: 'opacity 0.3s ease'
  },
  clip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '3px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 100%)',
    boxShadow: '0 0 12px rgba(255,255,255,0.6), 0 0 20px rgba(102, 126, 234, 0.4)',
    filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.5))'
  },
  handle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'clamp(44px, 8vw, 56px)',
    height: 'clamp(44px, 8vw, 56px)',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: '200% 200%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 'clamp(18px, 3vw, 22px)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.5), 0 0 0 4px rgba(255,255,255,0.15), 0 0 20px rgba(102, 126, 234, 0.4)',
    pointerEvents: 'none',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  badgeLeft: {
    position: 'absolute',
    top: 'clamp(12px, 2vw, 16px)',
    left: 'clamp(12px, 2vw, 16px)',
    padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 14px)',
    borderRadius: '999px',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(16px)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 'clamp(11px, 1.8vw, 14px)',
    letterSpacing: '0.5px',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
  },
  badgeRight: {
    position: 'absolute',
    top: 'clamp(12px, 2vw, 16px)',
    right: 'clamp(12px, 2vw, 16px)',
    padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 14px)',
    borderRadius: '999px',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(16px)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 'clamp(11px, 1.8vw, 14px)',
    letterSpacing: '0.5px',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
  },
  downloadActions: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  openLink: {
    color: '#60a5fa',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  progressContainer: {
    marginTop: '20px',
    width: '100%'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
    animation: 'gradientShift 2s ease infinite'
  },
  progressText: {
    marginTop: '8px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: 500
  }
};

