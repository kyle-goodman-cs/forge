@echo off
cd /d "%~dp0"
rem Run this once. It puts a Forge icon on your desktop that starts the app.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Forge.lnk');" ^
  "$s.TargetPath = '%~dp0Start Forge.bat';" ^
  "$s.WorkingDirectory = '%~dp0';" ^
  "$s.IconLocation = '%~dp0forge.ico';" ^
  "$s.WindowStyle = 7;" ^
  "$s.Description = 'Start Forge';" ^
  "$s.Save()"
if errorlevel 1 (
  echo Could not create the shortcut. You can still double-click "Start Forge.bat".
) else (
  echo Done! Double-click the Forge icon on your desktop to start practicing.
)
pause
