@echo off
setlocal
cd /d %~dp0\..

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

echo Starting dev server on http://localhost:5173
call npm run dev
