"""
Response Validator - Valida sempre le risposte prima di restituirle
Garantisce che le API restituiscano sempre risposte valide e ben formate
"""
from typing import Any, Dict, Optional, List
import logging
from backend.utils.exceptions import ProcessingException

logger = logging.getLogger(__name__)


def validate_response(
    data: Any,
    required_fields: Optional[List[str]] = None,
    allow_empty: bool = False,
    response_type: str = "json"
) -> Dict[str, Any]:
    """
    Valida una risposta prima di restituirla
    
    Args:
        data: Dati da validare
        required_fields: Campi obbligatori che devono essere presenti
        allow_empty: Se True, permette risposte vuote (restituisce default)
        response_type: Tipo di risposta atteso ("json", "dataUrl", "url", "blob")
    
    Returns:
        Dict validato e formattato correttamente
    
    Raises:
        ProcessingException: Se la validazione fallisce
    """
    # Se data è None o vuoto
    if data is None:
        if allow_empty:
            return _get_default_response(response_type)
        raise ProcessingException("Risposta vuota dal server")
    
    # Valida in base al tipo
    if response_type == "json":
        return _validate_json_response(data, required_fields, allow_empty)
    elif response_type == "dataUrl":
        return _validate_dataurl_response(data, required_fields, allow_empty)
    elif response_type == "url":
        return _validate_url_response(data, required_fields, allow_empty)
    elif response_type == "blob":
        return _validate_blob_response(data, allow_empty)
    else:
        # Validazione generica
        return _validate_generic_response(data, required_fields, allow_empty)


def _validate_json_response(
    data: Any,
    required_fields: Optional[List[str]] = None,
    allow_empty: bool = False
) -> Dict[str, Any]:
    """Valida una risposta JSON"""
    if not isinstance(data, dict):
        if allow_empty:
            return _get_default_response("json")
        raise ProcessingException(f"Risposta non è un dizionario: {type(data)}")
    
    # Controlla campi obbligatori
    if required_fields:
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            if allow_empty:
                return _get_default_response("json")
            raise ProcessingException(f"Campi mancanti nella risposta: {missing_fields}")
    
    # Controlla se è vuoto
    if not data and not allow_empty:
        raise ProcessingException("Risposta vuota (dizionario senza chiavi)")
    
    return data


def _validate_dataurl_response(
    data: Any,
    required_fields: Optional[List[str]] = None,
    allow_empty: bool = False
) -> Dict[str, Any]:
    """Valida una risposta con dataUrl"""
    if not isinstance(data, dict):
        if allow_empty:
            return _get_default_response("dataUrl")
        raise ProcessingException("Risposta non è un dizionario")
    
    # Controlla se ha dataUrl
    if "dataUrl" in data:
        data_url = data.get("dataUrl")
        if not isinstance(data_url, str) or not data_url.strip():
            if allow_empty:
                return _get_default_response("dataUrl")
            raise ProcessingException("Data URL non valido nella risposta")
        
        # Restituisci risposta validata
        return {
            "name": data.get("name", "converted"),
            "dataUrl": data_url
        }
    
    # Controlla se ha url (alternativo)
    if "url" in data:
        url = data.get("url")
        if not isinstance(url, str) or not url.strip():
            if allow_empty:
                return _get_default_response("dataUrl")
            raise ProcessingException("URL non valido nella risposta")
        
        return {
            "name": data.get("name", "converted"),
            "url": url
        }
    
    # Nessun campo valido trovato
    if allow_empty:
        return _get_default_response("dataUrl")
    raise ProcessingException("Risposta non contiene dataUrl o url valido")


def _validate_url_response(
    data: Any,
    required_fields: Optional[List[str]] = None,
    allow_empty: bool = False
) -> Dict[str, Any]:
    """Valida una risposta con URL"""
    if not isinstance(data, dict):
        if allow_empty:
            return _get_default_response("url")
        raise ProcessingException("Risposta non è un dizionario")
    
    if "url" not in data:
        if allow_empty:
            return _get_default_response("url")
        raise ProcessingException("Risposta non contiene URL")
    
    url = data.get("url")
    if not isinstance(url, str) or not url.strip():
        if allow_empty:
            return _get_default_response("url")
        raise ProcessingException("URL non valido nella risposta")
    
    return {
        "name": data.get("name", "converted"),
        "url": url
    }


def _validate_blob_response(
    data: Any,
    allow_empty: bool = False
) -> bytes:
    """Valida una risposta blob"""
    if not isinstance(data, bytes):
        if allow_empty:
            return b""
        raise ProcessingException("Risposta non è un blob valido")
    
    if not data and not allow_empty:
        raise ProcessingException("Blob vuoto nella risposta")
    
    return data


def _validate_generic_response(
    data: Any,
    required_fields: Optional[List[str]] = None,
    allow_empty: bool = False
) -> Any:
    """Validazione generica"""
    if data is None and not allow_empty:
        raise ProcessingException("Risposta vuota")
    
    if isinstance(data, dict) and not data and not allow_empty:
        raise ProcessingException("Risposta vuota (oggetto senza proprietà)")
    
    return data


def _get_default_response(response_type: str) -> Dict[str, Any]:
    """Restituisce una risposta di default quando allow_empty=True"""
    defaults = {
        "json": {},
        "dataUrl": {
            "name": "error",
            "dataUrl": "data:text/plain;base64,ZXJyb3Jl"
        },
        "url": {
            "name": "error",
            "url": ""
        },
        "blob": b""
    }
    return defaults.get(response_type, {})


def ensure_valid_response(
    func,
    response_type: str = "json",
    required_fields: Optional[List[str]] = None,
    allow_empty: bool = False,
    default_value: Optional[Any] = None
):
    """
    Decorator per assicurarsi che una funzione restituisca sempre una risposta valida
    
    Usage:
        @ensure_valid_response(response_type="dataUrl", required_fields=["dataUrl"])
        async def my_api_function():
            ...
    """
    async def wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            
            # Valida il risultato
            validated = validate_response(
                result,
                required_fields=required_fields,
                allow_empty=allow_empty,
                response_type=response_type
            )
            
            return validated
        except ProcessingException:
            # Rilancia ProcessingException così com'è
            raise
        except Exception as e:
            # Altri errori - logga e rilancia come ProcessingException
            logger.error(f"Errore in {func.__name__}: {e}", exc_info=True)
            
            # Se allow_empty e default_value, restituisci default
            if allow_empty and default_value is not None:
                return default_value
            
            raise ProcessingException(f"Errore durante l'elaborazione: {str(e)}")
    
    return wrapper

