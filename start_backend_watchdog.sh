#!/bin/bash
# Script per avviare il backend con watchdog 24/7 su Linux/Mac

set -e

echo "========================================"
echo "Starting Backend with Watchdog 24/7"
echo "========================================"

# Vai nella directory dello script
cd "$(dirname "$0")"

# Crea directory logs se non esiste
mkdir -p logs

# Crea virtual environment se non esiste
if [ ! -d "venv" ]; then
    echo "Creando virtual environment..."
    python3 -m venv venv
fi

# Attiva virtual environment
source venv/bin/activate

# Installa dipendenze
echo "Verificando dipendenze..."
pip install -q -r requirements.txt

# Assicurati che lo script sia eseguibile
chmod +x start_backend_watchdog.py

# Avvia il watchdog
echo "Starting watchdog service..."
exec python start_backend_watchdog.py

