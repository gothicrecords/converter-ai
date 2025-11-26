#!/usr/bin/env python3
"""
Script per avviare il backend FastAPI
Ottimizzato per Railway: usa PORT da variabile d'ambiente
"""
import os
import uvicorn
from backend.main import app

# Railway imposta PORT automaticamente, usa quello se disponibile
# Se non c'è PORT usa 8000 in locale
port = int(os.environ.get("PORT", 8000))

if __name__ == "__main__":
    # Avvia il server FastAPI
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port
    )

