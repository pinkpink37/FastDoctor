@echo off
setlocal
cd /d %~dp0\..\kiosk_keyboard
if not exist .venv (
  py -m venv .venv
  call .venv\Scripts\pip install --upgrade pip
  call .venv\Scripts\pip install -r requirements.txt
)
echo Starting on-screen keypad (WS port 8765)...
call .venv\Scripts\python keypad.py
