# Architettura del Progetto

Questo documento descrive la nuova architettura modulare e scalabile del progetto.

## 📁 Struttura delle Directory

```
├── config/              # Configurazione centralizzata
│   └── index.js        # Tutte le configurazioni dell'app
│
├── constants/          # Costanti dell'applicazione
│   └── index.js        # HTTP status, metodi, messaggi, etc.
│
├── errors/             # Gestione errori centralizzata
│   └── index.js        # Classi di errore e formattazione
│
├── validators/         # Validatori riutilizzabili
│   └── index.js        # Validazione email, password, file, etc.
│
├── middleware/         # Middleware per API routes
│   └── api.js          # Autenticazione, validazione metodi, etc.
│
├── api/                # Helper per API routes
│   └── helpers/
│       ├── response.js # Formattazione risposte standardizzate
│       └── request.js   # Parsing richieste (JSON, multipart, etc.)
│
├── services/           # Logica di business
│   ├── auth/           # Servizio autenticazione
│   │   └── index.js
│   └── file/           # Servizio gestione file
│       └── index.js
│
├── lib/                # Librerie e utilities esistenti
│   ├── db.js           # Database (aggiornato per usare config)
│   ├── supabase.js
│   ├── auth.js
│   └── ...
│
└── pages/api/          # API routes (refactored)
    └── auth/
        ├── login.js    # Esempio refactored
        ├── signup.js   # Esempio refactored
        └── user.js     # Esempio refactored
```

## 🏗️ Principi Architetturali

### 1. Separazione delle Responsabilità

- **Config**: Tutte le configurazioni in un unico posto
- **Services**: Logica di business isolata e riutilizzabile
- **Middleware**: Autenticazione, validazione, error handling
- **Validators**: Validazione dati centralizzata
- **API Routes**: Solo orchestrazione, nessuna logica di business

### 2. Gestione Errori Centralizzata

Tutti gli errori passano attraverso `handleApiError()` che:
- Formatta le risposte in modo consistente
- Nasconde dettagli sensibili in produzione
- Fornisce stack trace in sviluppo
- Supporta classi di errore personalizzate

### 3. Validazione Centralizzata

I validatori sono riutilizzabili e consistenti:
- `validateEmail()` - Validazione email
- `validatePassword()` - Validazione password
- `validateFile()` - Validazione file upload
- `validatePagination()` - Validazione parametri paginazione

### 4. Middleware Composabile

I middleware possono essere combinati:
```javascript
export default apiHandler(
  requireMethod(HTTP_METHODS.POST)(
    requireAuth(handler)
  )
);
```

## 📝 Esempi di Utilizzo

### Creare una nuova API Route

```javascript
import { apiHandler, requireMethod, requireAuth } from '../../../middleware/api';
import { sendSuccess, sendError } from '../../../api/helpers/response';
import { HTTP_METHODS } from '../../../constants';
import { someServiceFunction } from '../../../services/some-service';

async function myHandler(req, res) {
  // req.user è disponibile se requireAuth è usato
  const result = await someServiceFunction(req.user.id);
  sendSuccess(res, { data: result });
}

export default apiHandler(
  requireMethod(HTTP_METHODS.GET)(
    requireAuth(myHandler)
  )
);
```

### Creare un nuovo Servizio

```javascript
// services/my-service/index.js
import { ValidationError, NotFoundError } from '../../errors';
import { validateRequired } from '../../validators';

export async function myServiceFunction(userId, data) {
  // Validazione
  validateRequired(data, ['field1', 'field2']);
  
  // Logica di business
  // ...
  
  return result;
}
```

### Usare la Configurazione

```javascript
import { config } from '../config';

const maxFileSize = config.upload.maxFileSize;
const dbUrl = config.database.url;
```

### Gestire Errori

```javascript
import { ValidationError, NotFoundError } from '../errors';

// Lanciare errori personalizzati
if (!user) {
  throw new NotFoundError('User');
}

if (!email) {
  throw new ValidationError('Email is required');
}
```

## 🔄 Migrazione delle API Routes Esistenti

### Pattern Vecchio:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Validazione manuale
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Logica di business
    // ...
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Pattern Nuovo:
```javascript
import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { myService } from '../../../services/my-service';
import { HTTP_METHODS } from '../../../constants';

async function myHandler(req, res) {
  const result = await myService(req.body);
  sendSuccess(res, { data: result });
}

export default apiHandler(
  requireMethod(HTTP_METHODS.POST)(myHandler)
);
```

## ✅ Vantaggi della Nuova Architettura

1. **Manutenibilità**: Codice organizzato e facile da trovare
2. **Riutilizzabilità**: Servizi e validatori riutilizzabili
3. **Testabilità**: Logica isolata e facilmente testabile
4. **Consistenza**: Pattern uniformi in tutto il progetto
5. **Scalabilità**: Facile aggiungere nuove funzionalità
6. **Sicurezza**: Validazione e autenticazione centralizzate
7. **Error Handling**: Gestione errori consistente e sicura

## 🚀 Prossimi Passi

1. Migrare gradualmente le API routes esistenti
2. Creare servizi per ogni dominio (PDF, AI tools, etc.)
3. Aggiungere test per servizi e middleware
4. Documentare ogni servizio con JSDoc
5. Implementare rate limiting centralizzato
6. Aggiungere logging strutturato

## 📚 Riferimenti

- **Config**: `config/index.js`
- **Errori**: `errors/index.js`
- **Validatori**: `validators/index.js`
- **Middleware**: `middleware/api.js`
- **Servizi**: `services/`

