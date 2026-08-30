@echo off
echo ===================================================
echo Publication de Immo-Connect sur GitHub
echo ===================================================
echo Dépôt cible: https://github.com/pistyl/immo-connect.git
echo.

set GIT_CMD=git

where git >%TEMP%\null 2>%TEMP%\null
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set GIT_CMD="C:\Program Files\Git\cmd\git.exe"
    ) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
        set GIT_CMD="C:\Program Files (x86)\Git\cmd\git.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set GIT_CMD="%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    ) else (
        echo.
        echo [ATTENTION] Git n'est pas encore installe ou ajoute au PATH de votre PC.
        echo Veuillez installer Git pour Windows depuis : https://git-scm.com/download/win
        echo.
        pause
        exit /b 1
    )
)

echo Utilisation de Git : %GIT_CMD%
echo.

%GIT_CMD% init
%GIT_CMD% remote set-url origin https://github.com/pistyl/immo-connect.git || %GIT_CMD% remote add origin https://github.com/pistyl/immo-connect.git
%GIT_CMD% add .
%GIT_CMD% commit -m "security: Isolation stricte des données et protection de la confidentialité par compte utilisateur"
%GIT_CMD% branch -M main
%GIT_CMD% push -u origin main

echo.
echo ===================================================
echo Publication terminée avec succès sur GitHub !
echo ===================================================
