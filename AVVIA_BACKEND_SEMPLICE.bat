@echo off
echo ========================================
echo   AVVIO BACKEND PYTHON FASTAPI
echo ========================================
echo.

REM Verifica Python installato
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRORE: Python non trovato!
    echo Installa Python da https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Verifica Python... OK
echo.

REM Crea virtual environment se non esiste
if not exist "venv" (
    echo [2/4] Creando virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERRORE: Impossibile creare virtual environment
        pause
        exit /b 1
    )
) else (
    echo [2/4] Virtual environment esistente... OK
)
echo.

REM Attiva virtual environment
echo [3/4] Attivazione virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERRORE: Impossibile attivare virtual environment
    pause
    exit /b 1
)
echo.

REM Installa dipendenze (solo se necessario)
echo [4/4] Verifica dipendenze...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installazione dipendenze (prima volta, potrebbe richiedere tempo)...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERRORE: Impossibile installare dipendenze
        pause
        exit /b 1
    )
) else (
    echo Dipendenze già installate... OK
)
echo.

echo ========================================
echo   BACKEND IN AVVIO...
echo   URL: http://localhost:8000
echo   Premi CTRL+C per fermare
echo ========================================
echo.

REM Avvia il server
python run_backend.py

pause

