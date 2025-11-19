# 🚀 Ecosistema di Sviluppo Avanzato

Questo documento descrive il sistema completo di diagnostica, gestione errori e miglioramento continuo del codice.

## 📋 Indice

- [Sistema di Logging](#sistema-di-logging)
- [Error Tracking](#error-tracking)
- [Diagnostica](#diagnostica)
- [Linting e Formattazione](#linting-e-formattazione)
- [Script Utili](#script-utili)
- [API Endpoints](#api-endpoints)

## 📊 Sistema di Logging

### Winston Logger

Il sistema utilizza **Winston** per logging strutturato con diversi livelli:

- **Error**: Errori critici
- **Warn**: Avvisi
- **Info**: Informazioni generali
- **Debug**: Informazioni di debug (solo in development)

### Utilizzo

```javascript
import { log } from '../lib/logger.js';

// Log errori
log.error('Operazione fallita', error, { context: 'additional info' });

// Log warning
log.warn('Attenzione', { data: 'info' });

// Log informazioni
log.info('Operazione completata', { duration: '100ms' });

// Log debug
log.debug('Dettagli operazione', { step: 1 });

// Log API request
log.api(req, res, responseTime);

// Log database operation
log.database('SELECT', query, duration);

// Log file operation
log.file('read', filePath, fileSize);

// Log performance
log.performance('image-processing', duration);
```

### File di Log

I log vengono salvati in `logs/`:
- `error.log`: Solo errori
- `combined.log`: Tutti i log
- `exceptions.log`: Eccezioni non gestite
- `rejections.log`: Promise rejection non gestite

## 🔍 Error Tracking

### Sistema Avanzato di Tracciamento Errori

Il sistema traccia automaticamente tutti gli errori con:
- Analisi pattern
- Rilevamento similarità
- Suggerimenti di soluzione
- Statistiche e trend

### Utilizzo

```javascript
import errorTracker from '../lib/errorTracker.js';

// Traccia un errore
await errorTracker.trackError(error, {
  endpoint: '/api/example',
  userId: '123',
  // ... altro contesto
});

// Ottieni statistiche
const stats = errorTracker.getStats();

// Ottieni errori per pattern
const dbErrors = errorTracker.getErrorsByPattern('database');
```

### Pattern di Errori Riconosciuti

- `database`: Errori di connessione database
- `network`: Errori di rete
- `filesystem`: Errori file system
- `permission`: Errori di permessi
- `validation`: Errori di validazione
- `auth`: Errori di autenticazione
- `timeout`: Timeout
- `memory`: Problemi di memoria

## 🏥 Diagnostica

### Health Checks

Il sistema include health checks automatici per:
- Database connectivity
- File system
- Environment variables
- Error statistics
- Disk space

### Utilizzo

```javascript
import diagnostics from '../lib/diagnostics.js';

// Esegui tutti i check
const health = await diagnostics.runAllChecks();

// Ottieni informazioni di sistema
const systemInfo = await diagnostics.getSystemInfo();

// Ottieni diagnostica completa
const fullReport = await diagnostics.getFullDiagnostics();
```

### Registrare Custom Health Checks

```javascript
diagnostics.registerCheck('custom-service', async () => {
  // Esegui check
  const isHealthy = await checkService();
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy ? 'Service is running' : 'Service is down',
    data: { /* dati aggiuntivi */ },
  };
}, {
  critical: true,  // Se true, fallimento blocca overall health
  interval: 30000, // Intervallo in ms
  timeout: 5000,   // Timeout in ms
});
```

## 🎨 Linting e Formattazione

### ESLint

Configurazione completa con regole per:
- React/Next.js
- Best practices
- Accessibility
- Import/Export
- Code quality

### Prettier

Formattazione automatica del codice con regole consistenti.

### Comandi

```bash
# Linting
npm run lint          # Controlla errori
npm run lint:fix      # Auto-fix errori

# Formattazione
npm run format        # Formatta tutto il codice
npm run format:check  # Verifica formattazione
```

## 🛠️ Script Utili

### Diagnostica Completa

```bash
npm run diagnostics
```

Esegue una diagnostica completa del sistema e mostra:
- Stato generale di salute
- Informazioni di sistema
- Risultati di tutti gli health checks
- Statistiche errori
- Raccomandazioni

### Health Check Rapido

```bash
npm run health
```

Output JSON compatto per integrazione con monitoring tools.

### Analisi Errori

```bash
npm run error:analyze
```

Analizza gli errori tracciati e mostra:
- Errori per tipo
- Errori per severità
- Top 10 errori più frequenti
- Errori ad alta severità recenti

### Auto-Fix Errori

```bash
npm run error:fix
```

Esegue automaticamente:
- ESLint auto-fix
- Prettier formatting
- Creazione directory mancanti
- Validazione environment variables

## 🌐 API Endpoints

### `/api/diagnostics`

Endpoint base per diagnostica (compatibilità con versione precedente).

**Response:**
```json
{
  "env": { ... },
  "cloudinary": { ... },
  "health": {
    "overall": "healthy",
    "timestamp": "..."
  },
  "system": { ... }
}
```

### `/api/diagnostics-enhanced`

Endpoint avanzato con opzioni di query:

**Query Parameters:**
- `type=full` (default): Diagnostica completa
- `type=health`: Solo health checks
- `type=errors`: Solo statistiche errori
- `type=system`: Solo informazioni sistema

**Response (type=full):**
```json
{
  "timestamp": "...",
  "health": {
    "overall": "healthy",
    "checks": { ... },
    "system": { ... }
  },
  "errorStats": { ... },
  "recommendations": [ ... ]
}
```

## 🔧 Configurazione

### Environment Variables

```env
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Error Tracking
ERROR_TRACKING_ENABLED=true
ERROR_ALERT_WEBHOOK=https://your-webhook-url
```

### Personalizzazione

Tutti i sistemi sono configurabili:

1. **Logger**: Modifica `lib/logger.js` per aggiungere transports personalizzati
2. **Error Tracker**: Modifica `lib/errorTracker.js` per pattern personalizzati
3. **Diagnostics**: Aggiungi health checks in `lib/diagnostics.js`
4. **ESLint**: Modifica `.eslintrc.js` per regole personalizzate
5. **Prettier**: Modifica `.prettierrc.js` per formattazione personalizzata

## 📈 Best Practices

1. **Usa sempre il logger strutturato** invece di `console.log`
2. **Traccia tutti gli errori** con `errorTracker.trackError()`
3. **Esegui diagnostica regolarmente** per monitorare la salute del sistema
4. **Usa health checks** per servizi critici
5. **Mantieni il codice formattato** con Prettier
6. **Risolvi i warning di ESLint** prima di committare

## 🚨 Alert e Monitoring

Il sistema può inviare alert per:
- Errori ad alta severità
- Errori frequenti (>10 occorrenze)
- Errori multipli in breve tempo (>5 in 5 minuti)

Configura `ERROR_ALERT_WEBHOOK` per ricevere notifiche.

## 📝 Note

- I log vengono ruotati automaticamente (max 5MB per file, 5 file)
- Gli errori vengono salvati in `logs/errors.db.json` (max 10000 errori)
- I health checks vengono eseguiti on-demand, non in background
- Il sistema è progettato per essere non-intrusivo e performante

## 🔄 Integrazione con Servizi Esterni

Il sistema è progettato per essere facilmente estendibile con:
- **Sentry**: Per error tracking in produzione
- **Datadog/New Relic**: Per APM
- **PagerDuty**: Per alert critici
- **Slack/Discord**: Per notifiche team

Esempi di integrazione disponibili su richiesta.

