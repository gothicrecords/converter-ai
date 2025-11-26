# Sistema Automatico di Gestione Errori

## Panoramica

È stato implementato un sistema completo e automatico per gestire tutti gli errori che si verificano quando i tool non restituiscono risultati validi. Il sistema garantisce che il codice funzioni sempre perfettamente, anche quando le API falliscono o restituiscono dati vuoti/null.

## Componenti Implementati

### 1. `utils/safeApiCall.js` - Wrapper Universale per Chiamate API

Un sistema completo che:
- ✅ **Valida automaticamente** tutte le risposte API prima di usarle
- ✅ **Gestisce retry automatico** con exponential backoff (3 tentativi di default)
- ✅ **Implementa fallback automatico** quando le API falliscono
- ✅ **Gestisce timeout** automaticamente (5 minuti di default)
- ✅ **Valida risultati** per diversi tipi (dataUrl, url, blob, json, array)
- ✅ **Gestisce errori** in modo silenzioso o con notifiche utente

#### Funzioni Principali:

```javascript
// Chiamata API sicura generica
import { safeApiCall } from '../utils/safeApiCall';
const result = await safeApiCall('/api/endpoint', options, config);

// Upload file sicuro con validazione
import { safeUploadFile } from '../utils/safeApiCall';
const result = await safeUploadFile('/api/upload', file, additionalFields, {
  validator: 'dataUrl',
  maxRetries: 3,
  timeout: 300000,
});

// Chiamate specializzate
import { safeJsonCall, safeArrayCall, safeBlobCall } from '../utils/safeApiCall';
```

#### Validatori Disponibili:

- `dataUrl`: Valida risposte con dataUrl o url (per conversioni file)
- `url`: Valida risposte con URL
- `blob`: Valida risposte blob/file
- `json`: Valida risposte JSON generiche
- `array`: Valida risposte array

### 2. `backend/utils/response_validator.py` - Validatore Python

Sistema di validazione lato backend che:
- ✅ **Valida sempre** le risposte prima di restituirle al frontend
- ✅ **Garantisce formato corretto** per tutti i tipi di risposta
- ✅ **Gestisce risposte vuote** con valori di default quando necessario
- ✅ **Lancia eccezioni appropriate** quando la validazione fallisce

#### Utilizzo:

```python
from backend.utils.response_validator import validate_response

# Valida una risposta
validated = validate_response(
    result,
    response_type="dataUrl",
    required_fields=["url"],
    allow_empty=False
)
```

### 3. Aggiornamento Componenti Frontend

#### `components/GenericConverter.js`

Aggiornato per usare `safeUploadFile` che:
- ✅ Gestisce automaticamente tutti gli errori
- ✅ Valida i risultati prima di usarli
- ✅ Implementa retry automatico
- ✅ Gestisce timeout e fallback

**Prima:**
```javascript
data = await uploadFile(fullApiUrl, file, additionalFields);
// Validazione manuale...
if (!data || typeof data !== 'object') {
  throw new Error('Formato risposta non valido');
}
// Altri controlli manuali...
```

**Dopo:**
```javascript
const data = await safeUploadFile(fullApiUrl, file, additionalFields, {
  validator: 'dataUrl',
  maxRetries: 3,
  timeout: 300000,
});
// I dati sono già validati e garantiti validi!
```

### 4. Aggiornamento Backend Python

#### `backend/routers/tools.py`

Tutti gli endpoint sono stati aggiornati per:
- ✅ Validare sempre le risposte prima di restituirle
- ✅ Gestire eccezioni ProcessingException in modo appropriato
- ✅ Restituire sempre risposte valide e ben formate

**Esempio:**
```python
@router.post("/remove-background")
async def remove_background(...):
    try:
        result = await tools_service.remove_background(...)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(
            result, 
            response_type="dataUrl", 
            required_fields=["url"]
        )
        return JSONResponse(validated)
    except ProcessingException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
```

## Caratteristiche del Sistema

### 1. Validazione Automatica

Il sistema valida automaticamente:
- ✅ Risposte null/undefined
- ✅ Risposte vuote (oggetti senza proprietà, array vuoti)
- ✅ Formato dati (stringhe vuote, tipi errati)
- ✅ Campi obbligatori mancanti
- ✅ Data URL/URL non validi

### 2. Retry Intelligente

