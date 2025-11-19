# ✅ Checklist Deploy Vercel

Usa questa checklist prima di ogni deploy importante.

## 🔧 Pre-Deploy

### Configurazione Repository
- [ ] Repository GitHub collegato a Vercel
- [ ] Branch principale configurato (main/master)
- [ ] GitHub Actions configurato (opzionale)
- [ ] Secrets configurati in GitHub (se usi Actions)

### Variabili d'Ambiente
- [ ] `SUPABASE_URL` configurata
- [ ] `SUPABASE_ANON_KEY` configurata
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurata
- [ ] `DATABASE_URL` configurata
- [ ] `CLOUDINARY_CLOUD_NAME` configurata
- [ ] `CLOUDINARY_API_KEY` configurata
- [ ] `CLOUDINARY_API_SECRET` configurata
- [ ] `STRIPE_SECRET_KEY` configurata
- [ ] `STRIPE_PUBLISHABLE_KEY` configurata
- [ ] `STRIPE_WEBHOOK_SECRET` configurata
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurata
- [ ] `OPENAI_API_KEY` configurata (se usi AI tools)
- [ ] `NEXT_PUBLIC_APP_URL` configurata con URL Vercel

### Build & Test
- [ ] `npm install` eseguito senza errori
- [ ] `npm run build` completato con successo
- [ ] `npm run lint` passato (o errori noti documentati)
- [ ] Test locali delle API routes principali
- [ ] Test upload file funzionante
- [ ] Test conversione PDF funzionante
- [ ] Test upscale immagini funzionante

### File di Configurazione
- [ ] `vercel.json` presente e valido
- [ ] `.vercelignore` configurato correttamente
- [ ] `.gitignore` aggiornato
- [ ] `next.config.mjs` valido
- [ ] `package.json` aggiornato

## 🚀 Deploy

### Durante il Deploy
- [ ] Monitorare i log di build su Vercel
- [ ] Verificare che non ci siano errori di compilazione
- [ ] Controllare che tutte le dipendenze siano installate
- [ ] Verificare che le variabili d'ambiente siano caricate

### Post-Deploy

#### Test Funzionalità Base
- [ ] Homepage carica correttamente
- [ ] Navigazione tra pagine funziona
- [ ] Login/Signup funziona
- [ ] Dashboard accessibile dopo login
- [ ] Logout funziona

#### Test API Routes
- [ ] `/api/upscale` funziona
- [ ] `/api/convert/[target]` funziona per formati principali
- [ ] `/api/pdf/*` routes funzionano
- [ ] `/api/tools/*` routes funzionano
- [ ] `/api/files/upload` funziona
- [ ] `/api/stripe/webhook` configurato correttamente

#### Test Performance
- [ ] Tempo di caricamento homepage < 3s
- [ ] API routes rispondono in tempi accettabili
- [ ] Immagini ottimizzate e caricate velocemente
- [ ] Nessun errore in console browser

#### Test Sicurezza
- [ ] HTTPS attivo
- [ ] Headers di sicurezza presenti
- [ ] CORS configurato correttamente
- [ ] Rate limiting attivo (se implementato)

## 🔍 Monitoraggio Post-Deploy

### Primi 24 Ore
- [ ] Monitorare errori su Vercel Dashboard
- [ ] Verificare analytics e traffico
- [ ] Controllare log delle funzioni
- [ ] Verificare che i webhook Stripe funzionino
- [ ] Testare pagamenti (se applicabile)

### Settimana 1
- [ ] Analizzare performance con Speed Insights
- [ ] Verificare che non ci siano memory leaks
- [ ] Controllare costi Vercel
- [ ] Raccogliere feedback utenti

## 🐛 Troubleshooting Rapido

### Build Fallisce
1. Controlla log di build su Vercel
2. Verifica `next.config.mjs` per errori di sintassi
3. Controlla che tutte le dipendenze siano in `package.json`
4. Verifica che non ci siano file troppo grandi

### API Route Timeout
1. Verifica configurazione in `vercel.json`
2. Controlla che la route abbia abbastanza `maxDuration`
3. Verifica che abbia abbastanza `memory`

### Variabili d'Ambiente Mancanti
1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Verifica che siano configurate per l'ambiente corretto (Production/Preview)
3. Riavvia il deployment dopo aver aggiunto variabili

### Errori Runtime
1. Controlla Function Logs su Vercel
2. Verifica che tutte le dipendenze native siano supportate
3. Controlla che Sharp, ffmpeg-static, etc. siano compatibili

## 📝 Note

- **Backup**: Prima di deploy importanti, esporta il database
- **Rollback**: Vercel mantiene history dei deploy, puoi fare rollback facilmente
- **Preview**: Usa sempre preview deployments per testare PR
- **Documentazione**: Aggiorna `VERCEL_SETUP.md` se cambi configurazione

---

**Ultimo aggiornamento**: Dopo ogni deploy importante, aggiorna questa checklist con nuove scoperte o problemi risolti.

