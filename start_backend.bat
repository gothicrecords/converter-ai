@echo off
REM Script per avviare il backend Python FastAPI su Windows

REM Crea virtual environment se non esiste
if not exist "venv" (
    echo Creando virtual environment...
    python -m venv venv
)

REM Attiva virtual environment
call venv\Scripts\activate.bat

REM Installa dipendenze
echo Installando dipendenze...
pip install -r requirements.txt

REM Avvia il server
echo Avviando backend FastAPI...
python run_backend.py

