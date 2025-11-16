import { useState } from 'react';

const tabs = [
  { key: 'jpg2pdf', label: 'JPG -> PDF' },
  { key: 'pdf2jpg', label: 'PDF -> JPG' },
  { key: 'docx2pdf', label: 'WORD -> PDF' },
  { key: 'pdf2docx', label: 'PDF -> WORD' },
];

export default function Home(){
  const [active, setActive] = useState('jpg2pdf');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outUrl, setOutUrl] = useState('');
  const [status, setStatus] = useState('');

  const onPick = (e) => setFiles(Array.from(e.target.files||[]));

  const submit = async () => {
    if (!files.length) return;
    setLoading(true); setOutUrl(''); setStatus('Elaborazione...');
    const fd = new FormData();
    if (active === 'jpg2pdf') files.forEach(f=>fd.append('images', f));
    else fd.append('file', files[0]);

    const route = active === 'jpg2pdf' ? '/api/jpg-to-pdf'
      : active === 'pdf2jpg' ? '/api/pdf-to-jpg'
      : active === 'docx2pdf' ? '/api/docx-to-pdf'
      : '/api/pdf-to-docx';

    try{
      const res = await fetch(route,{ method:'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.hint || j.details || j.error || 'Errore');
      setOutUrl(j.url);
      setStatus('Fatto!');
    }catch(e){
      setStatus('Errore: '+ (e?.message||e));
    }finally{ setLoading(false); }
  };

  return (
    <div className="container">
      <h1>PDF Converter Suite</h1>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={'tab ' + (active===t.key?'active':'')} onClick={()=>{setActive(t.key); setFiles([]); setOutUrl(''); setStatus('')}}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="drop">
          <input type="file" multiple={active==='jpg2pdf'} accept={active==='jpg2pdf'? 'image/*' : (active==='docx2pdf'? '.doc,.docx' : '.pdf')} onChange={onPick} />
          <p>{files.length? `${files.length} file selezionati` : 'Trascina qui i file o clicca per selezionare'}</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={submit} disabled={loading || !files.length}>{loading? 'Converto...':'Converti'}</button>
        </div>
        <div className="result">
          <div>{status}</div>
          {outUrl && (
            <div style={{marginTop:10}}>
              <a className="link" href={outUrl} target="_blank" rel="noreferrer">Apri risultato</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
