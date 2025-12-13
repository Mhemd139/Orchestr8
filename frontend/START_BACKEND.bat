@echo off
echo ================================================
echo    Shadow Worker - Starting Backend Server
echo ================================================
echo.
echo This will start the Flask backend on port 5000
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

cd /d "%~dp0"
python scripts\server.py

pause
