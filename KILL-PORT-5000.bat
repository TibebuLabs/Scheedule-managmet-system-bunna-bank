@echo off
echo ============================================
echo Killing Process on Port 5000
echo ============================================
echo.

echo Finding process on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000"') do (
    echo Found process ID: %%a
    taskkill /PID %%a /F
    if %errorlevel% equ 0 (
        echo ✓ Process killed successfully
    ) else (
        echo ✗ Failed to kill process
    )
)

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo Starting backend server...
echo ============================================
echo.

cd /d "%~dp0full-stackauthentication"
npm run dev

pause
