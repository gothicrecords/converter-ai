// LocalStorage history manager

const HISTORY_KEY = 'megapixelai_history';
const MAX_HISTORY_ITEMS = 5;

export const saveToHistory = (item) => {
    try {
        const history = getHistory();
        
        const newItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            tool: item.tool,
            filename: item.filename,
            thumbnail: item.thumbnail, // base64 preview
            params: item.params,
            result: item.result // URL or base64
        };

        // Add to beginning and limit to MAX_HISTORY_ITEMS
        const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        
        return newItem.id;
    } catch (error) {
        console.error('Error saving to history:', error);
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
