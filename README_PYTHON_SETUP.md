# Setup Backend Python - Guida Completa

## ✅ Struttura Creata

Il progetto è stato migrato a una architettura ibrida:
- **Frontend**: Next.js/React (invariato, stesso design)
- **Backend**: Python/FastAPI (nuovo, tutte le API)

```
backend/
├── main.py                 # Entry point FastAPI
├── config.py              # Configurazione con variabili d'ambiente
├── routers/               # Tutte le route API
│   ├── convert.py        # Conversione file generica
│   ├── pdf.py            # Conversione PDF
│   ├── tools.py          # AI tools
│   ├── auth.py           # Autenticazione
│   ├── files.py          # Gestione file
│   ├── chat.js           # Chat AI
│   ├── users.js          # Utenti
│   ├── stripe.js         # Pagamenti
│   └── support.js        # Supporto
├── services/             # Logica di business
│   ├── converter.py      # Servizio conversione
│   ├── pdf_converter.py  # Servizio PDF (completo)
│   └── tools_service.py  # Servizio AI tools (completo)
└── middleware/           # Middleware
    ├── error_handler.py  # Gestione errori
    └── logging_middleware.py # Logging
```

## 🚀 Setup Locale

### 1. Installare Python 3.10+

Verifica installazione:
```bash
python --version
# o
python3 --version
```

### 2. Creare Virtual Environment

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Installare Dipendenze

```bash
pip install -r requirements.txt
```

**Nota**: Alcune dipendenze potrebbero richiedere librerie di sistema:
- **Tesseract OCR**: Installare separatamente (non via pip)
- **FFmpeg**: Installare separatamente per video/audio
- **Poppler**: Richiesto per pdf2image (`sudo apt-get install poppler-utils` su Linux)

### 4. Configurare Variabili d'Ambiente

Crea un file `.env` nella root del progetto:

```env
# Backend Python
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
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_ID=prod_...

# OpenAI
OPENAI_API_KEY=sk-...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# App URL
APP_URL=http://localhost:3000
```

### 5. Avviare Backend

**Windows:**
```cmd
python run_backend.py
# o
start_backend.bat
```

**Linux/Mac:**
```bash
python run_backend.py
# o
chmod +x start_backend.sh
./start_backend.sh
```

Il backend sarà disponibile su `http://localhost:8000`

### 6. Configurare Frontend

Nel file `.env.local` (o `.env`) del frontend, aggiungi:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Poi avvia il frontend:
```bash
npm run dev
```

Il frontend sarà su `http://localhost:3000` e userà il backend Python su `http://localhost:8000`

## 📦 Deploy Backend Python

### Opzioni di Deploy

#### 1. Railway (Consigliato)
```bash
# Installa Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### 2. Render
1. Crea nuovo Web Service su Render
2. Collega repository GitHub
3. Imposta:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

#### 3. DigitalOcean App Platform
1. Crea nuova App
2. Seleziona Python
3. Imposta build/start commands come sopra

#### 4. Heroku
Crea `Procfile`:
```
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

## 🔧 Troubleshooting

### Errore: "Module not found"
```bash
pip install -r requirements.txt
```

### Errore: "FFmpeg not found"
Installa FFmpeg sul sistema:
- Windows: Download da https://ffmpeg.org/
- Linux: `sudo apt-get install ffmpeg`
- Mac: `brew install ffmpeg`

### Errore: "Tesseract not found"
Installa Tesseract:
- Windows: Download da https://github.com/UB-Mannheim/tesseract/wiki
- Linux: `sudo apt-get install tesseract-ocr`
- Mac: `brew install tesseract`

### Errore: "pdf2image: poppler not installed"
Installa Poppler:
- Linux: `sudo apt-get install poppler-utils`
- Mac: `brew install poppler`

## 📝 Note Importanti

1. **Frontend invariato**: Il design e l'interfaccia utente rimangono identici
2. **API compatibili**: Tutti gli endpoint hanno lo stesso formato delle API Next.js
3. **CORS configurato**: Il backend accetta richieste dal frontend
4. **File temporanei**: Su Vercel usa `/tmp`, localmente usa `os.tmpdir()`

## 🎯 Prossimi Passi

1. ✅ Backend Python creato
2. ✅ Tutti i router API implementati
3. ✅ Servizi principali implementati
4. ⚠️ Implementare servizi auth completi
5. ⚠️ Implementare servizi chat completi
6. ⚠️ Testing completo
7. ⚠️ Deploy backend Python
8. ⚠️ Aggiornare frontend per usare nuovo backend

## 📞 Supporto

Per problemi o domande, consulta:
- FastAPI docs: https://fastapi.tiangolo.com/
- Python docs: https://docs.python.org/

