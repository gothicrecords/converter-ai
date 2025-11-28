# Fix per Conversioni Audio/Video - 404 Not Found

## Problema
Le conversioni audio (mp3, wav, etc.) restituiscono errore 404 con URL malformato:
```
https://megapixelsuite.up.railway.app/https://megapixelsuite.up.railway.app/api/convert/wav
```

## Cause
1. **Doppio dominio nell'URL**: Il frontend sta aggiungendo il dominio due volte
2. **Endpoint sbagliato**: Le conversioni audio/video dovrebbero usare il backend Python, non Next.js

## Architettura Corretta

### Backend Python (Port 8000)
- **Audio**: `/api/audio/convert`
- **Video**: `/api/video/convert  
- **General Convert**: `/api/convert/{format}`

### frontend Next.js
- **Proxy locale**: `/api/convert/[target].js` (solo per sviluppo locale)

## Soluzione

### Opzione 1: Usare endpoint Python specifici (CONSIGLIATO)

Le conversioni audio e video dovrebbero chiamare:
- **Audio**: `POST ${NEXT_PUBLIC_API_URL}/api/audio/convert`
- **Video**: `POST ${NEXT_PUBLIC_API_URL}/api/video/convert`

**Parametri richiesti**:
```javascript
// Audio
FormData {
  file: File,
  target_format: 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a' | 'opus' | 'weba',
  abitrate: '128k' | '192k' | '320k' (optional)
}

// Video
FormData {
  file: File,
  target_format: 'mp4' | 'avi' | 'mov' | 'webm' | 'mkv' | 'flv',
  vwidth: number (optional),
  vheight: number (optional),
  vbitrate: string (optional),
  abitrate: string (optional)
}
```

### Opzione 2: Usare endpoint generico  converter

Se si vuole usare l'endpoint generico `/api/convert/{format}`:
- **Deve puntare al backend Python**, non a Next.js
- **URL**: `POST ${NEXT_PUBLIC_API_URL}/api/convert/{format}`

## File da Modificare

### 1. Componente che gestisce la conversione audio/video

Cerca il file che fa la chiamata API e verifica:

```javascript
// ❌ SBAGLIATO - doppio dominio
const url = `https://megapixelsuite.up.railway.app/https://megapixelsuite.up.railway.app/api/convert/${format}`;

// ❌ SBAGLIATO - chiama Next.js invece di Python
const url = `/api/convert/${format}`;

// ✅ CORRETTO - usa variabile d'ambiente
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/audio/convert`;
// o
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/video/convert`;
```

### 2. Verifica variabile d'ambiente

In produzione (Railway):
```env
NEXT_PUBLIC_API_URL=https://megapixelsuite.up.railway.app
```

In sviluppo locale:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### Test Backend Python

```bash
# Audio conversion
curl -X POST https://megapixelsuite.up.railway.app/api/audio/convert \
  -F "file=@test.mp3" \
  -F "target_format=wav"

# Video conversion
curl -X POST https://megapixelsuite.up.railway.app/api/video/convert \
  -F "file=@test.mp4" \
  -F "target_format=webm"
```

### Test da Browser Console

```javascript
// Test conversione audio
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('target_format', 'wav');

fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/audio/convert`, {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Endpoint Disponibili

### Audio Conversion
- **URL**: `/api/audio/convert`
- **Method**: POST
- **Body**: multipart/form-data
- **Response**: `{ name: string, dataUrl: string }`

### Video Conversion  
- **URL**: `/api/video/convert`
- **Method**: POST
- **Body**: multipart/form-data
- **Response**: `{ name: string, dataUrl: string }`

### Tools - Alternative Routes
- **Audio**: `/api/tools/convert-audio`
- **Video**: `/api/tools/convert-video`

## Checklist Debugging

- [ ] Verificare che `NEXT_PUBLIC_API_URL` sia impostato correttamente
- [ ] Verificare che l'URL non contenga doppi domini
- [ ] Verificare che la chiamata usi il backend Python (porta 8000)
- [ ] Verificare che i parametri FormData siano corretti
- [ ] Verificare che il backend Python sia in esecuzione su Railway
- [ ] Testare con curl per escludere problemi frontend
- [ ] Verificare i logs del backend Python per errori

## Log Railway

Verifica che il backend Python sia attivo:
```bash
railway logs
```

Cerca errori come:
- FFmpeg non trovato
- Dipendenze mancanti
- Errori di conversione
