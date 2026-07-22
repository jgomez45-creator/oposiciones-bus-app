@echo off
chcp 65001 > nul
echo ======================================================
echo    Buscando y subiendo cambios a GitHub automáticamente
echo ======================================================
echo.

:: 1. Añadir todos los cambios
echo [+] Añadiendo cambios al área de preparación...
git add .
echo.

:: 2. Mostrar resumen del estado actual
echo [+] Estado de los archivos modificados:
git status -s
echo.

:: 3. Solicitar mensaje de commit (opcional)
set /p msg="Introduce el mensaje del commit (o pulsa ENTER para usar la fecha y hora actuales): "
if "%msg%"=="" (
    set msg=Actualización automática - %date% %time%
)
echo.

:: 4. Realizar el commit
echo [+] Creando punto de restauración (Commit)...
git commit -m "%msg%"
echo.

:: 5. Subir a GitHub
echo [+] Subiendo cambios a GitHub (Push)...
git push
echo.

echo ======================================================
echo    ¡Hecho! Los cambios se han subido con éxito.
echo ======================================================
echo.
pause
