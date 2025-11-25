# Migrazione a Python - Backend FastAPI

Questo progetto è stato migrato da Next.js/Node.js a una architettura ibrida:
- **Frontend**: Next.js/React (mantiene il design esistente)
- **Backend**: Python/FastAPI (nuovo, per tutte le API)

## Struttura

```
.
├── backend/              # Backend Python/FastAPI
│   ├── main.py          # Entry point FastAPI
│   ├── config.py        # Configurazione
│   ├── routers/         # Route API
│   ├── services/        # Logica di business
│   └── middleware/      # Middleware
├── pages/               # Frontend Next.js (invariato)
├── components/          # Componenti React (invariati)
└── requirements.txt     # Dipendenze Python
```

## Setup

### 1. Installare Python 3.10+

### 2. Installare dipendenze

```bash
pip install -r requirements.txt
```

### 3. Configurare variabili d'ambiente

Crea un file `.env` nella root:

```env
# App
APP_NAME=MegaPixelAI
ENVIRONMENT=development
DEBUG=True
HOST=0.0.0.0
PORT=8000

# CORS (aggiungi i tuoi domini)
CORS_ORIGINS=["http://localhost:3000","https://pixelsuite.com"]

# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# OpenAI
OPENAI_API_KEY=sk-...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 4. Avviare il backend

```bash
# Sviluppo
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Produzione
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. Aggiornare il frontend

Nel file `components/GenericConverter.js` e altri componenti, cambia gli URL delle API da:
```javascript
const apiUrl = `/api/convert/${outputFormat}`;
```

a:
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const fullUrl = `${apiUrl}/api/convert/${outputFormat}`;
```

Aggiungi al `.env` del frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deploy

### Vercel (Frontend)
Il frontend Next.js continua a essere deployato su Vercel.

### Backend Python
Il backend Python può essere deployato su:
- **Railway**
- **Render**
- **Heroku**
- **DigitalOcean App Platform**
- **AWS Lambda** (con serverless framework)
- **Vercel** (con runtime Python)

## TODO

- [x] Struttura base FastAPI
- [x] Router per tutte le API
- [ ] Implementare servizi di conversione
- [ ] Implementare servizi PDF
- [ ] Implementare servizi AI tools
- [ ] Implementare autenticazione
- [ ] Migrare database logic
- [ ] Testing completo
- [ ] Documentazione API

## Note

Il frontend Next.js rimane invariato, solo gli endpoint API vengono chiamati dal backend Python invece che dalle route Next.js.

