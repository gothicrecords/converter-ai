# ✅ Verifica Backend Python

## 🔍 Come Verificare che il Backend sia Attivo

### Metodo 1: Browser (Più Semplice)

1. Apri il browser
2. Vai a: `http://localhost:8000/`
3. Dovresti vedere:
```json
{
  "message": "MegaPixelAI API",
  "version": "2.0.0",
  "status": "online"
}
```

### Metodo 2: Health Check

Vai a: `http://localhost:8000/health`

Dovresti vedere:
```json
{
  "status": "healthy",
  "message": "API is running"
}
```

### Metodo 3: Test Endpoint PDF

Vai a: `http://localhost:8000/api/pdf/jpg-to-pdf`

Dovresti vedere un errore 422 (Method Not Allowed o Validation Error) - questo è **normale** perché serve un POST con file, ma significa che l'endpoint esiste!

## ⚠️ Se il Backend Non Risponde

### Controlla il Terminale

Il backend dovrebbe essere in esecuzione in un terminale. Dovresti vedere:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Se Vedi Errori

1. **Python non trovato**: Installa Python da https://www.python.org/
2. **Dipendenze mancanti**: Esegui `pip install -r requirements.txt`
3. **Porta 8000 occupata**: Cambia porta in `backend/config.py` o `.env`

### Riavvia il Backend

1. Premi `CTRL+C` nel terminale del backend
2. Esegui di nuovo: `start_backend.bat`

## ✅ Una Volta Attivo

1. Il backend sarà disponibile su `http://localhost:8000`
2. Il frontend potrà connettersi automaticamente
3. Il convertitore JPG to PDF funzionerà!

## 📝 Nota

- **Lascia il terminale del backend aperto** mentre usi il frontend
- Per fermare: premi `CTRL+C` nel terminale
- Il backend deve essere sempre in esecuzione quando usi il frontend

