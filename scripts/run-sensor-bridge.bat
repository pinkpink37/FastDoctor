@echo off
setlocal
cd /d %~dp0\..\sensor_bridge
if not exist node_modules (
  call npm install
)
echo Starting sensor bridge (WS port 8787)...
node bridge.js
