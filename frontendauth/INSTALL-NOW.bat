@echo off
echo ========================================
echo Installing Frontend Dependencies
echo ========================================
echo.
echo This will take 2-5 minutes...
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
    echo 2. Disk space available
    echo 3. npm is working: npm --version
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Installation complete!
echo ========================================
echo.
echo Now starting development server...
echo.

call npm run dev

pause
