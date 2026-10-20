@echo off
echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.
echo This will take 1-3 minutes...
echo Please wait...
echo.

REM Install all dependencies
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Installation failed! Trying alternative method...
    echo ========================================
    echo.
    call npm install --legacy-peer-deps
)

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Installation still failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. Internet connection
    echo 2. npm is working: npm --version
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Backend dependencies installed!
echo ========================================
echo.

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Configure your .env file!
    echo    - Set MONGODB_URI
    echo    - Set JWT_SECRET
    echo    - Set EMAIL credentials (optional)
    echo.
)

echo Ready to start! Run one of these:
echo   npm run dev    (with auto-reload)
echo   npm start      (without auto-reload)
echo.
pause
