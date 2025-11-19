# 🚀 Setup Supabase - Guida Rapida

## ✅ Hai già le credenziali nel `.env.local`!

Le tue variabili sono già configurate:
- `NEXT_PUBLIC_SUPABASE_URL` = https://ckctyvebrkcemcgllpbc.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ✅ Presente
- `SUPABASE_SERVICE_ROLE_KEY` = ✅ Presente

## 📋 PASSO 1: Crea le Tabelle Database

1. Vai su **Supabase Dashboard**: https://app.supabase.com/project/ckctyvebrkcemcgllpbc

2. Nel menu laterale clicca su **"SQL Editor"**

3. Clicca su **"New Query"**

4. Copia e incolla TUTTO il contenuto del file `migrations/setup-database.sql`

5. Clicca su **"Run"** in basso a destra

6. Dovresti vedere: ✅ **"Success. No rows returned"**

---

## 🔓 PASSO 2: Disabilita RLS (Row Level Security) per Test

**IMPORTANTE**: Le tabelle hanno RLS attivo di default, ma le policy usano `auth.uid()` che funziona solo con Supabase Auth (noi usiamo custom auth).

### Opzione A: Disabilita RLS (per iniziare velocemente)

Nel SQL Editor, esegui:

```sql
-- Disabilita RLS per permettere accesso via REST API
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
```

### Opzione B: Aggiorna le Policy (più sicuro)

Nel SQL Editor, esegui:

```sql
-- Rimuovi le policy esistenti
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own history" ON user_history;
DROP POLICY IF EXISTS "Users can insert their own history" ON user_history;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- Permetti accesso con service_role key (usata dalle API)
-- Le API routes usano SUPABASE_SERVICE_ROLE_KEY che bypassa RLS
-- Quindi possiamo semplicemente disabilitare RLS o lasciare le policy vuote
```

**Consiglio**: Usa Opzione A per testare velocemente, poi implementa Opzione B in produzione.

---

## 🧪 PASSO 3: Testa la Registrazione

1. **Avvia il server locale**:
   ```bash
   npm run dev
   ```

2. **Vai su**: http://localhost:3000/signup

3. **Registra un account di test**:
   - Nome: Test User
   - Email: test@test.com
   - Password: test123456

4. **Controlla Supabase**:
   - Vai su: https://app.supabase.com/project/ckctyvebrkcemcgllpbc/editor
   - Clicca sulla tabella **"users"**
   - Dovresti vedere il nuovo utente! ✅

---

## 🔍 PASSO 4: Verifica nel Browser

Apri **DevTools Console (F12)** e controlla:

- ✅ Nessun errore di CORS
- ✅ Nessun errore 401/403
- ✅ Response 200 da `/api/auth/signup`

Se vedi errori:
- **404**: Le tabelle non esistono → Ripeti PASSO 1
- **401/403**: RLS attivo o chiavi sbagliate → Ripeti PASSO 2
- **409**: Email già registrata → Usa un'altra email

---

## 🎯 PASSO 5: Testa il Login

1. Vai su: http://localhost:3000/login

2. Usa le credenziali create:
   - Email: test@test.com
   - Password: test123456

3. Se funziona, verrai reindirizzato a `/dashboard` ✅

---

## ⚠️ Troubleshooting Comuni

### Errore: "relation users does not exist"
**Causa**: Tabelle non create
**Soluzione**: Esegui `migrations/setup-database.sql` nel SQL Editor di Supabase

### Errore: "new row violates row-level security policy"
**Causa**: RLS attivo con policy incompatibili
**Soluzione**: Disabilita RLS (vedi PASSO 2, Opzione A)

### Errore: "Invalid API key"
**Causa**: Chiavi sbagliate nel `.env.local`
**Soluzione**: Controlla che le chiavi siano corrette da Supabase Dashboard → Settings → API

### Errore: "Email already registered"
**Causa**: Email già usata in test precedenti
**Soluzione**: Usa un'altra email o elimina il record esistente:
```sql
DELETE FROM users WHERE email = 'test@test.com';
```

---

## ✅ Checklist Finale

- [ ] Eseguito `migrations/setup-database.sql` nel SQL Editor
- [ ] Disabilitato RLS o aggiornato le policy
- [ ] Verificato le tabelle esistono (users, user_history, user_sessions)
- [ ] Testato registrazione con successo
- [ ] Testato login con successo
- [ ] Visto l'utente nel database Supabase

---

## 🚀 Dopo il Setup

Una volta che tutto funziona:

1. **Deploy su Vercel**:
   - Aggiungi le stesse variabili `.env.local` su Vercel:
   - Dashboard → Project → Settings → Environment Variables
   - Copia: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

2. **Testa in produzione**:
   - Vai su: https://tuo-dominio.vercel.app/signup
   - Registra un account
   - Controlla il database Supabase

3. **Abilita RLS in produzione**:
   - Crea policy più sicure usando `user_id` invece di `auth.uid()`
   - Le API verificano il session_token e passano il user_id corretto

---

## 📚 Link Utili

- **Supabase Dashboard**: https://app.supabase.com/project/ckctyvebrkcemcgllpbc
- **SQL Editor**: https://app.supabase.com/project/ckctyvebrkcemcgllpbc/sql
- **Table Editor**: https://app.supabase.com/project/ckctyvebrkcemcgllpbc/editor
- **API Settings**: https://app.supabase.com/project/ckctyvebrkcemcgllpbc/settings/api

---

✨ **Fatto! Il tuo sistema di autenticazione è pronto!** ✨
