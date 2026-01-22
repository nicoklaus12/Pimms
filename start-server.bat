@echo off
echo ========================================
echo    SERVEUR LOCAL PIMMS MEDIATION
echo ========================================
echo.
echo Demarrage du serveur HTTP local...
echo.
echo Le site sera accessible sur :
echo   http://localhost:8080
echo   http://127.0.0.1:8080
echo.
echo Pour arreter le serveur : Ctrl+C
echo.
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8080

pause
