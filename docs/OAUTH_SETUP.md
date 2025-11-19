# 🔐 Configurazione OAuth - Google e Facebook

## ✅ Cosa è stato implementato

Sistema di autenticazione OAuth completo con:
- ✅ Login/Registrazione con **Google**
- ✅ Login/Registrazione con **Facebook**
- ✅ UI moderna e veloce con pulsanti OAuth prominenti
- ✅ Link automatico di account OAuth a utenti esistenti (stessa email)
- ✅ Gestione sessioni unificata
- ✅ Protezione CSRF con state token

---

## 📋 Setup Database

### Passo 1: Esegui la Migration OAuth

1. Vai al tuo database (Neon/Supabase SQL Editor)
2. Apri il file `migrations/add-oauth-fields.sql`
3. Copia tutto il contenuto e eseguilo nel SQL Editor

Questo aggiungerà i campi necessari:
- `auth_provider` - 'email', 'google', o 'facebook'
- `provider_id` - ID utente dal provider OAuth
- `provider_email` - Email dal provider
- `avatar_url` - URL avatar dal provider
- `password_hash` diventa nullable (OAuth users non hanno password)

---

## 🔧 Configurazione Google OAuth

### Passo 1: Crea un Progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita **Google+ API** (se necessario)

### Passo 2: Crea OAuth 2.0 Credentials

1. Vai su **APIs & Services** > **Credentials**
2. Clicca **Create Credentials** > **OAuth client ID**
3. Se richiesto, configura la schermata di consenso OAuth
4. Tipo applicazione: **Web application**
5. Aggiungi **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/oauth/google/callback  (per sviluppo)
   https://tuodominio.com/api/auth/oauth/google/callback  (per produzione)
   ```
6. Copia **Client ID** e **Client Secret**

### Passo 3: Aggiungi Variabili d'Ambiente

Aggiungi al tuo `.env.local`:

```bash
GOOGLE_CLIENT_ID=tuo-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tuo-client-secret
```

---

## 📘 Configurazione Facebook OAuth

### Passo 1: Crea un'App Facebook

1. Vai su [Facebook Developers](https://developers.facebook.com/)
2. Clicca **My Apps** > **Create App**
3. Scegli tipo: **Consumer** o **Business**
4. Compila le informazioni base

### Passo 2: Configura Facebook Login

1. Nel dashboard app, aggiungi il prodotto **Facebook Login**
2. Vai su **Settings** > **Basic**
3. Aggiungi **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/oauth/facebook/callback  (per sviluppo)
   https://tuodominio.com/api/auth/oauth/facebook/callback  (per produzione)
   ```
4. Copia **App ID** e **App Secret**

### Passo 3: Aggiungi Variabili d'Ambiente

Aggiungi al tuo `.env.local`:

```bash
FACEBOOK_APP_ID=tuo-app-id
FACEBOOK_APP_SECRET=tuo-app-secret
```

---

## 🚀 Come Funziona

### Flusso OAuth

1. **Utente clicca "Continua con Google/Facebook"**
   - Viene reindirizzato al provider OAuth
   - Viene generato un state token per CSRF protection

2. **Utente autorizza l'app**
   - Il provider reindirizza a `/api/auth/oauth/{provider}/callback`
   - Viene verificato il state token

3. **Scambio code per token**
   - Il server scambia il code per un access token
   - Recupera le informazioni utente dal provider

4. **Registrazione/Login automatico**
   - Se l'utente esiste con lo stesso provider+providerId → **Login**
   - Se l'utente esiste con la stessa email → **Link account OAuth**
   - Altrimenti → **Crea nuovo utente**

5. **Redirect a dashboard**
   - Viene creata una sessione
   - L'utente viene reindirizzato a `/dashboard`

---

## 🎨 UI Migliorata

Le pagine `/login` e `/signup` ora includono:

- **Pulsanti OAuth prominenti** in cima al form
- **Divider "oppure"** per separare OAuth da email/password
- **Design moderno** con icone SVG dei provider
- **Feedback errori** per problemi OAuth

---

## 🔒 Sicurezza

- ✅ **State token** per protezione CSRF
- ✅ **HttpOnly cookies** per session token
- ✅ **Validazione email** dal provider
- ✅ **Link automatico** di account esistenti (stessa email)

---

## 🧪 Test

### Test Locale

1. Assicurati che le variabili d'ambiente siano configurate
2. Avvia il server: `npm run dev`
3. Vai su `http://localhost:3000/login`
4. Clicca "Continua con Google" o "Continua con Facebook"
5. Dovresti essere reindirizzato al provider e poi alla dashboard

### Test Produzione

1. Aggiorna gli **Authorized Redirect URIs** con il tuo dominio
2. Assicurati che `APP_URL` in `.env` sia il tuo dominio
3. Riavvia il server
4. Testa il flusso completo

---

## ⚠️ Note Importanti

1. **Redirect URIs devono corrispondere esattamente** (incluso http/https, porta, path)
2. **Facebook richiede HTTPS in produzione** (usa ngrok per test locali)
3. **Google permette localhost** per sviluppo
4. **State token scade dopo 10 minuti** (600 secondi)
5. **Sessioni durano 7 giorni** come per login normale

---

## 🐛 Troubleshooting

### "OAuth not configured"
- Verifica che le variabili d'ambiente siano impostate
- Riavvia il server dopo aver aggiunto le variabili

### "Invalid state token"
- Il cookie potrebbe non essere stato salvato
- Verifica che i cookie siano abilitati nel browser
- Controlla la console del browser per errori

### "Failed to exchange token"
- Verifica che Client ID/Secret siano corretti
- Controlla che il redirect URI corrisponda esattamente
- Verifica i log del server per dettagli

### "Email not provided"
- L'utente potrebbe non aver concesso il permesso email
- Per Facebook, assicurati che lo scope includa 'email'

---

## 📚 Risorse

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login/)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)

---

## ✅ Checklist Setup

- [ ] Migration database eseguita
- [ ] Google OAuth app creata e configurata
- [ ] Facebook OAuth app creata e configurata
- [ ] Variabili d'ambiente aggiunte
- [ ] Redirect URIs configurati correttamente
- [ ] Test locale completato
- [ ] Test produzione completato

---

**🎉 Fatto! Ora gli utenti possono registrarsi e accedere velocemente con Google e Facebook!**

