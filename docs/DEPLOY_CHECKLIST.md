# ✅ Checklist Deploy Railway + Vercel

## 1. Verifica Deploy su Railway

### Step 1: Controlla lo Stato del Deploy
1. Vai su [Railway Dashboard](https://railway.app/)
2. Seleziona il tuo progetto
3. Vai su **Deployments**
4. Verifica che l'ultimo deploy sia **"Active"** e **"Success"**

### Step 2: Verifica i Log
1. Clicca sul deployment più recente
2. Controlla i log per errori:
   - ✅ Deve vedere: "Starting FastAPI server..."
   - ✅ Deve vedere: "Application startup complete"
   - ❌ Se vedi errori, controlla le dipendenze

### Step 3: Ottieni l'URL del Backend
1. Vai su **Settings** → **Networking**
2. Copia l'URL pubblico (es: `https://your-project.railway.app`)
3. **SALVA QUESTO URL** - ti servirà per Vercel

### Step 4: Test Health Check
Apri un terminale e testa:
```bash
curl https://your-project.railway.app/health
```
**Risultato atteso**: `{"status":"healthy"}`

```bash
curl https://your-project.railway.app/api/health
```
**Risultato atteso**: `{"status":"healthy","message":"API is running"}`

## 2. Configura Frontend su Vercel

### Step 1: Aggiungi Variabile d'Ambiente
1. Vai su [Vercel Dashboard](https://vercel.com/)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Clicca **Add New**
5. Inserisci:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: L'URL di Railway (es: `https://your-project.railway.app`)
   - **Environment**: Seleziona **Production**, **Preview**, **Development**
6. Clicca **Save**

### Step 2: Redeploy Frontend
1. Vai su **Deployments**
2. Clicca sui **3 puntini** del deployment più recente
3. Seleziona **Redeploy**
4. Seleziona **Use existing Build Cache** (opzionale)
5. Clicca **Redeploy**

### Step 3: Verifica il Deploy
1. Attendi che il deploy finisca (circa 2-3 minuti)
2. Verifica che sia **"Ready"**
3. Apri il sito in produzione

## 3. Test Finale

### Test 1: Console del Browser
1. Apri il sito in produzione
2. Apri la **Console del Browser** (F12)
3. Vai su una pagina che usa le API (es: convertitore PDF)
4. **NON dovresti vedere**: "Backend Python non disponibile"
5. **DOVRESTI vedere**: Le chiamate API vanno all'URL di Railway

### Test 2: Network Tab
1. Apri **Network Tab** nel browser (F12)
2. Prova a usare un convertitore (es: JPG to PDF)
3. Cerca la richiesta API
4. Verifica che l'URL sia quello di Railway (non `localhost` o Vercel)

### Test 3: Funzionalità
1. Prova a convertire un file
2. Verifica che funzioni correttamente
3. Se funziona, tutto è configurato correttamente!

## 4. Troubleshooting

### Problema: Backend non risponde su Railway
**Soluzione**:
1. Controlla i log su Railway
2. Verifica che tutte le dipendenze siano installate
3. Verifica che il PORT sia configurato (Railway lo imposta automaticamente)
4. Controlla che non ci siano errori di import

### Problema: Frontend non trova il backend
**Soluzione**:
1. Verifica che `NEXT_PUBLIC_API_URL` sia configurato su Vercel
2. Verifica che l'URL sia corretto (senza trailing slash)
3. Fai redeploy su Vercel dopo aver aggiunto la variabile
4. Verifica che la variabile sia disponibile in produzione (non solo development)

### Problema: CORS Error
**Soluzione**:
1. Il backend è configurato per accettare tutte le origini (`*`)
2. Se persiste, verifica i log su Railway
3. Controlla che `CORS_ORIGINS` sia impostato su `"*"` in `backend/config.py`

### Problema: 405 Method Not Allowed
**Soluzione**:
1. Verifica che la route esista nel backend Python
2. Controlla che il metodo HTTP sia corretto (POST, GET, etc.)
3. Verifica i log su Railway per vedere la richiesta ricevuta

## 5. Verifica Variabili d'Ambiente

### Su Railway (Backend):
- ✅ `PORT` (impostato automaticamente da Railway)
- ✅ `ENVIRONMENT=production` (opzionale)
- ✅ `DEBUG=False` (opzionale)
- ⚠️ `DATABASE_URL` (se usi database)
- ⚠️ `OPENAI_API_KEY` (se usi AI tools)
- ⚠️ `STRIPE_SECRET_KEY` (se usi pagamenti)

### Su Vercel (Frontend):
- ✅ `NEXT_PUBLIC_API_URL` ← **CRITICO**: URL di Railway
- ⚠️ Tutte le altre variabili d'ambiente del frontend

## 6. Monitoraggio

### Railway
- **Logs**: Dashboard → Deployments → Clicca sul deployment → Logs
- **Metrics**: Dashboard → Metrics (CPU, Memory, Network)
- **Alerts**: Configura alert per errori

### Vercel
- **Logs**: Dashboard → Deployments → Clicca sul deployment → Logs
- **Analytics**: Dashboard → Analytics
- **Functions**: Dashboard → Functions (per API routes Next.js)

## ✅ Checklist Finale

- [ ] Deploy su Railway completato con successo
- [ ] Health check del backend funziona
- [ ] URL di Railway copiato e salvato
- [ ] `NEXT_PUBLIC_API_URL` configurato su Vercel
- [ ] Redeploy su Vercel completato
- [ ] Console browser non mostra errori di connessione
- [ ] Network tab mostra chiamate al backend Railway
- [ ] Funzionalità di conversione funziona correttamente
- [ ] Tutte le variabili d'ambiente configurate

## 🎉 Se tutti i check sono ✅, tutto è configurato correttamente!

