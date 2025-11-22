module.exports=[74538,e=>e.a(async(t,i)=>{try{let t=await e.y("openai");e.n(t),i()}catch(e){i(e)}},!0),67370,e=>e.a(async(t,i)=>{try{var n=e.i(74538),o=t([n]);[n]=o.then?(await o)():o;let p=new n.default({apiKey:process.env.OPENAI_API_KEY});async function r(e){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");try{return(await p.embeddings.create({model:"text-embedding-3-small",input:e.substring(0,8e3)})).data[0].embedding}catch(e){throw console.error("Error generating embedding:",e),Error(`Failed to generate embedding: ${e.message}`)}}async function a(e){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");if(!Array.isArray(e)||0===e.length)return[];try{return(await p.embeddings.create({model:"text-embedding-3-small",input:e.map(e=>(e||"").toString().substring(0,8e3))})).data.map(e=>e.embedding)}catch(e){throw console.error("Error generating batch embeddings:",e),Error(`Failed to generate batch embeddings: ${e.message}`)}}async function s(e,t={}){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");try{return(await p.chat.completions.create({model:t.model||"gpt-4o-mini",messages:e,temperature:t.temperature||.7,max_tokens:t.max_tokens||1e3,top_p:t.top_p||1,frequency_penalty:t.frequency_penalty||0,presence_penalty:t.presence_penalty||0})).choices[0].message.content}catch(e){if(console.error("Error in chat completion:",e),401===e.status)throw Error("Chiave API OpenAI non valida. Verifica la configurazione.");if(429===e.status)throw Error("Limite di rate raggiunto. Riprova tra qualche secondo.");if(500===e.status)throw Error("Errore del server OpenAI. Riprova più tardi.");throw Error(`Errore nella comunicazione con OpenAI: ${e.message}`)}}async function l(e,t=200){let i=[{role:"system",content:"You are a helpful assistant that creates concise summaries."},{role:"user",content:`Summarize the following text in ${t} words or less:

${e}`}];return await s(i,{temperature:.5,max_tokens:300})}async function c(e,t=5){let i=[{role:"system",content:"You are a helpful assistant that generates relevant tags for documents. Return only comma-separated tags, no explanations."},{role:"user",content:`Generate ${t} relevant tags for this document:

${e.substring(0,2e3)}`}];return(await s(i,{temperature:.3,max_tokens:100})).split(",").map(e=>e.trim().toLowerCase()).filter(e=>e.length>0).slice(0,t)}async function m(e){let t=["contract","invoice","report","presentation","spreadsheet","image","code","email","article","other"],i=[{role:"system",content:`You are a document classifier. Classify the document into one or more of these categories: ${t.join(", ")}. Return only category names, comma-separated.`},{role:"user",content:`Classify this document:

${e.substring(0,1e3)}`}];return(await s(i,{temperature:.2,max_tokens:50})).split(",").map(e=>e.trim().toLowerCase()).filter(e=>t.includes(e))}async function u(e,t,i="Cosa contiene questa immagine? Descrivi tutto ciò che vedi."){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");try{let n=e.toString("base64");return(await p.chat.completions.create({model:"gpt-4o",messages:[{role:"system",content:"Sei un assistente AI esperto nell'analisi di immagini. Descrivi in dettaglio tutto ciò che vedi nell'immagine, inclusi testo, oggetti, persone, scene, colori e qualsiasi altro dettaglio rilevante. Rispondi sempre in italiano."},{role:"user",content:[{type:"text",text:i},{type:"image_url",image_url:{url:`data:${t};base64,${n}`,detail:"high"}}]}],max_tokens:2e3,temperature:.2})).choices[0].message.content}catch(e){if(console.error("Error in vision API:",e),401===e.status)throw Error("Chiave API OpenAI non valida. Verifica la configurazione.");if(429===e.status)throw Error("Limite di rate raggiunto. Riprova tra qualche secondo.");if(400===e.status&&e.message?.includes("image"))throw Error("Formato immagine non supportato o immagine troppo grande.");throw Error(`Errore nell'analisi dell'immagine: ${e.message}`)}}async function d(t){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");let i=await e.A(23970),n=null;try{n=await p.files.create({file:i.createReadStream(t),purpose:"user_data"});let e=((await p.responses.create({model:"gpt-4o",input:[{role:"user",content:[{type:"input_text",text:"Estrai tutto il testo e le informazioni rilevanti da questo documento. Rispondi SOLO con il testo estratto, senza commenti."},{type:"input_file",file_id:n.id}]}],max_output_tokens:8e3,temperature:.1})).output_text||"").toString().trim();if(!e)throw Error("Nessun testo estratto dal PDF");return e}catch(e){if(console.error("Error in PDF text extraction (Responses API):",e),401===e.status)throw Error("Chiave API OpenAI non valida. Verifica la configurazione.");if(429===e.status)throw Error("Limite di rate raggiunto. Riprova tra qualche secondo.");if(400===e.status)throw Error("Errore nell'analisi del PDF con Responses API. Il file potrebbe essere troppo grande o danneggiato.");throw Error(`Errore nell'estrazione del testo PDF: ${e.message}`)}finally{try{n&&n.id&&(p.files?.delete?await p.files.delete(n.id):p.files?.del&&await p.files.del(n.id))}catch(e){console.warn("Errore rimozione file da OpenAI (ignorato):",e?.message||e)}}}e.s(["analyzeImageWithVision",()=>u,"chatCompletion",()=>s,"classifyDocument",()=>m,"extractTextFromPdfWithOpenAI",()=>d,"generateEmbedding",()=>r,"generateEmbeddingsBatch",()=>a,"generateSummary",()=>l,"generateTags",()=>c]),i()}catch(e){i(e)}},!1),62069,e=>e.a(async(t,i)=>{try{var n=e.i(29211),o=e.i(16969),r=e.i(67370),a=t([r]);[r]=a.then?(await a)():a;let f=new Map;async function s(t,i,r,a=null){try{let s="",l={filename:r,mimeType:i,pages:0,wordCount:0};if("application/pdf"===i||r.toLowerCase().endsWith(".pdf")){let{extractTextFromPdfWithOpenAI:i}=await e.A(25775),n=await e.A(23970),o=await e.A(89793),a=(await e.A(7480)).tmpdir(),c=o.join(a,`temp_${Date.now()}_${r}`);try{if(n.writeFileSync(c,t),s=((s=await i(c))||"").toString().trim(),l.analysisMethod="openai-file-upload",!s||0===s.length)throw Error("Nessun testo estratto dal PDF tramite OpenAI")}finally{try{n.existsSync(c)&&n.unlinkSync(c)}catch(e){console.warn("Errore pulizia file temporaneo:",e)}}}else if(i.includes("wordprocessingml")||r.toLowerCase().endsWith(".docx"))s=(s=(await n.default.extractRawText({buffer:t})).value).replace(/\s+/g," ").trim();else if(i.includes("spreadsheet")||r.toLowerCase().match(/\.(xlsx|xls|csv)$/i)){let e=o.read(t,{type:"buffer"}),i=e.SheetNames,n=[];for(let t of i){let i=e.Sheets[t];for(let e of o.utils.sheet_to_json(i,{header:1,defval:""}))if(Array.isArray(e)){let i=e.filter(e=>e&&e.toString().trim()).join(" ");i.trim()&&n.push(`[${t}] ${i}`)}}s=n.join("\n")}else if(i.startsWith("text/")||r.toLowerCase().endsWith(".txt"))s=t.toString("utf-8");else if(i.startsWith("image/")||r.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp|bmp|tif|tiff|heic|heif)$/i))try{let{analyzeImageWithVision:n}=await e.A(25775);try{s=await n(t,i,"Analizza questa immagine in dettaglio. Descrivi tutto ciò che vedi, incluso qualsiasi testo presente, oggetti, persone, scene, colori e dettagli rilevanti. Se c'è del testo, trascrivilo accuratamente."),l.analysisMethod="openai-vision"}catch(o){let i=(await e.A(35943)).default,n=a||t;try{s=(await i.recognize(n,"ita+eng",{logger:e=>{e.status}})).data.text.trim(),l.analysisMethod="ocr-tesseract"}catch(t){let e=await i.createWorker("ita+eng",1,{logger:e=>{e.status}});try{s=(await e.recognize(n)).data.text.trim(),l.analysisMethod="ocr-tesseract-worker"}finally{await e.terminate()}}}if(!s||0===s.length)throw Error("Nessun contenuto estratto dall'immagine. L'immagine potrebbe essere vuota o non contenere testo leggibile.")}catch(e){throw console.error("Errore analisi immagine completo:",e),Error(`Errore nell'analisi dell'immagine: ${e.message}`)}else throw Error(`Tipo di file non supportato: ${i}`);if(!s||0===s.trim().length)throw Error("Nessun testo estratto dal documento");return l.wordCount=s.split(/\s+/).length,{text:s,metadata:l}}catch(e){throw console.error("Errore estrazione testo:",e),Error(`Errore nell'estrazione del testo: ${e.message}`)}}async function l(t,i=1e3,n=200){let o=t.split(/[.!?]+\s+/).filter(e=>e.trim().length>10),r=[],a="",s=0;for(let e of o){let o=e.length;s+o>i&&a.trim()?(r.push({text:a.trim(),startIndex:t.indexOf(a.trim()),endIndex:t.indexOf(a.trim())+a.length}),s=(a=a.split(/\s+/).slice(-Math.floor(n/10)).join(" ")+" "+e+" ").length):(a+=e+". ",s+=o+2)}a.trim()&&r.push({text:a.trim(),startIndex:t.indexOf(a.trim()),endIndex:t.length});let c=r.length>0?r:[{text:t.trim(),startIndex:0,endIndex:t.length}],{generateEmbeddingsBatch:m}=await e.A(25775);try{for(let e=0;e<c.length;e+=16){let t=c.slice(e,e+16);(await m(t.map(e=>e.text))).forEach((e,i)=>{t[i].embedding=e})}}catch(i){console.warn("Batch embeddings failed, falling back to per-chunk:",i.message);let{generateEmbedding:t}=await e.A(25775);for(let e of c)try{e.embedding=await t(e.text)}catch(t){console.warn("Errore generazione embedding per chunk:",t.message),e.embedding=null}}return c}async function c(t,i,n,o=5){if(!i||0===i.length)return[];let{generateEmbedding:r}=await e.A(25775),a=null;try{a=await r(n)}catch(e){console.warn("Errore generazione embedding query, uso TF-IDF:",e)}return i.map((e,t)=>{let i=0;i=a&&e.embedding?function(e,t){if(!e||!t||e.length!==t.length)return 0;let i=e.reduce((e,i,n)=>e+i*t[n],0),n=Math.sqrt(e.reduce((e,t)=>e+t*t,0)),o=Math.sqrt(t.reduce((e,t)=>e+t*t,0));return i/(n*o)}(a,e.embedding):function(e,t){let i=e.toLowerCase().split(/\W+/).filter(e=>e.length>2),n=t.toLowerCase().split(/\W+/).filter(e=>e.length>2);if(0===n.length)return 0;let o=0,r={};return i.forEach(e=>{r[e]=(r[e]||0)+1}),n.forEach(e=>{let t=r[e]||0;if(t>0){let e=t/i.length,n=Math.log(i.length/(t+1))+1;o+=e*n}}),o/n.length}(e.text,n)/10;let o=e.text.toLowerCase(),r=n.toLowerCase(),s=0;o.includes(r)&&(s=.1);let l=n.toLowerCase().split(/\W+/).filter(e=>e.length>2),c=l.filter(e=>o.includes(e)).length/l.length*.05,m=i+s+c;return{...e,score:m,index:t}}).sort((e,t)=>t.score-e.score).slice(0,o).filter(e=>e.score>=0)}async function m(e,t,i,n="",o={}){if(!t||0===t.length)return{answer:"Non ho trovato informazioni rilevanti nel documento per rispondere alla tua domanda. Prova a formulare la domanda in modo diverso o carica un documento più pertinente.",confidence:0,sources:[]};let a=t.map((e,t)=>`[Sezione ${t+1}]
${e.text}`).join("\n\n---\n\n"),s=Math.min(10*t[0].score,1);try{let i="";n&&n.trim()&&(i=`

**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**
${n}

Usa questo contesto per capire meglio la domanda e fornire una risposta coerente con la conversazione.`);let l=[{role:"system",content:`Sei un assistente AI esperto nell'analisi di documenti. Segui un ragionamento interno SILENTE (non mostrarlo) con i passi: 1) Identifica concetti chiave 2) Seleziona parti rilevanti 3) Sintetizza relazioni 4) Verifica contraddizioni o assenze 5) Struttura risposta finale. Poi produci SOLO l'output formattato.

OBIETTIVI:
1. Analisi accurata delle sezioni fornite
2. Risposta logica e coerente basata esclusivamente sul contenuto
3. Struttura chiara e professionale in italiano
4. Citazione delle fonti/Sezioni rilevanti
5. Nessuna invenzione: se manca l'informazione, dichiaralo e suggerisci cosa servirebbe

FORMATTA LA RISPOSTA CON LE SEZIONI (usa markdown semplice):
**Risposta**: sintesi principale diretta alla domanda.
**Dettagli**: approfondisci punti chiave organizzati.
**Fonti**: elenco puntato con sezione e breve estratto.
**Limiti**: cosa non \xe8 presente o ambiguo.
**Suggerimenti**: eventuali passi successivi o chiarimenti da richiedere.

Regole:
- Non includere il ragionamento interno.
- Non scusarti a meno che il contenuto sia realmente assente.
- Mantieni tono professionale, conciso ma completo.`},{role:"user",content:`Analizza il seguente contenuto estratto dal documento e rispondi alla domanda dell'utente in modo completo e accurato.

**CONTENUTO DEL DOCUMENTO:**
${a}${i}

**DOMANDA DELL'UTENTE:**
${e}

**ISTRUZIONI:**
- Rispondi basandoti SOLO sul contenuto fornito sopra
- Se la risposta richiede informazioni non presenti, dillo chiaramente
- Cita o fai riferimento alle sezioni rilevanti quando possibile
- Fornisci una risposta completa e ben strutturata
- Considera il contesto della conversazione se fornito per una risposta pi\xf9 pertinente`}],c=await (0,r.chatCompletion)(l,{model:"gpt-4o-mini",temperature:.2,max_tokens:1200,top_p:.9,frequency_penalty:.1,presence_penalty:.1});return c=c.trim(),/mi dispiace|non posso/i.test(c)&&c.length<120&&(c=`**Risposta**: Informazioni limitate nel testo fornito.
**Dettagli**:
${t.slice(0,3).map(e=>"- "+e.text.substring(0,200).replace(/\n+/g," ")+(e.text.length>200?"...":"")).join("\n")}
**Fonti**:
${t.map((e,t)=>`- Sezione ${t+1} (score ${e.score.toFixed(3)})`).join("\n")}
**Limiti**: Il documento sembra contenere testo estremamente breve o generico.
**Suggerimenti**: Carica un documento pi\xf9 esteso oppure specifica meglio la domanda.`),{answer:c,confidence:s,sources:t.map(e=>({filename:o?.originalFilename||o?.filename||"Documento",text:e.text.substring(0,150)+"...",score:e.score.toFixed(3)}))}}catch(i){console.error("Errore nella generazione della risposta con OpenAI:",i);let e=t[0].text;return{answer:`Basandomi sul documento:

${e}

${t.length>1?"\nInformazioni aggiuntive:\n"+t.slice(1,3).map((e,t)=>`• ${e.text.substring(0,200)}...`).join("\n"):""}`,confidence:s,sources:t.map(e=>({filename:o?.originalFilename||o?.filename||"Documento",text:e.text.substring(0,150)+"...",score:e.score.toFixed(3)}))}}}async function u(e,t,i={}){let n=await l(t),o={text:t,chunks:n,metadata:{...i,filename:i.filename||i.originalFilename||"Unknown",storedAt:new Date().toISOString(),chunkCount:n.length}};return f.set(e,o),{fileId:e,chunkCount:n.length,wordCount:t.split(/\s+/).length}}async function d(e,t=null){let i=t&&t.length>0?t.map(e=>{let t=f.get(e);return{id:e,data:t}}).filter(e=>e.data):Array.from(f.entries()).map(([e,t])=>({id:e,data:t}));if(0===i.length)return[];let n=[];for(let{id:t,data:o}of i){if(!o||!o.chunks||!o.chunks.length)continue;let i=await c(o.text,o.chunks,e,5);i.length>0&&n.push({fileId:t,filename:o.metadata?.originalFilename||o.metadata?.filename||"Unknown",results:i,topScore:i[0].score})}return n.sort((e,t)=>t.topScore-e.topScore)}async function p(e,t,i=""){var n;if(!t||0===t.length)return{answer:"Non ho trovato informazioni rilevanti nei documenti caricati. Prova a formulare la domanda in modo diverso o carica documenti più pertinenti.",confidence:0,sources:[]};let o=t.flatMap(e=>e.results.map(t=>({...t,filename:e.filename,fileId:e.fileId}))).sort((e,t)=>t.score-e.score).slice(0,5);if(0===o.length)return{answer:"Non ho trovato informazioni sufficienti per rispondere.",confidence:0,sources:[]};let a=o[0],s=(n=a.fileId,f.get(n));if(1===t.length)return await m(e,o,s.text,i,s.metadata||{});{let n=Math.min(10*a.score,1);try{let a=o.map((e,t)=>`[Documento: "${e.filename}" - Sezione ${t+1}]
${e.text}`).join("\n\n---\n\n"),s="";i&&i.trim()&&(s=`

**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**
${i}

Usa questo contesto per capire meglio la domanda e fornire una risposta coerente con la conversazione.`);let l=[{role:"system",content:`Sei un assistente AI esperto nell'analisi di documenti multipli. Usa ragionamento interno SILENTE (non mostrarlo) seguendo: 1) Mappa concetti per documento 2) Trova sovrapposizioni/contrasti 3) Sintetizza 4) Valuta completezza 5) Struttura output. Non mostrare i passi.

FORMATTA OUTPUT:
**Risposta** (sintesi diretta alla domanda)
**Analisi** (integrazione logica tra documenti, relazioni, eventuali differenze)
**Fonti** (elenco: Documento – breve estratto pertinente)
**Limiti** (informazioni mancanti, contraddizioni non risolte)
**Suggerimenti** (cosa potrebbe aiutare o prossimi passi)

Regole:
- Non inventare contenuto
- Non scusarti salvo assenza totale di informazioni
- Cita il nome del documento per ogni informazione specifica
- Indica contraddizioni se presenti.`},{role:"user",content:`Analizza il contenuto estratto da ${t.length} documenti diversi e rispondi alla domanda dell'utente sintetizzando le informazioni rilevanti.

**CONTENUTO DAI DOCUMENTI:**
${a}${s}

**DOMANDA DELL'UTENTE:**
${e}

**ISTRUZIONI:**
- Combina informazioni da tutti i documenti rilevanti
- Cita sempre il nome del documento quando fai riferimento a informazioni specifiche
- Se ci sono informazioni correlate in pi\xf9 documenti, integrale in modo coerente
- Fornisci una risposta completa che risponda alla domanda utilizzando tutte le fonti pertinenti
- Considera il contesto della conversazione se fornito per una risposta pi\xf9 pertinente`}],c=await (0,r.chatCompletion)(l,{model:"gpt-4o-mini",temperature:.2,max_tokens:1500,top_p:.9,frequency_penalty:.1,presence_penalty:.1});if(c=c.trim(),/mi dispiace|non posso/i.test(c)&&c.length<140){let e=o.slice(0,5).map((e,t)=>`- ${e.filename} [score ${e.score.toFixed(3)}]: ${e.text.substring(0,160).replace(/\n+/g," ")}${e.text.length>160?"...":""}`).join("\n");c=`**Risposta**: Informazioni limitate ma estratte dai documenti.
**Analisi**: I contenuti disponibili sono molto brevi; non emergono argomentazioni complesse.
**Fonti**:
${e}
**Limiti**: Poca profondit\xe0; serve testo aggiuntivo.
**Suggerimenti**: Carica versioni pi\xf9 complete dei documenti o specifica una domanda pi\xf9 dettagliata.`}return{answer:c,confidence:n,sources:o.slice(0,3).map(e=>({filename:e.filename,text:e.text.substring(0,100)+"...",score:e.score.toFixed(3)}))}}catch(n){console.error("Errore nella generazione della risposta multi-documento con OpenAI:",n);let e=`Basandomi sui ${t.length} documenti caricati:

`;if(e+=`**Dal documento "${a.filename}":**
${a.text}

`,o.length>1){let t=o.slice(1,3).filter(e=>e.fileId!==a.fileId);t.length>0&&(e+=`**Informazioni correlate da altri documenti:**
`,t.forEach((t,i)=>{e+=`
[${i+1}] Da "${t.filename}":
${t.text.substring(0,200)}...
`}))}let i=Math.min(10*a.score,1);return{answer:e.trim(),confidence:i,sources:o.slice(0,3).map(e=>({filename:e.filename,text:e.text.substring(0,100)+"...",score:e.score.toFixed(3)}))}}}}function g(){let e=Array.from(f.values());return{totalDocuments:f.size,totalWords:e.reduce((e,t)=>e+(t.text.split(/\s+/).length||0),0),totalChunks:e.reduce((e,t)=>e+(t.chunks?.length||0),0),documents:Array.from(f.entries()).map(([e,t])=>({fileId:e,index:Array.from(f.keys()).indexOf(e),filename:t.metadata?.filename||t.metadata?.originalFilename||"Unknown",wordCount:t.text.split(/\s+/).length,chunkCount:t.chunks?.length||0,storedAt:t.metadata?.storedAt}))}}e.s(["extractTextFromDocument",()=>s,"generateMultiDocumentAnswer",()=>p,"getDocumentStats",()=>g,"searchAllDocuments",()=>d,"storeDocument",()=>u]),i()}catch(e){i(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__7adc05b1._.js.map