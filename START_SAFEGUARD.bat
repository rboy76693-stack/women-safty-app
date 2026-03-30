@echo off
title SafeGuard - Running
echo ========================================
echo  SafeGuard Women's Safety App
echo ========================================
echo.

:: Kill anything on ports 3000 and 5000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" 2^>nul') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" 2^>nul') do taskkill /F /PID %%a 2>nul

timeout /t 1 /nobreak >nul

echo [1/3] Starting backend...
start "" /b cmd /c "cd /d "%~dp0server" && node index.js > "%~dp0logs\server.log" 2>&1"

timeout /t 2 /nobreak >nul

echo [2/3] Starting frontend...
start "" /b cmd /c "cd /d "%~dp0client" && npx vite > "%~dp0logs\client.log" 2>&1"

timeout /t 3 /nobreak >nul

echo [3/3] Starting ngrok...
start "" /b cmd /c "npx ngrok http 3000 > "%~dp0logs\ngrok.log" 2>&1"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  All services started in background!
echo  Local:  http://localhost:3000
echo  Mobile: http://localhost:4040
echo ========================================
echo.
echo Watching for crashes... (minimise this window)
echo.

:loop
timeout /t 30 /nobreak >nul

netstat -aon | find ":5000" >nul 2>&1
if errorlevel 1 (
    echo [%time%] Backend crashed - restarting...
    start "" /b cmd /c "cd /d "%~dp0server" && node index.js >> "%~dp0logs\server.log" 2>&1"
)

netstat -aon | find ":3000" >nul 2>&1
if errorlevel 1 (
    echo [%time%] Frontend crashed - restarting...
    start "" /b cmd /c "cd /d "%~dp0client" && npx vite >> "%~dp0logs\client.log" 2>&1"
    timeout /t 3 /nobreak >nul
)

goto loop
