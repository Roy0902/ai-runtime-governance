# Project-local environment for reproduction. Dot-source from the repository root:
#   . .\local-env\env.ps1
# No global installation or PATH change is performed.

$repoRoot = Split-Path -Parent $PSScriptRoot

$env:JAVA_HOME = Join-Path $repoRoot '.local-tools\jdk-25.0.5+8'
$env:MAVEN_HOME = Join-Path $repoRoot '.local-tools\apache-maven-3.9.16'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $repoRoot '.local-tools\playwright'
$env:npm_config_cache = Join-Path $repoRoot '.local-cache\npm'
$env:MAVEN_USER_HOME = Join-Path $repoRoot '.local-cache\maven'

$env:PATH = @(
  (Join-Path $env:JAVA_HOME 'bin')
  (Join-Path $env:MAVEN_HOME 'bin')
  $env:PATH
) -join [IO.Path]::PathSeparator

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "MAVEN_HOME=$env:MAVEN_HOME"
Write-Host "PLAYWRIGHT_BROWSERS_PATH=$env:PLAYWRIGHT_BROWSERS_PATH"
