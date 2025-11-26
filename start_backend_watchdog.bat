@echo off
REM Script per avviare il backend con watchdog 24/7 su Windows
echo ========================================
echo Starting Backend with Watchdog 24/7
echo ========================================

cd /d "%~dp0"

REM Crea directory logs se non esiste
if not exist "logs" mkdir logs

REM Attiva virtual environment se esiste
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Installa dipendenze se necessario
if not exist "venv\Lib\site-packages\fastapi" (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Avvia il watchdog
echo Starting watchdog service...
python start_backend_watchdog.py

if errorlevel 1 (
    echo.
    echo ERROR: Watchdog failed to start
    echo.
    pause
    exit /b 1
)

