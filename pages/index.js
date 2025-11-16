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
      if (!res.ok) throw new Error(j.error || 'Upscale failed');
      setUpscaledUrl(j.url);
      setStatus('Fatto!');
    } catch (err) {
      setStatus(`Errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Slider interactions (mouse + touch)
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const getPercent = (clientX) => {
      const r = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - r.left, 0), r.width);
      return (x / r.width) * 100;
    };
    const start = (clientX) => {
      dragging.current = true;
      setSliderPos(getPercent(clientX));
    };
    const move = (clientX) => {
      if (!dragging.current) return;
      setSliderPos(getPercent(clientX));
    };
    const end = () => { dragging.current = false; };

    const onMouseDown = (e) => start(e.clientX);
    const onMouseMove = (e) => move(e.clientX);
    const onTouchStart = (e) => start(e.touches[0].clientX);
    const onTouchMove = (e) => move(e.touches[0].clientX);

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', end);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', end);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', end);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', end);
    };
  }, []);

  return (
    <div className="container">
      <h1>Upscaler AI</h1>

      {!originalUrl && (
        <div
          id="dropzone"
          className="dropzone"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('fileInput').click()}
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
          <button onClick={handleUpscale} disabled={loading}>
            {loading ? 'Upscaling…' : 'Upscale'}
          </button>
        </div>
      )}

      <div className="status">{status}</div>

      {originalUrl && upscaledUrl && (
        <div className="result">
          <h3>Before / After</h3>
          <div ref={sliderRef} className="slider">
            <img src={originalUrl} alt="Originale" />
            <div
              className="clip"
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
            >
              <img src={upscaledUrl} alt="Upscalata" />
            </div>
            <div className="divider" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
              <div className="handle">↔</div>
            </div>
          </div>
          <a id="downloadLink" href={upscaledUrl} download="upscaled.png">Download</a>
        </div>
      )}
    </div>
  );
}
