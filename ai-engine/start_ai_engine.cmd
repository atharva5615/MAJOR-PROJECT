@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo ERROR: AI Engine virtual environment not found.
    exit /b 1
)

".venv\Scripts\python.exe" -m uvicorn ai_api:app --host 127.0.0.1 --port 8000

endlocal