// Sistema di limiti d'uso per tool gratuiti e PRO
// Piano gratuito senza registrazione: molto generoso per convincere a registrarsi

export const USAGE_LIMITS = {
    // Piano gratuito SENZA registrazione (generoso ma limitato per incentivare registrazione)
    GUEST: {
        // Tool PRO - 5 utilizzi al giorno per tutti (generoso ma limitato)
        'rimozione-sfondo-ai': {
            daily: 5, // 5 immagini al giorno
            monthly: 50, // 50 immagini al mese
            fileSize: 5 * 1024 * 1024, // 5MB max
        },
        'generazione-immagini-ai': {
            daily: 5, // 5 immagini al giorno
            monthly: 50, // 50 immagini al mese
        },
        'clean-noise-ai': {
            daily: 5, // 5 audio al giorno
            monthly: 50, // 50 audio al mese
            fileSize: 10 * 1024 * 1024, // 10MB max
        },
        'ocr-avanzato-ai': {
            daily: 5, // 5 documenti al giorno
            monthly: 50, // 50 documenti al mese
            fileSize: 10 * 1024 * 1024, // 10MB max
        },
        'traduzione-documenti-ai': {
            daily: 5, // 5 documenti al giorno
            monthly: 50, // 50 documenti al mese
            fileSize: 10 * 1024 * 1024, // 10MB max
        },
        'elabora-e-riassumi': {
            daily: 5, // 5 testi al giorno
            monthly: 50, // 50 testi al mese
            maxLength: 5000, // 5000 caratteri max
        },
        'thumbnail-generator': {
            daily: 5, // 5 thumbnail al giorno
            monthly: 50, // 50 thumbnail al mese
        },
        'upscaler-ai': {
            daily: 5, // 5 immagini al giorno
            monthly: 50, // 50 immagini al mese
            fileSize: 5 * 1024 * 1024, // 5MB max
        },
        // Tool gratuiti - limiti molto generosi
        'trascrizione-audio': {
            daily: 10, // 10 audio al giorno
            monthly: 200, // 200 audio al mese
            fileSize: 25 * 1024 * 1024, // 25MB max
        },
        'riassunto-testo': {
            daily: 20, // 20 testi al giorno
            monthly: 500, // 500 testi al mese
            maxLength: 10000, // 10000 caratteri max
        },
        'traduci-testo': {
            daily: 50, // 50 traduzioni al giorno
            monthly: 1000, // 1000 traduzioni al mese
            maxLength: 5000, // 5000 caratteri max
        },
        'correttore-grammaticale': {
            daily: 30, // 30 testi al giorno
            monthly: 500, // 500 testi al mese
            maxLength: 5000, // 5000 caratteri max
        },
        'combina-splitta-pdf': {
            daily: 20, // 20 operazioni al giorno
            monthly: 300, // 300 operazioni al mese
            fileSize: 50 * 1024 * 1024, // 50MB max
        },
    },
    
    // Piano gratuito CON registrazione (ancora più generoso)
    FREE: {
        'rimozione-sfondo-ai': {
            daily: 50, // 50 immagini al giorno
            monthly: 1000, // 1000 immagini al mese
            fileSize: 10 * 1024 * 1024, // 10MB max
        },
        'generazione-immagini-ai': {
            daily: 20, // 20 immagini al giorno
            monthly: 300, // 300 immagini al mese
        },
        'clean-noise-ai': {
            daily: 20, // 20 audio al giorno
            monthly: 400, // 400 audio al mese
            fileSize: 25 * 1024 * 1024, // 25MB max
        },
        'ocr-avanzato-ai': {
            daily: 50, // 50 documenti al giorno
            monthly: 1000, // 1000 documenti al mese
            fileSize: 25 * 1024 * 1024, // 25MB max
        },
        'traduzione-documenti-ai': {
            daily: 20, // 20 documenti al giorno
            monthly: 400, // 400 documenti al mese
            fileSize: 25 * 1024 * 1024, // 25MB max
        },
        'elabora-e-riassumi': {
            daily: 50, // 50 testi al giorno
            monthly: 1000, // 1000 testi al mese
            maxLength: 20000, // 20000 caratteri max
        },
        'thumbnail-generator': {
            daily: 50, // 50 thumbnail al giorno
            monthly: 1000, // 1000 thumbnail al mese
        },
        'upscaler-ai': {
            daily: 100, // 100 immagini al giorno
            monthly: 2000, // 2000 immagini al mese
            fileSize: 25 * 1024 * 1024, // 25MB max
        },
        'trascrizione-audio': {
            daily: 50, // 50 audio al giorno
            monthly: 1000, // 1000 audio al mese
            fileSize: 50 * 1024 * 1024, // 50MB max
        },
        'riassunto-testo': {
            daily: 100, // 100 testi al giorno
            monthly: 2000, // 2000 testi al mese
            maxLength: 50000, // 50000 caratteri max
        },
        'traduci-testo': {
            daily: 200, // 200 traduzioni al giorno
            monthly: 5000, // 5000 traduzioni al mese
            maxLength: 20000, // 20000 caratteri max
        },
        'correttore-grammaticale': {
            daily: 100, // 100 testi al giorno
            monthly: 2000, // 2000 testi al mese
            maxLength: 20000, // 20000 caratteri max
        },
        'combina-splitta-pdf': {
            daily: 100, // 100 operazioni al giorno
            monthly: 2000, // 2000 operazioni al mese
            fileSize: 100 * 1024 * 1024, // 100MB max
        },
    },
    
    // Piano PRO (illimitato o limiti molto alti)
    PRO: {
        'rimozione-sfondo-ai': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 50 * 1024 * 1024, // 50MB max
        },
        'generazione-immagini-ai': {
            daily: 100, // 100 immagini al giorno
            monthly: 2000, // 2000 immagini al mese
        },
        'clean-noise-ai': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 100 * 1024 * 1024, // 100MB max
        },
        'ocr-avanzato-ai': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 100 * 1024 * 1024, // 100MB max
        },
        'traduzione-documenti-ai': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 100 * 1024 * 1024, // 100MB max
        },
        'elabora-e-riassumi': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            maxLength: -1, // Illimitato
        },
        'thumbnail-generator': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
        },
        'upscaler-ai': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 100 * 1024 * 1024, // 100MB max
        },
        'trascrizione-audio': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 200 * 1024 * 1024, // 200MB max
        },
        'riassunto-testo': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            maxLength: -1, // Illimitato
        },
        'traduci-testo': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            maxLength: -1, // Illimitato
        },
        'correttore-grammaticale': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            maxLength: -1, // Illimitato
        },
        'combina-splitta-pdf': {
            daily: -1, // Illimitato
            monthly: -1, // Illimitato
            fileSize: 500 * 1024 * 1024, // 500MB max
        },
    },
};

