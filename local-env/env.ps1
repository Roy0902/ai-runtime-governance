# Project-local environment for reproduction. Dot-source from the repository root:
#   . .\local-env\env.ps1
# No global installation or PATH change is performed.

$repoRoot = Split-Path -Parent $PSScriptRoot

$javaHomes = @('.local-tools\jdk-25.0.5+8', '.local-tools\java\jdk-25.0.5+8')
$mavenHomes = @('.local-tools\apache-maven-3.9.16', '.local-tools\maven\apache-maven-3.9.16')
$javaHome = $javaHomes | ForEach-Object { Join-Path $repoRoot $_ } |
  Where-Object { Test-Path -LiteralPath (Join-Path $_ 'bin\java.exe') } | Select-Object -First 1
$mavenHome = $mavenHomes | ForEach-Object { Join-Path $repoRoot $_ } |
  Where-Object { Test-Path -LiteralPath (Join-Path $_ 'bin\mvn.cmd') } | Select-Object -First 1
if (-not $javaHome) { throw 'The pinned project-local Java 25.0.5+8 installation is missing.' }
if (-not $mavenHome) { throw 'The pinned project-local Maven 3.9.16 installation is missing.' }
$env:JAVA_HOME = $javaHome
$env:MAVEN_HOME = $mavenHome
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $repoRoot '.local-tools\playwright'
$env:npm_config_cache = Join-Path $repoRoot '.local-cache\npm'
$env:MAVEN_USER_HOME = Join-Path $repoRoot '.local-cache\maven'

$localNode = Join-Path $repoRoot '.local-tools\node-v24.22.0-win-x64'
$toolPaths = @(
  (Join-Path $env:JAVA_HOME 'bin')
  (Join-Path $env:MAVEN_HOME 'bin')
)
if (Test-Path -LiteralPath (Join-Path $localNode 'node.exe')) {
  $toolPaths += $localNode
}
$env:PATH = ($toolPaths + $env:PATH) -join [IO.Path]::PathSeparator

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "MAVEN_HOME=$env:MAVEN_HOME"
Write-Host "PLAYWRIGHT_BROWSERS_PATH=$env:PLAYWRIGHT_BROWSERS_PATH"
