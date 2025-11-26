#!/usr/bin/env python3
"""
Script principale per avviare il backend con watchdog 24/7
Mantiene il servizio sempre attivo con auto-restart automatico
"""
import asyncio
import logging
import signal
import sys
from pathlib import Path

# Configura logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/watchdog.log"),
    ],
)

logger = logging.getLogger(__name__)

# Importa watchdog dopo la configurazione del logging
from backend.services.watchdog_service import get_watchdog


def setup_signal_handlers(watchdog):
    """Configura gestori di segnali per shutdown graceful"""
    
    def signal_handler(signum, frame):
        logger.info(f"Ricevuto segnale {signum}, arresto watchdog...")
        watchdog.stop()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    if sys.platform != "win32":
        signal.signal(signal.SIGHUP, signal_handler)


async def main():
    """Funzione principale"""
    # Crea directory logs se non esiste
    Path("logs").mkdir(exist_ok=True)
    
    logger.info("=" * 60)
    logger.info("Avvio Watchdog per Backend FastAPI 24/7")
    logger.info("=" * 60)
    
    # Ottieni istanza watchdog
    watchdog = get_watchdog()
    
    # Configura gestori segnali
    setup_signal_handlers(watchdog)
    
    # Avvia loop di monitoraggio
    try:
        await watchdog.monitor_loop()
    except KeyboardInterrupt:
        logger.info("Interrupt da tastiera, arresto...")
    except Exception as e:
        logger.error(f"Errore critico nel watchdog: {e}", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("Watchdog terminato")


if __name__ == "__main__":
    # Verifica che siamo nella directory corretta
    if not Path("backend").exists():
        logger.error("Directory 'backend' non trovata. Esegui lo script dalla root del progetto.")
        sys.exit(1)
    
    # Avvia il programma
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Arresto richiesto dall'utente")
        sys.exit(0)

