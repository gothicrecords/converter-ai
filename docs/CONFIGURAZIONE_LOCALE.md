# 🔧 Configurazione Locale vs Produzione

## 📋 Panoramica

Il sistema ora gestisce automaticamente la differenza tra ambiente **locale** e **produzione**, con fallback intelligente alle API Next.js quando il backend Python non è disponibile.

---

## 🏠 Configurazione Locale

### Setup Base

1. **Backend Python** (opzionale ma consigliato):
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Su Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
   Il backend sarà disponibile su `http://localhost:8000`

2. **Frontend Next.js**:
   ```bash
   npm install
   npm run dev
   ```
   Il frontend sarà disponibile su `http://localhost:3000`

### Variabili d'Ambiente Locali

Crea un file `.env.local` con:

```bash
# Per sviluppo locale - Backend Python
NEXT_PUBLIC_API_URL=http://localhost:8000

# Oppure commenta questa riga per usare solo API Next.js
# NEXT_PUBLIC_API_URL=

# App URL locale
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Comportamento in Locale

**Con backend Python avviato (`NEXT_PUBLIC_API_URL=http://localhost:8000`):**
- ✅ I tool usano il backend Python su `localhost:8000`
- ✅ Controllo automatico della disponibilità ogni 30 secondi
- ✅ Se il backend si spegne, fallback automatico alle API Next.js

**Senza backend Python (variabile non configurata o commentata):**
- ✅ I tool usano direttamente le API Next.js
- ✅ Nessun controllo del backend Python
- ✅ Funziona tutto senza backend Python

---

## 🌐 Configurazione Produzione

### Variabili d'Ambiente Produzione

Su **Vercel** (frontend) e **Railway** (backend Python):

```bash
# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://tuo-backend.railway.app
NEXT_PUBLIC_APP_URL=https://tuo-dominio.vercel.app

# Backend (Railway)
APP_URL=https://tuo-dominio.vercel.app
DATABASE_URL=postgresql://...
# ... altre variabili
```

### Comportamento in Produzione

**Con backend Python disponibile:**
- ✅ I tool usano il backend Python su Railway
- ✅ Controllo automatico della disponibilità
- ✅ Se Railway è offline, fallback automatico alle API Next.js su Vercel

**Senza backend Python:**
- ✅ I tool usano le API Next.js su Vercel
- ✅ Funziona tutto normalmente

---

## 🔄 Come Funziona il Sistema

### 1. Rilevamento Automatico Ambiente

Il sistema rileva automaticamente se sei in locale o produzione:

```javascript
// In locale (localhost)
→ Usa http://localhost:8000 se configurato
→ Altrimenti usa API Next.js

// In produzione (dominio pubblico)
→ Usa NEXT_PUBLIC_API_URL se configurato
→ Altrimenti usa API Next.js
```

### 2. Controllo Disponibilità Backend

Prima di ogni chiamata API:
1. Controlla se il backend Python è configurato
2. Se configurato, verifica disponibilità (con cache 30 secondi)
3. Se disponibile → usa backend Python
4. Se non disponibile → usa API Next.js

### 3. Fallback Automatico

Se una chiamata al backend Python fallisce:
1. Rileva errore di rete/connessione
2. Prova automaticamente con API Next.js
3. Se anche quello fallisce → mostra errore all'utente

---

## 🧪 Test Locale

### Test 1: Backend Python Attivo

```bash
# Terminal 1: Avvia backend Python
cd backend
python main.py

# Terminal 2: Avvia frontend
npm run dev
```

**Risultato atteso:**
- ✅ I tool funzionano usando backend Python
- ✅ Console mostra: `Sending request to: http://localhost:8000/api/tools/...`

### Test 2: Backend Python Spento

```bash
# Ferma il backend Python (Ctrl+C)
# Lascia solo il frontend attivo
npm run dev
```

**Risultato atteso:**
- ✅ I tool funzionano usando API Next.js
- ✅ Console mostra: `Backend Python non disponibile, uso fallback Next.js API: /api/tools/...`
- ✅ Nessun errore per l'utente

### Test 3: Nessuna Configurazione

```bash
# Commenta NEXT_PUBLIC_API_URL in .env.local
# NEXT_PUBLIC_API_URL=

npm run dev
```

**Risultato atteso:**
- ✅ I tool usano direttamente API Next.js
- ✅ Nessun tentativo di connessione al backend Python

---

