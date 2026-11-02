@echo off
title Forge
cd /d "%~dp0"
rem Starts Forge and opens it in your browser. Keep this window open while you practice.
set "PYCMD="
where py >nul 2>nul && set "PYCMD=py"
if not defined PYCMD (
  python -c "import sys" >nul 2>nul && set "PYCMD=python"
)
if not defined PYCMD (
  powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Python 3 was not found. Install it from python.org (tick Add python.exe to PATH), then try again.', 'Forge') | Out-Null"
  exit /b 1
)
%PYCMD% serve.py --open
if errorlevel 1 (
  powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Forge could not start because port 8000 is used by another program. Close that program and try again.', 'Forge') | Out-Null"
)
