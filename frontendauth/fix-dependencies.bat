@echo off
echo ====================================
echo Fixing Frontend Dependencies
echo ====================================
echo.

echo [1/4] Removing old node_modules...
if exist node_modules rmdir /s /q node_modules
echo Done!

echo [2/4] Removing package-lock.json...
if exist package-lock.json del /f /q package-lock.json
echo Done!

echo [3/4] Cleaning npm cache...
call npm cache clean --force
echo Done!

echo [4/4] Installing fresh dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Installation failed!
    echo.
    echo Try running this command manually:
    echo npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo ====================================
echo SUCCESS! Dependencies installed!
echo ====================================
echo.
echo You can now run: npm run dev
echo.
pause
