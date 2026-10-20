@echo off
echo ====================================
echo Bunna Bank Schedule Management System
echo Starting Application...
echo ====================================
echo.

echo [INFO] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0full-stackauthentication" && npm run dev"

timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontendauth" && npm run dev"

echo.
echo ====================================
echo Application Started!
echo ====================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows have been opened.
echo Press any key to close this window...
echo ====================================
pause >nul
