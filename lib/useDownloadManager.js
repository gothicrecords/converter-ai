import { useState, useEffect, useCallback } from 'react';
import { getDownloadManager } from './downloadManager';

export function useDownloadManager() {
  const [state, setState] = useState(() => {
    const manager = getDownloadManager();
    return manager.getState();
  });

  useEffect(() => {
    const manager = getDownloadManager();
    
    const unsubscribe = manager.addListener((newState) => {
      setState(manager.getState());
    });

    // Aggiorna stato iniziale
    setState(manager.getState());

    return unsubscribe;
  }, []);

  const addDownload = useCallback((options) => {
    const manager = getDownloadManager();
    return manager.addDownload(options);
  }, []);

  const resumeDownload = useCallback((downloadId) => {
    const manager = getDownloadManager();
    return manager.resumeDownload(downloadId);
  }, []);

  const pauseDownload = useCallback((downloadId) => {
    const manager = getDownloadManager();
    return manager.pauseDownload(downloadId);
  }, []);

  const cancelDownload = useCallback((downloadId) => {
    const manager = getDownloadManager();
    manager.cancelDownload(downloadId);
  }, []);

  const clearHistory = useCallback(() => {
    const manager = getDownloadManager();
    manager.clearHistory();
  }, []);

  const removeFromHistory = useCallback((downloadId) => {
    const manager = getDownloadManager();
    manager.removeFromHistory(downloadId);
  }, []);

  return {
    ...state,
    addDownload,
    resumeDownload,
    pauseDownload,
    cancelDownload,
    clearHistory,
    removeFromHistory
  };
}

