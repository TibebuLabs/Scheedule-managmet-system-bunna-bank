@echo off
echo ====================================
echo Bunna Bank Schedule Management System
echo Dependency Installation Script
echo ====================================
echo.

echo [1/4] Installing Backend Dependencies...
cd /d "%~dp0full-stackauthentication"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed!
echo.

echo [2/4] Installing Frontend Dependencies...
cd /d "%~dp0frontendauth"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed!
echo.

echo [3/4] Creating environment files...
cd /d "%~dp0full-stackauthentication"
if not exist .env (
    copy .env.example .env
    echo [INFO] Created backend .env file - Please configure it!
) else (
    echo [INFO] Backend .env file already exists
)

cd /d "%~dp0frontendauth"
if not exist .env (
    copy .env.example .env
    echo [INFO] Created frontend .env file - Please configure it!
) else (
    echo [INFO] Frontend .env file already exists
)
echo.

echo [4/4] Installation Complete!
echo.
echo ====================================
echo NEXT STEPS:
echo ====================================
echo 1. Configure your .env files:
echo    - full-stackauthentication\.env (MongoDB, JWT, Email)
echo    - frontendauth\.env (API URL)
echo.
echo 2. Ensure MongoDB is running
echo.
echo 3. Start the backend server:
echo    cd full-stackauthentication
echo    npm run dev
echo.
echo 4. Start the frontend (in a new terminal):
echo    cd frontendauth
echo    npm run dev
echo.
echo ====================================
pause