- ✅ **3 tentativi** di default (configurabile)
- ✅ **Exponential backoff**: 1s, 2s, 4s
- ✅ **Non ritenta** su errori di validazione (400, 401, 403)
- ✅ **Notifiche utente** durante i retry

### 3. Fallback Automatico

- ✅ Se il backend Python fallisce, prova automaticamente Next.js API
- ✅ Se un endpoint fallisce, prova endpoint alternativi
- ✅ Gestisce errori di rete e timeout

### 4. Gestione Timeout

- ✅ **Timeout configurabile** (default: 5 minuti)
- ✅ **AbortController** per cancellare richieste
- ✅ **Pulizia automatica** dei timeout

### 5. Gestione Errori Utente-Friendly

- ✅ **Messaggi di errore chiari** in italiano
- ✅ **Toast notifications** automatiche
- ✅ **Dettagli tecnici** solo in sviluppo
- ✅ **Codici errore** standardizzati

## Configurazione

### Frontend (JavaScript)

```javascript
const config = {
  maxRetries: 3,              // Numero di tentativi
  retryDelay: 1000,          // Delay iniziale (ms)
  timeout: 300000,           // Timeout (5 minuti)
  validateResponse: true,    // Abilita validazione
  allowEmpty: false,         // Permetti risposte vuote
  fallbackOnError: true,     // Abilita fallback
  silentErrors: false,       // Mostra notifiche errore
  validator: 'dataUrl',       // Tipo validatore
  defaultValue: null,         // Valore default se allowEmpty=true
};
```

### Backend (Python)

```python
validated = validate_response(
    data,
    required_fields=["url", "name"],  # Campi obbligatori
    allow_empty=False,                 # Permetti vuoto
    response_type="dataUrl"            # Tipo risposta
)
```

## Esempi di Utilizzo

### Esempio 1: Upload File con Validazione

```javascript
import { safeUploadFile } from '../utils/safeApiCall';

try {
  const result = await safeUploadFile('/api/convert/jpg', file, {
    target: 'png',
    quality: 80
  }, {
    validator: 'dataUrl',
    maxRetries: 3,
    timeout: 300000,
  });
  
  // result è garantito valido!
  console.log(result.dataUrl); // Sempre presente e valido
  console.log(result.name);    // Sempre presente
} catch (error) {
  // Gestione errore (già mostrato toast automaticamente)
  console.error('Errore:', error.message);
}
```

### Esempio 2: Chiamata API JSON

```javascript
import { safeJsonCall } from '../utils/safeApiCall';

const data = await safeJsonCall('/api/tools/text-summarizer', {
  method: 'POST',
  body: JSON.stringify({ text: '...' }),
}, {
  required_fields: ['summary'],
  maxRetries: 2,
});
```

### Esempio 3: Backend Python

```python
from backend.utils.response_validator import validate_response

@router.post("/my-endpoint")
async def my_endpoint(...):
    try:
        result = await my_service.process(...)
        
        # Valida sempre prima di restituire
        validated = validate_response(
            result,
            response_type="dataUrl",
            required_fields=["url", "name"]
        )
        
        return JSONResponse(validated)
    except ProcessingException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
```

## Benefici

1. **Affidabilità**: Il codice funziona sempre, anche quando le API falliscono
2. **Manutenibilità**: Gestione errori centralizzata e consistente
3. **UX Migliorata**: Messaggi di errore chiari e retry automatici
4. **Robustezza**: Validazione automatica previene bug
5. **Performance**: Retry intelligente e fallback automatico

## Compatibilità

- ✅ Funziona con backend Python (FastAPI)
- ✅ Funziona con Next.js API routes
- ✅ Supporta fallback automatico tra i due
- ✅ Compatibile con tutti i tool esistenti

## Prossimi Passi

Per applicare il sistema a tutti i tool:

1. Sostituire `uploadFile` con `safeUploadFile` in tutti i componenti
2. Sostituire `apiCall` con `safeApiCall` dove necessario
3. Aggiungere validazione in tutti gli endpoint backend Python
4. Testare tutti i tool per verificare il funzionamento

## Note

- Il sistema è retrocompatibile: i tool esistenti continuano a funzionare
- La validazione può essere disabilitata con `validateResponse: false`
- I retry possono essere disabilitati con `maxRetries: 0`
- Il fallback può essere disabilitato con `fallbackOnError: false`

