# 🗄️ Configurazione Database Supabase per MegaPixelAI

## Perché Supabase?

Ho scelto **Supabase** come database per MegaPixelAI per i seguenti vantaggi:

✅ **Tier Gratuito Generoso**
- 500 MB di spazio database
- Fino a 50.000 utenti attivi al mese
- 2 GB di bandwidth
- API illimitate

✅ **PostgreSQL Completo**
- Database relazionale professionale
- Supporto per relazioni e indici
- Backup automatici

✅ **Funzionalità Avanzate**
- Autenticazione integrata
- Row Level Security (RLS) per sicurezza dati
- API REST automatiche
- Real-time subscriptions

✅ **Scalabilità**
- Facile upgrade a piani superiori
- Infrastructure solida e affidabile
- Dashboard intuitiva per gestione

---

## 🚀 Setup Rapido (5 Minuti)

### Passo 1: Crea Account Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Clicca su "Start your project" 
3. Registrati con GitHub, Google o Email
4. È **completamente gratuito**, nessuna carta di credito richiesta

### Passo 2: Crea Nuovo Progetto

1. Nella dashboard, clicca "New Project"
2. Compila i campi:
   - **Name**: `megapixelai-production` (o nome a tua scelta)
   - **Database Password**: Scegli una password sicura (salvala!)
   - **Region**: Scegli la regione più vicina (es. `Europe West (Ireland)` per Italia)
   - **Pricing Plan**: Seleziona **Free** (500 MB)
3. Clicca "Create new project" (ci vogliono 1-2 minuti)

### Passo 3: Ottieni le Credenziali API

1. Nel menu laterale, vai su **Settings** > **API**
2. Troverai queste credenziali:

   - **Project URL**: `https://tuoprogetto.supabase.co`
   - **anon/public key**: Una chiave lunga che inizia con `eyJ...`
   - **service_role key**: Un'altra chiave (clicca su "Reveal" per vederla)

3. **Copia queste chiavi** - ne avrai bisogno nel passo successivo

### Passo 4: Aggiorna .env.local

Apri il file `.env.local` nella root del progetto e sostituisci i valori placeholder:

```bash
# Sostituisci con i tuoi valori da Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (la tua anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (la tua service role key)
```

⚠️ **IMPORTANTE**: 
- La `service_role key` è SEGRETA - non condividerla mai!
- Non committare mai `.env.local` su Git (è già in `.gitignore`)

### Passo 5: Crea le Tabelle del Database

1. Nella dashboard Supabase, vai su **SQL Editor** (icona database nel menu laterale)
2. Clicca "New Query"
3. Apri il file `migrations/setup-database.sql` dal tuo progetto
4. **Copia tutto il contenuto** del file SQL
5. **Incolla** nell'editor SQL di Supabase
6. Clicca "Run" (tasto play in basso a destra)

✅ Se tutto è andato bene, vedrai:
- ✓ "Success. No rows returned"
- Nel menu **Table Editor** troverai le tabelle: `users`, `user_history`, `user_sessions`

### Passo 6: Verifica Installazione

1. Riavvia il server di sviluppo:
   ```bash
   npm run dev
   ```

2. Vai su `http://localhost:3000/signup`
3. Registra un nuovo utente
4. Controlla nella dashboard Supabase:
   - Vai su **Table Editor** > **users**
   - Dovresti vedere il tuo nuovo utente con password hashata ✅

---

## 📊 Struttura Database

### Tabella `users`
Memorizza tutti gli utenti registrati:

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | UUID | ID univoco utente (auto-generato) |
| email | TEXT | Email utente (unique) |
| name | TEXT | Nome completo utente |
| password_hash | TEXT | Password hashata con bcrypt |
| created_at | TIMESTAMP | Data registrazione |
| updated_at | TIMESTAMP | Ultimo aggiornamento (auto) |
| images_processed | INTEGER | Conteggio immagini processate |
| tools_used | JSONB | Array JSON con nomi tool usati |
| has_discount | BOOLEAN | Se utente ha sconto 5% (default: true) |
| plan | TEXT | Piano: 'free', 'pro', 'business' |

### Tabella `user_history`
Cronologia delle elaborazioni:

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | UUID | ID univoco record |
| user_id | UUID | Riferimento a users.id |
| tool_name | TEXT | Nome tool utilizzato |
| thumbnail | TEXT | URL thumbnail risultato |
| metadata | JSONB | Dati extra (dimensioni, formato, etc.) |
| created_at | TIMESTAMP | Data elaborazione |

### Tabella `user_sessions`
Gestione sessioni utente:

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | UUID | ID univoco sessione |
| user_id | UUID | Riferimento a users.id |
| session_token | TEXT | Token sessione (unique) |
| expires_at | TIMESTAMP | Scadenza sessione (7 giorni) |
| created_at | TIMESTAMP | Data creazione |

---

## 🔒 Sicurezza Implementata

### Password Hashing
- ✅ Password hashate con **bcrypt** (10 rounds)
- ✅ Password mai salvate in chiaro
- ✅ Hash non reversibile

### Row Level Security (RLS)
- ✅ Utenti vedono solo i propri dati
- ✅ Policy SQL per protezione a livello database
- ✅ Impossibile accedere a dati di altri utenti via API

