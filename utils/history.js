// LocalStorage history manager

const HISTORY_KEY = 'megapixelai_history';
const MAX_HISTORY_ITEMS = 3; // Ridotto per evitare problemi di quota
const MAX_THUMBNAIL_SIZE = 50000; // Max 50KB per thumbnail (circa 200x200px)
const MAX_TOTAL_SIZE = 2 * 1024 * 1024; // Max 2MB totali per localStorage

// Funzione per ridurre la dimensione di un'immagine base64
const compressThumbnail = (base64String, maxSize = MAX_THUMBNAIL_SIZE) => {
    if (!base64String || typeof base64String !== 'string') return null;
    
    // Se è già piccolo, restituiscilo così com'è
    const currentSize = new Blob([base64String]).size;
    if (currentSize <= maxSize) return base64String;
    
    // Se è troppo grande, restituisci null (non salvare)
    // In alternativa, potresti implementare una compressione più avanzata
    return null;
};

// Controlla la dimensione totale della history
const checkStorageSize = () => {
    try {
        const history = getHistory();
        const totalSize = new Blob([JSON.stringify(history)]).size;
        return totalSize;
    } catch (error) {
        return 0;
    }
};

export const saveToHistory = (item) => {
    try {
        // Controlla se abbiamo spazio disponibile
        const currentSize = checkStorageSize();
        if (currentSize > MAX_TOTAL_SIZE) {
            console.warn('History storage limit reached, clearing old items');
            // Rimuovi gli elementi più vecchi fino a quando non c'è spazio
            const history = getHistory();
            while (checkStorageSize() > MAX_TOTAL_SIZE * 0.7 && history.length > 0) {
                history.pop(); // Rimuovi l'elemento più vecchio
                try {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                } catch (e) {
                    // Se ancora non c'è spazio, svuota tutto
                    clearHistory();
                    break;
                }
            }
        }
        
        const history = getHistory();
        
        // Comprimi il thumbnail se presente
        const compressedThumbnail = item.thumbnail ? compressThumbnail(item.thumbnail) : null;
        
        // Non salvare il result se è troppo grande (solo URL o null)
        let result = item.result;
        if (result && typeof result === 'string' && result.startsWith('data:')) {
            // Se è un data URL e troppo grande, non salvarlo
            const resultSize = new Blob([result]).size;
            if (resultSize > 500000) { // Se più di 500KB, non salvare
                result = null;
            }
        }
        
        const newItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            tool: item.tool,
            filename: item.filename,
            thumbnail: compressedThumbnail, // thumbnail compresso o null
            params: item.params,
            result: result // URL o null (non salvare immagini base64 grandi)
        };

        // Add to beginning and limit to MAX_HISTORY_ITEMS
        const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
        
        // Prova a salvare, se fallisce per quota, rimuovi elementi più vecchi
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (quotaError) {
            console.warn('Quota exceeded, trying to free space');
            // Rimuovi metà degli elementi più vecchi
            const reducedHistory = updatedHistory.slice(0, Math.floor(MAX_HISTORY_ITEMS / 2));
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(reducedHistory));
            } catch (e) {
                // Se ancora non funziona, svuota tutto
                clearHistory();
                console.error('Could not save to history, storage full');
                return null;
            }
        }
        
        return newItem.id;
    } catch (error) {
        console.error('Error saving to history:', error);
        // Se è un errore di quota, prova a pulire
        if (error.name === 'QuotaExceededError') {
            clearHistory();
            console.warn('History cleared due to quota exceeded');
        }
        return null;
    }
};

export const getHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
};

export const clearHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
};

// Pulisci automaticamente la history se è troppo grande (chiama all'avvio)
export const cleanupHistory = () => {
    try {
        const history = getHistory();
        const currentSize = checkStorageSize();
        
        if (currentSize > MAX_TOTAL_SIZE || history.length > MAX_HISTORY_ITEMS) {
            // Mantieni solo gli elementi più recenti
            const cleanedHistory = history
                .slice(0, MAX_HISTORY_ITEMS)
                .map(item => ({
                    ...item,
                    // Rimuovi result se troppo grande
                    result: item.result && typeof item.result === 'string' && item.result.startsWith('data:') && new Blob([item.result]).size > 500000 
                        ? null 
                        : item.result,
                    // Comprimi thumbnail se troppo grande
                    thumbnail: item.thumbnail ? compressThumbnail(item.thumbnail) : null
                }));
            
            localStorage.setItem(HISTORY_KEY, JSON.stringify(cleanedHistory));
            console.log('History cleaned up');
        }
    } catch (error) {
        console.error('Error cleaning up history:', error);
        // Se c'è ancora un errore, svuota tutto
        if (error.name === 'QuotaExceededError') {
            clearHistory();
        }
    }
};

export const removeHistoryItem = (id) => {
    try {
        const history = getHistory();
        const updatedHistory = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return true;
    } catch (error) {
        console.error('Error removing history item:', error);
        return false;
    }
};

export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
};
