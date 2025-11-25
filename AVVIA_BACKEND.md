# 🚀 Come Avviare il Backend Python

## ❌ Errore: ERR_CONNECTION_REFUSED

Se vedi l'errore `ERR_CONNECTION_REFUSED` quando provi a usare il convertitore JPG in PDF, significa che **il backend Python non è in esecuzione**.

## ✅ Soluzione Rapida

### Opzione 1: Script Automatico (Consigliato)

**Windows:**
```cmd
start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

### Opzione 2: Manuale

1. **Apri un nuovo terminale/PowerShell**

2. **Vai nella cartella del progetto:**
```cmd
cd "C:\Users\jurit\OneDrive\Desktop\sito upscale"
```

3. **Crea virtual environment (solo la prima volta):**
```cmd
python -m venv venv
```

4. **Attiva virtual environment:**
```cmd
venv\Scripts\activate
```

5. **Installa dipendenze (solo la prima volta):**
```cmd
pip install -r requirements.txt
```

6. **Avvia il backend:**
```cmd
python run_backend.py
```

Dovresti vedere:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## ✅ Verifica che Funzioni

1. Apri il browser e vai a: `http://localhost:8000/`
2. Dovresti vedere: `{"message": "MegaPixelAI API", "version": "2.0.0", "status": "online"}`
3. Testa health check: `http://localhost:8000/health`
4. Dovresti vedere: `{"status": "healthy"}`

## 🔧 Configurazione Frontend

Assicurati che il frontend sia configurato per usare il backend Python.

Crea/modifica il file `.env.local` nella root del progetto:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Poi riavvia il frontend Next.js:
```cmd
npm run dev
```

## 🐛 Troubleshooting

### Porta 8000 già in uso

Se la porta 8000 è già in uso:

1. Modifica `backend/config.py` o crea `.env`:
```env
PORT=8001
```

2. Aggiorna `.env.local` nel frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Errori di importazione

Se vedi errori come `ModuleNotFoundError`:
```cmd
venv\Scripts\activate
pip install -r requirements.txt
```

### Backend si avvia ma frontend non si connette

1. Verifica che `NEXT_PUBLIC_API_URL` sia configurato correttamente
2. Verifica che CORS sia configurato (già fatto in `backend/config.py`)
3. Controlla la console del browser per errori CORS
4. Assicurati che entrambi (frontend e backend) siano in esecuzione

## 📝 Note

- Il backend deve essere **sempre in esecuzione** quando usi il frontend
- Lascia il terminale con il backend aperto
- Per fermare il backend: premi `CTRL+C` nel terminale

## 🎯 Test Rapido

Dopo aver avviato il backend, prova:

```bash
curl http://localhost:8000/
```

Dovresti vedere:
```json
{"message":"MegaPixelAI API","version":"2.0.0","status":"online"}
```

