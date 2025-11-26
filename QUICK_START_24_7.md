# 🚀 Quick Start - Hosting 24/7

Guida rapida per avviare il backend con sistema di monitoraggio 24/7.

## ⚡ Avvio Rapido Locale

### Windows
```cmd
start_backend_watchdog.bat
```

### Linux/Mac
```bash
chmod +x start_backend_watchdog.sh
./start_backend_watchdog.sh
```

### Python diretto
```bash
python start_backend_watchdog.py
```

## ✅ Verifica Funzionamento

1. **Health Check Base:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Health Check Dettagliato:**
   ```bash
   curl http://localhost:8000/health/detailed
   ```

3. **Metriche Sistema:**
   ```bash
   curl http://localhost:8000/health/metrics
   ```

## 📊 Monitoraggio

### Log Files
- `logs/backend.log` - Log generale
- `logs/errors.log` - Solo errori
- `logs/watchdog.log` - Log watchdog
- `logs/watchdog_status.json` - Stato watchdog

### Status Watchdog
```bash
cat logs/watchdog_status.json
```

## 🌐 Deploy Produzione

### Railway (Consigliato)
```bash
railway login
railway init
railway up
```

### Heroku
```bash
heroku create tuoprogetto-backend
git push heroku main
```

### VPS/Dedicated
Vedi `HOSTING_24_7.md` per configurazione completa con systemd/supervisor.

## 🔧 Configurazione

Crea file `.env`:
```env
ENVIRONMENT=production
PORT=8000
WORKERS=4
LOG_LEVEL=INFO
```

## 📖 Documentazione Completa

Vedi `HOSTING_24_7.md` per:
- Configurazione avanzata
- Troubleshooting
- Deploy su diverse piattaforme
- Monitoraggio esterno

---

**Il backend è ora configurato per rimanere attivo 24/7! 🎉**

