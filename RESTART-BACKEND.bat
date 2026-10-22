@echo off
echo ============================================
echo Restarting Backend Server
echo ============================================
echo.

cd /d "%~dp0full-stackauthentication"

echo Stopping old process (if running)...
taskkill /F /IM node.exe 2>nul

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
echo.

npm run dev

pause
