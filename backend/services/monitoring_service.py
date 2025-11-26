"""
Monitoring Service - Servizio di monitoraggio avanzato per produzione 24/7
"""
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path
import json

# Psutil è opzionale, gestisce il caso in cui non sia installato
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logging.warning("psutil non disponibile, metriche di sistema limitate")

logger = logging.getLogger(__name__)


class SystemMonitor:
    """Monitoraggio delle risorse di sistema"""
    
    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0
        self.uptime_history = []
        
    def get_system_metrics(self) -> Dict[str, Any]:
        """Ottieni metriche di sistema"""
        metrics = {
            "uptime": {
                "seconds": int(time.time() - self.start_time),
                "hours": (time.time() - self.start_time) / 3600,
            },
            "requests": {
                "total": self.request_count,
                "errors": self.error_count,
                "error_rate": self.error_count / max(self.request_count, 1),
            },
        }
        
        # Aggiungi metriche psutil se disponibile
        if PSUTIL_AVAILABLE:
            try:
                process = psutil.Process()
                
                metrics.update({
                    "cpu": {
                        "percent": psutil.cpu_percent(interval=0.1),
                        "count": psutil.cpu_count(),
                    },
                    "memory": {
                        "total": psutil.virtual_memory().total,
                        "available": psutil.virtual_memory().available,
                        "percent": psutil.virtual_memory().percent,
                        "used": psutil.virtual_memory().used,
                        "process_memory_mb": process.memory_info().rss / 1024 / 1024,
                    },
                    "disk": {
                        "total": psutil.disk_usage("/").total if Path("/").exists() else 0,
                        "used": psutil.disk_usage("/").used if Path("/").exists() else 0,
                        "percent": psutil.disk_usage("/").percent if Path("/").exists() else 0,
                    },
                })
            except Exception as e:
                logger.error(f"Errore nel recupero metriche psutil: {e}")
                metrics["psutil_error"] = str(e)
        else:
            metrics["psutil"] = "not_available"
        
        return metrics
    
    def record_request(self, success: bool = True):
        """Registra una richiesta"""
        self.request_count += 1
        if not success:
            self.error_count += 1
    
    def get_health_status(self) -> Dict[str, Any]:
        """Ottieni stato di salute completo"""
        metrics = self.get_system_metrics()
        
        # Valuta lo stato di salute
        health_status = "healthy"
        warnings = []
        
        # Controlla memoria
        if metrics.get("memory", {}).get("percent", 0) > 90:
            health_status = "degraded"
            warnings.append("High memory usage")
        
        # Controlla CPU
        if metrics.get("cpu", {}).get("percent", 0) > 95:
            health_status = "degraded"
            warnings.append("High CPU usage")
        
        # Controlla error rate
        error_rate = metrics.get("requests", {}).get("error_rate", 0)
        if error_rate > 0.1:  # 10% error rate
            health_status = "degraded"
            warnings.append("High error rate")
        
        return {
            "status": health_status,
            "timestamp": datetime.now().isoformat(),
            "metrics": metrics,
            "warnings": warnings,
        }


# Singleton instance
_monitor_instance: Optional[SystemMonitor] = None


def get_monitor() -> SystemMonitor:
    """Ottieni l'istanza singleton del monitor"""
    global _monitor_instance
    
    if _monitor_instance is None:
        _monitor_instance = SystemMonitor()
    
    return _monitor_instance

