# ⚡ Quick Start: Indicizzare il Sito su Google

## 🎯 Passi Rapidi (5 minuti)

### 1. Configura Google Search Console

1. Vai su [Google Search Console](https://search.google.com/search-console)
2. Aggiungi la proprietà del tuo sito
3. Scegli **"Verifica tramite meta tag"**
4. Copia il codice di verifica (es: `ABC123XYZ789...`)

### 2. Aggiungi la Variabile d'Ambiente

**Se usi Vercel:**
1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name**: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value**: `ABC123XYZ789...` (il codice che hai copiato)
5. Seleziona tutti gli ambienti (Production, Preview, Development)
6. Clicca **Save**
7. **Riavvia il deployment**

**Se usi un altro hosting:**
1. Aggiungi nel file `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=ABC123XYZ789...
   ```
2. Riavvia il server

### 3. Verifica la Proprietà

1. Torna su Google Search Console
2. Clicca su **"Verifica"**
3. ✅ Dovresti vedere un messaggio di successo

### 4. Invia la Sitemap

1. In Google Search Console, vai su **"Sitemap"**
2. Inserisci: `sitemap.xml`
3. Clicca su **"Invia"**

### 5. Richiedi Indicizzazione (Opzionale ma Consigliato)

1. Vai su **"Ispezione URL"**
2. Inserisci l'URL della homepage
3. Clicca su **"Richiedi indicizzazione"**
4. Ripeti per le pagine principali

## ✅ Checklist

- [ ] Google Search Console configurato
- [ ] Variabile `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` aggiunta
- [ ] Sito riavviato dopo l'aggiunta della variabile
- [ ] Proprietà verificata in Google Search Console
- [ ] Sitemap inviata
- [ ] Pagine principali richieste per l'indicizzazione

## 📊 Tempi Attesi

- **Verifica**: Immediata (dopo aver aggiunto la variabile)
- **Prima indicizzazione**: 1-7 giorni
- **Indicizzazione completa**: 2-4 settimane

## 🔍 Verifica che Funzioni

1. Apri il sito nel browser
2. Fai clic destro → **"Visualizza sorgente pagina"**
3. Cerca `google-site-verification`
4. Dovresti vedere il meta tag con il tuo codice

## 📚 Documentazione Completa

Per una guida dettagliata, vedi: [GOOGLE_SEARCH_CONSOLE_SETUP.md](./GOOGLE_SEARCH_CONSOLE_SETUP.md)

