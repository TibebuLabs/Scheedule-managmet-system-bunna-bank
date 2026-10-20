@echo off
echo ========================================
echo Installing New Backend Dependencies
echo ========================================
echo.
echo Installing security and logging packages...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo Installation failed! Trying alternative...
    call npm install --legacy-peer-deps
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo New packages installed:
echo - express-mongo-sanitize (NoSQL injection protection)
echo - morgan (HTTP request logger)
echo - winston (Advanced logging)
echo - winston-daily-rotate-file (Log rotation)
echo - validator (Enhanced validation)
echo.
echo Starting server...
echo.

call npm run dev
