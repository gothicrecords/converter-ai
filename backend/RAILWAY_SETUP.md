# Railway Setup Guide

## Configurazione Backend Python su Railway

### 1. Variabili d'Ambiente Richieste

Configura queste variabili d'ambiente nel dashboard Railway:

#### Database (Supabase/Neon)
```
DATABASE_URL=postgresql://user:password@host:port/database
NEON_DATABASE_URL=postgresql://user:password@host:port/database
```

#### Supabase
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### OpenAI (per AI tools)
```
OPENAI_API_KEY=sk-your_openai_api_key
```

#### Stripe (per pagamenti)
```
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### App Configuration
```
ENVIRONMENT=production
DEBUG=False
HOST=0.0.0.0
PORT=8000
SECRET_KEY=your-secret-key-here
APP_URL=https://your-frontend-domain.com
```

### 2. URL del Backend

Dopo il deploy, Railway ti fornirà un URL tipo:
```
https://your-project.railway.app
```

### 3. Configurazione Frontend

Aggiungi questa variabile d'ambiente nel tuo frontend (Vercel o altro):

```
NEXT_PUBLIC_API_URL=https://your-project.railway.app
```

oppure

```
NEXT_PUBLIC_PYTHON_API_URL=https://your-project.railway.app
```

### 4. Verifica Deploy

Dopo il deploy, verifica che il backend funzioni:

```bash
curl https://your-project.railway.app/health
```

Dovresti ricevere:
```json
{"status": "healthy"}
```

### 5. Test API

Testa un endpoint:

```bash
curl https://your-project.railway.app/api/health
```

### 6. Logs

Per vedere i log del backend su Railway:
- Vai su Railway Dashboard
- Seleziona il tuo progetto
- Clicca su "Deployments"
- Clicca sul deployment più recente
- Vedi i log in tempo reale

### 7. Troubleshooting

#### Backend non risponde
- Verifica che il PORT sia configurato correttamente (Railway usa la variabile PORT automaticamente)
- Controlla i log su Railway Dashboard
- Verifica che tutte le dipendenze siano installate correttamente

#### Errori CORS
- Il backend è configurato per accettare tutte le origini (`*`)
- Se hai problemi, verifica che `CORS_ORIGINS` sia impostato su `["*"]` in `backend/config.py`

#### Errori di dipendenze
- Verifica che `requirements.txt` contenga tutte le dipendenze necessarie
- Il Dockerfile installa automaticamente gfortran per scipy

### 8. Monitoraggio

Railway fornisce:
- Logs in tempo reale
- Metriche di utilizzo
- Alert per errori

### 9. Domini Personalizzati

Puoi configurare un dominio personalizzato su Railway:
- Vai su Settings → Domains
- Aggiungi il tuo dominio
- Configura i DNS come indicato

