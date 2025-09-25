@echo off
cls
echo.
echo ============================================================
echo   MAKE SURE REDIS SERVER IS ONLINE BEFORE STARTING THE APP!
echo ============================================================
echo.

REM Start frontend
cd frontend
echo Starting frontend (npm run start)...
start cmd /k "npm run start"

REM Start backend
cd ..
cd backend
echo Starting backend (python app.py)...
start cmd /k "python app.py"

echo.
echo Both frontend and backend have been started in separate terminals.
pause