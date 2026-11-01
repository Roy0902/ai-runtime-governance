@echo off
setlocal
set "ROOT=%~dp0..\.."
"%ROOT%\.local-tools\jdk-25.0.5+8\bin\java.exe" -jar "%ROOT%\backend\target\ai-runtime-governance-backend-0.1.0-SNAPSHOT.jar" admin %*
exit /b %ERRORLEVEL%
