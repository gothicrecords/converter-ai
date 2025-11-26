"""
Configurazione logging strutturato per produzione 24/7
"""
import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from datetime import datetime
import json


class JSONFormatter(logging.Formatter):
    """Formatter JSON per log strutturati"""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Aggiungi extra fields se presenti
        if hasattr(record, "extra"):
            log_data.update(record.extra)
        
        # Aggiungi exception info se presente
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def setup_logging(
    log_level: str = "INFO",
    log_dir: str = "logs",
    log_to_file: bool = True,
    log_to_console: bool = True,
    use_json: bool = False,
):
    """
    Configura il sistema di logging
    
    Args:
        log_level: Livello di logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory per i file di log
        log_to_file: Se True, scrive log su file
        log_to_console: Se True, scrive log su console
        use_json: Se True, usa formato JSON per log strutturati
    """
    # Crea directory logs
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Configura root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Rimuovi handlers esistenti
    root_logger.handlers.clear()
    
    # Formatter
    if use_json:
        formatter = JSONFormatter()
        console_formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s",
            datefmt="%H:%M:%S"
        )
    
    # Console handler
    if log_to_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
    
    # File handler con rotazione giornaliera
    if log_to_file:
        # Log generale (rotazione giornaliera)
        file_handler = TimedRotatingFileHandler(
            log_path / "backend.log",
            when="midnight",
            interval=1,
            backupCount=30,  # Mantieni 30 giorni di log
            encoding="utf-8",
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
        
        # Log errori separato
        error_handler = RotatingFileHandler(
            log_path / "errors.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=10,
            encoding="utf-8",
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        root_logger.addHandler(error_handler)
        
        # Log accessi separato
        access_handler = RotatingFileHandler(
            log_path / "access.log",
            maxBytes=50 * 1024 * 1024,  # 50MB
            backupCount=10,
            encoding="utf-8",
        )
        access_handler.setLevel(logging.INFO)
        access_handler.setFormatter(formatter)
        # Filtra solo access log
        access_handler.addFilter(lambda record: "access" in record.name.lower())
        root_logger.addHandler(access_handler)
    
    # Configura logging per librerie esterne
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    return root_logger


def get_logger(name: str) -> logging.Logger:
    """Ottieni un logger con il nome specificato"""
    return logging.getLogger(name)

