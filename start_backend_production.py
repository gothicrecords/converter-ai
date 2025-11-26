#!/usr/bin/env python3
"""
Script di avvio per produzione - Con workers multipli e ottimizzazioni
Ottimizzato per hosting 24/7 su Railway, Heroku, AWS, etc.
"""
import os
import sys
import subprocess
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Avvia il server in modalità produzione"""
    # Configurazione per produzione
    # Railway imposta PORT automaticamente, usa quello se disponibile
    # Se non c'è PORT usa 8000 in locale
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    # Numero di workers (2-4x CPU cores, max 4 per limiti memoria)
    cpu_count = os.cpu_count() or 1
    workers = int(os.getenv("WORKERS", min(4, max(2, cpu_count))))
    
    # Timeout per worker
    timeout = int(os.getenv("WORKER_TIMEOUT", "120"))
    
    # Keep-alive
    keepalive = int(os.getenv("KEEPALIVE", "5"))
    
    logger.info(f"Avvio server produzione su {host}:{port}")
    logger.info(f"Workers: {workers}, Timeout: {timeout}s")
    
    # Comando uvicorn per produzione
    cmd = [
        sys.executable,
        "-m", "uvicorn",
        "backend.main:app",
        "--host", host,
        "--port", str(port),
        "--workers", str(workers),
        "--timeout-keep-alive", str(keepalive),
        "--timeout-graceful-shutdown", "30",
        "--log-level", "info",
        "--access-log",
        "--no-server-header",
        "--proxy-headers",
        "--forwarded-allow-ips", "*",
    ]
    
    # Aggiungi SSL se configurato
    if os.getenv("SSL_KEYFILE") and os.getenv("SSL_CERTFILE"):
        cmd.extend([
            "--ssl-keyfile", os.getenv("SSL_KEYFILE"),
            "--ssl-certfile", os.getenv("SSL_CERTFILE"),
        ])
        logger.info("SSL abilitato")
    
    try:
        # Avvia il server
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        logger.info("Arresto server richiesto")
    except subprocess.CalledProcessError as e:
        logger.error(f"Errore nell'avvio server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

