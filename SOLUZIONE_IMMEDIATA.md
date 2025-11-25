# 🚨 Soluzione Immediata - ERR_CONNECTION_REFUSED

## Problema
L'errore `ERR_CONNECTION_REFUSED` su `localhost:8000` significa che **il backend Python non è in esecuzione**.

## ✅ Soluzione Rapida (2 Opzioni)

### Opzione 1: Avviare Backend Python (Consigliato)

**Apri un NUOVO terminale/PowerShell** e esegui:

```cmd
cd "C:\Users\jurit\OneDrive\Desktop\sito upscale"
start_backend.bat
```

Oppure manualmente:
```cmd
cd "C:\Users\jurit\OneDrive\Desktop\sito upscale"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run_backend.py
```

**Dovresti vedere:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Opzione 2: Usare API Next.js (Fallback)

Se non vuoi usare il backend Python per ora, rimuovi o commenta `NEXT_PUBLIC_API_URL` dal file `.env.local`:

**Crea/modifica `.env.local`:**
```env
# NEXT_PUBLIC_API_URL=http://localhost:8000  # Commentato - usa API Next.js
```

Poi riavvia il frontend:
```cmd
npm run dev
```

## 🔍 Verifica

### Verifica Backend Python
1. Apri browser: `http://localhost:8000/`
2. Dovresti vedere: `{"message": "MegaPixelAI API", "version": "2.0.0", "status": "online"}`

### Verifica Frontend
1. Apri browser: `http://localhost:3000/`
2. Prova convertitore JPG to PDF
3. Dovrebbe funzionare

## ⚠️ Importante

- **Backend Python** deve essere **sempre in esecuzione** quando usi il frontend con `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **Lascia il terminale con il backend aperto**
- Per fermare: premi `CTRL+C` nel terminale del backend

## 🐛 Se Non Funziona

1. **Verifica porta 8000 libera:**
```cmd
netstat -ano | findstr :8000
```

2. **Verifica Python installato:**
```cmd
python --version
```

3. **Verifica dipendenze:**
```cmd
pip list | findstr fastapi
```

4. **Controlla errori nel terminale del backend**