### Session Management
- ✅ Token sessione univoci e sicuri
- ✅ Scadenza automatica dopo 7 giorni
- ✅ Cleanup automatico sessioni scadute

### API Routes
- ✅ Autenticazione via Bearer token
- ✅ Validazione input su tutti gli endpoint
- ✅ Error handling completo
- ✅ Service role key solo server-side (mai esposta al client)

---

## 🧪 Test del Sistema

### Test Registrazione
1. Vai su `/signup`
2. Compila form con email valida e password (min 6 caratteri)
3. Clicca "Registrati"
4. ✅ Dovresti essere reindirizzato a `/dashboard` con messaggio di benvenuto

### Test Login
1. Vai su `/login`
2. Inserisci email e password del test precedente
3. Clicca "Accedi"
4. ✅ Dovresti vedere la dashboard con statistiche

### Test Dashboard
Nella dashboard dovresti vedere:
- ✅ Nome utente e email
- ✅ Badge "Sconto 5% Attivo"
- ✅ 4 card statistiche (tutte a 0 per nuovo utente)
- ✅ Tabs: Panoramica, Cronologia, Preferiti, Impostazioni

### Test Logout
1. Clicca pulsante "Logout" in alto a destra
2. ✅ Reindirizzamento a homepage
3. Prova ad accedere a `/dashboard`
4. ✅ Dovresti essere reindirizzato a `/login`

### Verifica Database (opzionale)
1. Apri Supabase Dashboard > Table Editor > users
2. ✅ Vedi utente con `password_hash` (non password in chiaro)
3. ✅ `has_discount` è `true`
4. ✅ `images_processed` è `0`
5. Vai su Table Editor > user_sessions
6. ✅ Vedi sessione attiva con `expires_at` futuro

---

## 📈 Monitoraggio e Manutenzione

### Dashboard Supabase
Accedi regolarmente a [app.supabase.com](https://app.supabase.com) per:

- **Table Editor**: Visualizza e modifica dati utenti
- **SQL Editor**: Esegui query personalizzate
- **Database**: Monitora dimensioni e performance
- **Auth**: (opzionale) Gestisci utenti
- **Logs**: Visualizza errori e accessi API

### Controlli Periodici

**Ogni Settimana:**
- Controlla spazio database utilizzato (max 500 MB free tier)
- Verifica numero utenti attivi (max 50K free tier)

**Ogni Mese:**
- Cleanup sessioni scadute (automatico, ma verifica)
- Backup dati (Supabase fa backup automatici, ma puoi esportare)

### Query Utili

**Conta utenti totali:**
```sql
SELECT COUNT(*) FROM users;
```

**Utenti registrati ultimi 7 giorni:**
```sql
SELECT COUNT(*) FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days';
```

**Sessioni attive:**
```sql
SELECT COUNT(*) FROM user_sessions 
WHERE expires_at > NOW();
```

**Cleanup sessioni scadute (manuale):**
```sql
DELETE FROM user_sessions 
WHERE expires_at < NOW();
```

---

## 🚨 Troubleshooting

### Errore: "Missing Supabase environment variables"
- ✅ Verifica di aver aggiornato `.env.local` con le tue credenziali
- ✅ Riavvia il server: `Ctrl+C` e poi `npm run dev`

### Errore: "Failed to create user"
- ✅ Verifica di aver eseguito `migrations/setup-database.sql` in Supabase
- ✅ Controlla che la tabella `users` esista in Table Editor

### Errore: "Invalid or expired session"
- ✅ Fai logout e login di nuovo
- ✅ Cancella localStorage del browser (F12 > Application > Local Storage > Clear)

### Errore: "Password must be at least 6 characters"
- ✅ Usa password di almeno 6 caratteri (consigliato 8+)

### Login non funziona
- ✅ Verifica email e password corrette
- ✅ Controlla in Supabase Table Editor > users se l'utente esiste
- ✅ Prova a registrare nuovo utente

### Dashboard non carica
- ✅ Apri DevTools (F12) > Console e cerca errori
- ✅ Verifica sessione valida in Local Storage
- ✅ Prova logout e login di nuovo

---

## 🎯 Prossimi Passi

Una volta che il database è funzionante:

1. **Testa Produzione**: Fai deploy su Vercel con le variabili d'ambiente Supabase
2. **Configura Email**: Aggiungi servizio email per reset password (SendGrid, Resend)
3. **Aggiungi Analytics Avanzati**: Traccia tool usati, conversion rate, etc.
4. **Implementa Pagamenti**: Integra Stripe per upgrade piano Pro/Business
5. **Backup Periodici**: Esporta database settimanalmente come precauzione

---

## 📞 Supporto

**Risorse Supabase:**
- 📚 Documentazione: https://supabase.com/docs
- 💬 Discord Community: https://discord.supabase.com
- 🐛 GitHub Issues: https://github.com/supabase/supabase/issues

**MegaPixelAI:**
- Il sistema è già configurato e pronto all'uso
- Tutte le API routes sono implementate
- Password hashate con bcrypt
- Session management completo
- RLS attivo per sicurezza dati

**Buon lavoro! 🚀**
