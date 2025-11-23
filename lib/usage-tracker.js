// Sistema di tracking degli usi per limiti gratuiti/PRO
// Usa storage in-memory (in produzione si può usare database)

const usageStore = new Map(); // { userId: { toolSlug: { daily: count, monthly: count, lastReset: date } } }

/**
 * Ottiene le statistiche di uso per un utente e tool
 * @param {string} userId - ID utente (o 'guest' per utenti non registrati)
 * @param {string} toolSlug - Slug del tool
 * @returns {Object} { daily: number, monthly: number }
 */
export function getUsageStats(userId = 'guest', toolSlug) {
    const userKey = userId || 'guest';
    
    if (!usageStore.has(userKey)) {
        usageStore.set(userKey, {});
    }
    
    const userUsage = usageStore.get(userKey);
    
    if (!userUsage[toolSlug]) {
        userUsage[toolSlug] = {
            daily: 0,
            monthly: 0,
            lastDailyReset: new Date().toDateString(),
            lastMonthlyReset: new Date().getMonth(),
        };
    }
    
    const toolUsage = userUsage[toolSlug];
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    
    // Reset giornaliero se necessario
    if (toolUsage.lastDailyReset !== today) {
        toolUsage.daily = 0;
        toolUsage.lastDailyReset = today;
    }
    
    // Reset mensile se necessario
    if (toolUsage.lastMonthlyReset !== thisMonth) {
        toolUsage.monthly = 0;
        toolUsage.lastMonthlyReset = thisMonth;
    }
    
    return {
        daily: toolUsage.daily || 0,
        monthly: toolUsage.monthly || 0,
    };
}

/**
 * Incrementa il contatore di uso per un tool
 * @param {string} userId - ID utente
 * @param {string} toolSlug - Slug del tool
 */
export function incrementUsage(userId = 'guest', toolSlug) {
    const userKey = userId || 'guest';
    
    if (!usageStore.has(userKey)) {
        usageStore.set(userKey, {});
    }
    
    const userUsage = usageStore.get(userKey);
    
    if (!userUsage[toolSlug]) {
        userUsage[toolSlug] = {
            daily: 0,
            monthly: 0,
            lastDailyReset: new Date().toDateString(),
            lastMonthlyReset: new Date().getMonth(),
        };
    }
    
    const toolUsage = userUsage[toolSlug];
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    
    // Reset se necessario
    if (toolUsage.lastDailyReset !== today) {
        toolUsage.daily = 0;
        toolUsage.lastDailyReset = today;
    }
    
    if (toolUsage.lastMonthlyReset !== thisMonth) {
        toolUsage.monthly = 0;
        toolUsage.lastMonthlyReset = thisMonth;
    }
    
    // Incrementa contatori
    toolUsage.daily = (toolUsage.daily || 0) + 1;
    toolUsage.monthly = (toolUsage.monthly || 0) + 1;
}

/**
 * Ottiene il piano utente (per ora semplificato, in produzione si legge dal database)
 * @param {Object} req - Request object (opzionale)
 * @returns {string} Piano utente: 'GUEST', 'FREE', 'PRO'
 */
export function getUserPlan(req = null) {
    // TODO: In produzione, leggere dal database o dalla sessione
    // Per ora ritorna sempre 'GUEST' (utente non registrato)
    
    if (req && req.headers && req.headers['x-user-id']) {
        // Se c'è un user ID, potresti controllare il piano dal database
        // Per ora assumiamo FREE se registrato
        return 'FREE';
    }
    
    return 'GUEST';
}

/**
 * Ottiene l'ID utente dalla richiesta
 * @param {Object} req - Request object
 * @returns {string} User ID o 'guest'
 */
export function getUserId(req = null) {
    if (req && req.headers && req.headers['x-user-id']) {
        return req.headers['x-user-id'];
    }
    
    // In produzione, potresti usare session/cookie
    return 'guest';
}

export default {
    getUsageStats,
    incrementUsage,
    getUserPlan,
    getUserId,
};

