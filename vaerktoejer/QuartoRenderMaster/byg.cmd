@echo off
setlocal
cd /d "%~dp0"

echo Quarto Render Master - bygger programmet
echo.

set HARSDK=
for /f "delims=" %%i in ('dotnet --list-sdks 2^>nul') do set HARSDK=1

if defined HARSDK goto sdk
goto indbygget

:sdk
echo .NET SDK fundet. Bygger en selvstaendig .exe med dotnet publish.
echo.
dotnet publish QuartoRenderMaster.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o "%~dp0byg"
if errorlevel 1 goto fejl
goto faerdig

:indbygget
echo Ingen .NET SDK fundet. Bygger mod .NET Framework 4.8, som foelger med Windows.
echo.
set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe
if not exist "%CSC%" goto ingencsc
if not exist "%~dp0byg" mkdir "%~dp0byg"
"%CSC%" /nologo /target:winexe /platform:anycpu /optimize+ /win32manifest:app.manifest /out:"byg\QuartoRenderMaster.exe" /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll *.cs
if errorlevel 1 goto fejl
goto faerdig

:ingencsc
echo FEJL: Hverken .NET SDK eller Windows' egen C#-compiler blev fundet.
echo Installer .NET SDK fra https://dotnet.microsoft.com/download og proev igen.
goto slut

:fejl
echo.
echo FEJL: Programmet blev ikke bygget. Laes fejlbeskeden ovenfor.
goto slut

:faerdig
echo.
echo Faerdig. Programmet ligger i:
echo   %~dp0byg\QuartoRenderMaster.exe
goto slut

:slut
echo.
pause
