# 🚀 Quick Start: Railway Backend Setup

## Passi Rapidi

### 1. Verifica Deploy Railway (2 minuti)
```
1. Vai su railway.app → Dashboard
2. Controlla che il deploy sia "Active" e "Success"
3. Vai su Settings → Networking
4. Copia l'URL pubblico (es: https://xxx.railway.app)
```

### 2. Test Backend (30 secondi)
```bash
# Test health check
curl https://xxx.railway.app/health
# Dovresti vedere: {"status":"healthy"}
```

### 3. Configura Vercel (2 minuti)
```
1. Vai su vercel.com → Dashboard
2. Settings → Environment Variables
3. Aggiungi: NEXT_PUBLIC_API_URL = https://xxx.railway.app
4. Seleziona: Production, Preview, Development
5. Save
```

### 4. Redeploy Vercel (2 minuti)
```
1. Deployments → 3 puntini → Redeploy
2. Attendi completamento
3. Testa il sito
```

### 5. Verifica Funzionamento (1 minuto)
```
1. Apri il sito in produzione
2. F12 → Console
3. NON dovresti vedere: "Backend Python non disponibile"
4. Prova un convertitore → Dovrebbe funzionare!
```

## ⚠️ Se qualcosa non funziona:

1. **Backend non risponde**: Controlla log su Railway
2. **Frontend non trova backend**: Verifica `NEXT_PUBLIC_API_URL` su Vercel
3. **Errore CORS**: Backend già configurato per accettare tutto
4. **405 Error**: Verifica che la route esista nel backend

## 📞 Supporto

- Railway Logs: Dashboard → Deployments → Logs
- Vercel Logs: Dashboard → Deployments → Logs
- Documentazione completa: `docs/DEPLOY_CHECKLIST.md`

