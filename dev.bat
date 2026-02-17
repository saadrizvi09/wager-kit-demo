@echo off
echo Starting WagerKit...
echo.
echo Starting Backend (NestJS on port 3001)...
start "WagerKit Backend" cmd /k "cd /d c:\demo\backend && npm run start:dev"
timeout /t 3 /nobreak >nul

echo Starting Frontend (Next.js on port 3000)...
start "WagerKit Frontend" cmd /k "cd /d c:\demo\frontend && npm run dev"

echo.
echo ========================================
echo WagerKit is starting up!
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul
