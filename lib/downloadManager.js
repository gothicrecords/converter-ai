// Download Manager - Gestione coda download, riprendi download interrotti, cronologia

class DownloadManager {
  constructor() {
    this.queue = [];
    this.activeDownloads = new Map();
    this.history = [];
    this.maxConcurrent = 3; // Max download simultanei
    this.listeners = new Set();
    
    // Carica cronologia da localStorage
    this.loadHistory();
    
    // Carica coda da sessionStorage (persiste durante la sessione)
    this.loadQueue();
    
    // Riprendi download interrotti al caricamento
    this.resumeInterruptedDownloads();
  }

  // Carica cronologia da localStorage
  loadHistory() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('download_history');
      this.history = stored ? JSON.parse(stored) : [];
      
      // Mantieni solo ultimi 100 download
      if (this.history.length > 100) {
        this.history = this.history.slice(0, 100);
        this.saveHistory();
      }
    } catch (error) {
      console.error('Error loading download history:', error);
      this.history = [];
    }
  }

  // Salva cronologia in localStorage
  saveHistory() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('download_history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving download history:', error);
    }
  }

  // Carica coda da sessionStorage
  loadQueue() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = sessionStorage.getItem('download_queue');
      if (stored) {
        const queueData = JSON.parse(stored);
        // Ripristina solo download pending (non quelli in corso)
        this.queue = queueData.filter(item => item.status === 'pending');
      }
    } catch (error) {
      console.error('Error loading download queue:', error);
    }
  }

  // Salva coda in sessionStorage
  saveQueue() {
    if (typeof window === 'undefined') return;
      
    try {
      const queueToSave = this.queue.map(item => ({
        ...item,
        // Non salvare blob/object URL
        url: item.urlType === 'blob' ? null : item.url,
        blob: null
      }));
      sessionStorage.setItem('download_queue', JSON.stringify(queueToSave));
    } catch (error) {
      console.error('Error saving download queue:', error);
    }
  }

  // Aggiungi listener per aggiornamenti
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifica tutti i listener
  notify() {
    this.listeners.forEach(callback => {
      try {
        callback({
          queue: [...this.queue],
          activeDownloads: Array.from(this.activeDownloads.values()),
          history: [...this.history]
        });
      } catch (error) {
        console.error('Error in download manager listener:', error);
      }
    });
  }

  // Aggiungi download alla coda
  addDownload({ url, filename, tool, metadata = {} }) {
    const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const downloadItem = {
      id: downloadId,
      url,
      filename: filename || `download_${Date.now()}`,
      tool: tool || 'Unknown',
      metadata,
      status: 'pending',
      progress: 0,
      speed: 0,
      size: 0,
      downloaded: 0,
      startTime: null,
      endTime: null,
      error: null,
      urlType: url.startsWith('blob:') ? 'blob' : 'url',
      createdAt: new Date().toISOString()
    };

    this.queue.push(downloadItem);
    this.saveQueue();
    this.notify();
    
    // Avvia download se c'è spazio
    this.processQueue();
    
    return downloadId;
  }

  // Processa la coda download
  async processQueue() {
    // Conta download attivi
    const activeCount = Array.from(this.activeDownloads.values())
      .filter(d => d.status === 'downloading').length;
    
    if (activeCount >= this.maxConcurrent) {
      return;
    }

    // Trova prossimo download pending
    const nextDownload = this.queue.find(item => item.status === 'pending');
    if (!nextDownload) {
      return;
    }

    // Avvia download
    this.startDownload(nextDownload.id);
  }

  // Avvia un download
  async startDownload(downloadId) {
    const downloadItem = this.queue.find(item => item.id === downloadId);
    if (!downloadItem || downloadItem.status !== 'pending') {
      return;
    }

    downloadItem.status = 'downloading';
    downloadItem.startTime = new Date().toISOString();
    this.activeDownloads.set(downloadId, downloadItem);
    this.saveQueue();
    this.notify();

    try {
      // Se è un blob URL, scarica direttamente
      if (downloadItem.urlType === 'blob') {
        await this.downloadBlob(downloadItem);
      } else {
        // Download da URL con progress tracking
        await this.downloadFromUrl(downloadItem);
      }
    } catch (error) {
      downloadItem.status = 'failed';
      downloadItem.error = error.message;
      downloadItem.endTime = new Date().toISOString();
      this.saveQueue();
      this.notify();
      
      // Rimuovi da active dopo 5 secondi
      setTimeout(() => {
        this.activeDownloads.delete(downloadId);
        this.notify();
      }, 5000);
    }
  }

  // Download da blob URL
  async downloadBlob(downloadItem) {
    try {
      const response = await fetch(downloadItem.url);
      const blob = await response.blob();
      
      // Crea link e scarica
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadItem.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup dopo un delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      // Aggiorna stato
      downloadItem.status = 'completed';
      downloadItem.progress = 100;
      downloadItem.size = blob.size;
      downloadItem.downloaded = blob.size;
      downloadItem.endTime = new Date().toISOString();
      
      // Aggiungi a cronologia
      this.addToHistory(downloadItem);
      
      // Rimuovi da coda e active
      this.queue = this.queue.filter(item => item.id !== downloadItem.id);
      this.activeDownloads.delete(downloadItem.id);
      this.saveQueue();
      this.notify();
      
      // Processa prossimo download
      this.processQueue();
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  // Download da URL con progress tracking
  async downloadFromUrl(downloadItem) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          downloadItem.progress = Math.round(progress);
          downloadItem.size = e.total;
          downloadItem.downloaded = e.loaded;
          
          // Calcola velocità
          if (downloadItem.startTime) {
            const elapsed = (Date.now() - new Date(downloadItem.startTime).getTime()) / 1000;
            downloadItem.speed = e.loaded / elapsed;
          }
          
          this.notify();
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response]);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadItem.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          
          downloadItem.status = 'completed';
          downloadItem.progress = 100;
          downloadItem.endTime = new Date().toISOString();
          
          this.addToHistory(downloadItem);
          this.queue = this.queue.filter(item => item.id !== downloadItem.id);
          this.activeDownloads.delete(downloadItem.id);
          this.saveQueue();
          this.notify();
          
          this.processQueue();
          resolve();
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Download cancelled'));
      });

      xhr.open('GET', downloadItem.url);
      xhr.responseType = 'blob';
      xhr.send();
      
      // Salva xhr per poterlo cancellare
      downloadItem._xhr = xhr;
    });
  }

  // Riprendi download interrotto
  resumeDownload(downloadId) {
    const downloadItem = this.queue.find(item => item.id === downloadId);
    if (!downloadItem) {
      // Cerca nella cronologia
      const historyItem = this.history.find(item => item.id === downloadId);
      if (historyItem && historyItem.status === 'failed') {
        // Ricrea download dalla cronologia
        const newDownload = {
          ...historyItem,
          id: `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'pending',
          progress: 0,
          error: null,
          startTime: null,
          endTime: null
        };
        this.queue.push(newDownload);
        this.saveQueue();
        this.notify();
        this.processQueue();
        return newDownload.id;
      }
      return null;
    }

    if (downloadItem.status === 'failed' || downloadItem.status === 'paused') {
      downloadItem.status = 'pending';
      downloadItem.error = null;
      this.saveQueue();
      this.notify();
      this.processQueue();
      return downloadId;
    }

    return null;
  }

  // Pausa download (solo per URL, non blob)
  pauseDownload(downloadId) {
    const downloadItem = this.activeDownloads.get(downloadId);
    if (downloadItem && downloadItem._xhr) {
      downloadItem._xhr.abort();
      downloadItem.status = 'paused';
      downloadItem._xhr = null;
      this.activeDownloads.delete(downloadId);
      this.saveQueue();
      this.notify();
      this.processQueue();
      return true;
    }
    return false;
  }

  // Cancella download
  cancelDownload(downloadId) {
    // Se è in corso, fermalo
    const activeItem = this.activeDownloads.get(downloadId);
    if (activeItem && activeItem._xhr) {
      activeItem._xhr.abort();
      activeItem._xhr = null;
    }

    // Rimuovi da coda
    this.queue = this.queue.filter(item => item.id !== downloadId);
    this.activeDownloads.delete(downloadId);
    this.saveQueue();
    this.notify();
    
    // Processa prossimo download
    this.processQueue();
  }

  // Aggiungi a cronologia
  addToHistory(downloadItem) {
    const historyEntry = {
      id: downloadItem.id,
      filename: downloadItem.filename,
      tool: downloadItem.tool,
      metadata: downloadItem.metadata,
      status: downloadItem.status,
      size: downloadItem.size,
      createdAt: downloadItem.createdAt,
      completedAt: downloadItem.endTime || new Date().toISOString(),
      error: downloadItem.error
    };

    this.history.unshift(historyEntry);
    
    // Mantieni solo ultimi 100
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
    
    this.saveHistory();
  }

  // Riprendi download interrotti al caricamento
  resumeInterruptedDownloads() {
    if (typeof window === 'undefined') return;
    
    // Cerca download con status 'downloading' nella coda
    const interrupted = this.queue.filter(item => item.status === 'downloading');
    interrupted.forEach(item => {
      item.status = 'pending';
      item.error = null;
    });
    
    if (interrupted.length > 0) {
      this.saveQueue();
      this.notify();
      this.processQueue();
    }
  }

  // Ottieni stato corrente
  getState() {
    return {
      queue: [...this.queue],
      activeDownloads: Array.from(this.activeDownloads.values()),
      history: [...this.history],
      stats: {
        pending: this.queue.filter(item => item.status === 'pending').length,
        downloading: Array.from(this.activeDownloads.values())
          .filter(item => item.status === 'downloading').length,
        completed: this.history.filter(item => item.status === 'completed').length,
        failed: this.history.filter(item => item.status === 'failed').length
      }
    };
  }

  // Pulisci cronologia
  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.notify();
  }

  // Rimuovi elemento dalla cronologia
  removeFromHistory(downloadId) {
    this.history = this.history.filter(item => item.id !== downloadId);
    this.saveHistory();
    this.notify();
  }
}

// Singleton instance
let downloadManagerInstance = null;

export function getDownloadManager() {
  if (typeof window === 'undefined') {
    // Server-side: ritorna mock object
    return {
      addDownload: () => {},
      resumeDownload: () => {},
      pauseDownload: () => {},
      cancelDownload: () => {},
      addListener: () => () => {},
      getState: () => ({ queue: [], activeDownloads: [], history: [], stats: {} }),
      clearHistory: () => {},
      removeFromHistory: () => {}
    };
  }

  if (!downloadManagerInstance) {
    downloadManagerInstance = new DownloadManager();
  }
  
  return downloadManagerInstance;
}

// Utility per formattare dimensioni file
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Utility per formattare velocità
export function formatSpeed(bytesPerSecond) {
  if (!bytesPerSecond) return '0 B/s';
  return formatFileSize(bytesPerSecond) + '/s';
}

// Utility per formattare tempo rimanente
export function formatTimeRemaining(downloaded, total, speed) {
  if (!speed || speed === 0 || !total) return '--';
  
  const remaining = total - downloaded;
  const seconds = Math.ceil(remaining / speed);
  
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

