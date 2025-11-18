import { useState } from 'react';

// Generic converter UI: upload a file, select output (currently limited), perform placeholder conversion.
export default function GenericConverter({ tool }) {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState(tool.targetFormat);
  const [resultName, setResultName] = useState(null);
  const [resultDataUrl, setResultDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quality, setQuality] = useState('80');
  const [vWidth, setVWidth] = useState('');
  const [vHeight, setVHeight] = useState('');
  const [vBitrate, setVBitrate] = useState('2500k');
  const [aBitrate, setABitrate] = useState('192k');
  const [page, setPage] = useState('0');

  const availableOutputs = [tool.targetFormat, 'pdf', 'txt', 'jpg', 'png']; // initial generic options

  async function handleConvert() {
    if (!file) return;
    setLoading(true); setError(null); setResultDataUrl(null); setResultName(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('target', outputFormat);
      if (width) form.append('width', width);
      if (height) form.append('height', height);
      if (quality) form.append('quality', quality);
      if (vWidth) form.append('vwidth', vWidth);
      if (vHeight) form.append('vheight', vHeight);
      if (vBitrate) form.append('vbitrate', vBitrate);
      if (aBitrate) form.append('abitrate', aBitrate);
      if (page) form.append('page', page);
      const res = await fetch(`/api/convert/${outputFormat}`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Conversion failed');
      const data = await res.json();
      setResultName(data.name);
      setResultDataUrl(data.dataUrl);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.panel}>
        <h2 style={styles.title}>Converti {tool.title}</h2>
        <p style={styles.desc}>{tool.description}</p>
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          style={styles.fileInput}
        />
        <label style={styles.label}>Formato di destinazione</label>
        <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} style={styles.select}>
          {availableOutputs.map(fmt => <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>)}
        </select>
        {(outputFormat === 'jpg' || outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'png') && (
          <div style={styles.optionsRow}>
            <div style={styles.optionField}>
              <label style={styles.label}>Larghezza (px)</label>
              <input value={width} onChange={e => setWidth(e.target.value)} placeholder="es. 1920" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Altezza (px)</label>
              <input value={height} onChange={e => setHeight(e.target.value)} placeholder="es. 1080" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Qualità</label>
              <input value={quality} onChange={e => setQuality(e.target.value)} placeholder="1-100" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Pagina (PDF)</label>
              <input value={page} onChange={e => setPage(e.target.value)} placeholder="0 = prima pagina" style={styles.input} />
            </div>
          </div>
        )}
        {(['mp4','webm','avi','mkv','mov','flv'].includes(outputFormat)) && (
          <div style={styles.optionsRow}>
            <div style={styles.optionField}>
              <label style={styles.label}>Video larghezza</label>
              <input value={vWidth} onChange={e => setVWidth(e.target.value)} placeholder="es. 1280" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Video altezza</label>
              <input value={vHeight} onChange={e => setVHeight(e.target.value)} placeholder="es. 720" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Bitrate video</label>
              <input value={vBitrate} onChange={e => setVBitrate(e.target.value)} placeholder="es. 2500k" style={styles.input} />
            </div>
            <div style={styles.optionField}>
              <label style={styles.label}>Bitrate audio</label>
              <input value={aBitrate} onChange={e => setABitrate(e.target.value)} placeholder="es. 192k" style={styles.input} />
            </div>
          </div>
        )}
        <button onClick={handleConvert} disabled={!file || loading} style={styles.btn}>
          {loading ? 'Conversione...' : 'Converti'}
        </button>
        {error && <div style={styles.error}>{error}</div>}
      </div>
      {resultDataUrl && (
        <div style={styles.result}>
          <h3 style={styles.resultTitle}>Risultato</h3>
          <p style={styles.resultName}>{resultName}</p>
          <a href={resultDataUrl} download={resultName} style={styles.downloadBtn}>Scarica file</a>
          {resultDataUrl.startsWith('data:image') && <img src={resultDataUrl} alt={resultName} style={styles.previewImg} />}
          {resultDataUrl.startsWith('data:text') && <textarea readOnly value={atob(resultDataUrl.split(',')[1])} style={styles.previewText} />}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' },
  panel: { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.2)', padding: '24px', borderRadius: '12px' },
  title: { margin: '0 0 8px', fontSize: '22px', fontWeight: 700 },
  desc: { margin: '0 0 16px', color: '#94a3b8', fontSize: '14px' },
  fileInput: { marginBottom: '16px' },
  label: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' },
  select: { margin: '8px 0 16px', padding: '8px', borderRadius: '8px', background: '#0f172a', color: '#e6eef8', border: '1px solid #334155' },
  btn: { padding: '12px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  error: { marginTop: '12px', color: '#ef4444', fontSize: '13px' },
  result: { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.2)', padding: '24px', borderRadius: '12px' },
  resultTitle: { margin: 0, fontSize: '18px', fontWeight: 700 },
  resultName: { margin: '8px 0 16px', color: '#94a3b8', fontSize: '13px' },
  downloadBtn: { display: 'inline-block', padding: '10px 16px', background: '#4f46e5', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 },
  previewImg: { marginTop: '16px', maxWidth: '100%', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)' },
  previewText: { marginTop: '16px', width: '100%', minHeight: '160px', background: '#0f172a', color: '#e6eef8', border: '1px solid #334155', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px' },
  optionsRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  optionField: { flex: 1 },
  input: { width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#e6eef8', border: '1px solid #334155' }
};
