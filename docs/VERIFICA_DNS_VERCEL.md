# 🔐 Guida: Verifica DNS su Vercel per Google Search Console

Se Google Search Console ti permette solo la verifica tramite DNS, ecco come configurarla su Vercel.

## 📋 Prerequisiti

- Account Vercel attivo
- Dominio configurato su Vercel (o accesso al provider DNS)
- Accesso a Google Search Console

## 🎯 Passo 1: Ottieni il Record TXT da Google

1. Vai su [Google Search Console](https://search.google.com/search-console)
2. Aggiungi la proprietà del tuo sito
3. Seleziona **"Verifica tramite DNS"** o **"DNS verification"**
4. Google ti mostrerà un record TXT da aggiungere, simile a:
   ```
   google-site-verification=ABC123XYZ789...
   ```
5. **Copia il valore completo** (tutto quello dopo `google-site-verification=`)

## 🔧 Passo 2: Configura il Record TXT su Vercel

### Opzione A: Dominio Gestito da Vercel (CONSIGLIATO)

Se il tuo dominio è gestito direttamente da Vercel:

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Domains**
4. Clicca sul dominio che vuoi verificare
5. Scorri fino a **"DNS Records"** o **"DNS Configuration"**
6. Clicca su **"Add Record"** o **"Aggiungi Record"**
7. Configura il record:
   - **Type**: Seleziona `TXT`
   - **Name**: Lascia vuoto o inserisci `@` (per il dominio principale)
   - **Value**: Incolla il valore che Google ti ha dato (es: `ABC123XYZ789...`)
   - **TTL**: Lascia il default (3600) o imposta a 3600
8. Clicca su **"Save"** o **"Salva"**

### Opzione B: Dominio Gestito da Provider Esterno

Se il tuo dominio è gestito da un provider DNS esterno (es: Cloudflare, Namecheap, GoDaddy):

#### Per Cloudflare:
1. Accedi al tuo account Cloudflare
2. Seleziona il dominio
3. Vai su **DNS** → **Records**
4. Clicca su **"Add record"**
5. Configura:
   - **Type**: `TXT`
   - **Name**: `@` (o lascia vuoto per il dominio principale)
   - **Content**: Il valore di Google (es: `ABC123XYZ789...`)
   - **TTL**: Auto o 3600
6. Salva

#### Per Namecheap:
1. Accedi al tuo account Namecheap
2. Vai su **Domain List** → Seleziona il dominio
3. Clicca su **"Advanced DNS"**
4. Nella sezione **"Host Records"**, clicca su **"Add New Record"**
5. Configura:
   - **Type**: `TXT Record`
   - **Host**: `@`
   - **Value**: Il valore di Google
   - **TTL**: Automatic (o 3600)
6. Salva

#### Per GoDaddy:
1. Accedi al tuo account GoDaddy
2. Vai su **My Products** → **DNS**
3. Nella sezione **"Records"**, clicca su **"Add"**
4. Configura:
   - **Type**: `TXT`
   - **Name**: `@`
   - **Value**: Il valore di Google
   - **TTL**: 600 (o 3600)
5. Salva

#### Per altri provider:
1. Accedi al pannello di controllo del tuo provider DNS
2. Trova la sezione per gestire i record DNS
3. Aggiungi un nuovo record TXT:
   - **Nome/Host**: `@` o lascia vuoto (per il dominio principale)
   - **Valore/Content**: Il valore che Google ti ha dato
   - **TTL**: 3600 (o il default)

## ⏱️ Passo 3: Attendi la Propagazione DNS

Dopo aver aggiunto il record TXT:

1. **Attendi 5-30 minuti** per la propagazione DNS
   - La propagazione può richiedere fino a 48 ore, ma di solito è molto più veloce
   - Puoi verificare la propagazione usando [whatsmydns.net](https://www.whatsmydns.net/#TXT/)

2. **Verifica il record TXT** usando un tool online:
   - Vai su [MXToolbox](https://mxtoolbox.com/TXTLookup.aspx)
   - Inserisci il tuo dominio
   - Clicca su **"TXT Lookup"**
   - Dovresti vedere il record `google-site-verification=ABC123XYZ789...`

## ✅ Passo 4: Verifica su Google Search Console

1. Torna su Google Search Console
2. Clicca su **"Verifica"** o **"Verify"**
3. Se il record TXT è stato propagato correttamente, vedrai un messaggio di successo ✅

## 🔍 Risoluzione Problemi

### Il record TXT non viene trovato

**Possibili cause:**
1. **Propagazione DNS non completata**: Attendi più tempo (fino a 48 ore)
2. **Record TXT configurato male**: Verifica che il valore sia esatto (senza spazi extra)
3. **Dominio sbagliato**: Assicurati di aver aggiunto il record al dominio corretto

**Soluzioni:**
- Verifica il record usando [whatsmydns.net](https://www.whatsmydns.net/#TXT/)
- Controlla che il valore sia identico a quello fornito da Google
- Se usi un subdomain (es: `www.`), aggiungi il record anche per quello

### Vercel non mostra l'opzione DNS

Se Vercel non ti permette di aggiungere record DNS direttamente:

1. **Verifica chi gestisce il DNS del dominio:**
   - Vai su [Vercel Dashboard](https://vercel.com/dashboard)
   - Settings → Domains
   - Controlla se il dominio è gestito da Vercel o da un provider esterno

2. **Se il dominio è gestito esternamente:**
   - Devi aggiungere il record TXT nel pannello del tuo provider DNS
   - Vercel non può gestire record DNS per domini esterni

### Record TXT già esistente

Se hai già un record TXT per Google Search Console:

1. **Modifica il record esistente** invece di crearne uno nuovo
2. Aggiungi il nuovo valore alla fine del valore esistente (separato da spazio o nuova riga)
3. Oppure sostituisci il valore esistente con quello nuovo

## 📝 Esempio di Configurazione

**Record TXT da aggiungere:**
```
Type: TXT
Name: @
Value: google-site-verification=ABC123XYZ789abcdefghijklmnopqrstuvwxyz1234567890
TTL: 3600
```

**Nota**: Il valore completo include `google-site-verification=` seguito dal codice.

## 🎯 Dopo la Verifica

Una volta verificato il dominio:

1. **Invia la sitemap**:
   - Vai su "Sitemap" in Google Search Console
   - Inserisci: `sitemap.xml`
   - Clicca su "Invia"

2. **Richiedi l'indicizzazione** delle pagine principali (opzionale ma consigliato)

3. **Monitora le metriche** in Google Search Console

## 🔗 Link Utili

- [Google Search Console](https://search.google.com/search-console)
- [Vercel DNS Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Verifica propagazione DNS](https://www.whatsmydns.net/#TXT/)
- [MXToolbox TXT Lookup](https://mxtoolbox.com/TXTLookup.aspx)

## ✅ Checklist

- [ ] Record TXT ottenuto da Google Search Console
- [ ] Record TXT aggiunto nel DNS (Vercel o provider esterno)
- [ ] Atteso 5-30 minuti per la propagazione
- [ ] Verificato il record TXT usando un tool online
- [ ] Verificato il dominio su Google Search Console
- [ ] Sitemap inviata a Google
- [ ] Pagine principali richieste per l'indicizzazione

## 💡 Suggerimenti

- **Usa un tool di verifica DNS** prima di cliccare "Verifica" su Google per evitare errori
- **Salva il valore del record TXT** in un posto sicuro, potrebbe servirti in futuro
- **Non eliminare il record TXT** dopo la verifica, Google lo usa periodicamente per verificare la proprietà

