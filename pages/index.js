// pages/index.js (no Tailwind, uses styles.css + custom slider)
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [upscaledUrl, setUpscaledUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
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
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    onFileSelect(f);
  };

  const handleUpscale = async () => {
    if (!originalFile) return;
    setLoading(true);
    setStatus('Upscaling in corso...');
    const fd = new FormData();
    fd.append('image', originalFile);
    try {
      const res = await fetch('/api/upscale', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.details || j.error || 'Upscale failed');
      setUpscaledUrl(j.url);
      setStatus('Fatto!');
    } catch (err) {
      setStatus(`Errore: ${err.message}`);
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
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  // Slider interactions using Pointer Events for consistent mouse/touch/pen dragging
  useEffect(() => {
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
  }, [upscaledUrl]);

  return (
    <div className="container">
      <h1>Upscaler AI</h1>
      <div style={{textAlign:'center', marginBottom: 16}}>
        <a href="/pdf" style={{color:'#9fb0c8', fontWeight:700, textDecoration:'none'}}>Vai al PDF Converter →</a>
      </div>

      {!originalUrl && (
        <div
          id="dropzone"
          className="dropzone"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>Trascina qui la tua immagine o clicca per selezionare</p>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={(e) => onFileSelect(e.target.files?.[0])}
          />
        </div>
      )}

      {originalUrl && !upscaledUrl && (
        <div className="controls">
          <button className="btn-primary" onClick={handleUpscale} disabled={loading}>
            {loading ? 'Upscaling…' : 'Upscale'}
          </button>
        </div>
      )}

      <div className="status">{status}</div>

      {originalUrl && upscaledUrl && (
        <div className="result">
          <div ref={sliderRef} className="slider" role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(sliderPos)}>
            <img src={originalUrl} alt="Originale" />
            <div className="badge left">Originale</div>
            <div
              className="clip"
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
            >
              <img src={upscaledUrl} alt="Upscalata" />
            </div>
            <div className="divider" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
              <div className="handle">↔</div>
            </div>
            <div className="badge right">Upscalata 2x</div>
          </div>
          <div style={{marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
            <button onClick={handleDownload} className="btn-secondary">Download</button>
            <a href={upscaledUrl} target="_blank" rel="noreferrer" style={{color:'#9fb0c8', fontSize: 14}}>Apri a piena risoluzione</a>
          </div>
        </div>
      )}
    </div>
  );
}
