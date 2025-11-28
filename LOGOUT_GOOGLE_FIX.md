# Logout con Google - Correzioni Applicate

## Problema Originale
Il logout con Google OAuth non gestiva correttamente i cookie di sessione, causando problemi con la persistenza della sessione.

## Modifiche Apportate

### 1. **Endpoint `/api/auth/logout`** (auth.py)
- ✅ Aggiunto supporto per i cookie di sessione oltre all'header Authorization
- ✅ Gestione idempotente: se non c'è token, restituisce comunque successo
- ✅ Cancellazione esplicita del cookie `megapixelai_session`
- ✅ Supporto per token da Cookie e Header simultaneamente

**Comportamento:**
```python
# Prova a prendere il token dall'header Authorization (Bearer token)
# Se non presente, prova a prenderlo dal cookie megapixelai_session
# Cancella sempre il cookie nella risposta
# Elimina la sessione dal database se presente
```

### 2. **Endpoint `/api/auth/session`** (auth.py)
- ✅ Aggiunto supporto per leggere il token da cookie
- ✅ Priorità: Header Authorization → Cookie megapixelai_session

### 3. **Endpoint `/api/auth/login`** (auth.py)
- ✅ Impostazione automatica del cookie di sessione dopo il login
- ✅ Cookie configurato con: httponly=True, samesite="lax", max_age=7 giorni

### 4. **Endpoint `/api/auth/signup`** (auth.py)
- ✅ Impostazione automatica del cookie di sessione dopo la registrazione
- ✅ Stessa configurazione sicura del login

### 5. **Endpoint `/api/auth/oauth/google/callback`** (oauth.py)
- ✅ Già configurato correttamente per impostare il cookie
- ✅ Redirect a `/dashboard?welcome=true` con cookie impostato

## Flusso Completo

### Login con Google OAuth:
1. User clicca "Login con Google"
2. Redirect a Google per autenticazione
3. Google callback con il codice
4. Backend scambia il codice per access_token
5. Backend ottiene info utente da Google
6. Backend crea/aggiorna utente nel database
7. Backend crea sessione e imposta cookie `megapixelai_session`
8. Redirect a `/dashboard?welcome=true`

### Logout:
1. User clicca "Logout"
2. Frontend chiama `POST /api/auth/logout`
3. Backend legge token da Header o Cookie
4. Backend elimina sessione dal database
5. Backend cancella cookie `megapixelai_session` nella risposta
6. Frontend redirect a homepage/login

## Cookie di Sessione

Nome: `megapixelai_session`
Configurazione:
- `httponly`: true (non accessibile da JavaScript)
- `samesite`: lax (protezione CSRF)
- `max_age`: 604800 secondi (7 giorni)
- `path`: / (valido per tutto il sito)

## Testing

Per testare il logout:

1. **Login con Google**
   ```
   GET /api/auth/oauth/google
   ```

2. **Verificare la sessione**
   ```
   GET /api/auth/session
   Cookie: megapixelai_session=<token>
   ```

3. **Logout**
   ```
   POST /api/auth/logout
   Cookie: megapixelai_session=<token>
   ```

4. **Verificare che la sessione sia stata eliminata**
   ```
   GET /api/auth/session
   Cookie: megapixelai_session=<token>
   # Dovrebbe restituire 401 Unauthorized
   ```

## Compatibilità

Il sistema ora supporta:
- ✅ Token nell'header Authorization (per API/mobile)
- ✅ Token in cookie (per browser web)
- ✅ Entrambi simultaneamente (priorità all'header)

## Note di Sicurezza

- I cookie sono `httponly` per prevenire accesso da JavaScript malevolo
- `samesite=lax` protegge da attacchi CSRF
- Le sessioni hanno scadenza di 7 giorni
- Il logout cancella sia il cookie che la sessione nel database
