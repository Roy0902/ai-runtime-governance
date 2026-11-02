@echo off
setlocal
set "ROOT=%~dp0..\.."
set "JAVA_EXE=%ROOT%\.local-tools\jdk-25.0.5+8\bin\java.exe"
if defined JAVA_HOME set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if not exist "%JAVA_EXE%" (
  echo Project-local Java is unavailable; load local-env\env.ps1 first. 1>&2
  exit /b 5
)
"%JAVA_EXE%" -jar "%ROOT%\backend\target\ai-runtime-governance-backend-0.1.0-SNAPSHOT.jar" admin %*
exit /b %ERRORLEVEL%
