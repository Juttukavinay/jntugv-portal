@echo off
echo Starting JNTUGV Portal...

echo 1. Starting Database (MongoDB)...
start "MongoDB Data Service" mongod --dbpath ./mongodb_data

timeout /t 2 >nul

echo 2. Starting Backend Server...
cd backend
start "Backend Server (Port 5000)" npm run dev
cd ..

timeout /t 2 >nul

echo 3. Starting Frontend UI...
cd frontend
start "Frontend UI (Port 5173)" npm run dev -- --open
cd ..

echo ---------------------------------------------
echo All services are launching in separate windows.
echo You can minimize them, but DO NOT CLOSE them.
echo ---------------------------------------------
