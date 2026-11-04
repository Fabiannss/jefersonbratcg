@echo off
chcp 65001 >nul
echo ======================================================================
echo   JEFERSONBRATCG - E-COMMERCE ^& LEILOES POKEMON TCG (MANAUS - AM)
echo ======================================================================
echo.
if exist "C:\Program Files\nodejs\npm.cmd" (
    echo [INFO] Node.js detectado! Iniciando servidor Next.js...
    npm install && npm run dev
) else (
    echo [INFO] Abrindo Preview Interativo Instantaneo no navegador...
    start "" "%~dp0JefersonBRATCG_Preview_Interativo.html"
)
pause
