@echo off
setlocal
python "%~dp0local_server.py"
if errorlevel 1 (
  echo.
  pause
)
