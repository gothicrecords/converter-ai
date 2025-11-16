// pages/index.js
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [upscaledUrl, setUpscaledUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setUpscaledUrl(null);
  };

  // Upscale
  const handleUpscale = async () => {
    if (!originalFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', originalFile);

    try {
      const res = await fetch('/api/upscale', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUpscaledUrl(data.url);
      } else {
        alert('Errore: ' + data.error);
      }
    } catch (err) {
      alert('Errore rete: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Slider Drag
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const move = (e) => {
      if (!isDragging.current) return;
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      if (percent >= 0 && percent <= 100) {
        setSliderPos(percent);
      }
    };

    const start = () => { isDragging.current = true; };
    const end = () => { isDragging.current = false; };

    slider.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    return () => {
      slider.removeEventListener('mousedown', start);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
    };
  }, []);

  return (
    <>
      <Head>
        <title>PixelForge AI - Upscale Immagini 4K</title>
        <meta name="description" content="Upscale immagini con AI, before/after in tempo reale" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold mb-2 text-cyan-400">PixelForge AI</h1>
        <p className="text-lg mb-8 text-gray-300">Upscale immagini 4K con un click</p>

        {/* Drop Zone */}
        {!originalUrl && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
            className="w-full max-w-2xl h-64 border-4 border-dashed border-cyan-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-300 transition-all"
          >
            <p className="text-xl">Trascina immagine qui</p>
            <p className="text-sm text-gray-400 mt-2">o clicca per selezionare</p>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {/* Pulsante Upscale */}
        {originalUrl && !upscaledUrl && (
          <button
            onClick={handleUpscale}
            disabled={loading}
            className="mt-8 px-8 py-4 bg-cyan-500 text-white font-bold rounded-full text-lg hover:bg-cyan-400 disabled:opacity-50 transition-all"
          >
            {loading ? 'Upscaling...' : 'Upscale 4K'}
          </button>
        )}

        {/* Before/After Slider */}
        {originalUrl && upscaledUrl && (
          <div className="mt-12 w-full max-w-3xl">
            <p className="text-center mb-4 font-semibold">Trascina per vedere la differenza</p>
            <div
              ref={sliderRef}
              className="relative w-full h-96 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize"
            >
              {/* Originale */}
              <img
                src={originalUrl}
                alt="Originale"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {/* Upscalata (clip) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img
                  src={upscaledUrl}
                  alt="Upscalata"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              {/* Divider */}
              <div
                className="absolute top-0 w-1 h-full bg-white shadow-lg"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-xl">
                  ↔
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href={upscaledUrl}
                download
                className="inline-block px-6 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-400 transition-all"
              >
                Scarica 4K
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
