# Implementazione Tool PRO e Sistema di Limiti

## Panoramica

Sistema completo per gestire tool PRO a pagamento con limiti generosi per utenti gratuiti (con e senza registrazione) per incentivare la registrazione.

## Tool PRO Implementati

I seguenti tool sono marcati come PRO e hanno limiti d'uso:

1. **Rimozione Sfondo AI** ✅
2. **Generazione Immagini AI** ✅
3. **Clean Noise AI** ✅
4. **OCR Avanzato AI** ✅
5. **Traduzione Documenti AI** ✅
6. **Elabora e Riassumi** ✅
7. **Thumbnail Generator** ✅

## Sistema di Limiti

### Piano GUEST (Senza Registrazione) - Molto Generoso

**Tool PRO:**
- Rimozione Sfondo: 10/giorno, 100/mese, max 5MB
- Generazione Immagini: 5/giorno, 50/mese
- Clean Noise: 5/giorno, 50/mese, max 10MB
- OCR Avanzato: 10/giorno, 100/mese, max 10MB
- Traduzione Documenti: 5/giorno, 50/mese, max 10MB
- Elabora e Riassumi: 10/giorno, 100/mese, max 5000 caratteri
- Thumbnail Generator: 10/giorno, 100/mese

**Tool Gratuiti:**
- Upscaler: 20/giorno, 500/mese, max 10MB
- Trascrizione Audio: 10/giorno, 200/mese, max 25MB
- Riassunto Testo: 20/giorno, 500/mese, max 10000 caratteri
- Traduci Testo: 50/giorno, 1000/mese, max 5000 caratteri
- Correttore Grammaticale: 30/giorno, 500/mese, max 5000 caratteri
- Combina/Splitta PDF: 20/giorno, 300/mese, max 50MB

### Piano FREE (Con Registrazione) - Ancora Più Generoso

Tutti i limiti sono aumentati di 5-10x rispetto a GUEST per incentivare la registrazione.

### Piano PRO - Illimitato o Limiti Molto Alti

La maggior parte dei tool PRO sono illimitati, alcuni hanno limiti molto alti (es. Generazione Immagini: 100/giorno, 2000/mese).

## Componenti Creati

### 1. `lib/usage-limits.js`
Sistema di configurazione dei limiti per ogni tool e piano.

**Funzioni principali:**
- `getToolLimits(toolSlug, userPlan)` - Ottiene limiti per un tool
- `canUseTool(toolSlug, userPlan, usageStats, fileInfo)` - Verifica se può usare il tool
- `getUpgradeMessage(toolSlug, currentPlan)` - Messaggio di upgrade

### 2. `lib/usage-tracker.js`
Sistema di tracking degli usi (in-memory, in produzione usare database).

**Funzioni principali:**
- `getUsageStats(userId, toolSlug)` - Ottiene statistiche uso
- `incrementUsage(userId, toolSlug)` - Incrementa contatore
- `getUserPlan(req)` - Ottiene piano utente
- `getUserId(req)` - Ottiene ID utente

### 3. `components/ProBadge.js`
Componente badge PRO riutilizzabile.

## Integrazione nelle API

### Esempio: `pages/api/tools/translate-document.js`

```javascript
// Verifica limiti prima di processare
const limitCheck = canUseTool(toolSlug, userPlan, usageStats, fileInfo);
if (!limitCheck.allowed) {
    return res.status(403).json({
        error: limitCheck.reason,
        upgradeMessage: getUpgradeMessage(toolSlug, userPlan),
        requiresPro: true,
    });
}

// Incrementa contatore dopo successo
incrementUsage(userId, toolSlug);
```

## UI/UX

### Badge PRO
- Mostrato su card tool nella pagina `/tools`
- Mostrato nell'header della pagina tool
- Mostrato nel dropdown menu della navbar

### Messaggi di Upgrade
- Box informativo con limiti attuali
- Link diretto a `/pricing`
- Messaggi chiari su cosa si ottiene con PRO

## Prossimi Passi

1. **Integrare limiti in tutti i tool PRO**:
   - Rimozione Sfondo AI
   - Generazione Immagini AI
   - Clean Noise AI
   - OCR Avanzato AI
   - Elabora e Riassumi
   - Thumbnail Generator

2. **Database per tracking** (in produzione):
   - Sostituire `usage-tracker.js` in-memory con database
   - Salvare statistiche persistenti
   - Aggiungere analytics

3. **Sistema di autenticazione**:
   - Integrare con sistema auth esistente
   - Leggere piano utente dal database
   - Gestire sessioni utente

4. **Dashboard utente**:
   - Mostrare statistiche uso
   - Mostrare limiti rimanenti
   - Link per upgrade a PRO

## Note

- I limiti GUEST sono **molto generosi** per convincere a provare i tool
- I limiti FREE sono **ancora più generosi** per incentivare la registrazione
- I limiti PRO sono **illimitati o molto alti** per giustificare il prezzo
- Il sistema è progettato per essere facilmente estendibile