## 📊 Confronto: Prima vs Dopo

### ❌ Prima (Senza le Modifiche)

**Problema:**
- Se `NEXT_PUBLIC_API_URL` era configurato ma il backend era spento
- I tool fallivano con errori di connessione
- Nessun fallback automatico
- L'utente vedeva errori confusi

**Esempio:**
```javascript
// Se backend era spento
fetch('http://localhost:8000/api/tools/upscale')
  → ❌ Errore: "Failed to fetch"
  → ❌ Tool non funziona
```

### ✅ Dopo (Con le Modifiche)

**Soluzione:**
- Controllo automatico disponibilità backend
- Fallback automatico a API Next.js
- L'utente non vede errori
- Tool funzionano sempre

**Esempio:**
```javascript
// Se backend è spento
getApiUrl('/api/tools/upscale')
  → Controlla disponibilità
  → Backend non disponibile
  → ✅ Ritorna '/api/tools/upscale' (API Next.js)
  → ✅ Tool funziona normalmente
```

---

## 🎯 Casi d'Uso

### Caso 1: Sviluppo Locale con Backend Python

**Setup:**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Comportamento:**
- ✅ Backend Python attivo → Usa backend Python
- ✅ Backend Python spento → Fallback a API Next.js
- ✅ Migliore per sviluppo e test

### Caso 2: Sviluppo Locale Solo Frontend

**Setup:**
```bash
# .env.local
# NEXT_PUBLIC_API_URL=  (commentato o non presente)
```

**Comportamento:**
- ✅ Usa sempre API Next.js
- ✅ Non tenta connessione al backend Python
- ✅ Più veloce per sviluppo frontend

### Caso 3: Produzione con Backend Python

**Setup:**
```bash
# Vercel Environment Variables
NEXT_PUBLIC_API_URL=https://backend.railway.app
```

**Comportamento:**
- ✅ Backend Railway attivo → Usa backend Railway
- ✅ Backend Railway offline → Fallback a API Next.js su Vercel
- ✅ Alta disponibilità

### Caso 4: Produzione Solo Frontend

**Setup:**
```bash
# Vercel Environment Variables
# NEXT_PUBLIC_API_URL non configurato
```

**Comportamento:**
- ✅ Usa sempre API Next.js su Vercel
- ✅ Nessun backend Python necessario
- ✅ Più semplice da gestire

---

## 🔍 Debug

### Verificare Quale Backend Viene Usato

Apri la console del browser (F12) e cerca:

```javascript
// Se usa backend Python
"Sending request to: http://localhost:8000/api/tools/..."

// Se usa API Next.js (fallback)
"Backend Python non disponibile, uso fallback Next.js API: /api/tools/..."

// Se usa API Next.js (configurazione)
"Sending request to: /api/tools/..."
```

### Verificare Stato Cache Backend

Nella console del browser:
```javascript
// Controlla lo stato del backend
import { checkPythonBackend } from './utils/getApiUrl';
checkPythonBackend().then(available => {
  console.log('Backend disponibile:', available);
});
```

### Reset Cache Backend

Se il backend si riavvia e vuoi forzare un nuovo controllo:
```javascript
import { resetBackendStatusCache, checkPythonBackend } from './utils/getApiUrl';
resetBackendStatusCache();
await checkPythonBackend(null, true); // forceCheck = true
```

---

## 📝 Checklist Setup Locale

- [ ] Backend Python installato e funzionante
- [ ] `.env.local` configurato con `NEXT_PUBLIC_API_URL=http://localhost:8000` (opzionale)
- [ ] Frontend Next.js installato (`npm install`)
- [ ] Test con backend attivo ✅
- [ ] Test con backend spento (fallback) ✅
- [ ] Console browser mostra i log corretti ✅

---

## 🚀 Vantaggi del Nuovo Sistema

1. **🔄 Fallback Automatico**: Se il backend Python non è disponibile, usa automaticamente le API Next.js
2. **⚡ Performance**: Cache dello stato backend (controlla ogni 30 secondi, non ad ogni chiamata)
3. **🛡️ Resilienza**: I tool funzionano sempre, anche se il backend è offline
4. **🔧 Flessibilità**: Funziona con o senza backend Python configurato
5. **🌍 Multi-Ambiente**: Gestisce automaticamente locale e produzione

---

**🎉 Ora puoi sviluppare in locale senza problemi, anche se il backend Python non è sempre attivo!**
