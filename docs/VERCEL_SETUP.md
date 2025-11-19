# 🚀 Guida Setup Vercel - Deployment Ottimizzato

Questa guida spiega come configurare correttamente il deploy su Vercel con integrazione GitHub.

## 📋 Prerequisiti

1. Account Vercel (gratuito)
2. Repository GitHub del progetto
3. Variabili d'ambiente configurate

## 🔧 Configurazione Iniziale

### 1. Collegamento GitHub → Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca su **"Add New Project"**
3. Seleziona il repository GitHub
4. Vercel rileverà automaticamente Next.js
5. Configura le variabili d'ambiente (vedi sezione sotto)

### 2. Variabili d'Ambiente Richieste

Configura queste variabili nel dashboard Vercel (Settings → Environment Variables):

#### Database (Supabase/Neon)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

#### Cloudinary (per upscale immagini)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Stripe (per pagamenti)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_public_key
```

#### OpenAI (per AI tools)
```
OPENAI_API_KEY=your_openai_api_key
```

#### Altri
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Configurazione GitHub Actions (Opzionale)

Per abilitare il deploy automatico via GitHub Actions:

1. Vai su Vercel Dashboard → Settings → Tokens
2. Crea un nuovo token
3. Vai su GitHub → Settings → Secrets and variables → Actions
4. Aggiungi questi secrets:
   - `VERCEL_TOKEN`: il token creato su Vercel
   - `VERCEL_ORG_ID`: trova in Vercel → Settings → General
   - `VERCEL_PROJECT_ID`: trova in Vercel → Settings → General

## 📁 File di Configurazione

### vercel.json

Il file `vercel.json` è già configurato con:
- **Memory allocation** ottimizzata per ogni tipo di API route
- **Timeout** estesi per operazioni pesanti (upscale, video, AI)
- **Security headers** per protezione
- **Region** configurata (iad1 - US East)

### Configurazioni API Routes

- **Upscale/Generate Image/Video**: 3008MB RAM, 300s timeout
- **Convert/PDF Tools**: 2048MB RAM, 180s timeout
- **File Upload**: 2048MB RAM, 120s timeout
- **Altre API**: 1024MB RAM, 60s timeout

## 🔄 Workflow di Deploy

### Deploy Automatico (Raccomandato)

1. **Push su main/master**: Deploy automatico in produzione
2. **Pull Request**: Deploy automatico come preview
3. **GitHub Actions**: Verifica build prima del deploy

### Deploy Manuale

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 🐛 Risoluzione Problemi Comuni

### Errore: "Function exceeded maximum duration"

**Soluzione**: Le API routes pesanti sono già configurate con timeout estesi in `vercel.json`. Se persiste:
- Verifica che la route specifica sia nella configurazione
- Controlla i log su Vercel Dashboard → Functions

### Errore: "Out of Memory"

**Soluzione**: 
- Verifica che la route abbia abbastanza memoria in `vercel.json`
- Le route più pesanti hanno 3008MB (massimo disponibile)

### Errore: "Build failed"

**Soluzione**:
1. Controlla i log di build su Vercel
2. Verifica che tutte le dipendenze siano in `package.json`
3. Assicurati che `next.config.mjs` sia valido
4. Controlla che non ci siano file troppo grandi (usa `.vercelignore`)

### Errore: "Environment variables missing"

**Soluzione**:
1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Aggiungi tutte le variabili richieste
3. Assicurati di selezionare gli ambienti corretti (Production, Preview, Development)

### Deploy lento

**Soluzione**:
- Usa `.vercelignore` per escludere file non necessari
- Verifica che `node_modules` non sia committato
- Usa build cache di Vercel

## 📊 Monitoraggio

### Analytics Vercel

Il progetto include già:
- `@vercel/analytics` per analytics
- `@vercel/speed-insights` per performance

### Logs

- **Function Logs**: Vercel Dashboard → Functions → [route] → Logs
- **Build Logs**: Vercel Dashboard → Deployments → [deployment] → Build Logs

## 🔒 Best Practices

1. **Non committare file sensibili**: Usa sempre variabili d'ambiente
2. **Usa preview deployments**: Testa su PR prima di merge
3. **Monitora i costi**: Le funzioni con più memoria costano di più
4. **Ottimizza le immagini**: Usa Next.js Image component
5. **Cache aggressivo**: Configurato in `next.config.mjs`

## 📝 Checklist Pre-Deploy

- [ ] Tutte le variabili d'ambiente configurate
- [ ] Test locale passati (`npm run build`)
- [ ] `.vercelignore` configurato correttamente
- [ ] `vercel.json` aggiornato
- [ ] GitHub Actions secrets configurati (se usato)
- [ ] Database migrations applicate
- [ ] Test delle API routes principali

## 🎯 Prossimi Passi

1. **Collega il dominio**: Vercel Dashboard → Settings → Domains
2. **Configura SSL**: Automatico con Vercel
3. **Setup monitoring**: Usa Vercel Analytics
4. **Ottimizza performance**: Monitora con Speed Insights

## 📞 Supporto

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deploy**: https://nextjs.org/docs/deployment
- **GitHub Actions**: https://docs.github.com/en/actions

---

**Nota**: Questo setup è ottimizzato per Next.js 16 e include configurazioni avanzate per gestire operazioni pesanti come upscale immagini, conversione video e AI processing.

