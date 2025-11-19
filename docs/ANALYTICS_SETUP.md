# 📊 Analytics Setup Completo

Questo documento spiega come configurare il sistema di analytics completo per il tuo sito su Vercel.

## 🎯 Cosa è stato implementato

### ✅ Google Analytics 4 (GA4)
- Tracking completo di pageviews
- Event tracking avanzato
- Conversion tracking
- Ecommerce tracking
- User properties tracking

### ✅ Google Tag Manager (GTM)
- Integrazione completa
- DataLayer events
- Custom tags support

### ✅ Vercel Analytics
- Speed Insights (già installato)
- Web Analytics (già installato)

### ✅ Web Vitals Tracking
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- TTFB (Time to First Byte)
- INP (Interaction to Next Paint)

### ✅ Event Tracking Avanzato
- File uploads
- Conversions
- Tool usage
- Downloads
- User actions (login, signup, logout)
- Button clicks
- Errors
- Performance metrics
- Session tracking
- Time on page

## 🚀 Setup Rapido

### 1. Configura Google Analytics 4

1. Vai su [Google Analytics](https://analytics.google.com/)
2. Crea una nuova proprietà GA4
3. Copia il **Measurement ID** (formato: `G-XXXXXXXXXX`)
4. Aggiungi la variabile d'ambiente in Vercel:
   - Nome: `NEXT_PUBLIC_GA_ID`
   - Valore: `G-XXXXXXXXXX`

### 2. Configura Google Tag Manager (Opzionale ma consigliato)

1. Vai su [Google Tag Manager](https://tagmanager.google.com/)
2. Crea un nuovo container
3. Copia il **Container ID** (formato: `GTM-XXXXXXX`)
4. Aggiungi la variabile d'ambiente in Vercel:
   - Nome: `NEXT_PUBLIC_GTM_ID`
   - Valore: `GTM-XXXXXXX`

### 3. Configurazione Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** > **Environment Variables**
4. Aggiungi le seguenti variabili:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NODE_ENV=production
```

5. **Redeploy** il progetto per applicare le modifiche

## 📝 Variabili d'Ambiente Richieste

### Obbligatorie per Analytics

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Tag Manager (opzionale)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Environment
NODE_ENV=production
```

**Nota:** Analytics funziona solo in produzione (`NODE_ENV=production`)

## 📊 Eventi Tracciati

### File Operations
- `file_upload` - Quando un file viene caricato
- `file_download` - Quando un file viene scaricato
- `conversion` - Quando una conversione viene completata

### Tool Usage
- `tool_start` - Quando un tool viene avviato
- `tool_complete` - Quando un tool completa con successo
- `tool_failed` - Quando un tool fallisce

### User Actions
- `sign_up` - Registrazione utente
- `login` - Login utente
- `logout` - Logout utente
- `button_click` - Click su pulsanti importanti

### Ecommerce
- `begin_checkout` - Inizio checkout
- `add_to_cart` - Aggiunta al carrello
- `purchase` - Acquisto completato

### Engagement
- `time_on_page` - Tempo speso su una pagina
- `search` - Ricerche effettuate
- `video_play` - Riproduzione video

### Errors
- `error` - Errori JavaScript
- `api_error` - Errori API
- `exception` - Eccezioni

### Performance
- `performance` - Metriche di performance
- Web Vitals automatici (CLS, FID, FCP, LCP, TTFB, INP)

## 🔍 Come Visualizzare i Dati

### Google Analytics 4

1. Vai su [Google Analytics](https://analytics.google.com/)
2. Seleziona la tua proprietà
3. Vai su **Reports** per vedere:
   - Realtime users
   - Pageviews
   - Events
   - Conversions
   - User demographics
   - Technology
   - Ecommerce

### Vercel Analytics

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Analytics** per vedere:
   - Pageviews
   - Unique visitors
   - Top pages
   - Referrers
   - Countries
   - Devices

### Google Tag Manager

1. Vai su [Google Tag Manager](https://tagmanager.google.com/)
2. Seleziona il tuo container
3. Vai su **Preview** per testare i tag
4. Vai su **Tags** per vedere tutti i tag configurati

## 🛠️ Utilizzo nel Codice

### Hook React (Consigliato)

```javascript
import useAnalytics from '../lib/useAnalytics';

function MyComponent() {
  const { trackEvent, trackFileUpload, trackConversion } = useAnalytics();
  
  const handleUpload = (file) => {
    trackFileUpload(file.type, file.size, 'My Tool');
  };
  
  return <div>...</div>;
}
```

### Import Diretto

```javascript
import * as analytics from '../lib/analytics';

// Track file upload
analytics.trackFileUpload('image/jpeg', 1024000, 'Image Upscaler');

// Track conversion
analytics.trackConversion('file_conversion', 'jpg', 'png', 1024000, 5000);

// Track error
analytics.trackError('Something went wrong', 'MyComponent', 'error_type');
```

## 📈 Metriche Disponibili su Vercel

Una volta configurato, potrai vedere su Vercel:

1. **Analytics Dashboard**
   - Pageviews giornalieri/settimanali/mensili
   - Utenti unici
   - Top pages
   - Top referrers
   - Top countries
   - Top devices
   - Top browsers

2. **Speed Insights**
   - Core Web Vitals
   - Performance scores
   - Real User Monitoring (RUM)

3. **Web Analytics**
   - Traffic patterns
   - User behavior
   - Conversion funnels

## 🔒 Privacy e GDPR

Il sistema di analytics rispetta le impostazioni di privacy:
- IP anonymization abilitata
- Cookie flags configurati per GDPR
- Nessun dato personale tracciato senza consenso

## 🐛 Troubleshooting

### Analytics non funziona

1. Verifica che `NODE_ENV=production`
2. Controlla che le variabili d'ambiente siano impostate correttamente
3. Verifica la console del browser per errori
4. Usa Google Tag Assistant per debug

### Eventi non appaiono in GA4

1. Aspetta 24-48 ore per i dati in GA4
2. Usa la sezione "Realtime" per vedere eventi immediati
3. Verifica che gli eventi siano inviati correttamente (Network tab)

### Web Vitals non tracciati

1. Verifica che `web-vitals` sia installato: `npm list web-vitals`
2. Controlla che il browser supporti Web Vitals API
3. Verifica la console per errori

## 📚 Risorse Utili

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Google Tag Manager Documentation](https://developers.google.com/tag-manager)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Web Vitals Documentation](https://web.dev/vitals/)

## ✅ Checklist Setup

- [ ] Creato account Google Analytics 4
- [ ] Ottenuto Measurement ID (G-XXXXXXXXXX)
- [ ] Creato container Google Tag Manager (opzionale)
- [ ] Ottenuto Container ID (GTM-XXXXXXX)
- [ ] Aggiunto variabili d'ambiente in Vercel
- [ ] Redeploy del progetto
- [ ] Verificato che analytics funzioni (Realtime in GA4)
- [ ] Configurato conversioni in GA4 (se necessario)
- [ ] Configurato ecommerce in GA4 (se necessario)

## 🎉 Fatto!

Ora hai un sistema di analytics completo che ti permetterà di:
- Vedere tutti i dati su Vercel Analytics
- Tracciare conversioni e revenue
- Monitorare performance e Web Vitals
- Analizzare comportamento utenti
- Ottimizzare il sito basandoti sui dati

Buon tracking! 📊

