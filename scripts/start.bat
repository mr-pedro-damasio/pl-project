@echo off
setlocal

set SCRIPT_DIR=%~dp0
set FRONTEND_DIR=%SCRIPT_DIR%..\frontend

cd /d "%FRONTEND_DIR%"

if not exist "node_modules" (
  echo Installing dependencies...
  npm install
)

echo Starting prelegal frontend on http://localhost:3000 ...
npm run dev