/**
 * Ottiene i limiti per un tool specifico in base al piano utente
 * @param {string} toolSlug - Slug del tool
 * @param {string} userPlan - Piano utente: 'GUEST', 'FREE', 'PRO'
 * @returns {Object|null} Limiti del tool o null se non trovato
 */
export function getToolLimits(toolSlug, userPlan = 'GUEST') {
    const planLimits = USAGE_LIMITS[userPlan] || USAGE_LIMITS.GUEST;
    return planLimits[toolSlug] || null;
}

/**
 * Verifica se un utente può usare un tool
 * @param {string} toolSlug - Slug del tool
 * @param {string} userPlan - Piano utente
 * @param {Object} usageStats - Statistiche uso corrente (daily, monthly)
 * @param {Object} fileInfo - Info file (size, length, etc.)
 * @returns {Object} { allowed: boolean, reason: string }
 */
export function canUseTool(toolSlug, userPlan = 'GUEST', usageStats = {}, fileInfo = {}) {
    const limits = getToolLimits(toolSlug, userPlan);
    
    if (!limits) {
        return { allowed: true, reason: 'Nessun limite configurato' };
    }
    
    // Verifica limite giornaliero
    if (limits.daily !== -1 && usageStats.daily >= limits.daily) {
        return {
            allowed: false,
            reason: `Hai raggiunto il limite giornaliero di ${limits.daily} utilizzi. Riprova domani o passa a PRO per limiti più alti.`,
            limitType: 'daily',
            current: usageStats.daily,
            max: limits.daily,
        };
    }
    
    // Verifica limite mensile
    if (limits.monthly !== -1 && usageStats.monthly >= limits.monthly) {
        return {
            allowed: false,
            reason: `Hai raggiunto il limite mensile di ${limits.monthly} utilizzi. Passa a PRO per limiti più alti.`,
            limitType: 'monthly',
            current: usageStats.monthly,
            max: limits.monthly,
        };
    }
    
    // Verifica dimensione file
    if (limits.fileSize && fileInfo.size && fileInfo.size > limits.fileSize) {
        const maxMB = (limits.fileSize / (1024 * 1024)).toFixed(0);
        return {
            allowed: false,
            reason: `File troppo grande. Dimensione massima: ${maxMB}MB. Passa a PRO per file più grandi.`,
            limitType: 'fileSize',
            current: fileInfo.size,
            max: limits.fileSize,
        };
    }
    
    // Verifica lunghezza testo
    if (limits.maxLength && fileInfo.length && fileInfo.length > limits.maxLength) {
        return {
            allowed: false,
            reason: `Testo troppo lungo. Lunghezza massima: ${limits.maxLength} caratteri. Passa a PRO per testi più lunghi.`,
            limitType: 'maxLength',
            current: fileInfo.length,
            max: limits.maxLength,
        };
    }
    
    return { allowed: true, reason: 'OK' };
}

/**
 * Ottiene il messaggio di upgrade per un tool
 * @param {string} toolSlug - Slug del tool
 * @param {string} currentPlan - Piano corrente
 * @returns {string} Messaggio di upgrade
 */
export function getUpgradeMessage(toolSlug, currentPlan = 'GUEST') {
    const limits = getToolLimits(toolSlug, currentPlan);
    const proLimits = getToolLimits(toolSlug, 'PRO');
    
    if (!limits || !proLimits) {
        return 'Passa a PRO per funzionalità avanzate!';
    }
    
    const messages = [];
    
    if (limits.daily !== -1 && proLimits.daily === -1) {
        messages.push('utilizzi illimitati');
    } else if (limits.daily < proLimits.daily) {
        messages.push(`${proLimits.daily} utilizzi al giorno`);
    }
    
    if (limits.fileSize && proLimits.fileSize && limits.fileSize < proLimits.fileSize) {
        const maxMB = (proLimits.fileSize / (1024 * 1024)).toFixed(0);
        messages.push(`file fino a ${maxMB}MB`);
    }
    
    if (limits.maxLength && proLimits.maxLength === -1) {
        messages.push('testi di lunghezza illimitata');
    }
    
    if (messages.length === 0) {
        return 'Passa a PRO per funzionalità avanzate!';
    }
    
    return `Passa a PRO per ${messages.join(', ')} e molto altro!`;
}

export default {
    USAGE_LIMITS,
    getToolLimits,
    canUseTool,
    getUpgradeMessage,
};

