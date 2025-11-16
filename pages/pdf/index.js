import { useEffect, useState } from 'react';
import Head from 'next/head';

const tabs = [
  { key: 'jpg2pdf', label: 'JPG → PDF' },
  { key: 'pdf2jpg', label: 'PDF → JPG' },
  { key: 'docx2pdf', label: 'WORD → PDF' },
  { key: 'pdf2docx', label: 'PDF → WORD' },
];

export default function PdfSuite(){
  const [active, setActive] = useState('jpg2pdf');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outUrl, setOutUrl] = useState('');
  const [outList, setOutList] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const applyHash = () => {
      const key = (window.location.hash || '').replace('#','');
      if (tabs.some(t => t.key === key)) {
        setActive(key);
        setFiles([]);
        setOutUrl('');
        setOutList([]);
        setStatus('');
      }
    };
    // initial
    applyHash();
    // listen to changes
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const onPick = (e) => setFiles(Array.from(e.target.files||[]));

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
      setStatus('Errore: '+ (e?.message||e));
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
    <div className="pdf-wrap">
      <Head><title>PDF Converter Suite</title></Head>
      <h1>PDF Converter Suite</h1>
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={'tab ' + (active===t.key?'active':'')}
            onClick={()=>{
              // update hash for deep-linking and state for immediacy
              try { window.location.hash = t.key; } catch {}
              setActive(t.key); setFiles([]); setOutUrl(''); setOutList([]); setStatus('');
            }}
          >
            {t.label}
          </button>
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
          <button className="primary" onClick={submit} disabled={loading || !files.length}>{loading? 'Converto…':'Converti'}</button>
          {outUrl && (
            <button style={{marginLeft:10}} className="primary" onClick={handleDownload}>Download</button>
          )}
          {!!outList.length && (
            <button style={{marginLeft:10}} className="primary" onClick={async ()=>{
              try {
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();
                const mimeToExt = {
                  'application/pdf': 'pdf',
                  'image/jpeg': 'jpg',
                  'image/png': 'png',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
                };
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
            }}>Download ZIP</button>
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

      <style jsx>{`
        .pdf-wrap{max-width:1000px;margin:0 auto;padding:24px}
        h1{margin:0 0 16px;font-size:32px}
        .tabs{display:flex;gap:8px;flex-wrap:wrap}
        .tab{background:#1a2235;color:#cfe0ff;border:none;border-radius:10px;padding:10px 14px;cursor:pointer}
        .tab.active{background:#2563eb;color:#fff}
        .panel{margin-top:16px;padding:16px;background:#0f172a;border:1px solid #1f2a44;border-radius:12px}
        .drop{border:2px dashed #334155;border-radius:12px;padding:24px;text-align:center;cursor:pointer;position:relative;min-height:160px;display:flex;align-items:center;justify-content:center}
        .drop input{position:absolute;inset:0;opacity:0;cursor:pointer}
        .actions{margin-top:12px}
        .primary{background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px 18px;cursor:pointer}
        .link{color:#9cc1ff}
      `}</style>
    </div>
  );
}
