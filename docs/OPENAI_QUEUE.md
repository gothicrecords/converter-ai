# Sistema di Queue e Retry Automatico per OpenAI

## Panoramica

Il sistema di queue con retry automatico e rate limiting è stato implementato per gestire in modo intelligente le richieste a OpenAI, evitando errori di rate limit e migliorando l'affidabilità del servizio.

## Componenti

### 1. `lib/openai-queue.js`

Sistema di queue centralizzato che gestisce:
- **Rate Limiting**: Usa Bottleneck per limitare le richieste a 50 RPM (requests per minute)
- **Retry Automatico**: Retry automatico con backoff esponenziale fino a 3 tentativi
- **Priorità**: Sistema di priorità per gestire richieste importanti per prime
- **Gestione Errori**: Rilevamento intelligente di rate limits e errori retryable

### 2. Configurazione Bottleneck

```javascript
{
    reservoir: 50,              // 50 richieste disponibili
    reservoirRefreshAmount: 50,  // Ricarica ogni intervallo
    reservoirRefreshInterval: 60 * 1000, // Ogni minuto
    maxConcurrent: 3,            // Max 3 richieste concorrenti
    minTime: 200,                // Minimo 200ms tra richieste
}
```

## Utilizzo

### Aggiungere una richiesta alla queue

```javascript
import openAIQueue from '../../../lib/openai-queue.js';

const result = await openAIQueue.add(
    async () => {
        // La tua operazione OpenAI qui
        return await openai.chat.completions.create({...});
    },
    {
        priority: 8,        // Priorità 1-10 (più alto = più prioritario)
        maxRetries: 3,      // Numero massimo di retry
        retryDelay: 1000,   // Delay base per retry (ms)
        id: 'unique_id',    // ID univoco per tracking
    }
);
```

## Caratteristiche

### Retry Automatico

Il sistema ritenta automaticamente le richieste fallite con:
- **Backoff Esponenziale**: Il delay aumenta esponenzialmente ad ogni tentativo
- **Rate Limit Detection**: Rileva automaticamente errori di rate limit e usa delay più lunghi
- **Retry-After Support**: Rispetta l'header `retry-after` quando disponibile

### Gestione Errori

Il sistema distingue tra:
- **Errori Retryable**: Errori di rete, timeout, server errors (500, 502, 503, 504)
- **Errori Non-Retryable**: Errori di validazione, autenticazione (400, 401, 403)

### Priorità

Le richieste possono avere priorità da 1 a 10:
- **1-3**: Bassa priorità
- **4-6**: Priorità normale
- **7-9**: Alta priorità
- **10**: Priorità massima

## Integrazione

### API Traduzione Documenti

Il sistema è integrato in:
1. **Estrazione testo da PDF**: Quando usa OpenAI per estrarre testo
2. **Traduzione testo**: Tutte le traduzioni passano attraverso la queue

### Esempio di Integrazione

```javascript
// Prima (senza queue)
const response = await openai.chat.completions.create({...});

// Dopo (con queue)
const response = await openAIQueue.add(
    async () => await openai.chat.completions.create({...}),
    { priority: 8, maxRetries: 3 }
);
```

## Monitoraggio

### Statistiche Queue

```javascript
const stats = openAIQueue.getStats();
console.log(stats);
// {
//     queueLength: 5,
//     processing: true,
//     limiterStats: {
//         running: 2,
//         done: 150,
//         queued: 3
//     }
// }
```

## Benefici

1. **Riduzione Rate Limits**: Il rate limiting previene il raggiungimento dei limiti
2. **Affidabilità**: Retry automatico migliora il success rate
3. **Performance**: Priorità permette di processare richieste importanti per prime
4. **Scalabilità**: Gestisce picchi di traffico senza sovraccaricare OpenAI

## Configurazione Avanzata

Per modificare i limiti, modifica `lib/openai-queue.js`:

```javascript
const limiter = new Bottleneck({
    reservoir: 100,              // Aumenta per più richieste
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 5,            // Aumenta per più concorrenza
    minTime: 100,                // Riduci per più velocità
});
```

## Note Importanti

- Il sistema è **singleton**: una sola istanza gestisce tutte le richieste
- Le richieste sono processate **in ordine di priorità**
- I retry sono **automatici** e **trasparenti** per il chiamante
- Il sistema **non blocca** se una richiesta fallisce: continua con le altre

