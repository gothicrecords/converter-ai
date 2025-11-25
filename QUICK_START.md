# 🚀 Quick Start - Avvio Backend Python

## ❌ Problema: ERR_CONNECTION_REFUSED

Se vedi l'errore `ERR_CONNECTION_REFUSED` significa che il backend Python non è in esecuzione.

## ✅ Soluzione: Avviare il Backend

### Opzione 1: Usando lo script (Consigliato)

**Windows:**
```cmd
start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

### Opzione 2: Manually

1. **Crea virtual environment** (solo la prima volta):
```cmd
python -m venv venv
venv\Scripts\activate
```

2. **Installa dipendenze** (solo la prima volta):
```cmd
pip install -r requirements.txt
```

3. **Avvia il backend**:
```cmd
python run_backend.py
```

### Opzione 3: Usando uvicorn direttamente

```cmd
venv\Scripts\activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## ✅ Verifica che funzioni

1. Apri il browser e vai a: `http://localhost:8000/`
2. Dovresti vedere: `{"message": "MegaPixelAI API", "version": "2.0.0", "status": "online"}`
3. Testa health check: `http://localhost:8000/health`
4. Dovresti vedere: `{"status": "healthy"}`

## 🔧 Configurazione

Crea un file `.env` nella root del progetto:

```env
ENVIRONMENT=development
DEBUG=True
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

## 🐛 Troubleshooting

### Porta 8000 già in uso

Se la porta 8000 è già in uso, modifica il file `.env`:
```env
PORT=8001
```

E nel frontend, aggiorna `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Errori di importazione

Se vedi errori come `ModuleNotFoundError`, installa le dipendenze:
```cmd
pip install -r requirements.txt
```

### Backend si avvia ma frontend non si connette

1. Verifica che `NEXT_PUBLIC_API_URL` sia configurato correttamente
2. Verifica che CORS sia configurato per accettare il frontend
3. Controlla la console del browser per errori CORS

