// History management utilities

export function getHistory() {
  if (typeof window === 'undefined') return [];
  
  const history = localStorage.getItem('usage_history');
  return history ? JSON.parse(history) : [];
}

export function addToHistory(item) {
  if (typeof window === 'undefined') return;
  
  const history = getHistory();
  const newItem = {
    ...item,
    timestamp: new Date().toISOString(),
    id: Date.now().toString()
  };
  
  history.unshift(newItem);
  
  // Keep only last 50 items
  const limitedHistory = history.slice(0, 50);
  localStorage.setItem('usage_history', JSON.stringify(limitedHistory));
  
  return newItem;
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('usage_history');
}

export function removeFromHistory(id) {
  if (typeof window === 'undefined') return;
  
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem('usage_history', JSON.stringify(filtered));
}

export function getHistoryByTool(toolName) {
  const history = getHistory();
  return history.filter(item => item.tool === toolName);
}

export function getRecentHistory(limit = 10) {
  const history = getHistory();
  return history.slice(0, limit);
}
