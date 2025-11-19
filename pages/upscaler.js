// pages/upscaler.js - Professional Upscaler UI
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { HiSparkles, HiUpload, HiDownload, HiPhotograph } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import * as analytics from '../lib/analytics';

function Upscaler() {
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
    
    // Track file upload
    analytics.trackFileUpload(file.type, file.size, 'Image Upscaler');
    analytics.trackToolStart('Image Upscaler', file.type, file.size);
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
    const startTime = Date.now();
    const fd = new FormData();
    fd.append('image', originalFile);
    try {
      const res = await fetch('/api/upscale', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.details || j.error || 'Upscale failed');
      
      const duration = Date.now() - startTime;
      analytics.trackToolComplete('Image Upscaler', duration, true);
      analytics.trackConversion('image_upscale', originalFile.type, 'upscaled_image', originalFile.size, duration);
      
      setUpscaledUrl(j.url);
      setStatus('Fatto!');
    } catch (err) {
      const duration = Date.now() - startTime;
      analytics.trackToolComplete('Image Upscaler', duration, false);
      analytics.trackError(err.message, 'Upscaler', 'upscale_error');
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
      
      // Track download
      analytics.trackDownload('jpg', 'Image Upscaler', blob.size);
    } catch (e) {
      analytics.trackError(e.message, 'Upscaler', 'download_error');
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
    <>
      <Navbar />
      <div className="container">
        <Head>
          <title>Upscaler AI - 8K Image Enhancement</title>
        </Head>

        <div className="page-header">
        <div className="header-badge">
          <HiSparkles className="badge-icon" />
          <span>AI Powered</span>
        </div>
        <h1 className="page-title">Upscaler AI</h1>
        <p className="page-subtitle">Migliora le tue immagini con upscaling avanzato fino a 4K/8K - Completamente gratuito e locale</p>
      </div>

      {!originalUrl && (
        <div
          id="dropzone"
          className="dropzone"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="dropzone-content">
            <HiPhotograph className="dropzone-icon" />
            <p className="dropzone-text">Trascina qui la tua immagine o clicca per selezionare</p>
            <div className="file-formats">JPG, PNG, WebP supportati</div>
          </div>
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
            <HiUpload className="btn-icon" />
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
          <div className="download-actions">
            <button onClick={handleDownload} className="btn-download">
              <HiDownload className="btn-icon" />
              Download
            </button>
            <a href={upscaledUrl} target="_blank" rel="noreferrer" className="open-link">Apri a piena risoluzione</a>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

// Disabilita pre-rendering per questa pagina (usa browser APIs)
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default Upscaler;
