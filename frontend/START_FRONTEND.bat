@echo off
echo ================================================
echo    Shadow Worker - Starting Frontend
echo ================================================
echo.
echo This will start the React app on port 8080
echo The browser will open automatically
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

cd /d "%~dp0"
npm run dev

pause
