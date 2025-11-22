# ⚡ Quick Start: Indicizzare il Sito su Google

## 🎯 Passi Rapidi (5 minuti)

### 1. Configura Google Search Console

1. Vai su [Google Search Console](https://search.google.com/search-console)
2. Aggiungi la proprietà del tuo sito
3. Google ti mostrerà le opzioni di verifica:
   - **Se vedi "Verifica tramite meta tag"**: Vai al Passo 2A
   - **Se vedi solo "Verifica tramite DNS"**: Vai al Passo 2B (guida DNS)

### 2A. Verifica tramite Meta Tag (se disponibile)

**Se usi Vercel:**
1. Copia il codice di verifica da Google (es: `ABC123XYZ789...`)
2. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
3. Seleziona il tuo progetto → **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name**: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value**: `ABC123XYZ789...` (il codice che hai copiato)
5. Seleziona tutti gli ambienti → **Save**
6. **Riavvia il deployment**

### 2B. Verifica tramite DNS (se richiesto da Google)

**Per Vercel con dominio gestito da Vercel:**
1. Google ti darà un record TXT da aggiungere (es: `google-site-verification=ABC123XYZ789...`)
2. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
3. Seleziona il progetto → **Settings** → **Domains**
4. Clicca sul tuo dominio → **DNS Records**
5. Clicca **"Add Record"**:
   - **Type**: `TXT`
   - **Name**: `@` (o lascia vuoto)
   - **Value**: Il valore completo di Google (es: `ABC123XYZ789...`)
6. Salva e attendi 5-30 minuti per la propagazione

**Se il dominio è gestito esternamente** (Cloudflare, Namecheap, ecc.):
Vedi la guida completa: [VERIFICA_DNS_VERCEL.md](./VERIFICA_DNS_VERCEL.md)

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

- **Guida completa**: [GOOGLE_SEARCH_CONSOLE_SETUP.md](./GOOGLE_SEARCH_CONSOLE_SETUP.md)
- **Verifica DNS su Vercel**: [VERIFICA_DNS_VERCEL.md](./VERIFICA_DNS_VERCEL.md) ⭐ **LEGGI QUESTA se Google richiede verifica DNS**

