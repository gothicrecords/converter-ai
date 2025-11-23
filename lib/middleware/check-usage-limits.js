// Middleware helper per verificare limiti d'uso nei tool PRO
import { canUseTool, getUpgradeMessage } from '../usage-limits.js';
import { getUsageStats, getUserPlan, getUserId } from '../usage-tracker.js';

/**
 * Middleware per verificare limiti d'uso prima di processare una richiesta
 * @param {Object} req - Request object
 * @param {string} toolSlug - Slug del tool
 * @param {Object} fileInfo - Info file (size, length, etc.)
 * @returns {Object|null} Errore se limite raggiunto, null se OK
 */
export function checkUsageLimits(req, toolSlug, fileInfo = {}) {
    const userId = getUserId(req);
    const userPlan = getUserPlan(req);
    const usageStats = getUsageStats(userId, toolSlug);
    
    const limitCheck = canUseTool(toolSlug, userPlan, usageStats, fileInfo);
    
    if (!limitCheck.allowed) {
        return {
            status: 403,
            error: limitCheck.reason,
            limitType: limitCheck.limitType,
            current: limitCheck.current,
            max: limitCheck.max,
            upgradeMessage: getUpgradeMessage(toolSlug, userPlan),
            requiresPro: true,
        };
    }
    
    return null; // OK, nessun limite raggiunto
}

/**
 * Wrapper per API handler che verifica automaticamente i limiti
 * @param {Function} handler - Handler function
 * @param {string} toolSlug - Slug del tool
 * @returns {Function} Wrapped handler
 */
export function withUsageLimits(handler, toolSlug) {
    return async (req, res) => {
        // Estrai info file dalla richiesta (se disponibile)
        let fileInfo = {};
        
        try {
            // Prova a leggere file info se è una richiesta multipart
            if (req.method === 'POST' && req.headers['content-type']?.includes('multipart')) {
                // Il file info verrà estratto dopo il parsing del form
                // Per ora lasciamo vuoto, verrà aggiornato dopo
            }
        } catch (e) {
            // Ignora errori
        }
        
        // Verifica limiti base (senza file info, verrà verificato dopo)
        const userId = getUserId(req);
        const userPlan = getUserPlan(req);
        const usageStats = getUsageStats(userId, toolSlug);
        
        const limitCheck = canUseTool(toolSlug, userPlan, usageStats, {});
        
        if (!limitCheck.allowed && limitCheck.limitType !== 'fileSize' && limitCheck.limitType !== 'maxLength') {
            return res.status(403).json({
                error: limitCheck.reason,
                limitType: limitCheck.limitType,
                current: limitCheck.current,
                max: limitCheck.max,
                upgradeMessage: getUpgradeMessage(toolSlug, userPlan),
                requiresPro: true,
            });
        }
        
        // Esegui handler originale
        return handler(req, res, { userId, userPlan, toolSlug });
    };
}

export default {
    checkUsageLimits,
    withUsageLimits,
};

