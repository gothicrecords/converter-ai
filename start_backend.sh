#!/bin/bash
# Script per avviare il backend Python FastAPI

# Crea virtual environment se non esiste
if [ ! -d "venv" ]; then
    echo "Creando virtual environment..."
    python3 -m venv venv
fi

# Attiva virtual environment
source venv/bin/activate

# Installa dipendenze
echo "Installando dipendenze..."
pip install -r requirements.txt

# Avvia il server
echo "Avviando backend FastAPI..."
python run_backend.py

