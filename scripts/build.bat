@echo off
setlocal
cd /d %~dp0\..
call npm install
call npm run build
echo Build finished. Use 'npx serve -s dist' to preview.
