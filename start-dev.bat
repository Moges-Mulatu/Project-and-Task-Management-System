@echo off
setlocal EnableDelayedExpansion
title Debo Task Management - Dev Startup

echo ========================================
echo   Debo Task Management - Dev Startup
echo ========================================
echo.

:: -------------------------------------------------------
:: Ensure Node.js is in PATH (common install locations)
:: -------------------------------------------------------
set "NODE_PATH=C:\Program Files\nodejs"
if exist "%NODE_PATH%\node.exe" (
    set "PATH=%NODE_PATH%;%PATH%"
)

:: -------------------------------------------------------
:: Verify Node.js / npx is available
:: -------------------------------------------------------
where npx >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / npx not found in PATH!
    echo         Please install Node.js from https://nodejs.org
    echo         or make sure it is added to your system PATH.
    echo.
    pause
    exit /b 1
)

:: -------------------------------------------------------
:: Set ADB path
:: -------------------------------------------------------
set "ADB=C:\Users\windows 10\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if not exist "!ADB!" (
    echo [WARNING] ADB not found at:
    echo           !ADB!
    echo           Skipping ADB steps. Make sure Android SDK is installed.
    echo.
    goto :SKIP_ADB
)

:: -------------------------------------------------------
:: STEP 1: Force-stop Expo Go to clear any stale crash screen
:: (fixes the IllegalStateException / "Something went wrong" freeze)
:: -------------------------------------------------------
echo [1/5] Clearing Expo Go crash state...
"!ADB!" shell am force-stop host.exp.exponent >nul 2>&1
echo      Done (Expo Go cleared or was not running).
echo.

:: -------------------------------------------------------
:: STEP 2: Setup ADB reverse ports
::   5000  -> backend API
::   8081  -> Metro bundler (JS bundle) ** must match expo start --port **
::   19000 -> Expo dev server
::   19001 -> Expo dev tools
:: -------------------------------------------------------
echo [2/5] Setting up USB/TCP port forwarding...
"!ADB!" reverse tcp:5000 tcp:5000 >nul 2>&1
"!ADB!" reverse tcp:8081 tcp:8081 >nul 2>&1
"!ADB!" reverse tcp:19000 tcp:19000 >nul 2>&1
"!ADB!" reverse tcp:19001 tcp:19001 >nul 2>&1
echo      Done!
echo.
goto :START_BACKEND

:SKIP_ADB
echo [1/5] Skipped (ADB not found).
echo [2/5] Skipped (ADB not found).
echo.

:START_BACKEND
:: -------------------------------------------------------
:: STEP 3: Start backend in new window
:: -------------------------------------------------------
echo [3/5] Starting backend server...
start "Backend Server" cmd /k "cd /d "D:\debo first task\Project-and-Task-Management-System\backend" && npm run dev"
echo      Backend starting in a new window...
echo.

:: -------------------------------------------------------
:: STEP 4: Wait for backend to initialize
:: -------------------------------------------------------
echo [4/5] Waiting for backend to start (5s)...
timeout /t 5 /nobreak >nul
echo      Done!
echo.

:: -------------------------------------------------------
:: STEP 5: Start Expo (with cache clear)
:: -------------------------------------------------------
echo [5/5] Starting Expo Metro bundler...
cd /d "D:\debo first task\Project-and-Task-Management-System\mobile"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not navigate to mobile directory!
    echo         Expected: D:\debo first task\Project-and-Task-Management-System\mobile
    pause
    exit /b 1
)

set EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
echo      API URL: %EXPO_PUBLIC_API_BASE_URL%
echo.
echo -------------------------------------------------------
echo   Once Metro is ready:
echo     - Press 'a' to open on connected Android device
echo     - OR scan the QR code with Expo Go
echo   Expo Go was force-stopped so it launches fresh.
echo -------------------------------------------------------
echo.

npx expo start -c --localhost --port 8081
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Expo failed to start. See error above.
)

echo.
pause
