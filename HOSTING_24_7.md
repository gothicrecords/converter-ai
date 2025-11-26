# 🚀 Hosting 24/7 - Guida Completa

Questa guida descrive come configurare e mantenere il backend Python sempre attivo 24/7 con sistema di monitoraggio avanzato e auto-recovery.

## 📋 Indice

1. [Sistema di Watchdog](#sistema-di-watchdog)
2. [Health Checks Avanzati](#health-checks-avanzati)
3. [Monitoraggio e Metriche](#monitoraggio-e-metriche)
4. [Deploy su Railway](#deploy-su-railway)
5. [Deploy su Heroku](#deploy-su-heroku)
6. [Deploy su VPS/Dedicated](#deploy-su-vpsdedicated)
7. [Troubleshooting](#troubleshooting)

---

## 🐕 Sistema di Watchdog

Il sistema di watchdog mantiene il backend sempre attivo con auto-restart automatico in caso di crash.

### Funzionalità

- ✅ **Auto-restart automatico** in caso di crash
- ✅ **Health checks periodici** ogni 30 secondi
- ✅ **Rate limiting restart** (max 10 restart/ora)
- ✅ **Logging strutturato** di tutti gli eventi
- ✅ **Shutdown graceful** su segnali SIGTERM/SIGINT

### Avvio Locale con Watchdog

#### Windows
```cmd
start_backend_watchdog.bat
```

#### Linux/Mac
```bash
chmod +x start_backend_watchdog.sh
./start_backend_watchdog.sh
```

#### Python diretto
```bash
python start_backend_watchdog.py
```

### Configurazione Watchdog

Variabili d'ambiente per personalizzare il watchdog:

```env
# Intervallo tra health checks (secondi)
WATCHDOG_HEALTH_CHECK_INTERVAL=30

# Delay prima di riavviare (secondi)
WATCHDOG_RESTART_DELAY=5

# Max restart in una finestra temporale
WATCHDOG_MAX_RESTARTS=10
WATCHDOG_RESTART_WINDOW=3600  # 1 ora

# URL per health check
WATCHDOG_HEALTH_CHECK_URL=http://localhost:8000/health
```

---

## 💚 Health Checks Avanzati

Il sistema include endpoint di health check per monitoraggio esterno.

### Endpoint Disponibili

#### `/health` - Health Check Base
```bash
curl http://localhost:8000/health
```

Risposta:
```json
{
  "status": "healthy",
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00"
}
```

#### `/health/detailed` - Health Check Dettagliato
```bash
curl http://localhost:8000/health/detailed
```

Include:
- Stato componenti (database, cache)
- Metriche di sistema (CPU, memoria, disco)
- Uptime del servizio
- Tasso di errori

#### `/health/metrics` - Metriche di Sistema
```bash
curl http://localhost:8000/health/metrics
```

Metriche disponibili:
- CPU usage
- Memoria (totale, usata, percentuale)
- Disco (spazio disponibile)
- Uptime
- Statistiche richieste (totali, errori, error rate)

#### `/health/ready` - Kubernetes Readiness Probe
```bash
curl http://localhost:8000/health/ready
```

Verifica se il servizio è pronto ad accettare traffico.

#### `/health/live` - Kubernetes Liveness Probe
```bash
curl http://localhost:8000/health/live
```

Verifica se il servizio è vivo.

---

## 📊 Monitoraggio e Metriche

### Metriche Raccolte

Il sistema raccoglie automaticamente:

1. **Metriche di Sistema**
   - CPU usage percentuale
   - Memoria usata/disponibile
   - Spazio disco
   - Uptime del processo

2. **Metriche Applicazione**
   - Numero totale richieste
   - Numero errori
   - Error rate percentuale
   - Tempo di risposta medio

3. **Metriche Watchdog**
   - Numero restart effettuati
   - Ultimo restart
   - Stato del processo monitorato

### File di Log

I log sono salvati in `logs/`:

- `backend.log` - Log generale (rotazione giornaliera, 30 giorni)
- `errors.log` - Solo errori (max 10MB, 10 backup)
- `access.log` - Log accessi (max 50MB, 10 backup)
- `watchdog.log` - Log del watchdog
- `watchdog_status.json` - Stato del watchdog (JSON)

### Log Strutturato JSON

Per abilitare log in formato JSON (utile per aggregatori di log):

```env
JSON_LOGS=true
LOG_LEVEL=INFO
```

---

## 🚂 Deploy su Railway

Railway è una piattaforma cloud che mantiene i servizi sempre attivi automaticamente.

### 1. Preparazione

1. Crea account su [Railway.app](https://railway.app)
2. Installa Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

### 2. Deploy

```bash
# Login
railway login

# Inizializza progetto
railway init

# Deploy
railway up
```

### 3. Variabili d'Ambiente

Configura su Railway Dashboard → Variables:

```env
# Server
PORT=8000  # Railway imposta automaticamente
ENVIRONMENT=production
DEBUG=False

# Database
DATABASE_URL=postgresql://...
NEON_DATABASE_URL=postgresql://...

# API Keys
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk-...

# App
APP_URL=https://tuodominio.com
SECRET_KEY=your-secret-key-here
```

### 4. Procfile

Railway usa automaticamente il `Procfile`:

```
web: python start_backend_production.py
```

### 5. Verifica Deploy

```bash
# Controlla logs
railway logs

# Testa health check
curl https://tuoprogetto.railway.app/health
```

### 6. Domini Personalizzati

1. Railway Dashboard → Settings → Domains
2. Aggiungi dominio personalizzato
3. Configura DNS come indicato

---

## 🟣 Deploy su Heroku

Heroku supporta app Python con Procfile.

### 1. Preparazione

```bash
# Installa Heroku CLI
# Windows: https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew tap heroku/brew && brew install heroku

# Login
heroku login

# Crea app
heroku create tuoprogetto-backend
```

### 2. Deploy

```bash
# Deploy
git push heroku main

# Oppure via GitHub integration
```

### 3. Variabili d'Ambiente

```bash
# Configura variabili
heroku config:set ENVIRONMENT=production
heroku config:set DATABASE_URL=postgresql://...
heroku config:set OPENAI_API_KEY=sk-...

# Vedi tutte le variabili
heroku config
```

### 4. Workers

Heroku usa il `Procfile` per determinare i dyno:

```
web: python start_backend_production.py
```

Avvia worker:
```bash
heroku ps:scale web=1
```

### 5. Logs

```bash
# Logs in tempo reale
heroku logs --tail

# Logs ultimi 1000 righe
heroku logs -n 1000
```

---

## 🖥️ Deploy su VPS/Dedicated Server

Per server Linux dedicati (Ubuntu, Debian, etc.)

### 1. Setup Iniziale

```bash
# Aggiorna sistema
sudo apt update && sudo apt upgrade -y

# Installa Python 3.12
sudo apt install python3.12 python3.12-venv python3-pip -y

# Installa nginx (reverse proxy)
sudo apt install nginx -y

# Installa supervisor (process manager)
sudo apt install supervisor -y
```

### 2. Clone e Setup Progetto

```bash
# Crea utente per l'app
sudo adduser backendapp
sudo su - backendapp

# Clone repository
git clone https://github.com/tuorepo/progetto.git
cd progetto

# Crea virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Installa dipendenze
pip install -r requirements.txt
```

### 3. Configurazione Supervisor

Crea `/etc/supervisor/conf.d/backend.conf`:

```ini
[program:backend]
command=/home/backendapp/progetto/venv/bin/python /home/backendapp/progetto/start_backend_production.py
directory=/home/backendapp/progetto
user=backendapp
autostart=true
autorestart=true
stderr_logfile=/home/backendapp/progetto/logs/backend_error.log
stdout_logfile=/home/backendapp/progetto/logs/backend_access.log
environment=ENVIRONMENT="production",PORT="8000"
```

Avvia supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start backend
sudo supervisorctl status
```

### 4. Configurazione Nginx (Reverse Proxy)

Crea `/etc/nginx/sites-available/backend`:

```nginx
server {
    listen 80;
    server_name api.tuodominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Abilita configurazione:
```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL con Let's Encrypt

```bash
# Installa certbot
sudo apt install certbot python3-certbot-nginx -y

# Ottieni certificato
sudo certbot --nginx -d api.tuodominio.com

# Auto-renewal è configurato automaticamente
```

### 6. Firewall

```bash
# Configura UFW
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 7. Sistema con Watchdog

Per maggiore affidabilità, usa il watchdog invece di supervisor:

```bash
# Crea systemd service
sudo nano /etc/systemd/system/backend-watchdog.service
```

Contenuto:
```ini
[Unit]
Description=Backend Watchdog Service
After=network.target

[Service]
Type=simple
User=backendapp
WorkingDirectory=/home/backendapp/progetto
Environment="PATH=/home/backendapp/progetto/venv/bin"
ExecStart=/home/backendapp/progetto/venv/bin/python /home/backendapp/progetto/start_backend_watchdog.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Avvia servizio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable backend-watchdog
sudo systemctl start backend-watchdog
sudo systemctl status backend-watchdog
```

---

## 🔧 Configurazione Ottimale per Produzione

### Variabili d'Ambiente Consigliate

```env
# Server
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO
JSON_LOGS=true

# Workers (2-4x CPU cores)
WORKERS=4

# Timeouts
WORKER_TIMEOUT=120
KEEPALIVE=5

# Watchdog
WATCHDOG_HEALTH_CHECK_INTERVAL=30
WATCHDOG_RESTART_DELAY=5
WATCHDOG_MAX_RESTARTS=10
WATCHDOG_RESTART_WINDOW=3600
```

### Ottimizzazioni Uvicorn

Lo script `start_backend_production.py` configura automaticamente:
- Workers multipli (2-4x CPU cores)
- Timeout appropriati
- Keep-alive ottimizzati
- Proxy headers per reverse proxy

---

## 🐛 Troubleshooting

### Problema: Servizio non si avvia

1. **Verifica logs:**
   ```bash
   tail -f logs/backend.log
   tail -f logs/errors.log
   ```

2. **Verifica dipendenze:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verifica porte:**
   ```bash
   # Linux/Mac
   lsof -i :8000
   
   # Windows
   netstat -ano | findstr :8000
   ```

### Problema: Watchdog continua a riavviare

1. **Verifica logs del watchdog:**
   ```bash
   tail -f logs/watchdog.log
   ```

2. **Verifica health check:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Verifica risorse:**
   ```bash
   curl http://localhost:8000/health/metrics
   ```

4. **Controlla limite restart:**
   - Il watchdog limita a 10 restart/ora
   - Verifica `watchdog_status.json`

### Problema: Memoria esaurita

1. **Riduci workers:**
   ```env
   WORKERS=2
   ```

2. **Verifica metriche:**
   ```bash
   curl http://localhost:8000/health/metrics
   ```

3. **Controlla processi:**
   ```bash
   ps aux | grep python
   ```

### Problema: Database non raggiungibile

1. **Verifica connessione:**
   ```bash
   curl http://localhost:8000/health/detailed
   ```

2. **Verifica variabili d'ambiente:**
   ```bash
   echo $DATABASE_URL
   ```

3. **Testa connessione direttamente:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

---

## 📈 Monitoraggio Esterno

### Uptime Robot

Configura monitoraggio esterno con [UptimeRobot](https://uptimerobot.com):

1. Crea nuovo monitor
2. Tipo: HTTP(s)
3. URL: `https://tuoprogetto.railway.app/health`
4. Intervallo: 5 minuti

### Datadog / New Relic

Per monitoraggio avanzato, integra con Datadog o New Relic usando gli endpoint `/health/metrics`.

---

## ✅ Checklist Deploy Produzione

- [ ] Variabili d'ambiente configurate
- [ ] Database connesso e testato
- [ ] Health checks funzionanti
- [ ] Logs configurati e verificati
- [ ] SSL/HTTPS configurato
- [ ] Firewall configurato
- [ ] Monitoraggio esterno configurato
- [ ] Backup configurati
- [ ] Documentazione aggiornata

---

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log in `logs/`
2. Verifica gli health checks
3. Controlla la documentazione Railway/Heroku
4. Verifica le variabili d'ambiente

---

**Il sistema è ora configurato per rimanere attivo 24/7 con auto-recovery automatico! 🎉**

