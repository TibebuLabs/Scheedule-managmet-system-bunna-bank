@echo off
echo ============================================
echo Bunna Bank Schedule Management System
echo COMPLETE INSTALLATION SCRIPT
echo ============================================
echo.
echo This will install ALL dependencies for:
echo   - Backend (Node.js/Express)
echo   - Frontend (React/Vite)
echo.
echo Estimated time: 3-8 minutes
echo.
pause

REM ==========================================
REM BACKEND INSTALLATION
REM ==========================================
echo.
echo ============================================
echo [1/2] Installing BACKEND Dependencies...
echo ============================================
echo.

cd /d "%~dp0full-stackauthentication"

call npm install
if %errorlevel% neq 0 (
    echo Trying alternative method...
    call npm install --legacy-peer-deps
)

if %errorlevel% equ 0 (
    echo ✓ Backend dependencies installed successfully!
    
    REM Create .env if it doesn't exist
    if not exist .env (
        copy .env.example .env
        echo ✓ Created backend .env file
    )
) else (
    echo ✗ Backend installation FAILED!
    echo Please run: cd full-stackauthentication && npm install
)

REM ==========================================
REM FRONTEND INSTALLATION  
REM ==========================================
echo.
echo ============================================
echo [2/2] Installing FRONTEND Dependencies...
echo ============================================
echo.

cd /d "%~dp0frontendauth"

call npm install
if %errorlevel% neq 0 (
    echo Trying alternative method...
    call npm install --legacy-peer-deps
)

if %errorlevel% equ 0 (
    echo ✓ Frontend dependencies installed successfully!
    
    REM Create .env if it doesn't exist
    if not exist .env (
        copy .env.example .env
        echo ✓ Created frontend .env file
    )
) else (
    echo ✗ Frontend installation FAILED!
    echo Please run: cd frontendauth && npm install
)

REM ==========================================
REM SUMMARY
REM ==========================================
echo.
echo ============================================
echo INSTALLATION COMPLETE!
echo ============================================
echo.

REM Verify installations
cd /d "%~dp0full-stackauthentication"
if exist "node_modules\nodemon" (
    echo ✓ Backend: nodemon found
) else (
    echo ✗ Backend: nodemon NOT found - installation incomplete
)

cd /d "%~dp0frontendauth"
if exist "node_modules\vite" (
    echo ✓ Frontend: vite found
) else (
    echo ✗ Frontend: vite NOT found - installation incomplete
)

echo.
echo ============================================
echo NEXT STEPS:
echo ============================================
echo.
echo 1. Configure environment files:
echo    • full-stackauthentication\.env
echo    • frontendauth\.env
echo.
echo 2. Start MongoDB:
echo    • Local: Run MongoDB service
echo    • Cloud: Use MongoDB Atlas
echo.
echo 3. Start the application:
echo    • Run: start-app.bat
echo    OR manually:
echo      - Terminal 1: cd full-stackauthentication && npm run dev
echo      - Terminal 2: cd frontendauth && npm run dev
echo.
echo ============================================

cd /d "%~dp0"
pause
