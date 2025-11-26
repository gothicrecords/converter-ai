"""
Watchdog Service - Sistema di monitoraggio e auto-restart 24/7
Mantiene il servizio sempre attivo con auto-recovery
"""
import asyncio
import logging
import time
import subprocess
import signal
import sys
import os
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import json

logger = logging.getLogger(__name__)


class ProcessWatchdog:
    """Watchdog per mantenere il processo sempre attivo"""
    
    def __init__(
        self,
        restart_delay: int = 5,
        max_restarts: int = 10,
        restart_window: int = 3600,  # 1 ora
        health_check_interval: int = 30,
        health_check_url: str = "http://localhost:8000/health",
    ):
        self.restart_delay = restart_delay
        self.max_restarts = max_restarts
        self.restart_window = restart_window
        self.health_check_interval = health_check_interval
        self.health_check_url = health_check_url
        
        self.process: Optional[subprocess.Popen] = None
        self.restart_count = 0
        self.restart_times = []
        self.is_running = False
        self.should_stop = False
        
        # Log file per monitoraggio
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        self.status_file = self.log_dir / "watchdog_status.json"
        
    def start_process(self) -> bool:
        """Avvia il processo FastAPI"""
        try:
            # Determina il comando da eseguire
            port = os.getenv("PORT", "8000")
            workers = os.getenv("WORKERS", "1")
            
            cmd = [
                sys.executable,
                "-m", "uvicorn",
                "backend.main:app",
                "--host", "0.0.0.0",
                "--port", str(port),
                "--workers", str(workers),
                "--log-level", "info",
                "--access-log",
                "--no-server-header",
            ]
            
            logger.info(f"Avvio processo: {' '.join(cmd)}")
            
            # Avvia il processo con stdout/stderr redirect
            log_file = self.log_dir / f"backend_{datetime.now().strftime('%Y%m%d')}.log"
            
            with open(log_file, "a") as f:
                self.process = subprocess.Popen(
                    cmd,
                    stdout=f,
                    stderr=subprocess.STDOUT,
                    cwd=os.getcwd(),
                    env=os.environ.copy(),
                    preexec_fn=None if sys.platform == "win32" else os.setsid,
                )
            
            logger.info(f"Processo avviato con PID: {self.process.pid}")
            self._save_status({"pid": self.process.pid, "started_at": datetime.now().isoformat()})
            return True
            
        except Exception as e:
            logger.error(f"Errore nell'avvio del processo: {e}", exc_info=True)
            return False
    
    def stop_process(self, timeout: int = 10):
        """Ferma il processo gracefully"""
        if not self.process:
            return
        
        try:
            logger.info(f"Arresto processo PID: {self.process.pid}")
            
            if sys.platform == "win32":
                self.process.terminate()
            else:
                # Invia SIGTERM al gruppo di processi
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
            
            # Attendi la terminazione
            try:
                self.process.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                logger.warning("Processo non terminato, forza kill...")
                if sys.platform == "win32":
                    self.process.kill()
                else:
                    os.killpg(os.getpgid(self.process.pid), signal.SIGKILL)
                self.process.wait()
            
            logger.info("Processo terminato")
            
        except ProcessLookupError:
            logger.warning("Processo già terminato")
        except Exception as e:
            logger.error(f"Errore nell'arresto del processo: {e}", exc_info=True)
        finally:
            self.process = None
    
    def check_health(self) -> bool:
        """Verifica lo stato di salute del servizio"""
        try:
            import httpx
            
            response = httpx.get(
                self.health_check_url,
                timeout=5,
                follow_redirects=True
            )
            return response.status_code == 200
            
        except Exception as e:
            logger.debug(f"Health check fallito: {e}")
            return False
    
    def can_restart(self) -> bool:
        """Verifica se è possibile riavviare (rate limiting)"""
        now = time.time()
        
        # Rimuovi restart vecchi (fuori dalla finestra temporale)
        self.restart_times = [t for t in self.restart_times if now - t < self.restart_window]
        
        # Verifica limite restart
        if len(self.restart_times) >= self.max_restarts:
            logger.error(f"Limite restart raggiunto ({self.max_restarts} in {self.restart_window}s)")
            return False
        
        return True
    
    def restart_process(self) -> bool:
        """Riavvia il processo"""
        if not self.can_restart():
            logger.error("Impossibile riavviare: limite restart raggiunto")
            return False
        
        self.restart_count += 1
        self.restart_times.append(time.time())
        
        logger.warning(f"Riavvio processo (restart #{self.restart_count})...")
        
        self.stop_process()
        
        logger.info(f"Attesa {self.restart_delay}s prima del riavvio...")
        time.sleep(self.restart_delay)
        
        return self.start_process()
    
    def _save_status(self, status: Dict[str, Any]):
        """Salva lo stato del watchdog"""
        try:
            current_status = {
                "watchdog": {
                    "restart_count": self.restart_count,
                    "last_restart": self.restart_times[-1] if self.restart_times else None,
                    "is_running": self.is_running,
                    "timestamp": datetime.now().isoformat(),
                },
                "process": status,
            }
            
            with open(self.status_file, "w") as f:
                json.dump(current_status, f, indent=2)
        except Exception as e:
            logger.error(f"Errore nel salvataggio status: {e}")
    
    async def monitor_loop(self):
        """Loop principale di monitoraggio"""
        self.is_running = True
        
        # Avvia il processo iniziale
        if not self.start_process():
            logger.error("Impossibile avviare il processo iniziale")
            return
        
        last_health_check = 0
        
        try:
            while not self.should_stop:
                await asyncio.sleep(1)
                
                # Verifica se il processo è ancora attivo
                if self.process:
                    return_code = self.process.poll()
                    
                    if return_code is not None:
                        logger.error(f"Processo terminato inaspettatamente con codice: {return_code}")
                        if not self.should_stop:
                            if not self.restart_process():
                                logger.error("Impossibile riavviare il processo. Uscita...")
                                break
                        continue
                
                # Health check periodico
                current_time = time.time()
                if current_time - last_health_check >= self.health_check_interval:
                    last_health_check = current_time
                    
                    if self.process and self.process.poll() is None:
                        health_ok = self.check_health()
                        
                        if not health_ok:
                            logger.warning("Health check fallito, verifica del processo...")
                            # Non riavviare subito, potrebbe essere un problema temporaneo
                            # Ma registra l'evento
                
        except KeyboardInterrupt:
            logger.info("Ricevuto interrupt, arresto...")
        except Exception as e:
            logger.error(f"Errore nel loop di monitoraggio: {e}", exc_info=True)
        finally:
            self.is_running = False
            self.stop_process()
            logger.info("Watchdog fermato")
    
    def stop(self):
        """Arresta il watchdog"""
        logger.info("Arresto watchdog richiesto...")
        self.should_stop = True


# Singleton instance
_watchdog_instance: Optional[ProcessWatchdog] = None


def get_watchdog() -> ProcessWatchdog:
    """Ottieni l'istanza singleton del watchdog"""
    global _watchdog_instance
    
    if _watchdog_instance is None:
        _watchdog_instance = ProcessWatchdog()
    
    return _watchdog_instance

