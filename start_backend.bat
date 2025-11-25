@echo off
REM Script per avviare il backend Python FastAPI su Windows
echo ========================================
echo Starting Python Backend on port 8000
echo ========================================
cd /d "%~dp0"
python -m backend.main
pause

