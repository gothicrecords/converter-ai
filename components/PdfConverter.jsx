import { useEffect, useState } from 'react';
import Head from 'next/head';
import { BsDownload, BsArchive } from 'react-icons/bs';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';

const tabs = [
  { key: 'jpg2pdf', label: 'JPG -> PDF', color: '#f093fb' },
  { key: 'pdf2jpg', label: 'PDF -> JPG', color: '#4facfe' },
  { key: 'docx2pdf', label: 'WORD -> PDF', color: '#43e97b' },
  { key: 'pdf2docx', label: 'PDF -> WORD', color: '#fa709a' },
];

export default function PdfConverter({ initialActive = 'jpg2pdf', seoTitle, seoDescription }){
  const [active, setActive] = useState(initialActive);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outUrl, setOutUrl] = useState('');
  const [outList, setOutList] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hashKey = (window.location.hash || '').replace('#','');
    if (hashKey && tabs.some(t => t.key === hashKey)) setActive(hashKey);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.includes('/pdf/') && !window.location.pathname.match(/index$/)){
      // If we're on a per-tool page, do not override pathname
      return;
    }
    try { window.location.hash = active; } catch {}
  }, [active]);

  const onPick = (e) => setFiles(Array.from(e.target.files || []));

  const submit = async () => {
    if (!files.length) return;
    setLoading(true); setOutUrl(''); setOutList([]); setStatus('Elaborazione...');
    const fd = new FormData();
    if (active === 'jpg2pdf') {
      files.forEach(f=>fd.append('images', f));
    } else {
      const multi = (active === 'pdf2jpg' || active === 'pdf2docx' || active === 'docx2pdf');
      if (multi) files.forEach(f=>fd.append('file', f)); else fd.append('file', files[0]);
    }

    const route = active === 'jpg2pdf' ? '/api/pdf/jpg-to-pdf'
      : active === 'pdf2jpg' ? '/api/pdf/pdf-to-jpg'
      : active === 'docx2pdf' ? '/api/pdf/docx-to-pdf'
      : '/api/pdf/pdf-to-docx';

    try{
      const res = await fetch(route,{ method:'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.hint || j.details || j.error || 'Errore');
      if (j.urls && Array.isArray(j.urls)) {
        setOutList(j.urls);
      } else if (j.url) {
        setOutUrl(j.url);
      } else {
        throw new Error('Risposta sconosciuta');
      }
      setStatus('Fatto!');
    }catch(e){
      setStatus('Errore: '+ (e && e.message ? e.message : String(e)));
    }finally{ setLoading(false); }
  };

  const mimeToExt = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };

  const defaultExtByTab = {
    jpg2pdf: 'pdf',
    pdf2jpg: 'jpg',
    docx2pdf: 'pdf',
    pdf2docx: 'docx',
  };

  const handleDownload = async () => {
    if (!outUrl) return;
    try {
      let ext = defaultExtByTab[active] || 'bin';
      const res = await fetch(outUrl);
      const blob = await res.blob();
      const ct = blob.type;
      if (ct && mimeToExt[ct]) ext = mimeToExt[ct];
      else {
        try {
          const u = new URL(outUrl);
          const path = u.pathname || '';
          const dot = path.lastIndexOf('.')
          if (dot !== -1) {
            const guess = path.slice(dot+1).toLowerCase();
            if (guess) ext = guess;
          }
        } catch {}
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      setStatus('Errore nel download');
    }
  };

  return (
    <>
      <Navbar />
      <div className="pdf-wrap">
        <Head>
          <title>{seoTitle || 'PDF Converter Suite'}</title>
          <meta name="description" content={seoDescription || 'Converti documenti e immagini da e verso PDF con risultati rapidi e sicuri.'} />
          <meta property="og:title" content={seoTitle || 'PDF Converter Suite'} />
          <meta property="og:description" content={seoDescription || 'Converti documenti e immagini da e verso PDF con risultati rapidi e sicuri.'} />
        </Head>

        <div className="page-header">
          <h1 className="page-title">{seoTitle || 'PDF Converter Suite'}</h1>
          <p className="page-subtitle">{seoDescription || 'Converti i tuoi file in pochi secondi'}</p>
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <a
              key={t.key}
              href={`/pdf/${t.key}`}
              onClick={(e) => { e.preventDefault(); setActive(t.key); history.pushState(null,'',`/pdf/${t.key}`); }}
              className={'tab ' + (active===t.key?'active':'')}
              style={active === t.key ? { borderColor: t.color, background: `${t.color}15` } : {}}
            >
              <span>{t.label}</span>
            </a>
          ))}
        </div>

        <div className="panel">
          <div className="drop">
            <input
              type="file"
              multiple={active==='jpg2pdf' || active==='pdf2jpg' || active==='pdf2docx' || active==='docx2pdf'}
              accept={active==='jpg2pdf'? 'image/*' : (active==='docx2pdf'? '.doc,.docx' : '.pdf')}
              onChange={onPick}
            />
            <p>{files.length? `${files.length} file selezionati` : 'Trascina qui i file o clicca per selezionare'}</p>
          </div>

          <div className="actions">
            <button className="primary" onClick={submit} disabled={loading || !files.length}>
              {loading ? 'Converto...' : 'Converti'}
            </button>
            {outUrl && (
              <button className="primary download-btn" onClick={handleDownload}>
                <BsDownload className="btn-icon" />
                Download
              </button>
            )}
            {!!outList.length && (
              <button className="primary download-btn" onClick={async ()=>{
                try {
                  const JSZip = (await import('jszip')).default;
                  const zip = new JSZip();
                  let i = 1;
                  for (const it of outList) {
                    const r = await fetch(it.url);
                    const b = await r.blob();
                    const ct = it.type || b.type;
                    let ext = mimeToExt[ct] || 'bin';
                    try {
                      const u = new URL(it.url);
                      const p = u.pathname || '';
                      const dot = p.lastIndexOf('.');
                      if (!mimeToExt[ct] && dot !== -1) ext = p.slice(dot+1).toLowerCase();
                    } catch {}
                    const base = (it.name || `file-${i}`).replace(/[^a-z0-9\-_.]/gi,'_');
                    zip.file(`${base.replace(/\.(pdf|docx|jpg|jpeg|png)$/i,'')}.${ext}`, b);
                    i++;
                  }
                  const content = await zip.generateAsync({ type: 'blob' });
                  const url = URL.createObjectURL(content);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `converted-batch-${Date.now()}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (e) {
                  console.error(e);
                }
              }}>
                <BsArchive className="btn-icon" />
                Download ZIP
              </button>
            )}
          </div>

          <div className="result">
            <div>{status}</div>
            {outUrl && (
              <div style={{marginTop:10}}>
                <a className="link" href={outUrl} target="_blank" rel="noreferrer">Apri risultato</a>
              </div>
            )}
            {!!outList.length && (
              <div style={{marginTop:10}}>
                <ul>
                  {outList.map((it, idx)=> (
                    <li key={idx} style={{marginBottom:6}}>
                      <a className="link" href={it.url} target="_blank" rel="noreferrer">{it.name || `file-${idx+1}`}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

        <style jsx>{`/* copy of styles from pages/pdf/index.jsx */
          .pdf-wrap{max-width:1000px;margin:0 auto;padding:40px 24px}
          .page-header{text-align:center;margin-bottom:40px}
          .page-title{font-size:clamp(28px,5vw,40px);font-weight:800;margin:0 0 12px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
          .page-subtitle{font-size:16px;color:#94a3b8;margin:0}
          .tabs{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:32px}
          .tab{display:flex;align-items:center;gap:4px;background:#0f172a;color:#cfe0ff;border:2px solid rgba(148,163,184,0.24);border-radius:12px;padding:12px 18px;cursor:pointer;transition:all 0.3s;font-weight:600;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 6px 14px rgba(0,0,0,0.25);text-decoration:none}
          .tab:hover{transform:translateY(-2px);border-color:rgba(148,163,184,0.36)}
          .tab.active{color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 8px 20px rgba(0,0,0,0.35)}
          .panel{margin-top:16px;padding:28px;background:#0b1220;border:2px solid rgba(148,163,184,0.24);border-radius:16px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 12px 26px rgba(0,0,0,0.35)}
          .drop{border:2px dashed rgba(148,163,184,0.36);border-radius:12px;padding:32px;text-align:center;cursor:pointer;position:relative;min-height:180px;display:flex;align-items:center;justify-content:center;transition:all 0.3s}
          .drop:hover{border-color:rgba(148,163,184,0.55);background:rgba(148,163,184,0.05)}
          .drop input{position:absolute;inset:0;opacity:0;cursor:pointer}
          .drop p{margin:0;font-size:15px;color:#94a3b8}
          .actions{display:flex;gap:12px;margin-top:20px;flex-wrap:wrap}
          .primary{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:10px;padding:12px 20px;cursor:pointer;font-weight:600;transition:all 0.3s}
          .primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 16px rgba(102,126,234,0.3)}
          .primary:disabled{opacity:0.5;cursor:not-allowed}
          .download-btn{background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)}
          .download-btn:hover{box-shadow:0 8px 16px rgba(67,233,123,0.3)}
          .btn-icon{width:18px;height:18px}
          .result{margin-top:20px}
          .result>div:first-child{padding:12px 16px;background:rgba(148,163,184,0.1);border-radius:8px;font-size:14px;color:#cbd5e1}
          .link{color:#60a5fa;text-decoration:none;font-weight:500;transition:color 0.2s}
          .link:hover{color:#93c5fd}
          ul{list-style:none;padding:0;margin:0}
          li{padding:8px 12px;background:rgba(148,163,184,0.05);border-radius:8px;margin-bottom:8px}
          @media (max-width:640px){
            .pdf-wrap{padding:24px 16px}
            .tabs{gap:8px}
            .tab{padding:10px 14px;font-size:14px}
            .panel{padding:20px}
          }
        `}</style>
      </div>
    </>
  );
}
