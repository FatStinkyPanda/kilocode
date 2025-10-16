@echo off
REM Windows batch file wrapper for rebuild-and-install.js

echo Starting Kilo Code rebuild and reinstall...
echo.

node rebuild-and-install.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Script failed with error code %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Press any key to exit...
pause > nul
