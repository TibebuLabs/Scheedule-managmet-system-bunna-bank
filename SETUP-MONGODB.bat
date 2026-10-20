@echo off
echo ============================================
echo MongoDB Setup Helper
echo ============================================
echo.

echo Checking if MongoDB is installed...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB is installed!
    echo.
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% equ 0 (
        echo ✓ MongoDB service started successfully!
        echo.
        echo MongoDB is now running on: mongodb://localhost:27017
        echo.
        echo You can now restart your backend server.
    ) else (
        echo.
        echo ⚠️  Could not start MongoDB service.
        echo.
        echo Try running this command as Administrator:
        echo    net start MongoDB
        echo.
        echo Or start MongoDB manually:
        echo    mongod --dbpath C:\data\db
    )
) else (
    echo.
    echo ❌ MongoDB is NOT installed!
    echo.
    echo ============================================
    echo OPTION 1: Install MongoDB Locally
    echo ============================================
    echo.
    echo 1. Download MongoDB Community Server:
    echo    https://www.mongodb.com/try/download/community
    echo.
    echo 2. Install with default settings
    echo.
    echo 3. MongoDB will start automatically as a service
    echo.
    echo ============================================
    echo OPTION 2: Use MongoDB Atlas (Cloud - FREE)
    echo ============================================
    echo.
    echo 1. Sign up at: https://www.mongodb.com/cloud/atlas
    echo.
    echo 2. Create a FREE cluster (M0)
    echo.
    echo 3. Create a database user
    echo.
    echo 4. Whitelist IP: 0.0.0.0/0 (for development)
    echo.
    echo 5. Get connection string and update in:
    echo    full-stackauthentication\.env
    echo.
    echo    Change MONGODB_URI to:
    echo    mongodb+srv://username:password@cluster.mongodb.net/task_scheduler
    echo.
    echo ============================================
)

echo.
pause
