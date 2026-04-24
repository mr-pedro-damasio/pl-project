@echo off
setlocal enabledelayedexpansion

set PORT=3000
set PID=

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":%PORT% "') do (
  if not defined PID set PID=%%a
)

if defined PID (
  echo Stopping prelegal frontend ^(PID %PID% on port %PORT%^)...
  taskkill /F /PID %PID% >nul 2>&1
  echo Done.
) else (
  echo No process found on port %PORT%.
)
