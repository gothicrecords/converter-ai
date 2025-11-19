# Guida alla Migrazione

Questa guida ti aiuta a migrare le API routes esistenti alla nuova architettura.

## 🎯 Vantaggi della Migrazione

- ✅ Codice più pulito e leggibile
- ✅ Meno duplicazione
- ✅ Gestione errori consistente
- ✅ Validazione centralizzata
- ✅ Facile da testare
- ✅ Facile da mantenere

## 📋 Checklist di Migrazione

### 1. Identifica la Logica di Business
Sposta la logica di business in un servizio dedicato in `services/`.

### 2. Usa i Validatori
Sostituisci la validazione manuale con i validatori di `validators/`.

### 3. Applica i Middleware
Usa `requireMethod`, `requireAuth`, etc. invece di controlli manuali.

### 4. Usa gli Helper di Risposta
Sostituisci `res.status().json()` con `sendSuccess()` o `sendError()`.

### 5. Gestisci gli Errori
Lascia che `apiHandler` gestisca gli errori automaticamente.

## 🔄 Esempi di Migrazione

### Esempio 1: API Route Semplice

**Prima:**
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Logica...
    const result = await doSomething(email);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Dopo:**
```javascript
import { apiHandler, requireMethod } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { doSomething } from '../../../services/my-service';
import { HTTP_METHODS } from '../../../constants';

async function myHandler(req, res) {
  const { email } = req.body;
  const result = await doSomething(email);
  sendSuccess(res, { data: result });
}

export default apiHandler(
  requireMethod(HTTP_METHODS.POST)(myHandler)
);
```

### Esempio 2: API Route con Autenticazione

**Prima:**
```javascript
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const session = await getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const userId = session.user_id;
    const data = await getUserData(userId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Dopo:**
```javascript
import { apiHandler, requireMethod, requireAuth, composeMiddleware } from '../../../middleware/api';
import { sendSuccess } from '../../../api/helpers/response';
import { getUserData } from '../../../services/user-service';
import { HTTP_METHODS } from '../../../constants';

async function getUserDataHandler(req, res) {
  const data = await getUserData(req.user.id);
  sendSuccess(res, { data });
}

export default apiHandler(
  composeMiddleware(
    requireMethod(HTTP_METHODS.GET),
    requireAuth
  )(getUserDataHandler)
);
```

### Esempio 3: Creare un Nuovo Servizio

**Crea `services/user-service/index.js`:**
```javascript
import { NotFoundError } from '../../errors';
import { getUserDataFromDB } from '../../lib/db';

export async function getUserData(userId) {
  const data = await getUserDataFromDB(userId);
  
  if (!data) {
    throw new NotFoundError('User data');
  }

  return data;
}
```

## 🛠️ Servizi Esistenti

### Auth Service (`services/auth/index.js`)
- `registerUser({ name, email, password })` - Registra nuovo utente
- `authenticateUser({ email, password })` - Autentica utente
- `logoutUser(sessionToken)` - Logout utente
- `getUserFromSession(sessionToken)` - Ottieni utente da sessione

### File Service (`services/file/index.js`)
- `processUploadedFile(file, options)` - Processa file uploadato
- `cleanupTempFile(filePath)` - Pulisci file temporaneo
- `generateFileMetadata(file, userId)` - Genera metadati file

## 📝 Validatori Disponibili

- `validateEmail(email)` - Valida email
- `validatePassword(password, minLength)` - Valida password
- `validateName(name, fieldName)` - Valida nome
- `validateFile(file, options)` - Valida file
- `validatePagination(page, limit)` - Valida paginazione
- `validateUUID(uuid, fieldName)` - Valida UUID
- `validateRequired(data, fields)` - Valida campi richiesti

## 🔐 Middleware Disponibili

- `requireMethod(methods)` - Richiede metodo HTTP specifico
- `requireAuth` - Richiede autenticazione (session-based)
- `requireSupabaseAuth` - Richiede autenticazione (Supabase)
- `requirePlan(plan)` - Richiede piano utente specifico
- `composeMiddleware(...middlewares)` - Combina più middleware

## ⚠️ Note Importanti

1. **Non usare più `try/catch` manuale** - `apiHandler` lo gestisce
2. **Non controllare manualmente i metodi HTTP** - Usa `requireMethod`
3. **Non validare manualmente** - Usa i validatori
4. **Non formattare manualmente le risposte** - Usa `sendSuccess`/`sendError`
5. **Lancia errori invece di restituire risposte** - Il middleware li gestisce

## 🚀 Prossimi Passi

1. Inizia con le API routes più semplici
2. Migra gradualmente, una route alla volta
3. Testa ogni migrazione prima di procedere
4. Usa i file `.refactored.js` come riferimento
5. Rimuovi i file `.refactored.js` dopo la migrazione

## ❓ Domande Frequenti

**Q: Devo migrare tutto subito?**  
A: No, puoi migrare gradualmente. La nuova e vecchia architettura possono coesistere.

**Q: Cosa succede se non migro?**  
A: Niente, il codice esistente continua a funzionare. Ma perderai i vantaggi della nuova architettura.

**Q: Come testo le nuove API routes?**  
A: Usa gli stessi test di prima, ma ora puoi testare i servizi separatamente.

**Q: Posso usare entrambi gli stili?**  
A: Sì, ma è meglio essere consistenti. Migra gradualmente.

