# Configurazione Vercel + Railway

## Setup Backend Python su Railway

1. **Deploy su Railway**
   - Vai su [Railway](https://railway.app/)
   - Crea un nuovo progetto
   - Collega il repository GitHub
   - Railway rileverà automaticamente il `Dockerfile` o `Procfile`
   - Il deploy partirà automaticamente

2. **Ottieni l'URL del Backend**
   - Dopo il deploy, Railway ti fornirà un URL tipo:
     ```
     https://your-project.railway.app
     ```
   - Copia questo URL

## Configurazione Frontend su Vercel

1. **Vai su Vercel Dashboard**
   - Seleziona il tuo progetto
   - Vai su **Settings** → **Environment Variables**

2. **Aggiungi la Variabile d'Ambiente**
   - **Nome**: `NEXT_PUBLIC_API_URL`
   - **Valore**: L'URL del tuo backend Railway (es: `https://your-project.railway.app`)
   - **Ambiente**: Seleziona tutti gli ambienti (Production, Preview, Development)

3. **Redeploy**
   - Dopo aver aggiunto la variabile, fai un nuovo deploy
   - Vai su **Deployments** → Clicca sui 3 puntini → **Redeploy**

## Verifica

1. **Test Health Check**
   ```bash
   curl https://your-project.railway.app/health
   ```
   Dovresti ricevere: `{"status": "healthy"}`

2. **Test API**
   ```bash
   curl https://your-project.railway.app/api/health
   ```
   Dovresti ricevere: `{"status": "healthy", "message": "API is running"}`

3. **Test dal Frontend**
   - Apri la console del browser
   - Dovresti vedere che le chiamate API vanno al backend Python
   - Non dovresti più vedere "Backend Python non disponibile"

## Troubleshooting

### Errore: ERR_CONNECTION_REFUSED
- Verifica che `NEXT_PUBLIC_API_URL` sia configurato correttamente su Vercel
- Verifica che l'URL di Railway sia corretto (senza trailing slash)
- Assicurati di aver fatto redeploy dopo aver aggiunto la variabile

### Errore: CORS
- Il backend Python è configurato per accettare tutte le origini (`*`)
- Se hai problemi, verifica i log su Railway

### Backend non risponde
- Controlla i log su Railway Dashboard
- Verifica che tutte le dipendenze siano installate correttamente
- Verifica che il PORT sia configurato correttamente (Railway lo imposta automaticamente)

## Variabili d'Ambiente Richieste

### Su Railway (Backend Python):
- `DATABASE_URL` (opzionale)
- `OPENAI_API_KEY` (per AI tools)
- `STRIPE_SECRET_KEY` (per pagamenti)
- `ENVIRONMENT=production`
- `DEBUG=False`

### Su Vercel (Frontend):
- `NEXT_PUBLIC_API_URL` ← **IMPORTANTE**: URL del backend Railway
- Tutte le altre variabili d'ambiente del frontend

## Note

- Il frontend userà automaticamente il backend Python se `NEXT_PUBLIC_API_URL` è configurato
- Se il backend non è disponibile, il frontend userà le API Next.js come fallback
- Il backend Python è sempre online 24/7 su Railway

