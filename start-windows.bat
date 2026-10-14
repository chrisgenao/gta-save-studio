@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Download Node.js 18 or newer from https://nodejs.org/
  pause
  exit /b 1
)
echo Starting GTA Save Studio v2.0...
echo Open http://localhost:5173 in your browser.
node server.mjs
pause
