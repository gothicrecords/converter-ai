# 🔐 Guida Completa: Autenticazione e Stripe

## ✅ Completato

### 1. Sistema di Autenticazione
- ✅ Login/Signup API routes (`/api/auth/login`, `/api/auth/signup`)
- ✅ Gestione sessioni con token sicuri
- ✅ Hash password con bcrypt
- ✅ Funzioni auth client-side (`lib/auth.js`)
- ✅ Database Neon con tabelle users e sessions

### 2. Integrazione Stripe con Database
- ✅ Campi Stripe aggiunti alla tabella users:
  - `stripe_customer_id`
  - `stripe_subscription_id`
  - `stripe_subscription_status`
  - `subscription_expires_at`
- ✅ Funzioni database per gestire Stripe (`lib/db.js`)
- ✅ Webhook completamente integrato con database
- ✅ Pricing page con autenticazione utente

---

## 📋 TODO: Configurazioni Manuali

### 1️⃣ Aggiornare Database Neon

Esegui questo SQL nel Neon SQL Editor:

\`\`\`sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);
\`\`\`

Oppure usa il file: `migrations/add-stripe-fields.sql`

### 2️⃣ Aggiungere Chiavi Stripe su Vercel

1. Vai su: https://vercel.com/gothicrecords/best-upscaler-ia/settings/environment-variables
2. Aggiungi queste 3 variabili:

| Nome | Valore |
|------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_51SUZp0AYkkHFHNFubtL1Cu087SF09axYQAL1TZKOHH2dUdKLTZMIVBg7B5YpILWJ1j5QGZl2kXouCsv1wP4rOxJa00GXEdCfvV` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51SUZp0AYkkHFHNFuDK9bY1iN8xNUFPeBVZTSLgTBq5SxSo7bBeyaMYSTaaLfJ2g5oxOCXOO1bAAefqa5I9StJwF9001XRLRFQf` |
| `STRIPE_WEBHOOK_SECRET` | *(Configuralo dopo il passo 3)* |

3. **Redeploy** il progetto su Vercel

### 3️⃣ Configurare Webhook Stripe

**Per TEST locale (con Stripe CLI):**
\`\`\`bash
# Installa Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copia il webhook signing secret che appare (whsec_...)
# e aggiungilo a .env.local come STRIPE_WEBHOOK_SECRET
\`\`\`

**Per PRODUZIONE:**
1. Vai su: https://dashboard.stripe.com/test/webhooks
2. Clicca "+ Add endpoint"
3. **Endpoint URL**: `https://tuo-dominio.vercel.app/api/stripe/webhook`
4. **Eventi da selezionare**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Salva e copia il **Signing secret** (whsec_...)
6. Aggiungilo su Vercel come `STRIPE_WEBHOOK_SECRET`

### 4️⃣ Passare a Live Mode (Produzione)

**Quando sei pronto per pagamenti reali:**

1. **Attiva account Stripe**:
   - Completa la verifica identità su Stripe
   - Aggiungi informazioni bancarie per ricevere pagamenti

2. **Ottieni chiavi LIVE**:
   - Vai su: https://dashboard.stripe.com/apikeys
   - Passa da "Test mode" a "Live mode" (toggle in alto)
   - Copia le nuove chiavi (iniziano con `pk_live_` e `sk_live_`)

3. **Aggiorna .env.local**:
   \`\`\`env
   STRIPE_SECRET_KEY=sk_live_TUA_CHIAVE_LIVE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TUA_CHIAVE_LIVE
   \`\`\`

4. **Aggiorna Vercel**:
   - Sostituisci le chiavi su Vercel con quelle LIVE
   - Redeploy

5. **Configura webhook LIVE**:
   - Crea nuovo endpoint su Stripe in Live mode
   - Copia il nuovo webhook secret
   - Aggiornalo su Vercel

---

## 🧪 Test Completo

### Test Autenticazione:
1. Vai su `/signup` e crea un account
2. Verifica login su `/login`
3. Vai su `/dashboard` e verifica che vedi i tuoi dati

### Test Pagamento:
1. **Con utente loggato**, vai su `/pricing`
2. Clicca "Inizia la prova gratuita" sul piano Pro
3. Usa carta test: `4242 4242 4242 4242`
4. Completa il pagamento
5. Verifica che nel database:
   - `plan` = 'pro'
   - `stripe_subscription_status` = 'active'
   - `stripe_customer_id` e `stripe_subscription_id` sono salvati

### Test Webhook:
1. Con Stripe CLI attivo, completa un pagamento test
2. Controlla i log del server Next.js
3. Verifica che il webhook ha aggiornato il database

---

## 🚨 Note Importanti

### Fiscalità (Italia - senza P.IVA)
- ✅ **Fino a €5.000/anno**: OK come "redditi diversi"
- ⚠️ **Oltre €5.000/anno**: Devi aprire P.IVA
- 📊 Dichiarazione: Modello 730 o Redditi PF, quadro RL

### Commissioni Stripe
- **1.4% + €0.25** per transazione
- Esempio: €2.99 → Tu ricevi €2.70 (circa)

### Sicurezza
- ✅ Password hashate con bcrypt
- ✅ Session token sicuri (32 bytes random)
- ✅ Webhook con verifica firma Stripe
- ✅ Database connection con SSL
- ⚠️ **TODO**: Aggiungi rate limiting sulle API

### Backup e Monitoring
- 📊 Monitora pagamenti su Stripe Dashboard
- 🗄️ Neon ha backup automatici giornalieri
- 📧 **TODO**: Implementa email notifications per eventi importanti

---

## 📚 Risorse

- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Neon Database Docs](https://neon.tech/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Hai completato tutto? Fai un test completo e poi passa a Live Mode! 🚀**
