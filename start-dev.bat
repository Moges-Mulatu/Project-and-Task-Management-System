@echo off
echo ========================================
echo   Debo Task Management - Dev Startup
echo ========================================
echo.

:: Set ADB path
set ADB="C:\Users\windows 10\AppData\Local\Android\Sdk\platform-tools\adb.exe"

:: Setup ADB reverse ports
echo [1/4] Setting up USB connection...
%ADB% reverse tcp:5000 tcp:5000
%ADB% reverse tcp:19000 tcp:19000
%ADB% reverse tcp:19001 tcp:19001
echo      Done!
echo.

:: Start backend in new window
echo [2/4] Starting backend server...
start "Backend Server" cmd /k "cd /d D:\debo first task\Project-and-Task-Management-System\backend && npm run dev"
echo      Backend starting in new window...
echo.

:: Wait for backend to initialize
echo [3/4] Waiting for backend to start...
timeout /t 3 /nobreak >nul
echo      Done!
echo.

:: Start Expo
echo [4/4] Starting Expo...
cd /d "D:\debo first task\Project-and-Task-Management-System\mobile"
set EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
echo      API URL: %EXPO_PUBLIC_API_BASE_URL%
npx expo start -c

pause
