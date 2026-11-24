@echo off
setlocal
cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
    echo ERROR: Backend virtual environment not found.
    exit /b 1
)

"venv\Scripts\python.exe" -m uvicorn main:app --app-dir app --host 127.0.0.1 --port 8001 --reload

endlocal